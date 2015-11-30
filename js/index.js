var canvas = document.getElementById("maze");
var ctx = canvas.getContext("2d");

var maze = new Maze();

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#AAA';
  renderMaze(canvas, maze);
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
  render();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
