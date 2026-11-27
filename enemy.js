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
    y: y !== undefined ? y : floor.y - 32,
    w: 56,
    h: 32,
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
    enemies.push(createEnemy(4, speed, floor.y - 32));
  } else if (pattern === 1) {
    // 右端から
    enemies.push(createEnemy(canvas.width - 60, -speed, floor.y - 32));
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
  const wasFalling = player.vy > 0;
  let stompedAny = false;
  let damaged = false;

  // 横・下からのダメージ判定は見た目より少し内側に縮めて理不尽な被弾を防ぐ
  const hurtPlayer = {
    x: player.x + 8,
    y: player.y + 6,
    w: player.w - 16,
    h: player.h - 10
  };

  for (const enemy of enemies) {
    if (!enemy.alive || !aabb(player, enemy)) continue;

    // 上から踏みつけた判定（落下中かつ敵の上半分付近から入った場合）
    if (wasFalling && prevBottom <= enemy.y + enemy.h * 0.55) {
      enemy.alive = false;
      stompedAny = true;

      banCount += 1;
      const reward = (Math.floor(Math.random() * 5) + 1) * 1000;
      money += reward;
      spawnBanEffect(enemy.x + enemy.w / 2, enemy.y, reward);

      if (banCount >= TARGET_BAN) {
        gameState = "clear";
        initClearEffects();
      }
    } else {
      // 横・下からの接触は小さめのヒットボックスで判定
      const hurtEnemy = {
        x: enemy.x + 8,
        y: enemy.y + 6,
        w: enemy.w - 16,
        h: enemy.h - 6
      };
      if (aabb(hurtPlayer, hurtEnemy)) {
        damaged = true;
      }
    }
  }

  if (stompedAny) {
    // 2体以上同時に踏んでも全員まとめてBANし、最後に1回だけ跳ねる
    player.vy = -JUMP_SPEED * 0.68;
    player.jumpsLeft = MAX_JUMPS;
  } else if (damaged && player.hitTimer <= 0) {
    // 踏んでいないフレームで横・下からぶつかった場合のみダメージ
    player.hp -= 1;
    player.hitTimer = 1.4;
    player.vy = -220;
  }

  enemies = enemies.filter((enemy) => enemy.alive);
}

// 「🤓☝️」オタク講釈スタンプを描画（Twemoji風デザイン）
function drawNerdStamp(x, y) {
  const faceCx = x + 16;
  const faceCy = y + 16;
  const faceR = 15;

  ctx.save();
  // --- 左側：🤓 顔 ---
  // 黄色い丸顔ベース（フラット）
  ctx.fillStyle = "#ffcc4d";
  ctx.beginPath();
  ctx.arc(faceCx, faceCy, faceR, 0, Math.PI * 2);
  ctx.fill();

  // 縦長の茶色い両目
  ctx.fillStyle = "#664500";
  ctx.beginPath();
  ctx.ellipse(faceCx - 5.2, faceCy - 2.2, 2.0, 3.1, 0, 0, Math.PI * 2);
  ctx.ellipse(faceCx + 5.2, faceCy - 2.2, 2.0, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // 黒縁の太めウェリントン型メガネ（#292f33）
  ctx.strokeStyle = "#292f33";
  ctx.fillStyle = "#292f33";
  ctx.lineWidth = 2.6;
  // 左レンズ枠
  ctx.beginPath();
  ctx.roundRect(faceCx - 11.8, faceCy - 6.8, 9.6, 8.2, [2.5, 2.5, 4.2, 4.2]);
  ctx.stroke();
  // 右レンズ枠
  ctx.beginPath();
  ctx.roundRect(faceCx + 2.2, faceCy - 6.8, 9.6, 8.2, [2.5, 2.5, 4.2, 4.2]);
  ctx.stroke();
  // 中央ブリッジ
  ctx.fillRect(faceCx - 2.4, faceCy - 5.6, 4.8, 2.6);
  // 左右のツル（テンプル）
  ctx.fillRect(faceCx - 14.8, faceCy - 5.8, 3.2, 2.4);
  ctx.fillRect(faceCx + 11.6, faceCy - 5.8, 3.2, 2.4);

  // ニヤリと開いた三日月状の口（#664500）
  ctx.fillStyle = "#664500";
  ctx.beginPath();
  ctx.moveTo(faceCx - 8.2, faceCy + 4.4);
  ctx.quadraticCurveTo(faceCx, faceCy + 9.2, faceCx + 8.2, faceCy + 4.4);
  ctx.quadraticCurveTo(faceCx, faceCy + 13.8, faceCx - 8.2, faceCy + 4.4);
  ctx.closePath();
  ctx.fill();

  // 白い2本の出っ歯（中央に少し隙間）
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(faceCx - 3.9, faceCy + 6.8, 3.4, 4.4, [0, 0, 1.4, 1.4]);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(faceCx + 0.5, faceCy + 6.8, 3.4, 4.4, [0, 0, 1.4, 1.4]);
  ctx.fill();

  // --- 右側：☝️ 指差し手 ---
  const hx = x + 43;
  const hy = y + 18;

  // 手のひらベース（丸みのある下部）
  ctx.fillStyle = "#ffdc5d";
  ctx.beginPath();
  ctx.arc(hx + 0.5, hy + 2.5, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // 右端にまっすぐ立てた人差し指
  ctx.beginPath();
  ctx.roundRect(hx + 3.6, y + 2, 4.4, 15.5, 2.2);
  ctx.fill();

  // 左側の折りたたんだ3本指（小指・薬指・中指）
  ctx.beginPath();
  ctx.roundRect(hx - 8.6, hy - 5.2, 4.0, 9.0, 2.0);
  ctx.roundRect(hx - 4.8, hy - 6.8, 4.2, 10.2, 2.0);
  ctx.roundRect(hx - 0.8, hy - 6.2, 4.2, 9.8, 2.0);
  ctx.fill();

  // 指の境目と親指のオレンジ色ライン（#ef9645）
  ctx.strokeStyle = "#ef9645";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";

  // 折りたたんだ指の下のカーブ
  ctx.beginPath();
  ctx.moveTo(hx - 8.6, hy + 1.8);
  ctx.quadraticCurveTo(hx - 6.6, hy + 4.0, hx - 4.8, hy + 1.8);
  ctx.quadraticCurveTo(hx - 2.7, hy + 4.0, hx - 0.8, hy + 1.8);
  ctx.stroke();

  // 指同士の縦の区切り線
  ctx.beginPath();
  ctx.moveTo(hx - 4.8, hy - 4.8);
  ctx.lineTo(hx - 4.8, hy + 1.8);
  ctx.moveTo(hx - 0.8, hy - 5.2);
  ctx.lineTo(hx - 0.8, hy + 1.8);
  ctx.stroke();

  // 横に重なった親指
  ctx.fillStyle = "#ffdc5d";
  ctx.beginPath();
  ctx.roundRect(hx - 1.5, hy - 3.2, 8.2, 5.2, 2.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx + 6.4, hy - 3.0);
  ctx.lineTo(hx + 0.5, hy - 3.0);
  ctx.quadraticCurveTo(hx - 2.2, hy - 0.6, hx + 0.5, hy + 2.0);
  ctx.lineTo(hx + 4.8, hy + 2.0);
  ctx.stroke();

  // 親指の付け根のカーブ（手のひらのシワ）
  ctx.beginPath();
  ctx.moveTo(hx + 3.2, hy + 2.4);
  ctx.quadraticCurveTo(hx + 0.2, hy + 5.2, hx + 0.6, hy + 9.4);
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
