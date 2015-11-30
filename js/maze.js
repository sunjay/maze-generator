function Maze(rows, columns) {
  rows = rows || 20;
  columns = columns || 20;

  this.grid = [];
  for (var i = 0; i < rows; i++) {
    var row = [];
    for (var j = 0; j < rows; j++) {
      row.push(new Cell());
    }
    this.grid.push(row);
  }
}

Maze.prototype.rows = function() {
  return this.grid.length;
};

Maze.prototype.cols = function() {
  return this.grid[0] ? this.grid[0].length : 0;
};

/**
 * Returns the cell at the given row and column
 * Returns undefined if the indexes are out of range
 */
Maze.prototype.get = function(row, col) {
  if (this.grid[row]) {
    return this.grid[row][col];
  }
};

/**
 * Opens up the wall at the cell given by row and column
 * in the direction specified.
 * 
 * Note that this modifies two cells, the one specified
 * and the one adjacent to it in the given direction
 * if there is one.
 */
Maze.prototype.openWall = function(row, col, direction) {
  var cell = this.get(row, col);
  if (!cell) {
    throw new Error("No cell at given row and col");
  }

  cell.open(direction);

  var adjacent = this.adjacentTo(row, col, direction);
  if (adjacent) {
    var opposite = Direction.opposite(direction);
    adjacent.open(opposite);
  }
};

/**
 * Similar to openWall but performs the opposite operation
 */
Maze.prototype.closeWall = function(row, col, direction) {
  var cell = this.get(row, col);
  if (!cell) {
    throw new Error("No cell at given row and col");
  }

  cell.close(direction);

  var adjacent = this.adjacentTo(row, col, direction);
  if (adjacent) {
    var opposite = Direction.opposite(direction);
    adjacent.close(opposite);
  }
};

/**
 * Returns the cell adjacent to the row and column in the given direction
 * If no such cell exists, returns undefined
 */
Maze.prototype.adjacentTo = function(row, col, direction) {
  var adjCoords = Direction.shift(row, col, direction);
  return this.get(adjCoords[0], adjCoords[1]);
};

