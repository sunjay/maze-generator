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
  var current = start;

  var backtracking = false;
  return asyncLoop(function(_, finish) {
    // go back until there are unvisited adjacents
    if (backtracking) {
      var openAdjacents = maze.openAdjacents(current);
      var unvisitedAdjacents = openAdjacents.filter(function(adj) {
        return !visited.has(adj.id);
      });

      if (unvisitedAdjacents.length) {
        backtracking = false;
        return;
      }
      current.unmarkSolution();

      // go back along the current assumed solution
      var solutionAdjacents = openAdjacents.filter(function(adj) {
        return adj.isMarkedSolution();
      });

      if (solutionAdjacents.length !== 1) {
        // since the solution cannot branch in more than one direction,
        // something must have gone wrong
        throw new Error("Backtracked all the way, could not find any solution (or an invariant was violated)");
      }

      current = solutionAdjacents[0];
    }
    // normal search around current unvisited adjacents
    else {
      current.markVisited().markSolution();
      visited.add(current.id);

      if (current.isFinish()) {
        return finish();
      }
      
      var openAdjacents = maze.openAdjacents(current);
      var unvisitedAdjacents = openAdjacents.filter(function(adj) {
        return !visited.has(adj.id);
      });

      if (!unvisitedAdjacents.length) {
        backtracking = true;
        current.unmarkSolution();
      }
      else {
        current = randomArrayItem(unvisitedAdjacents);
      }
    }
  }, null, delay);
}

