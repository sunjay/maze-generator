/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when complete
 */
function generatePaths(maze) {
  var delay = 1200/Math.max(maze.rows(), maze.cols());

  var start = maze.randomEdge().setStart();

  var closed = new Set();
  return generateSolution(maze, start, closed, delay).then(function() {
    return generateDecoys(maze, start, closed, delay);
  });
}

function generateSolution(maze, start, closed, delay) {
  var open = [start];
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
      cell.removeMark();
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
      if (!adj) {
        continue;
      }
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

// decoys are paths other than the solution
function generateDecoys(maze, startCell, closed, delay) {
  var open = unvistedFromPath(maze, startCell, closed);

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      return finish();
    }

    var current = open.splice(0, 1)[0];
    if (closed.has(current.id)) {
      return;
    }

    // Create a connection to the existing path
    var closedAdjacents = maze.adjacents(current).filter(function(adj) {
      return closed.has(adj.id);
    });
    var adj = randomArrayItem(closedAdjacents);
    maze.openBetween(current, adj);

    return generateBoundedPath(maze, current, closed, delay);
  }, null, delay);
}

function generateBoundedPath(maze, start, closed, delay) {
  var open = [start];
  var lastMarked = null;
  return asyncLoop(function(_, finish) {
    if (!open.length) {
      if (lastMarked) lastMarked.removeMark();
      return finish();
    }

    var current = open.splice(0, 1)[0].markCurrent();
    if (lastMarked) lastMarked.removeMark();
    lastMarked = current;

    if (closed.has(current.id)) {
      return;
    }
    closed.add(current.id);

    var adjacents = maze.adjacents(current);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !closed.has(adj.id);
    });
    console.log(unvisitedAdjacents);
    if (unvisitedAdjacents.length) {
      var next = randomArrayItem(unvisitedAdjacents);
      maze.openBetween(current, next);

      open.unshift(next);
      Array.prototype.push.apply(open, unvisitedAdjacents.filter(function(adj) {
        return adj !== next;
      }));
    }
  }, null, delay);
}

// does a search and returns all the unvisited adjacents
function unvistedFromPath(maze, startCell, closed) {
  var open = [startCell];
  var seen = new Set();

  var unvisitedCells = [];
  var unvisited = new Set();

  while (open.length) {
    var current = open.splice(0, 1)[0];
    if (seen.has(current.id)) {
      continue;
    }
    seen.add(current.id);
    var adjacents = maze.adjacents(current);

    for (var i = 0; i < adjacents.length; i++) {
      var adj = adjacents[i];
      if (seen.has(adj)) {
        continue;
      }
      if (closed.has(adj.id)) {
        open.push(adj);
      }
      else if (!unvisited.has(adj.id)) {
        unvisitedCells.push(adj);
        unvisited.add(adj.id);
      }
    }
  }

  return unvisitedCells;
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
