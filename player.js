// プレイヤー：データ・操作・動かす・描く

const GRAVITY = 1200;
const MOVE_SPEED = 240;
const JUMP_SPEED = 480;

const player = {
  x: 60,
  y: floor.y - 36,
  w: 28,
  h: 36,
  vx: 0,
  vy: 0,
  onGround: true
};

// 最初の値に戻す
function resetPlayer() {
  player.x = 60;
  player.y = floor.y - player.h;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
}

const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function updatePlayer(dt) {
  // 左右の移動
  player.vx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.vx = -MOVE_SPEED;
  if (keys["ArrowRight"] || keys["KeyD"]) player.vx = MOVE_SPEED;

  // ジャンプ
  if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && player.onGround) {
    player.vy = -JUMP_SPEED;
    player.onGround = false;
  }

  // 重力と位置の更新
  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // 画面の左右の端で止める
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  // 床との当たり判定
  if (player.y + player.h >= floor.y) {
    player.y = floor.y - player.h;
    player.vy = 0;
    player.onGround = true;
  }
}

function drawPlayer() {
  ctx.fillStyle = "#4dabf7";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}