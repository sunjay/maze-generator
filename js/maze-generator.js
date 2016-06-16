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
  var mazeSize = maze.rows() * maze.cols();

  var current = start;
  var lastVisited = null;

  return asyncLoop(function(_, finish) {
    if (visited.has(current.id)) {
      return;
    }
    visited.add(current.id);

    if (lastVisited) {
      lastVisited.unmarkCurrent();
    }
    lastVisited = current.markGenerated().markCurrent();

    if (visited.size == mazeSize) {
      current.unmarkCurrent();
      return finish();
    }

    var adjacents = maze.adjacents(current);
    var unvisitedAdjacents = adjacents.filter(function(adj) {
      return !visited.has(adj.id);
    });

    // potentially SUPER inefficient, could be better implemented by
    // keeping track of which visited nodes still have unvisited adjacents
    if (!unvisitedAdjacents.length) {
      var visitedArray = Array.from(visited);
      while (!unvisitedAdjacents.length) {
        current = maze.getById(randomArrayItem(visitedArray));

        unvisitedAdjacents = maze.adjacents(current).filter(function(adj) {
          return !visited.has(adj.id);
        });
      }
    }

    var next = randomArrayItem(unvisitedAdjacents);
    maze.openBetween(current, next);

    current = next;
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

