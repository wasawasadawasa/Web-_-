// 敵：OW講釈オタクスタンプ（「🤓☝️」）＋コメント吹き出し

const OTK_COMMENTS = [
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

const MAX_ENEMIES = 6;
const SPAWN_INTERVAL = 1.8;

// ① 作る：講釈オタクを1体作って返す関数
function createEnemy(x, vx, y) {
  const comment = OTK_COMMENTS[Math.floor(Math.random() * OTK_COMMENTS.length)];
  return {
    x: x,
    y: y !== undefined ? y : floor.y - 36,
    w: 44,
    h: 36,
    vx: vx,
    vy: 0,
    alive: true,
    comment: comment
  };
}

// ② 入れる：敵をまとめて入れる配列
let enemies = [];
let spawnTimer = 0;

// 最初の敵を入れ直す（初期3体）
function resetEnemies() {
  enemies = [];
  spawnTimer = 0;
  enemies.push(createEnemy(230, 85));
  enemies.push(createEnemy(400, -110));
  enemies.push(createEnemy(540, 75));
}

// 画面の左右端または上空から講釈オタクを1体出現させる
function spawnEnemy() {
  const pattern = Math.floor(Math.random() * 3);
  const speed = 75 + Math.random() * 65;
  if (pattern === 0) {
    // 左端から
    enemies.push(createEnemy(4, speed, floor.y - 36));
  } else if (pattern === 1) {
    // 右端から
    enemies.push(createEnemy(canvas.width - 48, -speed, floor.y - 36));
  } else {
    // 上空から降ってくる
    const rx = 60 + Math.random() * (canvas.width - 140);
    const dir = Math.random() < 0.5 ? -1 : 1;
    enemies.push(createEnemy(rx, dir * speed, 48));
  }
}

// ③ 動かす：敵の定期出現・移動・重力
function updateEnemies(dt) {
  spawnTimer += dt;
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer -= SPAWN_INTERVAL;
    if (enemies.length < MAX_ENEMIES) {
      spawnEnemy();
    }
  }

  for (const enemy of enemies) {
    enemy.vy += GRAVITY * dt;
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;

    // 床との当たり判定
    if (enemy.y + enemy.h >= floor.y) {
      enemy.y = floor.y - enemy.h;
      enemy.vy = 0;
    }

    // 画面端で折り返し
    if (enemy.x < 0) {
      enemy.x = 0;
      enemy.vx = Math.abs(enemy.vx);
    }
    if (enemy.x + enemy.w > canvas.width) {
      enemy.x = canvas.width - enemy.w;
      enemy.vx = -Math.abs(enemy.vx);
    }
  }
}

// プレイヤーとぶつかったとき：上から踏めばBAN＆集金、横・下ならメンタル減少
function collideWithEnemies(prevBottom) {
  for (const enemy of enemies) {
    if (!enemy.alive || !aabb(player, enemy)) continue;

    // 上から踏みつけた判定
    if (prevBottom <= enemy.y + 12 && player.vy > 0) {
      enemy.alive = false;
      player.vy = -JUMP_SPEED * 0.68;
      player.jumpsLeft = MAX_JUMPS;

      banCount += 1;
      const reward = (Math.floor(Math.random() * 5) + 1) * 1000;
      money += reward;
      spawnBanEffect(enemy.x + enemy.w / 2, enemy.y, reward);

      if (banCount >= TARGET_BAN) {
        gameState = "clear";
        initClearEffects();
      }
    } else if (player.hitTimer <= 0) {
      // 横・下からぶつかった：メンタルを1減らして無敵時間発生
      player.hp -= 1;
      player.hitTimer = 1.4;
      player.vy = -220;
    }
  }
  enemies = enemies.filter((enemy) => enemy.alive);
}

// 「🤓☝️」オタク講釈スタンプを描画
function drawNerdStamp(x, y) {
  const faceCx = x + 16;
  const faceCy = y + 19;
  const faceR = 14;

  ctx.save();
  // 黄色い丸顔ベース
  ctx.fillStyle = "#ffd43b";
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(faceCx, faceCy, faceR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 縦長の茶色い両目
  ctx.fillStyle = "#4a2511";
  ctx.beginPath();
  ctx.ellipse(faceCx - 5, faceCy - 2, 1.8, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(faceCx + 5, faceCy - 2, 1.8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 黒縁の太めメガネ
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2.4;
  ctx.strokeRect(faceCx - 10, faceCy - 6, 8.5, 7.5);
  ctx.strokeRect(faceCx + 1.5, faceCy - 6, 8.5, 7.5);
  // メガネのブリッジ
  ctx.beginPath();
  ctx.moveTo(faceCx - 1.5, faceCy - 2.5);
  ctx.lineTo(faceCx + 1.5, faceCy - 2.5);
  ctx.stroke();

  // ニヤリと開いた口
  ctx.fillStyle = "#5c1a1a";
  ctx.beginPath();
  ctx.arc(faceCx, faceCy + 4.5, 6.5, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // 白い2本の出っ歯
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(faceCx - 3.6, faceCy + 4.5, 3.2, 4.2);
  ctx.fillRect(faceCx + 0.4, faceCy + 4.5, 3.2, 4.2);
  ctx.strokeStyle = "#222222";
  ctx.lineWidth = 0.7;
  ctx.strokeRect(faceCx - 3.6, faceCy + 4.5, 3.2, 4.2);
  ctx.strokeRect(faceCx + 0.4, faceCy + 4.5, 3.2, 4.2);

  // 顔の右側に人差し指をピンと立てた黄色い手（☝️）
  const handX = x + 36;
  const handY = y + 23;

  ctx.fillStyle = "#ffd43b";
  ctx.strokeStyle = "#8a6200";
  ctx.lineWidth = 1.2;

  // 真上にまっすぐ立てた人差し指
  ctx.beginPath();
  ctx.roundRect(handX - 2.4, handY - 17, 4.8, 15, 2.4);
  ctx.fill();
  ctx.stroke();

  // 握った拳部分
  ctx.beginPath();
  ctx.roundRect(handX - 5.5, handY - 4, 11, 10, 4);
  ctx.fill();
  ctx.stroke();

  // 折りたたんだ指の線
  ctx.strokeStyle = "#a67600";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(handX - 1, handY - 2);
  ctx.lineTo(handX - 1, handY + 4);
  ctx.moveTo(handX + 2.2, handY - 2);
  ctx.lineTo(handX + 2.2, handY + 4);
  ctx.stroke();

  ctx.restore();
}

// スタンプの上にダークグレーのチャット吹き出しを描画
function drawCommentBubble(enemy) {
  ctx.save();
  ctx.font = "bold 10px sans-serif";
  const text = enemy.comment;
  const padX = 6;
  const textW = ctx.measureText(text).width;
  const bw = textW + padX * 2;
  const bh = 18;

  let bx = enemy.x + enemy.w / 2 - bw / 2;
  // 画面外にはみ出さないようクランプ
  if (bx < 4) bx = 4;
  if (bx + bw > canvas.width - 4) bx = canvas.width - 4 - bw;
  const by = Math.max(36, enemy.y - bh - 7);

  // ダークグレーの吹き出し本体
  ctx.fillStyle = "rgba(30, 34, 46, 0.92)";
  ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.stroke();

  // 吹き出しの下向き三角
  const tipX = Math.max(bx + 8, Math.min(bx + bw - 8, enemy.x + enemy.w / 2));
  ctx.beginPath();
  ctx.moveTo(tipX - 4, by + bh);
  ctx.lineTo(tipX + 4, by + bh);
  ctx.lineTo(tipX, by + bh + 5);
  ctx.closePath();
  ctx.fill();

  // コメント文字
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText(text, bx + padX, by + 13);
  ctx.restore();
}

// ④ 描く：配列の敵を1体ずつ取り出して描く
function drawEnemies() {
  for (const enemy of enemies) {
    drawNerdStamp(enemy.x, enemy.y);
    drawCommentBubble(enemy);
  }
}
