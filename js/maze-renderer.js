function renderMaze(ctx, maze, x, y, width, height) {
  var rows = maze.rows();
  var cols = maze.cols();

  var cellWidth = Math.floor(width / cols);
  var cellHeight = Math.floor(height / rows);

  // need to adjust x and y slightly so centered
  x += (width - cellWidth * cols)/2;
  y += (height - cellHeight * rows)/2;

  var rowsArray = [];
  var colsArray = [];

  ctx.beginPath();

  for (var i = 0; i < rows; i++) {
    var rowOffset = y + i * cellHeight;
    var row = [];
    for (var j = 0; j < cols; j++) {
      var colOffset = x + j * cellWidth;
      if (i === 0) {
        colsArray.push([]);
      }
      var cell = maze.get(i, j);
      renderCellBackground(ctx, cell, colOffset, rowOffset, cellWidth, cellHeight);

      row.push(cell);
      colsArray[j].push(cell);
    }
    rowsArray.push(row);
  }

  renderRow(ctx, rowsArray[0], Direction.N, 0, x, y, cellWidth, cellHeight);
  rowsArray.forEach(function(row, index) {
    renderRow(ctx, row, Direction.S, index + 1, x, y, cellWidth, cellHeight);
  });

  renderCol(ctx, colsArray[0], Direction.W, 0, x, y, cellWidth, cellHeight);
  colsArray.forEach(function(col, index) {
    renderCol(ctx, col, Direction.E, index + 1, x, y, cellWidth, cellHeight);
  });
  
  ctx.stroke();
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

function renderCellBackground(ctx, cell, x, y, width, height) {
  if (cell.isMarkedCurrent()) {
    renderSquare(ctx, x, y, width, height, "cyan");
  }
  else if (cell.isMarkedGenerated()) {
    renderSquare(ctx, x, y, width, height, "white");
  }
  else {
    renderSquare(ctx, x, y, width, height, ctx.strokeStyle);
  }
  if (cell.isStart()) {
    renderSquare(ctx, x, y, width, height, "lightgreen");
  }
  if (cell.isFinish()) {
    renderSquare(ctx, x, y, width, height, "red");
  }
}

function renderCell(ctx, cell, x, y, width, height) {
  renderCellBackground(ctx, cell, x, y, width, height);
  Array.from(cell.closedDirections).forEach(function(direction) {
    var offset = Direction.shift(0, 0, direction);
    var rowOffset = offset[0], colOffset = offset[1];
    renderLine(
      ctx,
      // these were derived by writing out each case
      // and generalizing it, no clue what the intuition is
      x + ((colOffset > 0) ? width : 0),
      y + ((rowOffset > 0) ? height : 0),
      x + ((colOffset < 0) ? 0 : width),
      y + ((rowOffset < 0) ? 0 : height)
    );
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

