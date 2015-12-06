function renderMaze(ctx, maze, x, y, width, height) {
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
      renderCell(ctx, cell, colOffset, rowOffset, cellWidth, cellHeight);
    }
  }
  ctx.stroke();
}

function renderCell(ctx, cell, x, y, width, height) {
  if (cell.isStart()) {
    renderSquare(ctx, x, y, width, height, "lightgreen");
  }
  if (cell.isFinish()) {
    renderSquare(ctx, x, y, width, height, "red");
  }
  if (cell.isClosed(Direction.N)) {
    renderLine(ctx, x, y, x + width, y);
  }
  if (cell.isClosed(Direction.S)) {
    renderLine(ctx, x, y + height, x + width, y + height);
  }
  if (cell.isClosed(Direction.E)) {
    renderLine(ctx, x, y, x, y + height);
  }
  if (cell.isClosed(Direction.W)) {
    renderLine(ctx, x + width, y, x + width, y + height);
  }
}

function renderLine(ctx, x, y, x2, y2) {
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
}

function renderSquare(ctx, x, y, width, height, style) {
  var fillStyle = ctx.fillStyle;

  ctx.fillStyle = style;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = fillStyle;
}
