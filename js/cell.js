function Cell() {
  this.openDirections = new Set();
  this.closedDirections = new Set(Direction.all());
}

Cell.prototype.open = function(direction) {
  this.closedDirections.delete(direction);
  this.openDirections.add(direction);
};

Cell.prototype.close = function(direction) {
  this.openDirections.delete(direction);
  this.closedDirections.add(direction);
};

Cell.prototype.isOpen = function(direction) {
  return this.openDirections.has(direction);
};

Cell.prototype.isClosed = function(direction) {
  return this.closedDirections.has(direction);
};
