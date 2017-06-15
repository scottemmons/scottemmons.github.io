// Global variables
var logoWidth = 12;
var logoHeight = 15;
var terminalWidth = 8;
var terminalHeight = 6;
var tileDim = 10; /* Choose an even number i.e. 14 */
var scaling = 30; /* Choose a multiple of tileDim i.e. 42 */
var boardWidth = (terminalWidth * scaling) / tileDim;
var boardHeight = (terminalHeight * scaling) / tileDim;
var topology = "plane"; /* Plane and torus supported */
var liveColor = "#3dc06c";
var deadColor = "#2a2d2d";
var canvas = document.getElementById("game-container");
var ctx = canvas.getContext("2d");
var tiles = emptyBoard()
var mouseDown = 0;
var highlighted = {x: -1, y: -1};
var playing = false;
var id = -1;

function mousePosition(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function emptyBoard() {
	var board = new Array(boardWidth);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(boardHeight);
		for (var j = 0; j < board[i].length; j++) {
			board[i][j] = false;
		}
	}
	return board;
}

function drawScaledRect(x, y, width, height, fill) {
	ctx.fillStyle = fill;
	ctx.fillRect(scaling*x, scaling*y, scaling*width, scaling*height);
}

function birthInitialTiles(x, y, width, height) {
	x = x - 2;
	y = y - 2;
	for (var i = (x * scaling) / tileDim; i < ((x + width) * scaling) / tileDim; i++) {
  		for (var j = (y * scaling) / tileDim; j < ((y + height) * scaling) / tileDim; j++) {
  			tiles[i][j] = true;
  		}
  	}
}

function tileNWCorner(x, y) {
	return {
		x: 2 * scaling + x * tileDim,
		y: 2 * scaling + y * tileDim
	};
}

function tileSECorner(x, y) {
	return {
		x: 2 * scaling + (x + 1) * tileDim - 1,
		y: 2 * scaling + (y + 1) * tileDim - 1
	};
}

function drawTile(x, y, status) {
	if (tiles[x][y]) {
		ctx.fillStyle = liveColor;
	} else {
		ctx.fillStyle = deadColor;
	}
	var NWCorner = tileNWCorner(x, y);
	ctx.fillRect(NWCorner.x, NWCorner.y, tileDim, tileDim);
}

function drawTiles() {
	for (var i = 0; i < tiles.length; i++) {
		for (var j = 0; j < tiles[i].length; j++) {
			drawTile(i, j);
			if (i == highlighted.x && j == highlighted.y) {
				highlightTile(i, j);
			}
		}
	}
	return;
}

function adjacent(x, y, dx, dy) {
	ax = x + dx;
	ay = y + dy;
	if (topology == "torus") {
		/* Adding boardWidth because of JavaScript's "%" operator */
		ax = (ax + boardWidth) % boardWidth;
		ay = (ay + boardHeight) % boardHeight;
	}
	return {
		x: ax,
		y: ay
	};
}

function validTile(x, y) {
	return (0 <= x && x < boardWidth && 0 <= y && y < boardHeight);
}

function adjTiles(x, y) {
	var adj = [];
	var deltas = [
		[-1, -1],
		[0, -1],
		[1, -1],
		[-1, 0],
		[1, 0],
		[-1, 1],
		[0, 1],
		[1, 1]
	];
	for (var i = 0; i < deltas.length; i++) {
		var dx = deltas[i][0];
		var dy = deltas[i][1];
		adj.push(adjacent(x, y, dx, dy));
	}
	return adj;
}

function numNeighbors(x, y) {
	var neighbors = 0;
	var adjs = adjTiles(x, y
		);
	for (var i = 0; i < adjs.length; i++) {
		var adj = adjs[i];
		if (validTile(adj.x, adj.y)) {
			if (tiles[adj.x][adj.y]) {
				neighbors = neighbors + 1;
			}
		}
	}
	return neighbors;
}

function posToTile(x, y) {
	return {
		x: Math.floor((x - 2 * scaling) / tileDim),
		y: Math.floor((y - 2 * scaling) / tileDim)
	};
}

function highlightTile(x, y, light) {
	var nw = tileNWCorner(x, y);
	var se = tileSECorner(x, y);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(nw.x, nw.y, tileDim - 1, 2);
	ctx.fillRect(nw.x, nw.y, 2, tileDim - 1);
	ctx.fillRect(se.x, se.y, -tileDim + 1, -2);
	ctx.fillRect(se.x, se.y, -2, -tileDim + 1);
}

function toggleTile(x, y) {
	if (validTile(x, y)) {
		tiles[x][y] = !tiles[x][y];
		drawTiles();
	}
}

function initialize() {
	canvas.setAttribute("width",logoWidth*scaling);
	canvas.setAttribute("height",logoHeight*scaling);

	// Draw logo background
	drawScaledRect(0, 0, 12, 1, "#2a2d2d");
	drawScaledRect(0, 0, 1, 10, "#2a2d2d");
	drawScaledRect(11, 0, 1, 10, "#2a2d2d");
	drawScaledRect(0, 9, 12, 1, "#2a2d2d");
	drawScaledRect(4, 9, 4, 3, "#2a2d2d");

  	drawScaledRect(1, 11, 10, 1, "#2a2d2d");
  	drawScaledRect(1, 11, 1, 4, "#2a2d2d");
  	drawScaledRect(10, 11, 1, 4, "#2a2d2d");
  	drawScaledRect(1, 14, 10, 1, "#2a2d2d");

  	drawScaledRect(0, 12, 2, 3, "#2a2d2d");
  	drawScaledRect(10, 12, 2, 3, "#2a2d2d");

  	drawScaledRect(10, 12, 2, 3, "#2a2d2d");

  	drawScaledRect(1, 11, 2, 2, "#2a2d2d");
  	drawScaledRect(4, 11, 1, 2, "#2a2d2d");
  	drawScaledRect(6, 11, 1, 2, "#2a2d2d");
  	drawScaledRect(8, 11, 1, 2, "#2a2d2d");

  	drawScaledRect(9, 13, 2, 2, "#2a2d2d");
  	drawScaledRect(7, 13, 1, 2, "#2a2d2d");
  	drawScaledRect(5, 13, 1, 2, "#2a2d2d");
  	drawScaledRect(3, 13, 1, 2, "#2a2d2d");

  	drawScaledRect(1, 1, 10, 8, "#fff");
  	drawScaledRect(2, 13, 1, 1, "#fff");
  	drawScaledRect(3, 12, 1, 1, "#fff");
  	drawScaledRect(4, 13, 1, 1, "#fff");
  	drawScaledRect(5, 12, 1, 1, "#fff");
  	drawScaledRect(6, 13, 1, 1, "#fff");
  	drawScaledRect(7, 12, 1, 1, "#fff");
  	drawScaledRect(8, 13, 1, 1, "#fff");
  	drawScaledRect(9, 12, 1, 1, "#fff");

  	drawScaledRect(2, 2, 8, 6, "#2a2d2d");

  	// Draw terminal display
  	// drawScaledRect(2, 3, 1, 1, "#3dc06c");
  	// drawScaledRect(4, 3, 1, 1, "#3dc06c");
  	// drawScaledRect(6, 3, 1, 1, "#3dc06c");
  	// drawScaledRect(3, 5, 2, 1, "#3dc06c");
  	// drawScaledRect(6, 5, 2, 1, "#3dc06c");

  	// Default live tiles aligning with logo
  	birthInitialTiles(2, 3, 1, 1);
  	birthInitialTiles(4, 3, 1, 1);
  	birthInitialTiles(6, 3, 1, 1);
  	birthInitialTiles(3, 5, 2, 1);
  	birthInitialTiles(6, 5, 2, 1);
  	drawTiles();
}

function highlight(evt) {
	var pos = mousePosition(canvas, evt);
	var tile = posToTile(pos.x, pos.y);
	if (tile.x == highlighted.x && tile.y == highlighted.y) {
		return;
	}
	var oldx = highlighted.x;
	var oldy = highlighted.y;
	highlighted.x = tile.x;
	highlighted.y = tile.y; 
	if ((oldx != tile.x || oldy != tile.y)
		&& validTile(oldx, oldy)) {
		drawTiles();
	}
	if (validTile(tile.x, tile.y)) {
		if (mouseDown) {
			toggleTile(tile.x, tile.y);
		} else {
			highlightTile(tile.x, tile.y, true);
		}
	}
}

function toggle(evt) {
	var pos = mousePosition(canvas, evt);
	var tile = posToTile(pos.x, pos.y);
	toggleTile(tile.x, tile.y);
}

function iterate() {
	var iterated = emptyBoard();
	var neighbors = 0;
	for (var i = 0; i < tiles.length; i++) {
		for (var j = 0; j < tiles[i].length; j++) {
			neighbors = numNeighbors(i, j);
			if (neighbors == 3) {
				iterated[i][j] = true;
			} else if (tiles[i][j] && neighbors == 2) {
				iterated[i][j] = true;
			} else {
				iterated[i][j] = false;
			}
		}
	}
	tiles = iterated;
	drawTiles();
}

function play() {
	id = setInterval(iterate, 500);
}

function pause() {
	clearInterval(id);
}

initialize();

document.body.onmousedown = function() {
	mouseDown = mouseDown + 1;
}

document.body.onmouseup = function() {
	mouseDown = mouseDown - 1;
}

window.addEventListener("keydown", function (evt) {
	// Prevent handling same event twice
	if (evt.defaultPrevented) {
		return;
	}

	switch (evt.key) {
		case "Enter":
			if (playing) {
				pause();
				playing = false;
			} else {
	  			play();
	  			playing = true;
	  		}
	  		break;
	  	default:
	  		return;
	  	}

	evt.preventDefault();
}, true);