function Cell(row, col) {
  this.row = row;
  this.col = col;

  this.id = Cell._idx++;
  this.type = Cell.NORMAL;

  this.openDirections = new Set();
  this.closedDirections = new Set(Direction.all());
}
Cell._idx = 1;

Cell.NORMAL = "normal";
Cell.START = "start";
Cell.FINISH = "finish";

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
