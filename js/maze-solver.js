var SOLVING_ALGORITHMS = {
  // these map to values in index.html
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
    if (openAdjacents.length) {
      Array.prototype.unshift.apply(open, openAdjacents);
    }
  }, null, delay);
}
