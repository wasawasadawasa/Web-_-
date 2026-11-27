// 全体の流れ：ゲームの状態を見て、動かす・描く

const TARGET_BAN = 15;
const TIME_LIMIT = 45;

let gameState = "title"; // "title"・"play"・"pause"・"gameover"・"clear"
let timeLeft = TIME_LIMIT;
let banCount = 0;
let money = 0;
let effects = [];
let clearParticles = [];

const BAN_SUB_TEXTS = [
  "ロケットパンチ！",
  "永久BAN！",
  "タイムアウト！",
  "配信妨害排除！"
];

// ゲームを最初の値に戻す
function resetGame() {
  resetPlayer();
  resetEnemies();
  timeLeft = TIME_LIMIT;
  banCount = 0;
  money = 0;
  effects = [];
  clearParticles = [];
}

// 始める：最初の値に戻してから、プレイ中にする
function startGame() {
  resetGame();
  gameState = "play";
}

// BAN＆集金エフェクトを生成
function spawnBanEffect(x, y, reward) {
  const usePhrase = Math.random() < 0.35;
  const subText = usePhrase
    ? BAN_SUB_TEXTS[Math.floor(Math.random() * BAN_SUB_TEXTS.length)]
    : "+¥" + reward.toLocaleString();
  effects.push({
    x: x,
    y: y,
    vy: -55,
    life: 0.95,
    maxLife: 0.95,
    mainText: "BAN!!",
    subText: subText,
    color: usePhrase ? "#38bdf8" : "#ffd43b"
  });
}

// クリア画面のスパチャ＆コイン演出を初期化
function initClearEffects() {
  clearParticles = [];
  const colors = ["#e03131", "#f59f00", "#2f9e44", "#ffd43b"];
  const labels = ["¥10,000", "¥5,000", "¥2,000", "¥1,000", "★"];
  for (let i = 0; i < 42; i++) {
    const isCoin = i % 3 === 0;
    clearParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 45,
      vy: 65 + Math.random() * 95,
      isCoin: isCoin,
      color: colors[i % colors.length],
      label: labels[i % labels.length],
      size: isCoin ? 7 + Math.random() * 4 : 10
    });
  }
}

function updateEffects(dt) {
  for (const ef of effects) {
    ef.y += ef.vy * dt;
    ef.life -= dt;
  }
  effects = effects.filter((ef) => ef.life > 0);
}

function updateClearEffects(dt) {
  for (const p of clearParticles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y > canvas.height + 24) {
      p.y = -24;
      p.x = Math.random() * canvas.width;
    }
  }
}

// ゲーム全体のキーボードイベント処理
document.addEventListener("keydown", (e) => {
  if (
    e.code === "Enter" &&
    (gameState === "title" || gameState === "gameover" || gameState === "clear")
  ) {
    startGame();
  }
  if (e.code === "KeyP") {
    if (gameState === "play") {
      gameState = "pause";
    } else if (gameState === "pause") {
      gameState = "play";
    }
  }
});

function update(dt) {
  if (gameState === "clear") {
    updateClearEffects(dt);
    updateEffects(dt);
    return;
  }
  if (gameState !== "play") {
    return; // プレイ中でなければ、動かさない
  }

  timeLeft = Math.max(0, timeLeft - dt);

  const prevBottom = player.y + player.h; // 動かす前のプレイヤーの下の辺
  updatePlayer(dt);
  updateEnemies(dt);
  collideWithEnemies(prevBottom);
  updateEffects(dt);

  if (gameState === "play" && (player.hp <= 0 || timeLeft <= 0)) {
    gameState = "gameover";
  }
}

// プレイ中のHUD描画（画面上部）
function drawHUD() {
  ctx.save();
  // 右上HUDバー背景
  ctx.fillStyle = "rgba(10, 14, 24, 0.78)";
  ctx.fillRect(194, 6, canvas.width - 202, 24);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(194, 6, canvas.width - 202, 24);

  // メンタル（ハート表示：減るほど赤く点滅）
  const lowMental = player.hp <= 2;
  const blinkOn = Math.floor(performance.now() / 220) % 2 === 0;
  ctx.font = "bold 13px sans-serif";
  let hearts = "";
  for (let i = 0; i < MAX_HP; i++) {
    hearts += i < player.hp ? "♥" : "♡";
  }
  ctx.fillStyle = lowMental && blinkOn ? "#ff2a2a" : "#ff6b6b";
  ctx.fillText("メンタル:" + hearts, 202, 23);

  // BAN数
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 12px monospace";
  ctx.fillText("BAN: " + banCount + " / " + TARGET_BAN, 326, 22);

  // 集金額
  ctx.fillStyle = "#ffd43b";
  ctx.fillText("収益: ¥" + money.toLocaleString(), 422, 22);

  // 定時までの残り時間（10秒以下で赤文字強調）
  ctx.fillStyle = timeLeft <= 10 ? "#ff4d4f" : "#38bdf8";
  ctx.fillText("定時まで: " + timeLeft.toFixed(1) + "s", 530, 22);
  ctx.restore();
}

// BANエフェクト描画
function drawEffects() {
  ctx.save();
  ctx.textAlign = "center";
  for (const ef of effects) {
    const alpha = Math.max(0, ef.life / ef.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = "bold 18px sans-serif";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(ef.mainText, ef.x, ef.y);
    ctx.fillStyle = "#ff4d4f";
    ctx.fillText(ef.mainText, ef.x, ef.y);

    ctx.font = "bold 13px sans-serif";
    ctx.strokeText(ef.subText, ef.x, ef.y + 16);
    ctx.fillStyle = ef.color;
    ctx.fillText(ef.subText, ef.x, ef.y + 16);
  }
  ctx.restore();
}

// クリア時のスパチャ＆コイン描画
function drawClearEffects() {
  ctx.save();
  for (const p of clearParticles) {
    if (p.isCoin) {
      ctx.fillStyle = "#ffd43b";
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#9c6f00";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("¥", p.x, p.y + 3);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(p.x - 28, p.y - 10, 56, 20, 5);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x, p.y + 4);
    }
  }
  ctx.restore();
}

// 画面のまん中に文字を書く
function drawMessage(text, sub) {
  ctx.save();
  // 読みやすくするための半透明パネル
  ctx.fillStyle = "rgba(8, 12, 22, 0.82)";
  ctx.strokeStyle = "rgba(249, 158, 26, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(42, 108, canvas.width - 84, 118, 12);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(text, canvas.width / 2, 156);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px sans-serif";
  ctx.fillText(sub, canvas.width / 2, 194);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStage();

  if (gameState === "title") {
    drawMessage(
      "OW配信防衛！講釈オタクBAN",
      "Enter で遅刻している配信を開始（スペースで多段ジャンプ）"
    );
    return;
  }

  drawEnemies();
  drawPlayer();
  drawEffects();
  drawHUD();

  if (gameState === "pause") {
    drawMessage("離席中（PAUSE）", "P キーで配信再開");
  }
  if (gameState === "gameover") {
    drawMessage(
      "ブチギレて配信終了。Z◯TA脱退。",
      "Enter で西原さんに土下座をしながらやり直す"
    );
  }
  if (gameState === "clear") {
    drawClearEffects();
    drawMessage(
      "配信でお金を吸い取れた！",
      "定時前に講釈オタクを全員BAN！ Enter でもう一稼ぎ"
    );
  }
}

let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
