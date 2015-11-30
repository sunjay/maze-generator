var canvas = document.getElementById("maze");
var ctx = canvas.getContext("2d");

var maze = new Maze();

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var padding = 3;
  var mazeWidth = canvas.width - padding * 2;
  var mazeHeight = canvas.height - padding * 2;
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#CCC';
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
