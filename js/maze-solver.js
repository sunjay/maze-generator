var SOLVING_ALGORITHMS = {
  // these map to values in index.html
  "astar": solveMazeAStar,
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

function solveMazeAStar(maze, visited, delay) {
  var start = maze.findStart();
  var finish = maze.findFinish();

  // Ordered by least cost first
  var open = [aStarNode(start, null, finish)];
  return asyncLoop(function(_, finishLoop) {
    if (!open.length) {
      throw new Error("Exhausted search.");
    }

    var current = open.splice(0, 1)[0];
    current.node.markVisited();
    visited.add(current.node.id);

    if (current.node.isFinish()) {
      return aStarMarkSolution(current, delay).then(finishLoop);
    }

    var openAdjacents = maze.openAdjacents(current.node);

    for (var i = 0; i < openAdjacents.length; i++) {
      var adj = openAdjacents[i];
      if (visited.has(adj.id)) {
        continue;
      }

      var adjNode = aStarNode(adj, current, finish);

      // Skip a potential node with a lower cost
      var sameOpen = open.findIndex(function(n) {
        return n.node.id === adj.id
      });
      if (sameOpen > -1) {
        if (open[sameOpen].cost < adjNode.cost) {
          continue;
        }
        else {
          // Remove sameOpen since its cost is higher than this path
          open.splice(sameOpen, 1);
        }
      }

      aStarInsertByCost(open, adjNode);
    }
  }, null, delay);
}

function aStarInsertByCost(open, node) {
  // attempt to insert the node before a node with a larger cost
  for (var i = 0; i < open.length; i++) {
    var openNode = open[i];
    // Since this is > and not >=, nodes with the same cost but checked later
    // will be searched afterwards
    if (openNode.cost > node.cost) {
      open.splice(i, 0, node);
      return;
    }
  }

  // never found any node with a smaller cost
  open.push(node);
}

function aStarMarkSolution(finishNode, delay) {
  var current = finishNode;
  return asyncLoop(function(_, finish) {
    if (!current) {
      return finish();
    }

    current.node.markSolution();
    current = current.parent;
  }, null, delay);
}

function aStarNode(node, parent, finish) {
  var total = parent ? parent.totalCost + parent.node.squaredDistanceTo(node) : 0;
  var estimate = node.squaredDistanceTo(finish);

  return {
    parent: parent,
    node: node,
    cost: total + estimate,
    // total distance up to this node from the start
    totalCost: total,
    estimatedCost: estimate,
  };
}

