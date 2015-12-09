/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when complete
 */
function generatePaths(maze, minPathLength) {
  minPathLength = minPathLength || Math.floor(Math.sqrt(maze.rows()*maze.cols()));
  var start = maze.randomEdge().setStart();

  var open = [start];
  var closed = new Set();
  
  var pathLength = 0;
  var reachedEnd = false;
  var lastVisited = null;
  var backwards = null;
  return asyncLoop(function(_, finish) {
    if (!open.length) {
      lastVisited.removeMark();
      return finish();
    }
    
    if (!reachedEnd) {
      pathLength++;
    }

    var cell = open.splice(0, 1)[0].markCurrent();
    console.log("visiting", cell);
    if (lastVisited) {
      lastVisited.removeMark();
      if (cell.isAdjacent(lastVisited)) {
        backwards = cell.directionTo(lastVisited);
      }
    }

    lastVisited = cell;
    closed.add(cell.id);

    // Ensure that the finish is not in the same row or column so the
    // puzzle isn't too easy
    if (!reachedEnd && !cell.isStart() && maze.isEdge(cell)
        && start.row !== cell.row && start.col !== cell.col
        && pathLength >= minPathLength) {
      cell.setFinish();
      reachedEnd = true;
      return;
    }

    var adjacents = maze.adjacents(cell);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !closed.has(adj.id);
    });

    var next;
    if (!unvisitedAdjacents.length) {
      if (reachedEnd) {
        // no need to continue searching
        console.log(3);
        return;
      }

      // in order to reach some kind of end, backtrack
      pathLength--;
      var openDirections = Array.from(cell.openDirections.values());
      if (openDirections.length > 1) {
        openDirections = openDirections.filter(function(d) {
          return d !== backwards;
        });
      }

      var index = Math.floor(openDirections.length * Math.random());
      var direction = openDirections[index];
      next = maze.adjacentTo(cell, direction);
      console.log(1);
      console.log(backwards);
    }
    else {
      var index = Math.floor(unvisitedAdjacents.length * Math.random());
      next = unvisitedAdjacents[index];
      maze.openBetween(cell, next);

      Array.prototype.push.apply(open, unvisitedAdjacents.filter(function(adj) {
        return adj !== next;
      }));
      console.log(2);
    }
    console.log("next", next);

    open.unshift(next);
  }, null, 1500/Math.max(maze.rows(), maze.cols()));
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
  promise.abort = function() {
    status.finish();
  };

  return promise;
}
