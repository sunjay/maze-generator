/**
 * Generates paths through the given maze asynchronously
 * 
 * Returns a promise to help determine when compvare
 */
function generatePaths(maze) {
  var delay = 100/Math.max(maze.rows(), maze.cols());

  var start = maze.randomEdge().setStart();

  var visited = new Set();
  return generateMazeTree(maze, start, visited, delay).then(function() {
    return pickFinish(maze, start, delay);
  });
}

/**
 * Generates a large tree of paths through the maze
 */
function generateMazeTree(maze, start, visited, delay) {
  var open = [start];
  var lastVisited = null;

  return asyncLoop(function(_, finish) {
    if (lastVisited) {
      lastVisited.unmarkCurrent();
    }
    if (!open.length) {
      return finish();
    }
    var cell = open.splice(0, 1)[0];

    if (visited.has(cell.id)) {
      return;
    }
    visited.add(cell.id);

    var adjacents = maze.adjacents(cell);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !visited.has(adj.id);
    });

    if (unvisitedAdjacents.length) {
      var next_index = randomArrayIndex(unvisitedAdjacents);
      var next = unvisitedAdjacents.splice(next_index, 1)[0];
      maze.openBetween(cell, next);

      open.unshift(next);
      Array.prototype.push.apply(open, unvisitedAdjacents);
    }
    // This is a way to figure out whether this is on the current
    // path being followed or a new path caused by pushing the rest
    // of unvisitedAdjacents onto the open array since if we were still
    // following a path, there would be no wall between the current cell
    // and lastVisited
    if (lastVisited && (!lastVisited.isAdjacent(cell) || !cell.isOpenTo(lastVisited))) {
      var adj = randomArrayItem(adjacents);
      maze.openBetween(cell, adj);
    }

    lastVisited = cell.markGenerated().markCurrent();
  }, null, delay);
}

/**
 * Finds a good path and marks that as the finish
 */
function pickFinish(maze, start, delay) {
  return asyncLoop(function(_, finish) {
    return finish();
  }, null, delay);
}

function generateSolution(maze, start, visited, delay) {
  var open = [start];
  var lastVisited = null;

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      throw new Error("Ran out of cells before finding a solution");
    }
    var cell = open.splice(0, 1)[0].markGenerated().markCurrent();
    if (lastVisited) {
      lastVisited.unmarkCurrent();
    }
    lastVisited = cell;

    if (visited.has(cell.id)) {
      return;
    }
    visited.add(cell.id);

    if (!cell.isStart() && maze.isEdge(cell)
        && start.row !== cell.row && start.col !== cell.col) {
      cell.setFinish();
      cell.unmarkCurrent();
      return finish();
    }

    var adjacents = maze.adjacents(cell);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !visited.has(adj.id);
    });

    var next;
    if (unvisitedAdjacents.length) {
      next = randomArrayItem(unvisitedAdjacents);
      maze.openBetween(cell, next);
    }
    else {
      next = backtrackToUnvisited(maze, cell, visited);
    }
    open.unshift(next);
    Array.prototype.push.apply(open, unvisitedAdjacents.filter(function(adj) {
      return adj !== next;
    }));
  }, null, delay);
}

function backtrackToUnvisited(maze, startCell, visited) {
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
      return !visited.has(adj.id);
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
function generateDecoys(maze, startCell, visited, delay) {
  var open = unvisitedFromPath(maze, startCell, visited);

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      open = unvisitedFromPath(maze, startCell, visited);
      if (!open.length) {
        return finish();
      }
    }

    var current = open.splice(0, 1)[0];
    if (visited.has(current.id)) {
      return;
    }

    // Create a connection to the existing path
    connectToExistingPath(maze, current, visited);

    return generateBoundedPath(maze, current, visited, delay);
  }, null, delay);
}

function connectToExistingPath(maze, cell, visited) {
  var visitedAdjacents = maze.adjacents(cell).filter(function(adj) {
    return visited.has(adj.id);
  });
  var adj = randomArrayItem(visitedAdjacents);
  maze.openBetween(cell, adj);
}

function generateBoundedPath(maze, start, visited, delay) {
  var open = [start];
  var lastMarked = null;
  return asyncLoop(function(_, finish) {
    if (!open.length) {
      if (lastMarked) lastMarked.unmarkCurrent();
      return finish();
    }

    var current = open.splice(0, 1)[0].markGenerated().markCurrent();
    if (lastMarked) lastMarked.unmarkCurrent();
    lastMarked = current;

    if (visited.has(current.id)) {
      return;
    }
    visited.add(current.id);

    var adjacents = maze.adjacents(current);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !visited.has(adj.id);
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
      lastMarked.unmarkCurrent();
      return finish();
    }
  }, null, delay);
}

// does a search and returns all the unvisited adjacents
function unvisitedFromPath(maze, startCell, visited) {
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
      if (visited.has(adj.id)) {
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

