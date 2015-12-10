var mazeCanvas = document.getElementById("maze");
var mazeCtx = mazeCanvas.getContext("2d");
var solutionCanvas = document.getElementById("maze-solution");
var solutionCtx = solutionCanvas.getContext("2d");

var maze = new Maze();
var pathsPromise = generatePaths(maze);
var solverPromise = null;

function generate() {
  cancelGenerate();
  cancelSolve();

  var size = document.getElementById('size').value;
  maze = new Maze(size, size);
  pathsPromise = generatePaths(maze);
}
document.getElementById('generate').addEventListener('click', generate);

function solve() {
  if (solverPromise) {
    //TODO: Make solving cancellable
    return;
  }

  setSolveStatus("Waiting for generator to finish...");

  var visited;
  var updateInterval;
  var aborted = false;
  solverPromise = modifiedPromise(new Promise(function(resolve, reject) {
    pathsPromise.then(function() {
      if (aborted) {
        return;
      }

      maze.visitedCells().forEach(function(cell) {
        cell.unmarkVisited().unmarkSolution();
      });

      setSolveStatus("Solving...");
      updateInterval = setInterval(function() {
        setSolveStatus("Solving... (steps: " + Array.from(visited).length + ")");
      }, 500);

      var algorithm = document.getElementById('solver-algorithm').value;
      visited = new Set();
      resolve(solveMaze(maze, algorithm, visited));
    }).catch(reject);
  }), function() {
    aborted = true;
    clearInterval(updateInterval);
  }).then(function() {
    clearInterval(updateInterval);
    setSolveStatus("Solved in " + Array.from(visited).length + " steps.");
    solverPromise = null;
  });
}
document.getElementById('solve').addEventListener('click', solve);

function cancelGenerate() {
  if (pathsPromise) {
    pathsPromise.abort();
  }
}

function cancelSolve() {
  if (solverPromise) {
    setSolveStatus("Solve cancelled.");
    solverPromise.abort();
    solverPromise = null;
  }
  else {
    setSolveStatus("");
  }
}

function setSolveStatus(string) {
  document.getElementById('solve-status').textContent = string;
}

function render() {
  var padding = 3;
  var x = padding;
  var y = padding;
  var mazeWidth = mazeCanvas.width - padding * 2;
  var mazeHeight = mazeCanvas.height - padding * 2;

  mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  mazeCtx.lineWidth = 2;
  mazeCtx.strokeStyle = '#444';
  renderMaze(mazeCtx, maze, x, y, mazeWidth, mazeHeight);

  solutionCtx.clearRect(0, 0, solutionCanvas.width, solutionCanvas.height);
  solutionCtx.lineWidth = 2;
  solutionCtx.strokeStyle = 'blue';
  renderConnected(solutionCtx, maze, x, y, mazeWidth, mazeHeight, function(cell) {
    return cell.isMarkedVisited();
  });
  solutionCtx.lineWidth = 3;
  solutionCtx.strokeStyle = '#33FF00';
  renderConnected(solutionCtx, maze, x, y, mazeWidth, mazeHeight, function(cell) {
    return cell.isMarkedSolution();
  });
}

function loop() {
  window.requestAnimationFrame(loop);

  render();
}
loop();

function resizeCanvas() {
  var canvases = document.getElementsByTagName('canvas');
  for (var i = 0; i < canvases.length; i++) {
    var cnvs = canvases[i];

    var style = window.getComputedStyle(cnvs);
    var width = parseInt(style.getPropertyValue('width'), 10);
    var height = parseInt(style.getPropertyValue('height'), 10);

    cnvs.width = width;
    cnvs.height = height;
  }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
