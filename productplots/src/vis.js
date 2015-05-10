//Author: Scott Emmons
//Created: 04/24/2014
//Purpose: To visualize products in two-dimensional space based on the demographic variables of their purchasers

//Notes:
//Handle "visibility" style attribute on node update
//Maybe use http://www.dynamicdrive.com/dynamicindex1/treeview/ or http://stackoverflow.com/questions/20459909/hierarchical-select-list-using-jquery or http://wimleers.com/demo/hierarchical-select or https://github.com/dbushell/Nestable

//Current Bugs:
//Clicking the "+" or "-" icon in the tree triggers the <li>'s onClick attribute
//On plot update, attributes of one node mixed up with another. For example, if have nodes selected and switch axis, new nodes will be selected. Spend some time with this.
//Clicking the search button with no text in the box will select all nodes

//Documentation:
//Input JSON data as var "dataset".
//If no label property, will create a blank string for it.
//If no categoryName property, will make it == "Undefined"
//If no categoryNum property, will make it == 0.
//categoryNum >== 0 will be base data
//categoryNum < 0 will be overlay data

///////////////////////////////////
//Global variables for all charts//
///////////////////////////////////

//Assumes global variable "dataset" already loded in HTML with properties "label", "categoryName", "categoryNum", "reAge", "hhAge", "reGender", "hhGender", "reMarried", "hhMarried", "numKids", "ageKids", "numAdults", "hIncome", "reEducation", "hhEducation", "reHoursWork", "hSize", "reEmployment", "hhEmployment"
var width = document.getElementById("plot-container").offsetHeight;
var height = document.getElementById("plot-container").offsetHeight;
var circleR = 5;
var rectW = 7;
var rectH = 7;
var noneMin = 0;
var noneMax = 10;
var noneVal = 5;
var axisTitleLookup = {"None" : "None", "reAge" : "Age - Respondent (Yrs.)", "hhAge" : "Age - Household Head (Yrs.)", "reGender" : "Gender - Respondent (% Male)", "hhGender" : "Gender - Household Head (% Male)", "reMarried" : "Currently Married - Respondent (%)", "hhMarried" : "Currently Married - Household Head (%)", "numKids" : "Number of Children in Household", "ageKids" : "Average Age of Children in Household (Yrs.)", "numAdults" : "Number of Adults in Household", "hIncome" : "Annual Household Income ($)", "reEducation" : "Years of Schooling - Respondent", "hhEducation" : "Years of Schooling - Household Head", "reHoursWork" : "Hours Worked Weekly - Respondent", "hSize" : "Household Size (Num. People)", "reEmployment" : "Employed Full or Part Time - Respondent (%)", "hhEmployment" : "Employed Full or Part Time - Household Head (%)"};
var chartTitle = "Consumer Products by Purchasing Demographics";
var xTicks = 10;
var yTicks = 5;
var padding = 50;
//"#DEA362" -- a nice soft grey
var colorList = ["#FFA700", "#FFD24F", "#FF661C", "#47A80F", "#DB4022", "#FF4338", "#FF5373", "#EE81A8", "#EE43A9", "#B42672",  "#91388C",  "#AC52C4",  "#B37AC5",  "#8085D6",  "#A0B3C9",  "#5AACE5",  "#0067C9",  "#008FDE",  "#009ADC",  "#007297",  "#12978B",  "#00BBB5",  "#009778",  "#75A33D",  "#96DB68",  "#C0BC00",  "#DFC10F",  "#BE8A20", "#733939", "#b26559", "#4c0000", "#f23d3d", "#e6b4ac", "#992900", "#e55c00", "#593116", "#331c0d", "#f2aa79", "#8c6246", "#4d4139", "#f2d6b6", "#ffaa00", "#8c5e00", "#998c73", "#bfa330", "#736f39", "#3d4010", "#ccff00", "#b8cc66", "#2d3326", "#44ff00", "#43bf30", "#bfffbf", "#1d7334", "#8fbfa3", "#00ffaa", "#003322", "#00ffee", "#39736f", "#60b9bf", "#004759", "#0d2b33", "#308fbf", "#40a6ff", "#accbe6", "#265499", "#4d5766", "#001140", "#202840", "#4059ff", "#7382e6", "#7a00e6", "#440080", "#75468c", "#af8fbf", "#da39e6", "#8c0083", "#330022", "#f279ca", "#d90074", "#73003d", "#403038", "#994d6b", "#8c6977", "#ffbfd0", "#7f0011", "#f27989"];
var defaultColor = "#e00";
var mediaColor = "#0000FF";
var selectedColor = "#000";
var labelColor = "#000";

//Variables that will be modified
var initialPlotting = true;
var mediaToggled = false;
var xAttr = "None";
var yAttr = "None";
var xMin = 0;
var xMax = 0;
var yMin = 0;
var yMax = 0;
var xScale = -1; //Vars with -1 vals are later reassigned to different type
var yScale = -1;
var xAxis = -1;
var yAxis = -1;
//var axisTitleLookup = {"None" : "None"};
var xTitle = "None";
var yTitle = "None";
var iClassDelimiter = " - ";
var classHierarchy = {};

////////////////////
//Helper functions//
///////////////////

//In order to get the size of an object. Credits to user "James Coglan" on SO (http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array)
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//In order to move circle to top layer. Credits to user "Christopher Chiche" on SO (http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3)
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

//In order to move circle to bottom layer. Credits to user "Clemens Tolboom" on SO (http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3)
d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
        	this.parentNode.insertBefore(this, firstChild);
        	if (firstChild.getAttribute("type") === "canvas") {
	        	d3.select(firstChild).moveToBack();
	        }
        }
    }); 
};

function centerRectCoor(coordinate, property) {
	return coordinate - (property / 2.0);
}

function calcMinMax(attr, data) {
	//Assumes data.length > 1
	var datum = data[0][attr];
	var min = datum
	var max = datum

	for (i = 1; i < data.length; i++) {
		datum = data[i][attr]
		if (datum < min) {
			min = datum;
		}
		else if (datum > max) {
			max = datum;
		}
	}

	return [min, max];
}

function handleScalesAxes() {
	//Define scale functions
	xScale = d3.scale.linear()
		.domain([xMin, xMax])
		.range([padding, width - padding]);

	yScale = d3.scale.linear()
		.domain([yMin, yMax])
		.range([height - padding, padding]); //html y-val's are distance from top

	//Define x- and y-axes
	xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(xTicks);
		
	yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(yTicks);

	//Need to create the axes and titles
	if (initialPlotting) {
		//Create x- and y-axes
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (height - padding) + ")")
			.call(xAxis);
			
		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + padding + ",0)")
			.call(yAxis);

		//Create titles for x- and y-axes. Credits to "mbostock" on StackOverflow
		svg.append("text")
			.attr("class", "x title")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", height - padding + 35)
			.text(xTitle);
			
		svg.append("text")
			.attr("class", "y title")
			.attr("text-anchor", "middle")
			.attr("x", -height / 2) // What does this line do?
			.attr("dy", ".75em") // What does this line do?
			.attr("transform", "rotate(-90)") // What does this line do?
			.text(yTitle);
	}

	//Need to update the axes and titles
	else {
		svg.selectAll("g.x.axis")
			.call(xAxis);

		svg.selectAll("g.y.axis")
			.call(yAxis);

		svg.selectAll("text.x.title")
			.text(xTitle);

		svg.selectAll("text.y.title")
			.text(yTitle);
	}
}

//Will use current global var values of xAttr and yAttr
function plotPoints() {
	//Define xTitle, yTitle, xMin, xMax, yMin, yMax
	xTitle = axisTitleLookup[xAttr];
	yTitle = axisTitleLookup[yAttr];

	if (xAttr === "None") {
		xMin = noneMin;
		xMax = noneMax;
	}
	else {
		var minMaxArray = calcMinMax(xAttr, dataset);
		xMin = minMaxArray[0];
		xMax = minMaxArray[1];
	}
	if (yAttr === "None") {
		yMin = noneMin;
		yMax = noneMax;
	}
	else {
		var minMaxArray = calcMinMax(yAttr, dataset);
		yMin = minMaxArray[0];
		yMax = minMaxArray[1];
		//Give a small vertical cushion
		var vertCushion = .05 * (yMax-yMin);
		yMin = yMin - vertCushion;
		yMax = yMax + vertCushion;
	}

	//Create and update scales and axes
	handleScalesAxes();

	//Plot the product points
	var circles = svg.selectAll("circle") //Update node case
		.data(circleDataset)
		.attr("cx", function (d,i) {
			if (xAttr === "None") {
				return xScale(noneVal);
			}
			else {
				return xScale(d[xAttr]);
			}
		})
		.attr("cy", function (d,i) {
			if (yAttr === "None") {
				return yScale(noneVal);
			}
			else {
				return yScale(d[yAttr]);
			}
		})
		.attr("r", circleR)
		.attr("title", function (d,i) {
			return d.label;
		})
		.attr("class", function (d,i) {
			return nameToClassAssignment(d.categoryName, iClassDelimiter);
		})
		.attr("fill", function (d,i) {
			if (d.isSelected === true) {
				return selectedColor;
			}
			else {
				return d.baseColor;
			}
		});
		
	circles.enter() //New node case
		.append("circle")
		.attr("cx", function (d,i) {
			if (xAttr === "None") {
				return xScale(noneVal);
			}
			else {
				return xScale(d[xAttr]);
			}
		})
		.attr("cy", function (d,i) {
			if (yAttr === "None") {
				return yScale(noneVal);
			}
			else {
				return yScale(d[yAttr]);
			}
		})
		.attr("r", circleR)
		.each(function (d,i) {
			d.isHighlighted = false;
		})
		.each(function (d,i) {
			d.isSelected = false;
		})
		.each(function (d,i) {
			d.isToggled = true;
		})
		.style("visibility", "visible")
		.attr("title", function (d,i) {
			return d.label;
		})
		.attr("class", function (d,i) {
			addClassToHierarchy(classHierarchy, d.categoryName, iClassDelimiter);
			return nameToClassAssignment(d.categoryName, iClassDelimiter);
		})
		.each(function (d,i) {
			d.clusterNum = 3;
		})
		.each(function (d,i) {
			d.baseColor = defaultColor;
		})
		.attr("fill", defaultColor)

		.on("mouseover", function (d,i) {
			clearNotSelected();
			clearHighlighted();
			highlightNode(d3.select(this));
		})

		.on("click", function (d,i) {
			if (d.isSelected === true) {
				clearNode(d3.select(this));
			}
			else {
				selectNode(d3.select(this));
			}
		});

	circles.exit() //Old node case
		.remove();

	//Plot the media points
	var rects = mediaPointSelection() //Update node case
		.data(rectDataset)
		.attr("x", function (d,i) {
			if (xAttr === "None") {
				return centerRectCoor(xScale(noneVal), rectW);
			}
			else {
				return centerRectCoor(xScale(d[xAttr]), rectW);
			}
		})
		.attr("y", function (d,i) {
			if (yAttr === "None") {
				return centerRectCoor(yScale(noneVal), rectH);
			}
			else {
				return centerRectCoor(yScale(d[yAttr]), rectH);
			}
		})
		.attr("width", rectW)
		.attr("height", rectH)
		.attr("title", function (d,i) {
			return d.label;
		})
		.attr("class", function (d,i) {
			return nameToClassAssignment(d.categoryName, iClassDelimiter);
		})
		.attr("fill", function (d,i) {
			if (d.isSelected === true) {
				return selectedColor;
			}
			else {
				return d.baseColor;
			}
		});

	rects.enter() //New node case
		.append("rect")
		.attr("x", function (d,i) {
			if (xAttr === "None") {
				return centerRectCoor(xScale(noneVal), rectW);
			}
			else {
				return centerRectCoor(xScale(d[xAttr]), rectW);
			}
		})
		.attr("y", function (d,i) {
			if (yAttr === "None") {
				return centerRectCoor(yScale(noneVal), rectH);
			}
			else {
				return centerRectCoor(yScale(d[yAttr]), rectH);
			}
		})
		.attr("width", rectW)
		.attr("height", rectH)
		.each(function (d,i) {
			d.isHighlighted = false;
		})
		.each(function (d,i) {
			d.isSelected = false;
		})
		.each(function (d,i) {
			d.isToggled = false;
		})
		.style("visibility", "hidden")
		.attr("title", function (d,i) {
			return d.label;
		})
		.attr("class", function (d,i) {
			addClassToHierarchy(classHierarchy, d.categoryName, iClassDelimiter);
			return nameToClassAssignment(d.categoryName, iClassDelimiter);
		})
		.each(function (d,i) {
			d.clusterNum = 3;
		})
		.each(function (d,i) {
			d.baseColor = mediaColor;
		})
		.attr("fill", mediaColor)

		.on("mouseover", function (d,i) {
			clearNotSelected();
			clearHighlighted();
			highlightNode(d3.select(this));
		})

		.on("click", function (d,i) {
			if (d.isSelected === true) {
				clearNode(d3.select(this));
			}
			else {
				selectNode(d3.select(this));
			}
		});

	rects.exit() //Old node case
		.remove();

	// clearNotSelected();
	// clearHighlighted();
	selectSelected();
	// highlightHighlighted();

	initialPlotting = false;
}

function addNodeLabel(item) {
	$(item).qtip({
		show: '',
		hide: '',

		content: {
			prerender: true,
			attr: 'title',
		},

		position: {
			my: 'top left',
			at: 'bottom right',
			adjust: {
				x: 10,
				y: 10
			}
		},

		show: {
			effect: false
		}
	}).qtip('show');
}

function removeNodeLabel(item) {
	$(item).qtip('destroy');
}

function selectNode(selection) {
	selection
		// .filter(function (d,i) {
		// 	return this.getAttribute("selected") !== "true";
		// })
		.each(function (d,i) {
			d.isSelected = true;
		})
		.attr("fill", selectedColor)
		.moveToFront();

	return selection;
}

function highlightNode(selection) {
	selection
		.filter(function (d,i) {
			return d.isHighlighted !== true;
		})
		.each(function (d,i) {
			d.isHighlighted = true;
		})
		.each(function (d,i) {
			addNodeLabel(this);
		})
		.filter(function (d,i) {
			return d.isSelected !== true;
		})
		.each(function (d,i) {
			selectNode(d3.select(this))
				.each(function (d,i) {
					d.isSelected = false;
				});
		});
}

function clearNode(selection) {
	selection
		// .filter(function (d,i) {
		// 	return this.getAttribute("selected") === "true"
		// 		|| this.getAttribute("highlighted") === "true";
		// })
		.each(function (d,i) {
			d.isSelected = false;
		})
		.each(function (d,i) {
			removeNodeLabel(this);
			colorByBase(d3.select(this));
		})
		.moveToBack();

		return selection;
}

function selectSelected() {
	selectNode(productPointSelection()
		.filter(function (d,i) {
			return d.isSelected === true;
		}));

	selectNode(mediaPointSelection()
		.filter(function (d,i) {
			return d.isSelected === true;
		}))
}

function highlightHighlighted() {
	highlightNode(productPointSelection()
		.filter(function (d,i) {
			return d.isHighlighted === true;
		}));

	highlightNode(mediaPointSelection()
		.filter(function (d,i) {
			return d.isHighlighted === true;
		}));
}

function clearNotSelected() {
	clearNode(productPointSelection()
		.filter(function (d,i) {
			return (d.isSelected !== true & d.isHighlighted === true);
		}));

	clearNode(mediaPointSelection()
		.filter(function (d,i) {
			return (d.isSelected !== true & d.isHighlihgted === true);
		}));
}

function clearHighlighted() {
	svg.selectAll("circle")
		.filter(function (d,i) {
			return d.isHighlighted === true;
		})
		.each(function (d,i) {
			d.isHighlighted = false;
		})
		.each(function (d,i) {
			removeNodeLabel(this);
		});

	mediaPointSelection()
		.filter(function (d,i) {
			return d.isHighlighted === true;
		})
		.each(function (d,i) {
			d.isHighlighted = false;
		})
		.each(function (d,i) {
			removeNodeLabel(this);
		});
}

function showNodes(selection) {
	selection
		.style("visibility", "visible")
		.each(function (d,i) {
			d.isToggled = true;
		});
}

function hideNodes(selection) {
	selection
		.style("visibility", "hidden")
		.each(function (d,i) {
			d.isToggled = false;
		});
}

function colorByBase(selection) {
	selection
		.filter(function (d,i) {
			return d.isSelected === false;
		})
		.attr("fill", function (d,i) {
			return d.baseColor;
		});
}

function setBaseColor(selection, color) {
	selection
		.each(function (d,i) {
			d.baseColor = color;
		})
}

function setBaseByAttr(selection, attributeName) {
	selection
		.each(function (d,i) {
			var number = d[attributeName];
			setBaseColor(d3.select(this), colorList[number]);
		});
}

function toggleByClass(classSelector, isToggled) {
	if (isToggled === true) {
		hideByClass(classSelector);
	}
	else {
		showByClass(classSelector);
	}
}

function setChildren(elem, checkedAttr) {
	//$(elem).attr("checked", checkedAttr);
	if (checkedAttr === true) {
		$(elem).attr("checked", "checked");
	}
	else {
		$(elem).removeAttr("checked")
	}
	$(elem).closest("li").find("ul").children().each(function () {
		setChildren($(this).find("label input"), checkedAttr);
	});
}

function productPointSelection() {
	return svg.selectAll("circle"); //Originally 'd3.selectAll("circle")'
}

function mediaPointSelection() {
	return svg.selectAll("rect") //Originally 'd3.selectAll("circle")'
		.filter(function (d,i) {
			return this.getAttribute("type") !== "canvas"; //Not to pick up background white rect
		});
}

function nameToClassAssignment(name, delimiter) {
	var regexToReplace = new RegExp(delimiter, "g");
	if (delimiter === " ") {
		return name.toLowerCase().replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
	}
	return name.toLowerCase().replace(/ /g, '').replace(regexToReplace, " ").replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
}

function nameToClassSelector(name, delimiter, toReplaceDelimiter) {
	if (toReplaceDelimiter) {
		var regexToReplace = new RegExp(delimiter, "g");
		name = name.replace(regexToReplace, ".");
	}
	return name.toLowerCase().replace(/ /g, '').replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
}

function nameArrayToName(iArray) {
	var name = "";
	for (iii = 0; iii < iArray.length; iii++) {
		name = name + iArray[iii] + " "
	}
	name = name.substring(0, name.length -1);
	return name;
}

function classToObject(iName, delimiter) {
	if (iName.length === 0) {
		return {};
	}

	var nameArray = iName.split(delimiter);
	var returnObj = {}

	if (nameArray.length === 0) {
	}
	else if (nameArray.length === 1) {
		var keyName = nameArray[0];
		returnObj[keyName] = {};
	}
	else {
		var keyName = nameArray[0]
		returnObj[keyName] = classToObject(nameArrayToName(nameArray.slice(1, nameArray.length)), delimiter);
	}

	return returnObj;
}

function addClassToHierarchy(hierarchy, className, delimiter) {
	// if (className === "") {
	// 	className = "Uncategorized";
	// }
	var classNameArray = className.split(delimiter);
	var currentLookup = hierarchy;

	for (ii = 0; ii < classNameArray.length; ii++) {
		var currentClass = classNameArray[ii];

		if (!(currentClass in currentLookup)) {
			// console.log("key follows");
			//console.log(classToObject(nameArrayToName(classNameArray.slice(ii + 1, classNameArray.length)), delimiter));
			currentLookup[currentClass] = classToObject(nameArrayToName(classNameArray.slice(ii + 1, classNameArray.length), delimiter));
			break;
		}
		else {
			currentLookup = currentLookup[currentClass];
		}
	}
}

function logAllAvailableClasses(hierarchy, delimiter, currentClassStr) {
	for (var key in hierarchy) {
		if (hierarchy.hasOwnProperty(key)) {
			if (Object.size(hierarchy[key]) === 0) {
				console.log(nameToClassSelector(currentClassStr + key, delimiter, false));
			}
			else {
				console.log(nameToClassSelector(currentClassStr + key, delimiter, false));
				logAllAvailableClasses(hierarchy[key], delimiter, currentClassStr + key + delimiter);
			}
		}
	}
}

function createTreeHtml(hierarchy, ancestorStr) {
	var returnStr = ""
	for (var key in hierarchy) {
		if (hierarchy.hasOwnProperty(key)) {
			if (ancestorStr.length === 0) {
				var currentClassStr = nameToClassSelector(key, iClassDelimiter, false);
			}
			else {
				var currentClassStr = ancestorStr + "." + nameToClassSelector(key, iClassDelimiter, false);
			}
			if (Object.size(hierarchy[key]) === 0) {
				returnStr += ('<li><label><input type="checkbox" value="' + currentClassStr + '" onClick="toggleByClass(' + "'.' + this.value, this.checked); setChildren(this, this.checked);" + '">' + key + '</label></li>');
			}
			else {
				returnStr += ('<li><label><input type="checkbox" value="' + currentClassStr + '" onClick="toggleByClass(' + "'.' + this.value, this.checked); setChildren(this, this.checked);" + '">' + key + '</label><ul>' + createTreeHtml(hierarchy[key], currentClassStr) + '</ul></li>');
			}
		}
	}

	return returnStr;
}

function fillTree(dataHierarchy, treeId) { //treeId a string without '#', i.e. 'idTextHere'
	var htmlToWrite = createTreeHtml(dataHierarchy, "")
	document.getElementById(treeId).innerHTML += htmlToWrite;
}

////////////////////
//Button functions//
////////////////////

function plotPointsModifyXAttr(val) {
	xAttr = val;
	plotPoints();
}

function plotPointsModifyYAttr(val) {
	yAttr = val;
	plotPoints();
}

function searchForTerms() {
	var inputTerms = document.getElementById('search_box').value.toLowerCase().split(" ");

	//Combine terms enclosed in quotes
	var searchTerms = [];
	var openQuote = false;
	for (i = 0; i < inputTerms.length; i++) {
		term = inputTerms[i];
		if (!openQuote) {
			if (term[0] === '"') {
				var openQuote = true;
				var combineTerms = term.substring(1); //Remove quote from string
			}
			else {
				searchTerms.push(term);
			}
		}
		else {
			if (term[term.length - 1] === '"') {
				var openQuote = false;
				var combineTerms = combineTerms + " " + term.substring(0, term.length-1); //Remove endquote from string
				searchTerms.push(combineTerms);
			}
			else {
				var combineTerms = combineTerms + " " + term;
			}
		}
	}

	//User forgets to close the quote
	if (openQuote) {
		//User encloses single word in quotes
		if (combineTerms[combineTerms.length - 1] === '"') {
			var combineTerms = combineTerms.substring(0, combineTerms.length - 1);
		}
		searchTerms.push(combineTerms);
	}

	//Select nodes meeting search term
	selectNode(svg.selectAll("circle")
		.filter(function (d,i) {
			return searchTerms.some(function (term) {
				return d.label.indexOf(term) !== -1;
			});
		}));

	selectNode(mediaPointSelection()
		.filter(function (d,i) {
			return (d.isToggled === true) &&
			(searchTerms.some(function (term) {
				return d.label.indexOf(term) !== -1;
			}));
		}));
}

function showByClass(classSelector) { //classSelector of the form ".usa.ny.nyc"
	showNodes(productPointSelection()
		.filter(classSelector)
		.filter(function (d,i) {
			return (window.getComputedStyle(this).getPropertyValue("visibility") === "hidden");
		}));
}

function hideByClass(classSelector) { //classSelector of the form ".usa.ny.nyc"
	hideNodes(productPointSelection()
		.filter(classSelector)
		.filter(function (d,i) {
			return (window.getComputedStyle(this).getPropertyValue("visibility") === "visible");
		}));
}

function toggleMedia() {
	if (mediaToggled) {
		clearNode(mediaPointSelection()
			.style("visibility", "hidden")
			.each(function (d,i) {
				d.isToggled = false;
			}));

		mediaToggled = false;
	}

	else {
		mediaPointSelection()
			.style("visibility", "visible")
			.each(function (d,i) {
				d.isToggled = true;
			});

		mediaToggled = true;
	}
}

function runKMeans() {
	//Retrieve k
	var inputK = document.getElementById('k_box').value;
	kMeans(svg.selectAll("circle"), inputK, .0025, 10);
	colorCluster();
}

function clearAll() {
	document.getElementById('search_box').value = "";
	
	svg.selectAll("circle")
		.each(function (d,i) {
			clearNode(d3.select(this));
		});

	mediaPointSelection()
		.each(function (d,i) {
			clearNode(d3.select(this));
		});
}

function colorByInput(input) {
	if (input === "default") {
		colorDefault();
	}

	else if (input === "category") {
		colorCategory();
	}

	else if (input === "cluster") {
		colorCluster();
	}
}

function colorDefault() {
	setBaseColor(svg.selectAll("circle"), defaultColor);
	colorByBase(svg.selectAll("circle"));
}

function colorCategory() {
	setBaseByAttr(svg.selectAll("circle"), "categoryNum");
	colorByBase(svg.selectAll("circle"));
}

function colorCluster() {
	setBaseByAttr(svg.selectAll("circle"), "clusterNum");
	colorByBase(svg.selectAll("circle"));
}

///////////
//D3 Body//
///////////

// //Create axis selection options
// var datum = dataset[0]; //Assumes dataset.length >= 1
// xaxisselect = document.getElementById('selectxaxis');
// yaxisselect = document.getElementById('selectyaxis');

// for (key in datum) {
// 	if (key !== "label" && key !== "categoryNum") {
// 		//Configure axisTitleLookup
// 		axisTitleLookup[key] = key;

// 		//Set x-axis option
// 		var xopt = document.createElement('option');
// 		xopt.value = key;
// 		xopt.innerHTML = key;
// 		xaxisselect.appendChild(xopt);

// 		//Set y-axis option
// 		var yopt = document.createElement('option');
// 		yopt.value = key;
// 		yopt.innerHTML = key;
// 		yaxisselect.appendChild(yopt);
// 	}
//}

//Parse user's input dataset, setting default label and categoryNum properties if needed
for (i = 0; i < dataset.length; i++) {
	var datum = dataset[i];
	if (!("label" in datum)) {
		datum["label"] = "";
	}
	if (!("categoryName" in datum)) {
		datum["categoryName"] = "Undefined";
	}
	if (!("categoryNum" in datum)) {
		datum["categoryNum"] = 0;
	}
}

//Filter master dataset for separate circle (product category) and rect (media category) datasets
var circleDataset = dataset.filter(function (element) {
	return element.categoryNum >= 0;
});
var rectDataset = dataset.filter(function (element) {
	return element.categoryNum < 0;
});

//Create the canvas
var svg = d3.select("#plot-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

//Create a white rect in background for mouseover clear
var canvasRect = svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("type", "canvas")
	.attr("width", width)
	.attr("height", height)
	.attr("fill", "#fff")
	.on("mouseover", function (d,i) {
		clearNotSelected();
		clearHighlighted();
	});

//Create title for chart
svg.append("text")
	.attr("class", "chart title")
	.attr("text-anchor", "middle")
	.attr("x", width / 2)
	.attr("y", padding)
	.text(chartTitle);

//Plot points based on initial xAttr and yAttr
plotPoints();

// console.log(classHierarchy);
// logAllAvailableClasses(classHierarchy, ".", "");

fillTree(classHierarchy, "tree");