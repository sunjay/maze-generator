var SOLVING_ALGORITHMS = {
  // these map to values in index.html
  "depth-first": solveMazeDepthFirst
};

function solveMaze(maze, algorithm) {
  return SOLVING_ALGORITHMS[algorithm](maze);
}

function solveMazeDepthFirst(maze) {
  console.log('solving depth first');
}
