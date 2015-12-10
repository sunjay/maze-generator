function MazeRenderer(maze) {
  this.maze = maze;
  // padding will not be perfectly applied due to rounding during rendering
  this.padding = 3;

  this.canvas = {
    background: null,
    walls: null,
    solution: null
  };
  this.ctx = {
    background: null,
    walls: null,
    solution: null
  };
  this.config = {
    walls: {
      style: '#444',
      lineWidth: 2
    }
  }
}

MazeRenderer.prototype.setBackgroundCanvas = function(canvas, ctx) {
  this.canvas.background = canvas;
  this.ctx.background = ctx || canvas.getContext("2d");
};

MazeRenderer.prototype.setWallsCanvas = function(canvas, ctx) {
  this.canvas.walls = canvas;
  this.ctx.walls = ctx || canvas.getContext("2d");
};

MazeRenderer.prototype.setSolutionCanvas = function(canvas, ctx) {
  this.canvas.solution = canvas;
  this.ctx.solution = ctx || canvas.getContext("2d");
};

MazeRenderer.prototype.render = function() {
  this.renderBackground();
  this.renderWalls();
  this.renderSolution();
};

MazeRenderer.prototype.renderBackground = function() {
  if (!this.canvas.background || !this.ctx.background) {
    return;
  }
  var canvas = this.canvas.background;
  var ctx = this.ctx.background;
  var info = this._drawingInfo(canvas, ctx);

  ctx.clearRect(0, 0, info.width, info.height);

  for (var i = 0; i < info.rows; i++) {
    var rowOffset = info.y + i * info.cellHeight;
    var row = [];
    for (var j = 0; j < info.cols; j++) {
      var colOffset = info.x + j * info.cellWidth;

      var cell = this.maze.get(i, j);
      this.renderCellBackground(ctx, cell, colOffset, rowOffset, info.cellWidth, info.cellHeight);
    }
  }
};

MazeRenderer.prototype.renderWalls = function() {
  if (!this.canvas.walls || !this.ctx.walls) {
    return;
  }
  var canvas = this.canvas.walls;
  var ctx = this.ctx.walls;
  var info = this._drawingInfo(canvas, ctx);

  ctx.clearRect(0, 0, info.width, info.height);
  ctx.lineWidth = this.config.walls.lineWidth;
  ctx.strokeStyle = this.config.walls.style;

  var rowsArray = [];
  var colsArray = [];

  ctx.beginPath();

  for (var i = 0; i < info.rows; i++) {
    var row = [];
    for (var j = 0; j < info.cols; j++) {
      if (i === 0) {
        colsArray.push([]);
      }
      var cell = this.maze.get(i, j);

      row.push(cell);
      colsArray[j].push(cell);
    }
    rowsArray.push(row);
  }

  renderRow(ctx, rowsArray[0], Direction.N, 0, info.x, info.y, info.cellWidth, info.cellHeight);
  rowsArray.forEach(function(row, index) {
    renderRow(ctx, row, Direction.S, index + 1, info.x, info.y, info.cellWidth, info.cellHeight);
  });

  renderCol(ctx, colsArray[0], Direction.W, 0, info.x, info.y, info.cellWidth, info.cellHeight);
  colsArray.forEach(function(col, index) {
    renderCol(ctx, col, Direction.E, index + 1, info.x, info.y, info.cellWidth, info.cellHeight);
  });
  
  ctx.stroke();
};

MazeRenderer.prototype.renderSolution = function() {
  if (!this.canvas.solution || !this.ctx.solution) {
    return;
  }
  var canvas = this.canvas.solution;
  var ctx = this.ctx.solution;
  var info = this._drawingInfo(canvas, ctx);

  ctx.clearRect(0, 0, info.width, info.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'blue';

  renderConnected(ctx, this.maze, info.x, info.y, info.drawingWidth, info.drawingHeight, function(cell) {
    return cell.isMarkedVisited();
  });
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#33FF00';
  renderConnected(ctx, this.maze, info.x, info.y, info.drawingWidth, info.drawingHeight, function(cell) {
    return cell.isMarkedSolution();
  });
};

MazeRenderer.prototype._drawingInfo = function(canvas, ctx) {
  var x = this.padding;
  var y = this.padding;
  var width = canvas.width;
  var height = canvas.height;

  var drawingWidth = width - this.padding * 2;
  var drawingHeight = height - this.padding * 2;

  var rows = this.maze.rows();
  var cols = this.maze.cols();

  var cellWidth = Math.floor(width / cols);
  var cellHeight = Math.floor(height / rows);

  // need to adjust x and y slightly so centered
  x += (width - cellWidth * cols)/2;
  y += (height - cellHeight * rows)/2;

  return {
    x: x,
    y: y,
    width: width,
    height: height,
    drawingWidth: drawingWidth,
    drawingHeight: drawingHeight,
    rows: rows,
    cols: cols,
    cellWidth: cellWidth,
    cellHeight: cellHeight
  };
};

MazeRenderer.prototype.renderCellBackground = function(ctx, cell, x, y, width, height) {
  if (cell.isMarkedCurrent()) {
    renderSquare(ctx, x, y, width, height, "cyan");
  }
  else if (cell.isMarkedGenerated()) {
    renderSquare(ctx, x, y, width, height, "white");
  }
  else {
    renderSquare(ctx, x, y, width, height, this.config.walls.style);
  }
  if (cell.isStart()) {
    renderSquare(ctx, x, y, width, height, "lightgreen");
  }
  if (cell.isFinish()) {
    renderSquare(ctx, x, y, width, height, "red");
  }
}

/*
 * Renders the given direction across the entire row
 * adjoining adjacent walls.
 * direction should be N or S
 */
function renderRow(ctx, row, direction, index, x, y, width, height) {
  var offset = y + index * height;
  adjoinAndRender(row, direction, function(index1, index2) {
    renderLine(ctx, x + index1 * width, offset, x + index2 * width, offset);
  });
}

/*
 * Renders the given direction across the entire col
 * adjoining adjacent walls.
 * direction should be W or E
 */
function renderCol(ctx, col, direction, index, x, y, width, height) {
  var offset = x + index * width;
  adjoinAndRender(col, direction, function(index1, index2) {
    renderLine(ctx, offset, y + index1 * height, offset, y + index2 * height);
  });
}

/**
 * Goes through the given cells and calls render(index1, index2)
 * Automatically adjoins adjacent cells where the direction is closed
 */
function adjoinAndRender(cells, direction, render) {
  var currentRunStart = null;
  for (var i = 0; i <= cells.length; i++) {
    var cell = cells[i];

    if (cell && cell.isClosed(direction)) {
      if (currentRunStart === null) {
        currentRunStart = i;
      }
    }
    else {
      if (currentRunStart !== null) {
        render(currentRunStart, i);
        currentRunStart = null;
      }
    }
  }
}

function renderConnected(ctx, maze, x, y, width, height, criteraCallback) {
  var cellWidth = Math.floor(width / maze.cols());
  var cellHeight = Math.floor(height / maze.rows());

  // need to adjust x and y slightly so centered
  x += (width - cellWidth * maze.cols())/2;
  y += (height - cellHeight * maze.rows())/2;

  ctx.beginPath();
  for (var i = 0; i < maze.rows(); i++) {
    var rowOffset = y + cellHeight * i;
    for (var j = 0; j < maze.cols(); j++) {
      var colOffset = x + cellWidth * j;

      var cell = maze.get(i, j);
      if (criteraCallback(cell)) {
        renderCellConnections(ctx, maze, cell, colOffset, rowOffset, cellWidth, cellHeight, criteraCallback);
      }
    }
  }
  ctx.stroke();
}

function renderCellConnections(ctx, maze, cell, x, y, width, height, criteraCallback) {
  var centerX = x + width/2;
  var centerY = y + height/2;
  maze.openAdjacents(cell).forEach(function(adj) {
    if (criteraCallback(adj)) {
      var direction = cell.directionTo(adj);
      var offset = Direction.shift(0, 0, direction);
      var rowOffset = offset[0], colOffset = offset[1];
      renderLine(ctx,
        // from center to...
        centerX,
        centerY,
        // corresponding side
        centerX + width/2 * colOffset,
        centerY + height/2 * rowOffset
      );
    }
  });
}

function renderLine(ctx, x, y, x2, y2) {
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
}

function renderCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2*Math.PI);
  ctx.fill();
}

function renderSquare(ctx, x, y, width, height, style) {
  var fillStyle = ctx.fillStyle;

  ctx.fillStyle = style;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillStyle;
}

