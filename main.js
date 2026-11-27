// 全体の流れ：5状態管理・配信HUD・BAN＆集金エフェクト・クリアスパチャ演出

const TARGET_BAN = 15;
const TIME_LIMIT = 45;

let gameState = "title"; // "title"・"play"・"pause"・"gameover"・"clear"
let timeLeft = TIME_LIMIT;
let banCount = 0;
let money = 0;
let effects = [];
let clearParticles = [];
let gameOverReason = "";
let uiTime = 0;

// ゲームを最初の値に戻す
function resetGame() {
  resetPlayer();
  resetEnemies();
  timeLeft = TIME_LIMIT;
  banCount = 0;
  money = 0;
  effects = [];
  clearParticles = [];
  gameOverReason = "";
}

// 始める：最初の値に戻してから、プレイ中にする
function startGame() {
  resetGame();
  gameState = "play";
}

// 敵を上から踏みつけてBANしたときの処理
function onEnemyBanned(enemy) {
  banCount += 1;

  // 1000〜5000円をランダムに加算（500円刻み）
  const rewardSteps = [1000, 1500, 2000, 2500, 3000, 4000, 5000];
  const reward = rewardSteps[Math.floor(Math.random() * rewardSteps.length)];
  money += reward;

  const cx = enemy.x + enemy.w / 2;
  const cy = enemy.y + 8;

  // ポップな "BAN!!" 文字エフェクト
  effects.push({
    kind: "text",
    text: "BAN!!",
    x: cx,
    y: cy,
    vx: 0,
    vy: -78,
    life: 0.95,
    maxLife: 0.95,
    color: "#ff4d6d",
    stroke: "#2b0510",
    font: "bold 22px sans-serif"
  });

  // 集金エフェクト "+¥..."
  effects.push({
    kind: "text",
    text: "+¥" + reward.toLocaleString(),
    x: cx + 22,
    y: cy - 18,
    vx: 14,
    vy: -92,
    life: 1.15,
    maxLife: 1.15,
    color: reward >= 3000 ? "#ffd43b" : "#4ade80",
    stroke: "#0b1a10",
    font: "bold 16px monospace"
  });

  // スパチャ感謝テキスト
  const cheerTexts = ["スパチャ感謝！", "ナイスBAN！", "運営ありがとう！"];
  const cheer = reward >= 3000 ? "スパチャ感謝！" : cheerTexts[banCount % cheerTexts.length];
  effects.push({
    kind: "text",
    text: cheer,
    x: cx - 18,
    y: cy - 34,
    vx: -12,
    vy: -64,
    life: 1.1,
    maxLife: 1.1,
    color: "#38bdf8",
    stroke: "#071a2b",
    font: "bold 13px sans-serif"
  });

  // 弾けるポップな火花パーティクル
  const sparkColors = ["#ff4d6d", "#ffd43b", "#4ade80", "#38bdf8", "#ffffff"];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
    const spd = 70 + Math.random() * 140;
    effects.push({
      kind: "spark",
      x: cx,
      y: enemy.y + enemy.h / 2,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 60,
      size: 3 + Math.random() * 4,
      life: 0.45 + Math.random() * 0.3,
      maxLife: 0.75,
      color: sparkColors[i % sparkColors.length]
    });
  }

  // 目標BAN数に達したら即座にクリア
  if (banCount >= TARGET_BAN) {
    gameState = "clear";
    initClearCelebration();
  }
}

// クリア時の高額スパチャ風バッジ＆コイン乱舞を初期化
function initClearCelebration() {
  clearParticles = [];
  const superChatTiers = [
    { bg: "#e62117", header: "#b71c1c", text: "¥10,000", sub: "赤スパ感謝！" },
    { bg: "#ffb300", header: "#e68a00", text: "¥5,000", sub: "金スパあざす！" },
    { bg: "#00bfa5", header: "#00897b", text: "¥2,000", sub: "定時前BAN最高！" },
    { bg: "#e91e63", header: "#ad1457", text: "¥50,000", sub: "神配信GG!!" }
  ];

  // スパチャバッジ
  for (let i = 0; i < 20; i++) {
    const tier = superChatTiers[i % superChatTiers.length];
    clearParticles.push({
      kind: "superchat",
      x: Math.random() * canvas.width,
      y: -40 - Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 45,
      vy: 65 + Math.random() * 85,
      w: 96,
      h: 36,
      rot: (Math.random() - 0.5) * 0.35,
      vrot: (Math.random() - 0.5) * 1.4,
      tier: tier
    });
  }

  // 舞い散るコイン
  for (let i = 0; i < 38; i++) {
    clearParticles.push({
      kind: "coin",
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 70,
      vy: 90 + Math.random() * 120,
      r: 7 + Math.random() * 5,
      spin: Math.random() * Math.PI * 2,
      vspin: 5 + Math.random() * 6
    });
  }
}

function updateEffects(dt) {
  for (const ef of effects) {
    ef.life -= dt;
    ef.x += ef.vx * dt;
    ef.y += ef.vy * dt;
    if (ef.kind === "spark") {
      ef.vy += 380 * dt;
    } else if (ef.kind === "text") {
      ef.vy *= Math.pow(0.25, dt);
    }
  }
  effects = effects.filter((ef) => ef.life > 0);
}

function updateClearParticles(dt) {
  for (const p of clearParticles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === "superchat") {
      p.rot += p.vrot * dt;
    } else {
      p.spin += p.vspin * dt;
    }
    if (p.y > canvas.height + 50) {
      p.y = -45;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -80) p.x = canvas.width + 60;
    if (p.x > canvas.width + 80) p.x = -60;
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
  uiTime += dt;

  if (gameState === "clear") {
    updateEffects(dt);
    updateClearParticles(dt);
    return;
  }

  if (gameState !== "play") {
    return;
  }

  // 定時までの残り時間を減らす
  timeLeft = Math.max(0, timeLeft - dt);

  const prevBottom = player.y + player.h;
  updatePlayer(dt);
  updateEnemies(dt);
  collideWithEnemies(prevBottom);
  updateEffects(dt);

  // プレイ中のままメンタル0または定時オーバーでゲームオーバー
  if (gameState === "play") {
    if (player.hp <= 0) {
      gameOverReason = "メンタルが限界に達した…";
      gameState = "gameover";
    } else if (timeLeft <= 0) {
      gameOverReason = "定時までに目標BAN数へ届かなかった…";
      gameState = "gameover";
    }
  }
}

// 左上の赤い「● LIVE」バッジ＋「ランクマッチ配信中」と上部HUDバーを描画
function drawStreamHeader(showPlayHUD) {
  ctx.save();

  // 上部半透明バー
  ctx.fillStyle = "rgba(8, 12, 22, 0.88)";
  ctx.fillRect(0, 0, canvas.width, 46);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(0, 45, canvas.width, 1);

  // 左上：赤い「● LIVE」バッジ
  drawRoundRect(ctx, 12, 10, 62, 26, 5);
  ctx.fillStyle = "#e11d48";
  ctx.fill();

  const liveDotAlpha = 0.45 + 0.55 * Math.abs(Math.sin(uiTime * 4));
  ctx.fillStyle = `rgba(255, 255, 255, ${liveDotAlpha.toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(24, 23, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("LIVE", 34, 27);

  // 「ランクマッチ配信中」テキスト
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("ランクマッチ配信中", 84, 27);

  if (!showPlayHUD) {
    ctx.restore();
    return;
  }

  // --- メンタル（ハート＋ゲージ、減るほど赤く点滅） ---
  const mentalX = 228;
  const isLowHp = player.hp <= 2;
  const dangerBlink = isLowHp && Math.sin(uiTime * (player.hp <= 1 ? 16 : 9)) > 0;

  ctx.fillStyle = dangerBlink ? "#ff3b5c" : "#cbd5e1";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("メンタル", mentalX, 18);

  // ハート4つ
  for (let i = 0; i < MAX_HP; i++) {
    const hx = mentalX + 54 + i * 20;
    const hy = 18;
    const filled = i < player.hp;
    ctx.font = "16px sans-serif";
    if (filled) {
      ctx.fillStyle = dangerBlink ? "#ff2a4b" : (player.hp <= 2 ? "#fb7185" : "#ff4d6d");
    } else {
      ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
    }
    ctx.fillText("♥", hx, hy);
  }

  // メンタルバー
  const barW = 132;
  const barH = 7;
  drawRoundRect(ctx, mentalX, 26, barW, barH, 3);
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.fill();
  const hpRatio = Math.max(0, player.hp / MAX_HP);
  if (hpRatio > 0) {
    drawRoundRect(ctx, mentalX, 26, barW * hpRatio, barH, 3);
    if (player.hp <= 1) {
      ctx.fillStyle = dangerBlink ? "#ff1744" : "#ff5252";
    } else if (player.hp === 2) {
      ctx.fillStyle = dangerBlink ? "#ff5252" : "#f59e0b";
    } else {
      ctx.fillStyle = "#38bdf8";
    }
    ctx.fill();
  }

  // --- BAN数 ---
  const banX = 390;
  drawRoundRect(ctx, banX, 8, 114, 30, 6);
  ctx.fillStyle = "rgba(249, 158, 26, 0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(249, 158, 26, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`BAN: ${banCount} / ${TARGET_BAN}`, banX + 57, 28);

  // --- 集金額 ---
  const moneyX = 516;
  drawRoundRect(ctx, moneyX, 8, 128, 30, 6);
  ctx.fillStyle = "rgba(74, 222, 128, 0.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
  ctx.stroke();

  ctx.fillStyle = "#4ade80";
  ctx.font = "bold 14px monospace";
  ctx.fillText(`収益: ¥${money.toLocaleString()}`, moneyX + 64, 28);

  // --- 定時までの残り時間（残り10秒以下で赤文字強調） ---
  const timeX = 656;
  const isUrgent = timeLeft <= 10;
  const urgentPulse = isUrgent && Math.sin(uiTime * 14) > 0;

  drawRoundRect(ctx, timeX, 8, 132, 30, 6);
  ctx.fillStyle = isUrgent
    ? (urgentPulse ? "rgba(239, 68, 68, 0.35)" : "rgba(239, 68, 68, 0.18)")
    : "rgba(56, 189, 248, 0.12)";
  ctx.fill();
  ctx.strokeStyle = isUrgent ? "#ef4444" : "rgba(56, 189, 248, 0.4)";
  ctx.stroke();

  ctx.fillStyle = isUrgent ? "#ff4d6d" : "#e2e8f0";
  ctx.font = isUrgent ? "bold 15px monospace" : "bold 14px monospace";
  ctx.fillText(`定時まで: ${timeLeft.toFixed(1)}s`, timeX + 66, 28);

  ctx.restore();
}

function drawEffects() {
  ctx.save();
  ctx.textAlign = "center";
  for (const ef of effects) {
    const alpha = Math.max(0, Math.min(1, ef.life / ef.maxLife));
    ctx.globalAlpha = alpha;
    if (ef.kind === "text") {
      ctx.font = ef.font;
      ctx.lineWidth = 4;
      ctx.strokeStyle = ef.stroke;
      ctx.strokeText(ef.text, ef.x, ef.y);
      ctx.fillStyle = ef.color;
      ctx.fillText(ef.text, ef.x, ef.y);
    } else if (ef.kind === "spark") {
      ctx.fillStyle = ef.color;
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, ef.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawClearCelebration() {
  ctx.save();
  for (const p of clearParticles) {
    if (p.kind === "superchat") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // スパチャカード本体
      drawRoundRect(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 6);
      ctx.fillStyle = p.tier.bg;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 上部ヘッダー帯
      drawRoundRect(ctx, -p.w / 2, -p.h / 2, p.w, 17, 5);
      ctx.fillStyle = p.tier.header;
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(p.tier.text, -p.w / 2 + 8, -p.h / 2 + 12);

      ctx.font = "bold 9px sans-serif";
      ctx.fillText(p.tier.sub, -p.w / 2 + 8, p.h / 2 - 5);
      ctx.restore();
    } else if (p.kind === "coin") {
      ctx.save();
      ctx.translate(p.x, p.y);
      const scaleX = Math.max(0.2, Math.abs(Math.cos(p.spin)));
      ctx.scale(scaleX, 1);

      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd43b";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#d97706";
      ctx.stroke();

      ctx.fillStyle = "#92400e";
      ctx.font = `bold ${Math.floor(p.r * 1.25)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("¥", 0, p.r * 0.42);
      ctx.restore();
    }
  }
  ctx.restore();
}

// 画面のまん中に配信オーバーレイ風のメッセージパネルを描く
function drawMessage(text, sub, accentColor, extraLines, skipBackdrop) {
  ctx.save();

  // 背景を薄暗くして文字を読みやすくする
  if (!skipBackdrop) {
    ctx.fillStyle = "rgba(7, 10, 18, 0.62)";
    ctx.fillRect(0, 46, canvas.width, canvas.height - 46);
  }

  const panelW = 640;
  const panelH = extraLines && extraLines.length > 0 ? 196 : 148;
  const px = (canvas.width - panelW) / 2;
  const py = (canvas.height - panelH) / 2 + 6;

  drawRoundRect(ctx, px, py, panelW, panelH, 12);
  ctx.fillStyle = "rgba(15, 22, 38, 0.92)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = accentColor || "#f99e1a";
  ctx.stroke();

  // 上部アクセントライン
  ctx.fillStyle = accentColor || "#f99e1a";
  ctx.fillRect(px + 24, py, panelW - 48, 4);

  // メイン見出し
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(text, canvas.width / 2, py + 58, panelW - 40);

  // サブメッセージ
  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(sub, canvas.width / 2, py + 98, panelW - 40);

  // 補足行
  if (extraLines && extraLines.length > 0) {
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "13px sans-serif";
    for (let i = 0; i < extraLines.length; i++) {
      ctx.fillText(extraLines[i], canvas.width / 2, py + 134 + i * 24, panelW - 40);
    }
  }

  ctx.restore();
}

function drawTitlePreview() {
  // タイトル画面のパネル下端にモザイク配信者＆講釈オタクのプレビューを添える
  ctx.save();
  if (playerImgLoaded) {
    const aspect = playerImg.width / playerImg.height;
    const h = 64;
    const w = h * aspect;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(playerImg, 130, floor.y - h, w, h);
  }
  drawNerdStamp(canvas.width - 190, floor.y - 42, 50, 42, uiTime * 5);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStage();

  if (gameState === "title") {
    drawTitlePreview();
    drawStreamHeader(false);
    drawMessage(
      "OW配信防衛！講釈オタクBAN",
      "Enter で配信開始（スペースで多段ジャンプ）",
      "#f99e1a",
      [
        "ルール：45秒（定時）以内に講釈オタクを15体上から踏みつけてBANしろ！",
        "操作：←→ / A・D で移動　Space / ↑ / W で2段ジャンプ　P で離席"
      ]
    );
    return;
  }

  drawEnemies();
  drawPlayer();
  drawEffects();

  if (gameState === "pause") {
    drawMessage("離席中（PAUSE）", "P キーで配信再開", "#38bdf8");
  }
  if (gameState === "gameover") {
    drawMessage(
      "ブチギレて配信終了。Z◯TA脱退。",
      "Enter でやり直す",
      "#ef4444",
      [
        gameOverReason || "メンタル崩壊または定時オーバー…",
        `結果：BAN ${banCount} / ${TARGET_BAN} 件　｜　獲得収益 ¥${money.toLocaleString()}`
      ]
    );
  }
  if (gameState === "clear") {
    // 暗幕の上に色鮮やかなスパチャ＆コインを舞わせ、その上にクリアパネルを表示
    ctx.fillStyle = "rgba(7, 10, 18, 0.55)";
    ctx.fillRect(0, 46, canvas.width, canvas.height - 46);
    drawClearCelebration();
    drawMessage(
      "配信でお金を吸い取れた！",
      "定時前に講釈オタクを全員BAN！ Enter でもう一度",
      "#ffd43b",
      [
        `総収益：¥${money.toLocaleString()}　｜　残り定時：${timeLeft.toFixed(1)}s`,
        `残メンタル：${player.hp} / ${MAX_HP}　—　今日も平和なランクマッチ配信GG！`
      ],
      true
    );
  }

  drawStreamHeader(true);
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
