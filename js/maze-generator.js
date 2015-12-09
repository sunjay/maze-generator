/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when complete
 */
function generatePaths(maze) {
  var delay = 1200/Math.max(maze.rows(), maze.cols());

  var start = maze.randomEdge().setStart();

  return generateSolution(maze, start, delay).then(function() {
    return;
  });
}

function generateSolution(maze, start, delay) {
  var open = [start];
  var closed = new Set();
  var lastVisited = null;

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      throw new Error("Ran out of cells before finding a solution");
    }
    var cell = open.splice(0, 1)[0].markCurrent();
    if (lastVisited) {
      lastVisited.removeMark();
    }
    lastVisited = cell;

    if (closed.has(cell.id)) {
      return;
    }
    closed.add(cell.id);

    if (!cell.isStart() && maze.isEdge(cell)
        && start.row !== cell.row && start.col !== cell.col) {
      cell.setFinish();
      return finish();
    }

    var adjacents = maze.adjacents(cell);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !closed.has(adj.id);
    });

    var next;
    if (unvisitedAdjacents.length) {
      next = randomArrayItem(unvisitedAdjacents);
      maze.openBetween(cell, next);
    }
    else {
      next = backtrackToUnvisited(maze, cell, closed);
    }
    open.unshift(next);
    Array.prototype.push.apply(open, unvisitedAdjacents.filter(function(adj) {
      return adj !== next;
    }));
  }, null, delay);
}

function backtrackToUnvisited(maze, startCell, closed) {
  var current = startCell;
  var backwards = null;
  while (current) {
    var openDirections = Array.from(current.openDirections);
    var openAdjacents = [];
    for (var i = 0; i < openDirections.length; i++) {
      var direction = openDirections[i];
      if (openDirections.length > 1 && direction === backwards) {
        continue;
      }
      var adj = maze.adjacentTo(current, direction);
      openAdjacents.push(adj);
    }

    var next = randomArrayItem(openAdjacents);
    backwards = next.directionTo(current);

    var adjacents = maze.adjacents(next);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !closed.has(adj.id);
    });
    if (unvisitedAdjacents.length) {
      var adj = randomArrayItem(unvisitedAdjacents);
      maze.openBetween(next, adj);
      return adj;
    }

    current = next;
  }
}

function randomArrayItem(array) {
  var index = Math.floor(array.length * Math.random());
  return array[index];
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
 *
 * The returned promise can be aborted using its abort() method
 * This ends the loop at the next iteration (similar to while(!done))
 */
function asyncLoop(callback, value, delay) {
  // Secret paramter saves from having to define a whole new function for
  // this extra argument
  var status = arguments[3] || {
    done: false,
    finish: function() {
      this.done = true;
    }
  };

  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      value = callback(value, status.finish.bind(status));
      if (!(value instanceof Promise)) {
        value = Promise.resolve(value);
      }
      value.then(function(nextValue) {
        if (status.done) {
          resolve();
        }
        else {
          resolve(asyncLoop(callback, nextValue, delay, status));
        }
      });
    }, delay || 0);
  });

  return modifiedPromise(promise, function() {
    status.finish();
  });
}

function modifiedPromise(promise, abort) {
  return {
    abort: abort,
    then: function() {
      promise = promise.then.apply(promise, arguments);
      return modifiedPromise(promise, abort);
    },
    catch: function() {
      promise = promise.catch.apply(promise, arguments);
      return modifiedPromise(promise, abort);
    }
  };
}
