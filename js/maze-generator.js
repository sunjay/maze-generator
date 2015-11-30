/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when complete
 */
function generatePaths(maze) {
  var directions = Direction.all();
  return asyncLoop(function(row, finish) {
    if (row >= maze.rows()) {
      return finish();
    }
    return asyncLoop(function(col, finish) {
      if (col >= maze.cols()) {
        return finish();
      }

      var direction = directions[Math.floor(Math.random() * directions.length)];

      maze.openWall(row, col, direction);

      return col + 1;
    }, 0).then(function() {
      return row + 1;
    });
  }, 0);
}

/**
 * Asynchronously completes a loop using setTimeout
 * Returns a promise for when the loop is done
 * 
 * Calls callback(value, finish). finish is a function
 * which when called will end the loop.
 * value is either the initial provided value or the return
 * value of each successive callback
 * If the return value is a promise, that promise will be awaited
 * before continuing in the loop
 */
function asyncLoop(callback, value) {
  var done = false;
  var finish = function() {done = true;};

  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      value = callback(value, finish);
      if (!(value instanceof Promise)) {
        value = Promise.resolve(value);
      }
      value.then(function(nextValue) {
        if (done) {
          resolve();
        }
        else {
          resolve(asyncLoop(callback, nextValue));
        }
      });
    }, 0);
  });
}
