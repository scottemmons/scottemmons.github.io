//Credits to user "Tim Down" on SO for this function (http://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array)
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor(i * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function createListXEmptyLists(x) {
	var list = [];
	for (i = 0; i < x; i++) {
		list.push([]);
	}
	return list;
}

function calcCentroidsByClusters(clusters) {
	var centroids = [];

	//For each cluster in clusters, calculate centroid point and push it to centroids list
	for (c = 0; c < clusters.length; c++) {
		var totalX = 0;
		var totalY = 0;
		var cluster = clusters[c];
		var numPoints = cluster.length;
		for (e = 0; e < numPoints; e++) {
			totalX = parseFloat(cluster[e].getAttribute("cx")) + totalX;
			totalY = parseFloat(cluster[e].getAttribute("cy")) + totalY;
		}
		var avgX = totalX / numPoints;
		var avgY = totalY / numPoints;
		centroids.push([avgX, avgY]);
	}

	return centroids;
}

//Assumes the point is an array of length two with only an x- and y-coordinate, i.e. point = [3.45, 5.23], and circle is an svg circle object
function distCirclePoint(circle, point) {
	return Math.sqrt(Math.pow(point[0]-parseFloat(circle.getAttribute("cx")),2) + Math.pow(point[1]-parseFloat(circle.getAttribute("cy")), 2));
}

//Assumes each point is an array of length two with only an x- and y-coordinate, i.e. point = [3.45, 5.23]
function distTwoPoints(p1, p2) {
	return Math.sqrt(Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2));
}

function kMeans(selection, k, cutoff, maxIters) {
	var numIters = 0;
	//Choose k initial centroids
	var listOfCircles = getRandomSubarray(selection[0], k);
	var listOfCentroids = [];
	for (i = 0; i < listOfCircles.length; i++) {
		var point = [];
		var circle = listOfCircles[i];
		point.push(parseFloat(circle.getAttribute("cx")));
		point.push(parseFloat(circle.getAttribute("cy")));
		listOfCentroids.push(point);
	}

	do {
		var listOfClusters = createListXEmptyLists(k);

		//Assign each circle to nearest cluster
		selection.each(function (d,i) {
			var minDist = distCirclePoint(this, listOfCentroids[0]);
			var clusterNum = 0;
			for (i = 1; i < listOfCentroids.length; i++) {
				var dist = distCirclePoint(this, listOfCentroids[i]);
				if (dist < minDist) {
					minDist = dist;
					clusterNum = i;
				}
			}
			listOfClusters[clusterNum].push(this);
			d3.select(this)
				.each(function(d,i) {
					d["clusterNum"] = clusterNum;
				});

		});

		//Calculate maximum distance between previous and new centroids
		var newCentroids = calcCentroidsByClusters(listOfClusters);
		var biggestChange = 0;
		for (i = 0; i < listOfCentroids.length; i++) {
			var change = distTwoPoints(listOfCentroids[i], newCentroids[i]);
			if (change > biggestChange) {
				biggestChange = change;
			}
		}
		listOfCentroids = newCentroids;

		numIters = numIters + 1;
	}
	while (biggestChange >= cutoff && numIters < maxIters);
}