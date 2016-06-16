/**
 * Utilities for randomness
 */

function randomArrayItem(array) {
  var index = randomArrayIndex(array);
  return array[index];
}

function randomArrayIndex(array) {
  return Math.floor(array.length * Math.random());
}

