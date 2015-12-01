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
  return asyncLoop(function(_, finish) {
    if (!open.length) {
      return finish();
    }
    
    if (!reachedEnd) {
      pathLength++;
    }

    var cell = open.splice(0, 1)[0];
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

    // Allow the path to continue even if there are no more unvisited
    // adjacents until we reach the end
    var searchAdjacents;
    if (!unvisitedAdjacents.length) {
      if (reachedEnd) {
        // no need to continue searching
        return;
      }
      searchAdjacents = Array.from(adjacents);
    }
    else {
      searchAdjacents = unvisitedAdjacents;
    }

    var index = Math.floor((searchAdjacents.length - 1)*Math.random());
    var next = searchAdjacents[index];
    maze.openBetween(cell, next);

    open.unshift(next);
    Array.prototype.push.apply(open, searchAdjacents.filter(function(adj) {
      return adj !== next;
    }));
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
