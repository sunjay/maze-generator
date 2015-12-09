function Cell(row, col) {
  this.row = row;
  this.col = col;

  this.id = Cell._idx++;
  this.type = Cell.NORMAL;
  this.mark = null;

  this.openDirections = new Set();
  this.closedDirections = new Set(Direction.all());
}
Cell._idx = 1;

// cell types
Cell.NORMAL = "normal";
Cell.START = "start";
Cell.FINISH = "finish";

// cell markers
Cell.CURRENT = "current";
Cell.VISITED = "visited";

Cell.prototype.isNormal = function() {
  return this.type === Cell.NORMAL;
};

Cell.prototype.isStart = function() {
  return this.type === Cell.START;
};

Cell.prototype.isFinish = function() {
  return this.type === Cell.FINISH;
};

Cell.prototype.setNormal = function() {
  this.type = Cell.NORMAL;
  return this;
};

Cell.prototype.setStart = function() {
  this.type = Cell.START;
  return this;
};

Cell.prototype.setFinish = function() {
  this.type = Cell.FINISH;
  return this;
};

Cell.prototype.open = function(direction) {
  this.closedDirections.delete(direction);
  this.openDirections.add(direction);
  return this;
};

Cell.prototype.close = function(direction) {
  this.openDirections.delete(direction);
  this.closedDirections.add(direction);
  return this;
};

Cell.prototype.isOpen = function(direction) {
  return this.openDirections.has(direction);
};

Cell.prototype.isClosed = function(direction) {
  return this.closedDirections.has(direction);
};

Cell.prototype.removeMark = function() {
  this.mark = null;
  return this;
};

Cell.prototype.markCurrent = function() {
  this.mark = Cell.CURRENT;
  return this;
};

Cell.prototype.markVisited = function() {
  this.mark = Cell.VISITED;
  return this;
};

Cell.prototype.isMarkedCurrent = function() {
  return this.mark === Cell.CURRENT;
};

Cell.prototype.isMarkedVisited = function() {
  return this.mark === Cell.VISITED;
};

/**
 * Returns true if the cell is adjacent to the other given cell
 */
Cell.prototype.isAdjacent = function(other) {
  return Math.abs(this.row - other.row) === 1
      && Math.abs(this.col - other.col) === 1;
};

/**
 * Returns the direction from one cell to another cell
 * The cells must be adjacent
 */
Cell.prototype.directionTo = function(other) {
  if ((this.row - 1) === other.row) {
    return Direction.N;
  }
  else if ((this.row + 1) === other.row) {
    return Direction.S;
  }
  else if ((this.col - 1) === other.col) {
    return Direction.E;
  }
  else if ((this.col + 1) === other.col) {
    return Direction.W;
  }
  else {
    throw new Error("Other cell is not adjacent");
  }
};
