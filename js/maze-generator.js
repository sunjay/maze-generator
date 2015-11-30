/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when complete
 */
function generatePaths(maze) {
  var directions = Direction.all();
  return asyncFor(0, maze.rows(), 1, function(row) {
    return asyncFor(0, maze.cols(), 1, function(col) {
      var direction = directions[Math.floor(Math.random() * directions.length)];

      maze.openWall(row, col, direction);
    });
  });
}

/**
 * Asynchronous for loop
 * Calls callback for each item of the loop
 * Equivalent: for (var i = start; i < end; i += step) callback(i)
 * If callback returns a Promise, waits on that promise before continuing
 */
function asyncFor(start, end, step, callback, delay) {
  return asyncLoop(function(value, finish) {
    if (value >= end) {
      return finish();
    }

    var result = callback(value);
    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }

    return result.then(function() {
      return value + step;
    });
  }, start, delay);
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
function asyncLoop(callback, value, delay) {
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
    }, delay || 0);
  });
}
