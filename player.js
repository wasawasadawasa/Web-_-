// プレイヤー：データ・操作・動かす・描く

const GRAVITY = 1200;
const MOVE_SPEED = 260;
const JUMP_SPEED = 470;
const MAX_JUMPS = 3;
const MAX_HP = 4;

// 透過・モザイク加工済みのプレイヤー画像
const playerImg = new Image();
playerImg.src = "player.png";

const player = {
  x: 80,
  y: floor.y - 48,
  w: 42,
  h: 48,
  vx: 0,
  vy: 0,
  onGround: true,
  jumpsLeft: MAX_JUMPS,
  hp: MAX_HP,
  hitTimer: 0,
  facing: 1 // 1: 右向き, -1: 左向き
};

// 最初の値に戻す
function resetPlayer() {
  player.x = 80;
  player.y = floor.y - player.h;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.jumpsLeft = MAX_JUMPS;
  player.hp = MAX_HP;
  player.hitTimer = 0;
  player.facing = 1;
}

const keys = {};
window.addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
    e.preventDefault();
  }
  keys[e.code] = true;

  // 多段ジャンプ（押しっぱなし連打防止のため !e.repeat）
  if (
    !e.repeat &&
    typeof gameState !== "undefined" &&
    gameState === "play" &&
    (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") &&
    player.jumpsLeft > 0
  ) {
    player.vy = -JUMP_SPEED;
    player.jumpsLeft -= 1;
    player.onGround = false;
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function updatePlayer(dt) {
  // 無敵時間の更新
  if (player.hitTimer > 0) {
    player.hitTimer = Math.max(0, player.hitTimer - dt);
  }

  // 左右の移動と向きの更新
  player.vx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.vx = -MOVE_SPEED;
    player.facing = -1;
  }
  if (keys["ArrowRight"] || keys["KeyD"]) {
    player.vx = MOVE_SPEED;
    player.facing = 1;
  }

  // 重力と位置の更新
  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // 画面の左右の端で止める
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  // 画面上端の制限
  if (player.y < 32) {
    player.y = 32;
    if (player.vy < 0) player.vy = 0;
  }

  // 床との当たり判定
  if (player.y + player.h >= floor.y) {
    player.y = floor.y - player.h;
    player.vy = 0;
    player.onGround = true;
    player.jumpsLeft = MAX_JUMPS;
  }
}

function drawPlayer() {
  const isHit = player.hitTimer > 0;
  const blinkAlpha = isHit && Math.floor(player.hitTimer * 18) % 2 === 0 ? 0.45 : 1;

  ctx.save();
  ctx.globalAlpha = blinkAlpha;

  const centerX = player.x + player.w / 2;
  const bottomY = player.y + player.h;

  // 移動方向に合わせて左右反転して描画
  ctx.translate(centerX, bottomY);
  ctx.scale(player.facing, 1);

  if (playerImg.complete && playerImg.naturalWidth > 0) {
    const aspect = playerImg.naturalWidth / playerImg.naturalHeight;
    let drawH = player.h;
    let drawW = drawH * aspect;
    if (drawW > player.w + 10) {
      drawW = player.w + 10;
      drawH = drawW / aspect;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(playerImg, -drawW / 2, -drawH, drawW, drawH);

    // ダメージ無敵時間中は赤い半透明フィルターを重ねる
    if (isHit) {
      ctx.fillStyle = "rgba(255, 40, 40, 0.38)";
      ctx.fillRect(-drawW / 2, -drawH, drawW, drawH);
    }
  } else {
    // 画像読み込み前のフォールバック
    ctx.fillStyle = isHit ? "#ff6b6b" : "#4dabf7";
    ctx.fillRect(-player.w / 2, -player.h, player.w, player.h);
  }
  ctx.restore();

  // 無敵時間中は怒りマーク＆汗マークを重ねて限界寸前の焦りを表現
  if (isHit) {
    ctx.save();
    // 怒りマーク（右上）
    const ax = player.x + player.w - 4;
    const ay = player.y + 4;
    ctx.strokeStyle = "#ff3b30";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ax - 5, ay - 2);
    ctx.quadraticCurveTo(ax - 1, ay - 2, ax - 1, ay - 6);
    ctx.moveTo(ax + 5, ay - 2);
    ctx.quadraticCurveTo(ax + 1, ay - 2, ax + 1, ay - 6);
    ctx.moveTo(ax - 5, ay + 2);
    ctx.quadraticCurveTo(ax - 1, ay + 2, ax - 1, ay + 6);
    ctx.moveTo(ax + 5, ay + 2);
    ctx.quadraticCurveTo(ax + 1, ay + 2, ax + 1, ay + 6);
    ctx.stroke();

    // 汗マーク（左上）
    const sx = player.x + 2;
    const sy = player.y + 8;
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(sx, sy - 6);
    ctx.quadraticCurveTo(sx + 5, sy + 1, sx, sy + 4);
    ctx.quadraticCurveTo(sx - 5, sy + 1, sx, sy - 6);
    ctx.fill();
    ctx.restore();
  }
}
