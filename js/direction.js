function Direction() {
  throw new Error("Don't use this constructor");
}

Direction.N = 'north';
Direction.S = 'south';
Direction.E = 'east';
Direction.W = 'west';

Direction.OPPOSITES = {};
Direction.OPPOSITES[Direction.N] = Direction.S;
Direction.OPPOSITES[Direction.S] = Direction.N;
Direction.OPPOSITES[Direction.E] = Direction.W;
Direction.OPPOSITES[Direction.W] = Direction.E;

// Represents a translation of 1 unit in that direction
Direction.TRANSLATIONS = {};
// [row, col]
Direction.TRANSLATIONS[Direction.N] = [-1, 0];
Direction.TRANSLATIONS[Direction.S] = [+1, 0];
Direction.TRANSLATIONS[Direction.E] = [0, +1];
Direction.TRANSLATIONS[Direction.W] = [0, -1];

/**
 * Returns a list of all the directions
 */
Direction.all = function() {
  return [Direction.N, Direction.S, Direction.E, Direction.W];
};

/**
 * Returns the opposite of the given direction
 */
Direction.opposite = function(direction) {
  return Direction.OPPOSITES[direction];
};

/**
 * Shifts the given row and column in the given direction
 * by exactly 1 unit
 */
Direction.shift = function(row, col, direction) {
  var translation = Direction.TRANSLATIONS[direction];
  return [row + translation[0], col + translation[1]];
};

