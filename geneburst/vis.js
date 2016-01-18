///////////
// To Do //
///////////
// Handle change in upload file
// Make plots drag-and-droppable like http://jsfiddle.net/tovic/85EpZ/

// Credits to http://bl.ocks.org/syntagmatic/raw/3299303/
// for csv upload features

// Supporting multiple plots per row.
var plotsInRow = 2;

// Dimensions of sunburst.
var width = 750 / plotsInRow;
var height = 400;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 100, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
// var colors = {
//   "home": "#5687d1",
//   "product": "#7b615c",
//   "search": "#de783b",
//   "account": "#6ab975",
//   "other": "#a173d1",
//   "end": "#bbbbbb"
// };

// Alphabetic sorting instead of default sorting by size
var sortAlphabetically = true;

var maxColorVal = 1275;
// Color of each arc based on its start angle and end angle
var angleColors = true;
// Color based on the range of color of partition's parent
var partitionColor = true;
// To be used if both angleColors and partitionColor are false
var colors = ["#5687d1", "#7b615c", "#de783b", "#6ab975", "#a173d1", "#bbbbbb"];

// To select elements among multiple plots
currentPlot = 1;

// To be parsed to JSON
var csvFileName = "otu_table_filtered_L6.csv";
var sequenceDelimiter = ";";
var maxDepth = 0;

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

if (sortAlphabetically) {
  partition.sort(function(a, b) { return a.name.localeCompare(b.name); });
}

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Basic setup of page elements.
initializeBreadcrumbTrail();

// Use d3.text and d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
// d3.text(csvFileName, function(text) {
//   var csv = d3.csv.parseRows(text);
//   var json = buildHierarchy(csv, sequenceDelimiter, false);
//   console.log(json);
//   createVisualization(json);
//   // console.log(json["6.2100m"]);
//   // createVisualization(json["6.2100m"]);
//   //createVisualization(json["3.1950m"]);
//
// });

function handleUpload(id, toReceive) {
  var uploader = document.getElementById(id);
  var reader = new FileReader();

  reader.onload = function(event) {
    var text = event.target.result;
    toReceive(text);
  }

  uploader.addEventListener("change", handleFileChange, false);

  function handleFileChange() {
    // placeholder for usability features, i.e. "loading..." message
    var file = this.files[0];
    reader.readAsText(file);
  }
}

function receiveUpload(text) {
  var csv = d3.csv.parseRows(text);
  var combinedJson = buildHierarchy(csv, sequenceDelimiter, false);
  var containedJson = buildHierarchy(csv, sequenceDelimiter, true);
  //console.log(combinedJson);
  createVisualization(combinedJson, combinedJson);
  createVisualization(combinedJson, combinedJson);
  createVisualization(containedJson["6.2100m"], combinedJson);
  createVisualization(containedJson["3.1950m"], combinedJson);
}

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json, basemap) {

  // Basic setup of page elements.
  var vis = appendChart(currentPlot);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
    .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .attr("plotnum", function(d) {return currentPlot;})
      .style("fill", function(d) {
        if (angleColors) {
          return determineAngleColor(retrieveFromHierarchy(basemap, getAncestors(d, false, true)), d.depth);
        } else if (partitionColor) {
          return determinePartitionColor(d);
        } else {
          return determineNameColor(d);
        }
      })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.selectAll("#chart").on("mouseleave", mouseleave);

  currentPlot += 1;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage, percentageString;

  d3.selectAll(".explanation")
      .style("visibility", "hidden");

  updateBreadcrumbs(getAncestors(d, false, false), percentageString);
  var sequenceNameArray = getAncestors(d, false, true);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  d3.selectAll("path")
      .filter(function(node) {
                // return isUnderUmbrella(getAncestors(node, false, true), sequenceNameArray)
                //   && childrenContainLine(node, sequenceNameArray);
                nodeAncestors = getAncestors(node, false, true);
                if ((nodeAncestors.length == sequenceNameArray.length)
                  && isUnderUmbrella(nodeAncestors, sequenceNameArray)) {
                    totalSize = getAncestors(node, true, false)[0].value;
                    percentage = (100 * node.value / totalSize).toPrecision(3);
                    percentageString = percentage + "%";
                    if (percentage < 0.1) {
                      percentageString = "< 0.1%";
                    }
                    d3.selectAll("#percentage" + this.getAttribute("plotnum"))
                        .text(percentageString)
                    d3.selectAll("#taxon" + this.getAttribute("plotnum"))
                        .text(d.name);
                    d3.selectAll("#explanation" + this.getAttribute("plotnum"))
                        .style("visibility", "");
                    console.log('#explanation' + this.getAttribute("plotnum"));
                    return true;
                }
                return false;
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.selectAll(".explanation")
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node, getRoot, nameOnly) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(nameOnly ? current.name : current);
    current = current.parent;
  }
  if (getRoot) {
    path.unshift(nameOnly ? current.name : current);
  }
  return path;
}

function retrieveFromHierarchy(hierarchy, line) {
  object = hierarchy;
  for (var i = 0; i < line.length; i++) {
    name = line[i];
    children = object.children;
    for (var j = 0; j < children.length; j++) {
      if (line[i] == children[j].name) {
        object = children[j];
        continue;
      } 
    }
  }
  return object;
}

function isUnderUmbrella(line, umbrella) {
  if (line.length > umbrella.length) {
    return false;
  }
  for (i = 0; i < line.length; i++) {
    if (line[i] != umbrella[i]) {
      return false;
    }
  }
  return true;
}

function childrenContainLine(object, line) {
  if (object.depth > line.length) {
    return false;
  }
  current = object;
  for (i = object.depth; i < line.length; i++) {
    childNames = [];
    for (j = 0; j < current.children.length; j++) {
      childNames.push(current.children[j].name);
    }
    if (childNames.indexOf(line[i]) < 0) {
      return false;
    }
    current = current.children[childNames.indexOf(line[i])];
  }
  console.log(object);
  console.log(line);
  return true;
}

function appendChart(plotNum) {
  var chart = document.createElement('div');
  chart.id = "chart";
  chart.setAttribute("style", "width:" + String(width) + "px;" + 
    'display:inline-block;');
  chart.innerHTML = '<div class="explanation" id="explanation' + plotNum.toString() +
    '" +style="visibility: hidden;">' +
    '<span class="percentage" id="percentage' + plotNum.toString() +
    '"></span><br/>of community is the taxon ' +
    '<span id="taxon' + plotNum.toString() + '"></span></div>';
  document.getElementById('plot-container').appendChild(chart)
  var vis = d3.select(chart).append("svg:svg")
      .attr("width", width)
      .attr("height", height)
    .append("svg:g")
      .attr("id", "container")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  return vis
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width * plotsInRow)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) {
        if (angleColors) {
          return determineAngleColor(d, d.depth);
        } else if (partitionColor) {
          return determinePartitionColor(d);
        } else {
          return determineNameColor(d);
        }
      });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) {
        if (d.name.length < 14) {
          return d.name;
        }
        else {
          return d.name.slice(0,13)
        }
      });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv, sequenceDelimiter, makeContainer) {
  var csvWidth = csv[0].length; // Assumes all rows are of equal width
  if (makeContainer) {
    var container = {};
  }
  var root = {"name": "root", "children": []};
  for (var column = 1; column < csvWidth; column++) {
    if (makeContainer) {
      root = {"name": "root", "children": []};
      var columnHeader = csv[0][column]
    }
    for (var i = 1; i < csv.length; i++) {
      var sequence = csv[i][0];
      var size = csv[i][column];
      if (isNaN(size)) {
        throw "Error: size value is not a number";
      }
      var parts = sequence.split(sequenceDelimiter);
      if (parts.length > maxDepth) {
        maxDepth = parts.length;
      }
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          var foundChild = false;
          for (var k = 0; k < children.length; k++) {
            if (children[k]["name"] == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          // If we don't already have a child node for this branch, create it.
          if (!foundChild) {
            childNode = {"name": nodeName, "children": []};
            children.push(childNode);
          }
          currentNode = childNode;
        } else {
          // Reached the end of the sequence; merge or create leaf node.
          var mergedLeaf = false;
          for (var k = 0; k < children.length; k++) {
            if (children[k]["name"] == nodeName) {
              children[k]["size"] = String((Number(children[k]["size"]) + Number(size)));
              mergedLeaf = true;
              break;
            }
          }
          if (!mergedLeaf) {
            childNode = {"name": nodeName, "size": size};
            children.push(childNode);
          }
        }
      }
    }
    if (makeContainer) {
      container[columnHeader] = root;
    }
  }
  if (makeContainer) {
    return container;
  } else {
    return root;
  }
};

function determineAngleColor(obj, depth) {
  // startAngleColorVal = (obj.x / (2 * Math.PI)) * maxColorVal;
  // endAngleColorVal = ((obj.x + obj.dx) / (2 * Math.PI)) * maxColorVal;
  //return rgbMap((startAngleColorVal + endAngleColorVal) / 2 % 1275);
  startAngleColorVal = (obj.x / (2 * Math.PI)) * 360;
  endAngleColorVal = ((obj.x + obj.dx) / (2 * Math.PI)) * 360;
  percentage = String(100 - (depth / (2 * maxDepth)) * 100) + "%"
  return "hsl(" + String((startAngleColorVal + endAngleColorVal) / 2) + "," + percentage + ",50%)";
}

function determinePartitionColor(obj) {
  ancestors = getAncestors(obj, true, false);
  width = maxColorVal;
  position = 0;
  for (i = 0; i < ancestors.length - 1; i++) {
    pieces = ancestors[i].children.filter(function (obj) { return (obj.dx > (.015) * 2 * Math.PI) || (obj.dx > (.015) * 2 * Math.PI) }).length;
    if (pieces >= 3 && (pieces % 2) != 0) { // *
      // Corrects for repition of color in child partitions
      pieces = pieces + 1; // *
    } // *
    if (pieces != 0) {
      width = width / pieces;
      console.log(ancestors[i].children.indexOf(ancestors[i+1]));
      position = position + ancestors[i].children.indexOf(ancestors[i+1]) * width;
    }
  }
  position = position + width / 2;
  color = rgbMap(position);
  if (typeof color == "undefined") {
    return "#dddddd";
  }
  return color;
}

// To determine name color
// Source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function determineNameColor(obj) {
  return colors[Math.abs(obj.name.hashCode()) % colors.length];
}

function rgbMap(n) {

  // Credits to user Adamarla on SO: http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
  function decimalToHex(decimal, chars) {
    return (Math.round(decimal) + Math.pow(16, chars)).toString(16).slice(-chars);
  }

  // Modified
  if (255 * 0 <= n && n <= 255 * 1) {
    if (n == 255 * 0) { return "#ff0000";
    } else if (n == 255 * 1) { return "#ffff00"; }
    return "#ff" + decimalToHex(n % 255, 2) + "00";
  } else if (255 * 1 < n && n <= 255 * 2) {
    if (n == 255 * 2) return "00ff00";
    return "#" + decimalToHex(255 - n % 255, 2) + "ff00";
  } else if (255 * 2 < n && n <= 255 * 3) {
    if (n == 255 * 3) return "#00ffff";
    return "#00ff" + decimalToHex(n % 255, 2);
  } else if (255 * 3 < n && n <= 255 * 4) {
    if (n == 255 * 4) return "#0000ff";
    return "#00" + decimalToHex(255 - n % 255, 2) + "ff";
  } else if (255 * 4 < n && n <= 255 * 5) {
    if (n == 255 * 5) return "#ff00ff";
    return "#" + decimalToHex(n % 255, 2) + "00ff";
  }

  // // Original with maxColorVal = 1530
  // if (0 <= n && n <= 255 * 1) {
  //   return "#" + decimalToHex(n, 2) + "0000";
  // } else if (255 * 1 < n && n <= 255 * 2) {
  //   if (n == 255 * 2) return "#ffff00";
  //   return "#ff" + decimalToHex(n % 255, 2) + "00";
  // } else if (255 * 2 < n && n <= 255 * 3) {
  //   if (n == 255 * 3) return "00ff00";
  //   return "#" + decimalToHex(255 - n % 255, 2) + "ff00";
  // } else if (255 * 3 < n && n <= 255 * 4) {
  //   if (n == 255 * 4) return "#00ffff";
  //   return "#00ff" + decimalToHex(n % 255, 2);
  // } else if (255 * 4 < n && n <= 255 * 5) {
  //   if (n == 255 * 5) return "#0000ff";
  //   return "#00" + decimalToHex(255 - n % 255, 2) + "ff";
  // } else if (255 * 5 < n && n <= 255 * 6) {
  //   if (n == 255 * 6) return "#ff00ff";
  //   return "#" + decimalToHex(n % 255, 2) + "00ff";
  // }
}