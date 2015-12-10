var SOLVING_ALGORITHMS = {
  // these map to values in index.html
  "backtracking": solveMazeBacktracking,
  "breadth-first": solveMazeBreadthFirst,
  "depth-first": solveMazeDepthFirst
};

function solveMaze(maze, algorithm, visited) {
  var delay = 500/Math.max(maze.rows(), maze.cols());

  return SOLVING_ALGORITHMS[algorithm](maze, visited, delay);
}

function solveMazeBreadthFirst(maze, visited, delay) {
  var start = maze.findStart();
  var open = [start];

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      throw new Error("Exhausted search.");
    }

    var current = open.splice(0, 1)[0].markVisited();
    if (visited.has(current.id)) {
      return;
    }
    visited.add(current.id);

    if (current.isFinish()) {
      return finish();
    }

    var openAdjacents = maze.openAdjacents(current);
    Array.prototype.push.apply(open, openAdjacents);
  }, null, delay);
}

function solveMazeDepthFirst(maze, visited, delay) {
  var start = maze.findStart();
  var open = [start];

  return asyncLoop(function(_, finish) {
    if (!open.length) {
      throw new Error("Exhausted search.");
    }

    var current = open.splice(0, 1)[0].markVisited();
    if (visited.has(current.id)) {
      return;
    }
    visited.add(current.id);

    if (current.isFinish()) {
      return finish();
    }

    var openAdjacents = maze.openAdjacents(current);
    Array.prototype.unshift.apply(open, openAdjacents);
  }, null, delay);
}

function solveMazeBacktracking(maze, visited, delay) {
  var start = maze.findStart();
  var open = [start];

  var backtracking = false;
  return asyncLoop(function(_, finish) {
    if (!open.length) {
      throw new Error("Exhausted search.");
    }

    var current = open.splice(0, 1)[0];
    if (visited.has(current.id)) {
      return;
    }
    visited.add(current.id);

    current.markVisited().markSolution();

    if (current.isFinish()) {
      return finish();
    }

    var openAdjacents = maze.openAdjacents(current);
    var unvisitedAdjacents = openAdjacents.filter(function(adj) {
      return !visited.has(adj.id);
    });
    if (unvisitedAdjacents.length) {
      backtracking = false;

      Array.prototype.unshift.apply(open, unvisitedAdjacents);
    }
    if (backtracking || !unvisitedAdjacents.length) {
      backtracking = true;

      var visitedAdjacents = openAdjacents.filter(function(adj) {
        return visited.has(adj.id);
      });
      if (!visitedAdjacents) {
        throw new Error("For some reason there was no where to go back to after we just came from somewhere...");
      }
      open.unshift(visitedAdjacents[0]);
    }

    if (backtracking) {
      current.unmarkSolution();
    }
  }, null, delay);
}

