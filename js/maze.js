function Maze(rows, columns) {
  rows = rows || 50;
  columns = columns || 50;

  this.grid = [];
  for (var i = 0; i < rows; i++) {
    var row = [];
    for (var j = 0; j < rows; j++) {
      row.push(new Cell(i, j));
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
 * Returns whether a cell is on an edge
 */
Maze.prototype.isEdge = function(cell) {
  return cell.row === 0 || cell.row === (this.rows()-1)
    || cell.col === 0 || cell.col === (this.cols()-1);
};

/**
 * Returns a list of all the edge cells (in no particular order)
 */
Maze.prototype.edgeCells = function() {
  var rows = this.rows();
  var cols = this.cols();

  var edges = [];
  for (var i = 0; i < rows; i++) {
    edges.push(this.get(i, 0));
    edges.push(this.get(i, cols - 1));
  }
  for (var j = 0; j < cols; j++) {
    edges.push(this.get(0, j));
    edges.push(this.get(rows - 1, j));
  }
  return edges;
};

/**
 * Returns a random edge cell not equal to the given cell if provided
 */
Maze.prototype.randomEdge = function(other) {
  var random = this._randomEdge();
  while (random === other) {
    random = this._randomEdge();
  }
  return random;
};

Maze.prototype._randomEdge = function() {
  var edges = this.edgeCells();
  return edges[Math.floor(edges.length * Math.random())];
};

/**
 * Opens the wall between two cells
 * The cells must be adjacent or this will not work
 */
Maze.prototype.openBetween = function(cell, other) {
  var direction = cell.directionTo(other);
  this.openWall(cell, direction);
};

/**
 * Similar to openBetween but performs the opposite operation
 */
Maze.prototype.closeBetween = function(cell, other) {
  var direction = cell.directionTo(other);
  this.closeWall(cell, direction);
};

/**
 * Opens up the wall at the cell in the direction specified.
 * 
 * Note that this modifies two cells, the one specified
 * and the one adjacent to it in the given direction
 * if there is one.
 */
Maze.prototype.openWall = function(cell, direction) {
  cell.open(direction);

  var adjacent = this.adjacentTo(cell, direction);
  if (adjacent) {
    var opposite = Direction.opposite(direction);
    adjacent.open(opposite);
  }
};

/**
 * Similar to openWall but performs the opposite operation
 */
Maze.prototype.closeWall = function(cell, direction) {
  cell.close(direction);

  var adjacent = this.adjacentTo(cell, direction);
  if (adjacent) {
    var opposite = Direction.opposite(direction);
    adjacent.close(opposite);
  }
};

/**
 * Returns all the adjacent cells to the given cell
 * May not always be four for edge vertexes
 */
Maze.prototype.adjacents = function(cell) {
  var adjacents = [];
  Direction.all().forEach(function(direction) {
    var adj = this.adjacentTo(cell, direction);
    if (adj) {
      adjacents.push(adj);
    }
  }.bind(this));
  return adjacents;
};

/**
 * Returns the cell adjacent to the given cell in the given direction
 * If no such cell exists, returns undefined
 */
Maze.prototype.adjacentTo = function(cell, direction) {
  var adjCoords = Direction.shift(cell.row, cell.col, direction);
  return this.get(adjCoords[0], adjCoords[1]);
};

