// プレイヤー：モザイク加工キャラクター・多段ジャンプ・メンタル＆被弾演出

const GRAVITY = 1300;
const MOVE_SPEED = 290;
const JUMP_SPEED = 510;
const MAX_JUMPS = 2;
const MAX_HP = 4;
const HIT_INVINCIBLE_TIME = 1.4;

const player = {
  x: 80,
  y: floor.y - 62,
  w: 44,
  h: 62,
  vx: 0,
  vy: 0,
  onGround: true,
  jumpsLeft: MAX_JUMPS,
  hp: MAX_HP,
  hitTimer: 0,
  facing: 1   // 1: 右向き, -1: 左向き
};

// 背景透過＆モザイク加工済みのプレイヤー画像を読み込む
const playerImg = new Image();
let playerImgLoaded = false;
// 被弾時の赤い半透明フィルターを人物シルエットのみに重ねるオフスクリーンCanvas
let playerRedCanvas = null;

playerImg.onload = () => {
  playerImgLoaded = true;
  playerRedCanvas = document.createElement("canvas");
  playerRedCanvas.width = playerImg.width;
  playerRedCanvas.height = playerImg.height;
  const rctx = playerRedCanvas.getContext("2d");
  rctx.imageSmoothingEnabled = false;
  rctx.drawImage(playerImg, 0, 0);
  rctx.globalCompositeOperation = "source-atop";
  rctx.fillStyle = "rgba(255, 35, 35, 0.55)";
  rctx.fillRect(0, 0, playerRedCanvas.width, playerRedCanvas.height);
  rctx.globalCompositeOperation = "source-over";
};
playerImg.src = "player.png";

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

// ダメージを受けてメンタル減少＋無敵時間発生
function damagePlayer(attackerCenterX) {
  if (player.hitTimer > 0) return;
  player.hp = Math.max(0, player.hp - 1);
  player.hitTimer = HIT_INVINCIBLE_TIME;

  // 軽いノックバック
  const playerCenterX = player.x + player.w / 2;
  player.vx = playerCenterX < attackerCenterX ? -220 : 220;
  player.vy = -260;
  player.onGround = false;
}

const keys = {};
window.addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
    e.preventDefault();
  }
  keys[e.code] = true;

  // 多段ジャンプ（押しっぱなし連打を防ぎ、押した瞬間だけ消費）
  const isJumpKey = e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW";
  if (isJumpKey && !e.repeat && typeof gameState !== "undefined" && gameState === "play") {
    if (player.jumpsLeft > 0) {
      player.vy = -JUMP_SPEED;
      player.onGround = false;
      player.jumpsLeft -= 1;
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function updatePlayer(dt) {
  // 無敵タイマーの更新
  if (player.hitTimer > 0) {
    player.hitTimer = Math.max(0, player.hitTimer - dt);
  }

  // 左右の移動と向きの更新
  const moveLeft = keys["ArrowLeft"] || keys["KeyA"];
  const moveRight = keys["ArrowRight"] || keys["KeyD"];

  if (moveLeft && !moveRight) {
    player.vx = -MOVE_SPEED;
    player.facing = -1;
  } else if (moveRight && !moveLeft) {
    player.vx = MOVE_SPEED;
    player.facing = 1;
  } else {
    // 移動入力がないときは摩擦で止める（ノックバック中も自然に戻る）
    player.vx *= Math.pow(0.001, dt);
    if (Math.abs(player.vx) < 8) player.vx = 0;
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
    player.jumpsLeft = MAX_JUMPS;
  }
}

// 怒りマーク（💢）をCanvasで描画
function drawAngerMark(cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "#ff2e4c";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  const d = size * 0.42;
  const r = size * 0.38;
  // 4方向のくの字（青筋マーク）
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1]
  ];
  for (const [sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(sx * d, sy * (d + r));
    ctx.quadraticCurveTo(sx * d * 0.65, sy * d * 0.65, sx * (d + r), sy * d);
    ctx.stroke();
  }
  ctx.restore();
}

// 焦りの汗マーク（💧）をCanvasで描画
function drawSweatDrop(cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.75, 0, size * 0.65, size * 0.9, 0, size * 0.9);
  ctx.bezierCurveTo(-size * 0.65, size * 0.9, -size * 0.75, 0, 0, -size);
  ctx.closePath();
  ctx.fillStyle = "#5ce1ff";
  ctx.fill();
  ctx.strokeStyle = "#0b2545";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 小さな光沢
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-size * 0.18, size * 0.2, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const isHit = player.hitTimer > 0;
  // 無敵時間中は高速点滅
  const blinkPhase = Math.floor(player.hitTimer * 16) % 2 === 0;

  ctx.save();
  const centerX = player.x + player.w / 2;
  const bottomY = player.y + player.h;

  // 足元の影
  const groundDist = Math.max(0, floor.y - bottomY);
  const shadowScale = Math.max(0.35, 1 - groundDist / 260);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(centerX, floor.y - 2, (player.w * 0.55) * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 無敵時間中の小刻みな震えと点滅
  const shakeX = isHit ? (Math.sin(player.hitTimer * 70) * 2.5) : 0;
  if (isHit && !blinkPhase) {
    ctx.globalAlpha = 0.45;
  }

  ctx.translate(centerX + shakeX, player.y + player.h / 2);
  ctx.scale(player.facing, 1);
  ctx.imageSmoothingEnabled = false;

  if (playerImgLoaded) {
    // アスペクト比を維持して描画
    const aspect = playerImg.width / playerImg.height;
    const drawH = player.h;
    const drawW = drawH * aspect;
    const source = (isHit && playerRedCanvas) ? playerRedCanvas : playerImg;
    ctx.drawImage(source, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    // フォールバック描画
    ctx.fillStyle = isHit ? "#ff5252" : "#4dabf7";
    ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
  }

  ctx.restore();

  // 無敵時間中は限界寸前の怒りマーク＆汗マークを重ねる（左右反転させず見やすく表示）
  if (isHit) {
    const pulse = 1 + Math.sin(player.hitTimer * 28) * 0.18;
    const sweatBounce = Math.sin(player.hitTimer * 22) * 3;
    drawAngerMark(player.x + player.w + 4, player.y - 4, 11 * pulse);
    drawSweatDrop(player.x - 6, player.y + 8 + sweatBounce, 7);
    drawSweatDrop(player.x - 14, player.y + 22 - sweatBounce * 0.6, 5);
  }
}
