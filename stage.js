// ステージ：画面と床の準備・描く

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const floor = {
  x: 0,
  y: 310,
  w: canvas.width,
  h: 50
};

function drawStage() {
  // 背景
  ctx.fillStyle = "#182036";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 床
  ctx.fillStyle = "#3b4973";
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h);

  // 文字の基本設定
  ctx.font = "16px sans-serif";
}