// 敵：「🤓☝️」オタク講釈スタンプ＋チャット吹き出し・出現・踏みつけ判定

const MAX_ENEMIES = 6;
const SPAWN_INTERVAL = 1.8;
const ENEMY_GRAVITY = 900;

const LECTURE_COMMENTS = [
  "今のウルト吐くの早すぎｗ",
  "ザリア出せば勝てるのに",
  "俺マスターだけど今の立ち回り違う",
  "今のフォーカス甘くない？",
  "それ構成負けしてるよ",
  "サブ垢でキャリーしてあげよっか？",
  "今のエイムどうしたｗ",
  "指示厨じゃないけど今のピックは〜",
  "タンクの仕事してないね",
  "お前がキャリーするしかないよ"
];

let enemies = [];
let spawnTimer = 0;
let enemySeq = 0;
let lastCommentIndex = -1;

// ランダムな講釈コメントを選ぶ（直前と同じ文言を避ける）
function pickLectureComment() {
  let idx = Math.floor(Math.random() * LECTURE_COMMENTS.length);
  if (idx === lastCommentIndex) {
    idx = (idx + 1) % LECTURE_COMMENTS.length;
  }
  lastCommentIndex = idx;
  return LECTURE_COMMENTS[idx];
}

// ① 作る：講釈オタクを1体作って返す関数
function createEnemy(x, vx, y) {
  const w = 50;
  const h = 42;
  const startY = typeof y === "number" ? y : floor.y - h;
  enemySeq += 1;
  return {
    id: enemySeq,
    x: x,
    y: startY,
    w: w,
    h: h,
    vx: vx,
    vy: 0,
    alive: true,
    comment: pickLectureComment(),
    bobPhase: Math.random() * Math.PI * 2,
    bubbleTier: enemySeq % 2   // 吹き出しの高さを少しずらして読みやすくする
  };
}

// ② 最初の敵を入れ直す（初期の講釈オタクを3体配置）
function resetEnemies() {
  enemies = [];
  spawnTimer = 0;
  enemySeq = 0;
  enemies.push(createEnemy(280, 95));
  enemies.push(createEnemy(500, -125));
  enemies.push(createEnemy(670, -85));
}

// プレイ中に左右または上空から新しい講釈オタクを出現させる
function spawnEnemy() {
  if (enemies.length >= MAX_ENEMIES) return;

  const speed = 85 + Math.random() * 80;
  const pattern = Math.random();

  if (pattern < 0.35) {
    // 左端から出現（プレイヤーが左端に近すぎる場合は右端へ逃がす）
    if (player.x < 140) {
      enemies.push(createEnemy(canvas.width - 52, -speed));
    } else {
      enemies.push(createEnemy(2, speed));
    }
  } else if (pattern < 0.7) {
    // 右端から出現（プレイヤーが右端に近すぎる場合は左端へ逃がす）
    if (player.x > canvas.width - 180) {
      enemies.push(createEnemy(2, speed));
    } else {
      enemies.push(createEnemy(canvas.width - 52, -speed));
    }
  } else {
    // 上空から落下出現（プレイヤーの真上直撃は避ける）
    let spawnX = 60 + Math.random() * (canvas.width - 170);
    if (Math.abs(spawnX - player.x) < 90) {
      spawnX = player.x < canvas.width / 2
        ? Math.min(canvas.width - 90, player.x + 150)
        : Math.max(40, player.x - 150);
    }
    const dir = Math.random() < 0.5 ? -1 : 1;
    enemies.push(createEnemy(spawnX, dir * speed, 48));
  }
}

// ③ 動かす：スポーン管理と移動・落下処理
function updateEnemies(dt) {
  spawnTimer += dt;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer -= SPAWN_INTERVAL;
    spawnEnemy();
  }

  for (const enemy of enemies) {
    enemy.bobPhase += dt * 9;

    // 空中からの出現時は重力で床へ落とす
    if (enemy.y + enemy.h < floor.y) {
      enemy.vy += ENEMY_GRAVITY * dt;
      enemy.y += enemy.vy * dt;
      if (enemy.y + enemy.h >= floor.y) {
        enemy.y = floor.y - enemy.h;
        enemy.vy = 0;
      }
    }

    // 横移動と画面端での折り返し
    enemy.x += enemy.vx * dt;
    if (enemy.x < 4) {
      enemy.x = 4;
      enemy.vx = Math.abs(enemy.vx);
    }
    if (enemy.x + enemy.w > canvas.width - 4) {
      enemy.x = canvas.width - 4 - enemy.w;
      enemy.vx = -Math.abs(enemy.vx);
    }
  }
}

// プレイヤーとの当たり判定：上から踏みつけでBAN、横・下からでメンタルダメージ
function collideWithEnemies(prevBottom) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    if (!aabb(player, enemy)) continue;

    // 上から落下して踏みつけた判定（少し余裕を持たせて踏みやすくする）
    const isStomp = prevBottom <= enemy.y + 16 && player.vy > 0;
    if (isStomp) {
      enemy.alive = false;
      player.vy = -JUMP_SPEED * 0.72;
      player.jumpsLeft = MAX_JUMPS;

      if (typeof onEnemyBanned === "function") {
        onEnemyBanned(enemy);
      }
    } else {
      // 横・下からぶつかったらメンタル耐久値を減らして無敵時間発生
      damagePlayer(enemy.x + enemy.w / 2);
    }
  }

  enemies = enemies.filter((enemy) => enemy.alive);
}

// 「🤓☝️」オタク講釈スタンプ本体を描く（顔＋右側の人差し指を立てた手）
function drawNerdStamp(x, y, w, h, bob) {
  ctx.save();
  const yOff = Math.sin(bob) * 2;
  const faceR = 16.5;
  const faceX = x + 17.5;
  const faceY = y + h - faceR - 2 + yOff;

  // --- 1. 黄色い丸顔ベース ---
  const faceGrad = ctx.createRadialGradient(
    faceX - 5, faceY - 6, 2,
    faceX, faceY, faceR
  );
  faceGrad.addColorStop(0, "#fff275");
  faceGrad.addColorStop(0.65, "#ffd43b");
  faceGrad.addColorStop(1, "#f0a500");

  ctx.beginPath();
  ctx.arc(faceX, faceY, faceR, 0, Math.PI * 2);
  ctx.fillStyle = faceGrad;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = "#6e4600";
  ctx.stroke();

  // わずかな頬の赤み
  ctx.fillStyle = "rgba(255, 110, 90, 0.28)";
  ctx.beginPath();
  ctx.ellipse(faceX - 9, faceY + 4, 3.2, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(faceX + 9, faceY + 4, 3.2, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 2. ニヤリと開いた口と白い2本の出っ歯 ---
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(faceX - 8.5, faceY + 5);
  ctx.quadraticCurveTo(faceX, faceY + 7.5, faceX + 8.5, faceY + 5);
  ctx.quadraticCurveTo(faceX + 6.5, faceY + 13.5, faceX, faceY + 13.5);
  ctx.quadraticCurveTo(faceX - 6.5, faceY + 13.5, faceX - 8.5, faceY + 5);
  ctx.closePath();
  ctx.fillStyle = "#591c1c";
  ctx.fill();
  ctx.strokeStyle = "#3b1212";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2本の白い出っ歯
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 0.8;
  ctx.fillRect(faceX - 4.1, faceY + 6, 3.9, 4.6);
  ctx.strokeRect(faceX - 4.1, faceY + 6, 3.9, 4.6);
  ctx.fillRect(faceX + 0.2, faceY + 6, 3.9, 4.6);
  ctx.strokeRect(faceX + 0.2, faceY + 6, 3.9, 4.6);
  ctx.restore();

  // --- 3. 縦長の茶色い両目 ---
  const eyeY = faceY - 2.2;
  const leftEyeX = faceX - 6.2;
  const rightEyeX = faceX + 6.2;

  ctx.fillStyle = "#3d2210";
  ctx.beginPath();
  ctx.ellipse(leftEyeX, eyeY, 2.2, 3.8, 0, 0, Math.PI * 2);
  ctx.ellipse(rightEyeX, eyeY, 2.2, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 目のハイライト
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(leftEyeX - 0.7, eyeY - 1.3, 0.9, 0, Math.PI * 2);
  ctx.arc(rightEyeX - 0.7, eyeY - 1.3, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // --- 4. 黒縁の太めメガネ ---
  ctx.save();
  const lensW = 11.2;
  const lensH = 9.8;
  const lensY = eyeY - lensH / 2;

  // レンズの薄いガラス感と光沢
  ctx.fillStyle = "rgba(230, 246, 255, 0.32)";
  drawRoundRect(ctx, leftEyeX - lensW / 2, lensY, lensW, lensH, 3.5);
  ctx.fill();
  drawRoundRect(ctx, rightEyeX - lensW / 2, lensY, lensW, lensH, 3.5);
  ctx.fill();

  // レンズの斜めキラリ線
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(leftEyeX - 3.5, lensY + 2);
  ctx.lineTo(leftEyeX - 1.5, lensY + 4.5);
  ctx.moveTo(rightEyeX - 3.5, lensY + 2);
  ctx.lineTo(rightEyeX - 1.5, lensY + 4.5);
  ctx.stroke();

  // 太い黒フレーム
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2.5;
  drawRoundRect(ctx, leftEyeX - lensW / 2, lensY, lensW, lensH, 3.5);
  ctx.stroke();
  drawRoundRect(ctx, rightEyeX - lensW / 2, lensY, lensW, lensH, 3.5);
  ctx.stroke();

  // ブリッジと左右のつる
  ctx.beginPath();
  ctx.moveTo(leftEyeX + lensW / 2, eyeY - 0.8);
  ctx.lineTo(rightEyeX - lensW / 2, eyeY - 0.8);
  ctx.moveTo(leftEyeX - lensW / 2, eyeY - 1);
  ctx.lineTo(faceX - faceR + 0.5, eyeY - 2);
  ctx.moveTo(rightEyeX + lensW / 2, eyeY - 1);
  ctx.lineTo(faceX + faceR - 0.5, eyeY - 2);
  ctx.stroke();
  ctx.restore();

  // --- 5. 顔の右側に人差し指をピンと立てた黄色い手（☝️） ---
  const handX = x + 36;
  const handY = y + h - 19 + yOff * 1.15;

  ctx.save();
  ctx.fillStyle = "#ffd43b";
  ctx.strokeStyle = "#6e4600";
  ctx.lineWidth = 1.4;

  // 真上にピンと立てた人差し指
  drawRoundRect(ctx, handX + 1.5, handY - 16, 6.2, 19, 3.1);
  ctx.fill();
  ctx.stroke();

  // 人差し指のハイライト
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(handX + 3.2, handY - 14, 1.6, 5);

  // 拳ベース（手のひら）
  ctx.fillStyle = "#fcc419";
  drawRoundRect(ctx, handX, handY - 1, 13.5, 13, 5);
  ctx.fill();
  ctx.stroke();

  // 丸めた中指・薬指・小指の3つの節
  ctx.fillStyle = "#ffd43b";
  for (let i = 0; i < 3; i++) {
    drawRoundRect(ctx, handX + 6.5, handY - 0.5 + i * 3.8, 6.8, 3.9, 1.8);
    ctx.fill();
    ctx.stroke();
  }

  // 左側に添えた親指
  drawRoundRect(ctx, handX - 1.5, handY + 2.5, 6.5, 5.2, 2.4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ダークグレーのオタク講釈コメント吹き出しを描く
function drawCommentBubble(enemy) {
  ctx.save();
  ctx.font = "bold 11px sans-serif";
  const text = enemy.comment;
  const padX = 8;
  const bubbleH = 22;
  const textW = ctx.measureText(text).width;
  const bubbleW = textW + padX * 2 + 10;

  const anchorX = enemy.x + enemy.w / 2;
  const tierOffset = enemy.bubbleTier * 24;
  let bx = anchorX - bubbleW / 2;
  let by = enemy.y - bubbleH - 10 - tierOffset;

  // 画面端や上部HUDバーに被らないようクランプ
  if (bx < 6) bx = 6;
  if (bx + bubbleW > canvas.width - 6) bx = canvas.width - 6 - bubbleW;
  if (by < 54) by = 54;

  // 吹き出し本体（ダークグレー）
  drawRoundRect(ctx, bx, by, bubbleW, bubbleH, 6);
  ctx.fillStyle = "rgba(28, 31, 42, 0.94)";
  ctx.fill();
  ctx.strokeStyle = "rgba(155, 170, 205, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 下向きの三角しっぽ
  const tailX = Math.max(bx + 10, Math.min(bx + bubbleW - 10, anchorX));
  ctx.beginPath();
  ctx.moveTo(tailX - 5, by + bubbleH - 0.5);
  ctx.lineTo(tailX + 5, by + bubbleH - 0.5);
  ctx.lineTo(tailX, by + bubbleH + 6);
  ctx.closePath();
  ctx.fillStyle = "rgba(28, 31, 42, 0.94)";
  ctx.fill();
  ctx.strokeStyle = "rgba(155, 170, 205, 0.55)";
  ctx.beginPath();
  ctx.moveTo(tailX - 5, by + bubbleH);
  ctx.lineTo(tailX, by + bubbleH + 6);
  ctx.lineTo(tailX + 5, by + bubbleH);
  ctx.stroke();

  // チャットアイコン風の小さなバッジ＋コメント本文
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(bx + 9, by + bubbleH / 2, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f1f5ff";
  ctx.textAlign = "left";
  ctx.fillText(text, bx + 16, by + 15);
  ctx.restore();
}

// ④ 描く：配列の敵本体を描いたあと、吹き出しを上に重ねて読みやすく描く
function drawEnemies() {
  for (const enemy of enemies) {
    // 足元の影
    const groundDist = Math.max(0, floor.y - (enemy.y + enemy.h));
    const shadowScale = Math.max(0.35, 1 - groundDist / 260);
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(
      enemy.x + enemy.w / 2,
      floor.y - 2,
      20 * shadowScale,
      4.5 * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    drawNerdStamp(enemy.x, enemy.y, enemy.w, enemy.h, enemy.bobPhase);
  }

  for (const enemy of enemies) {
    drawCommentBubble(enemy);
  }
}
