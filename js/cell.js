function Cell(row, col) {
  this.row = row;
  this.col = col;

  this.id = Cell._idx++;
  this.type = Cell.NORMAL;
  this.marks = new Set();

  this.openDirections = new Set();
  this.closedDirections = new Set(Direction.all());
}
Cell._idx = 1;

// cell types
Cell.NORMAL = "normal";
Cell.START = "start";
Cell.FINISH = "finish";

// cell markers
Cell.GENERATED = "generated";
Cell.CURRENT = "current";
Cell.VISITED = "visited";
Cell.SOLUTION = "solution";

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

Cell.prototype.clearMarks = function() {
  this.marks.clear();
  return this;
};

Cell.prototype.markCurrent = function() {
  this.marks.add(Cell.CURRENT);
  return this;
};

Cell.prototype.markVisited = function() {
  this.marks.add(Cell.VISITED);
  return this;
};

Cell.prototype.markGenerated = function() {
  this.marks.add(Cell.GENERATED);
  return this;
};

Cell.prototype.markSolution = function() {
  this.marks.add(Cell.SOLUTION);
  return this;
};

Cell.prototype.unmarkCurrent = function() {
  this.marks.delete(Cell.CURRENT);
  return this;
};

Cell.prototype.unmarkVisited = function() {
  this.marks.delete(Cell.VISITED);
  return this;
};

Cell.prototype.unmarkGenerated = function() {
  this.marks.delete(Cell.GENERATED);
  return this;
};

Cell.prototype.unmarkSolution = function() {
  this.marks.delete(Cell.SOLUTION);
  return this;
};

Cell.prototype.isMarkedCurrent = function() {
  return this.marks.has(Cell.CURRENT);
};

Cell.prototype.isMarkedVisited = function() {
  return this.marks.has(Cell.VISITED);
};

Cell.prototype.isMarkedGenerated = function() {
  return this.marks.has(Cell.GENERATED);
};

Cell.prototype.isMarkedSolution = function() {
  return this.marks.has(Cell.SOLUTION);
};

/**
 * Returns true if the cell is adjacent to the other given cell
 */
Cell.prototype.isAdjacent = function(other) {
  let drow = Math.abs(this.row - other.row);
  let dcol = Math.abs(this.col - other.col);
  return (drow === 0 && dcol === 1)
      || (drow === 1 && dcol === 0);
};

/**
 * Returns the direction from one cell to another cell
 * The cells must be adjacent
 */
Cell.prototype.directionTo = function(other) {
  var directions = Direction.all();
  for (var i = 0; i < directions.length; i++) {
    var direction = directions[i];
    var shifted = Direction.shift(this.row, this.col, direction);
    if (shifted[0] === other.row && shifted[1] === other.col) {
      return direction;
    }
  }
  throw new Error("Other cell is not adjacent");
};

/**
 * Returns true if there is NO wall between this cell and the other one
 */
Cell.prototype.isOpenTo = function(other) {
  var direction = this.directionTo(other);
  return this.isOpen(direction);
};

