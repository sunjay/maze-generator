function Cell() {
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
};

Cell.prototype.setStart = function() {
  this.type = Cell.START;
};

Cell.prototype.setFinish = function() {
  this.type = Cell.FINISH;
};

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
