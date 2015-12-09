/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when complete
 */
function generatePaths(maze) {
  var delay = 500/Math.max(maze.rows(), maze.cols());

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
      lastVisited.markVisited();
    }
    lastVisited = cell;

    if (closed.has(cell.id)) {
      return;
    }
    closed.add(cell.id);

    if (!cell.isStart() && maze.isEdge(cell)
        && start.row !== cell.row && start.col !== cell.col) {
      cell.setFinish();
      cell.markVisited();
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
  var open = unvisitedFromPath(maze, startCell, closed);

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      open = unvisitedFromPath(maze, startCell, closed);
      if (!open.length) {
        return finish();
      }
    }

    var current = open.splice(0, 1)[0];
    if (closed.has(current.id)) {
      return;
    }

    // Create a connection to the existing path
    connectToExistingPath(maze, current, closed);

    return generateBoundedPath(maze, current, closed, delay);
  }, null, delay);
}

function connectToExistingPath(maze, cell, closed) {
  var closedAdjacents = maze.adjacents(cell).filter(function(adj) {
    return closed.has(adj.id);
  });
  var adj = randomArrayItem(closedAdjacents);
  maze.openBetween(cell, adj);
}

function generateBoundedPath(maze, start, closed, delay) {
  var open = [start];
  var lastMarked = null;
  return asyncLoop(function(_, finish) {
    if (!open.length) {
      if (lastMarked) lastMarked.markVisited();
      return finish();
    }

    var current = open.splice(0, 1)[0].markCurrent();
    if (lastMarked) lastMarked.markVisited();
    lastMarked = current;

    if (closed.has(current.id)) {
      return;
    }
    closed.add(current.id);

    var adjacents = maze.adjacents(current);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !closed.has(adj.id);
    });
    if (unvisitedAdjacents.length) {
      var next = randomArrayItem(unvisitedAdjacents);
      maze.openBetween(current, next);

      open.unshift(next);
      Array.prototype.push.apply(open, unvisitedAdjacents.filter(function(adj) {
        return adj !== next;
      }));
    }
    else {
      lastMarked.markVisited();
      return finish();
    }
  }, null, delay);
}

// does a search and returns all the unvisited adjacents
function unvisitedFromPath(maze, startCell, closed) {
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

