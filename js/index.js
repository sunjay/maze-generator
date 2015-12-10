var backgroundCanvas = document.getElementById("maze-bg");
var wallsCanvas = document.getElementById("maze-walls");
var solutionCanvas = document.getElementById("maze-solution");

var maze;
var renderer;
var pathsPromise;
var solverPromise = null;
generate();

function generate() {
  cancelGenerate();
  cancelSolve();

  var size = document.getElementById('size').value;
  maze = new Maze(size, size);

  renderer = new MazeRenderer(maze);
  renderer.setBackgroundCanvas(backgroundCanvas);
  renderer.setWallsCanvas(wallsCanvas);
  renderer.setSolutionCanvas(solutionCanvas);

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
  if (renderer) {
    renderer.render();
  }
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
