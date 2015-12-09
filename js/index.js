var canvas = document.getElementById("maze");
var ctx = canvas.getContext("2d");

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

  var aborted = false;
  solverPromise = modifiedPromise(new Promise(function(resolve, reject) {
    pathsPromise.then(function() {
      if (aborted) {
        return;
      }
      setSolveStatus("Solving...");
      var algorithm = document.getElementById('solver-algorithm').value;
      resolve(solveMaze(maze, algorithm));
    }).catch(reject);
  }), function() {
    aborted = true;
  }).then(function() {
    setSolveStatus("Solved.");
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var padding = 3;
  var mazeWidth = canvas.width - padding * 2;
  var mazeHeight = canvas.height - padding * 2;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#444';
  renderMaze(ctx, maze, padding, padding, mazeWidth, mazeHeight);
}

function loop() {
  window.requestAnimationFrame(loop);

  render();
}
loop();

function resizeCanvas() {
  var style = window.getComputedStyle(canvas);
  var width = parseInt(style.getPropertyValue('width'), 10);
  var height = parseInt(style.getPropertyValue('height'), 10);

  canvas.width = width;
  canvas.height = height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
