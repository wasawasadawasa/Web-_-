// ステージ：OWランクマッチ配信オーバーレイ風の背景と床

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const floor = {
  x: 0,
  y: 382,
  w: canvas.width,
  h: canvas.height - 382
};

// 背景にうっすら流すダミーチャット枠
const BG_CHAT_LINES = [
  "viewer_01: ナイスピック！",
  "ow_fan99: ランク上げ頑張れ〜",
  "sub_user: 今のウルト惜しい",
  "chat_bot: 指示コメントはBAN対象です",
  "tank_main: 前線押し上げよう",
  "sup_enjoy: ヒール届いてるよ！",
  "fps_pro: 定時まであと少し！"
];

function drawStage() {
  // 1. 暗い配信オーバーレイ基調の背景（濃いチャコール・ネイビー）
  const bgGrad = ctx.createLinearGradient(0, 0, 0, floor.y);
  bgGrad.addColorStop(0, "#0c111e");
  bgGrad.addColorStop(0.55, "#131b2e");
  bgGrad.addColorStop(1, "#182238");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // うっすらとした背景のOW風斜めライン＆グリッド
  ctx.save();
  ctx.strokeStyle = "rgba(120, 155, 220, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 48);
    ctx.lineTo(x, floor.y);
    ctx.stroke();
  }
  for (let y = 48; y < floor.y; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 右側のうっすらした配信チャット欄オーバーレイ
  const chatX = canvas.width - 215;
  const chatY = 62;
  const chatW = 200;
  const chatH = floor.y - 78;
  drawRoundRect(ctx, chatX, chatY, chatW, chatH, 6);
  ctx.fillStyle = "rgba(8, 12, 22, 0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(130, 160, 220, 0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // チャット欄ヘッダー
  ctx.fillStyle = "rgba(170, 195, 240, 0.22)";
  ctx.fillRect(chatX, chatY, chatW, 22);
  ctx.fillStyle = "rgba(220, 232, 255, 0.36)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("LIVE CHAT", chatX + 10, chatY + 15);

  // うっすらしたチャット行
  ctx.font = "11px sans-serif";
  for (let i = 0; i < BG_CHAT_LINES.length; i++) {
    const lineY = chatY + 42 + i * 34;
    if (lineY > chatY + chatH - 12) break;
    drawRoundRect(ctx, chatX + 8, lineY - 12, chatW - 16, 22, 4);
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.fillStyle = "rgba(195, 212, 245, 0.2)";
    ctx.fillText(BG_CHAT_LINES[i], chatX + 14, lineY + 3);
  }

  // 中央上部にうっすらOWマッチ風ペイロード/スコアバー装飾
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 110, 56);
  ctx.lineTo(canvas.width / 2 + 110, 56);
  ctx.lineTo(canvas.width / 2 + 95, 76);
  ctx.lineTo(canvas.width / 2 - 95, 76);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(249, 158, 26, 0.25)";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("COMPETITIVE  //  PAYLOAD DEFENSE", canvas.width / 2, 70);
  ctx.restore();

  // 2. 床（配信画面下部のOW風オーバーレイHUDエリア）
  const floorGrad = ctx.createLinearGradient(0, floor.y, 0, canvas.height);
  floorGrad.addColorStop(0, "#1c243b");
  floorGrad.addColorStop(1, "#0d1220");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h);

  // 床の上端ライン（OWオレンジ＋シアンアクセント）
  ctx.fillStyle = "#f99e1a";
  ctx.fillRect(0, floor.y, canvas.width, 3);
  ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
  ctx.fillRect(0, floor.y + 3, canvas.width, 2);

  // OW風左下ヒーローアイコン枠＆HPバー装飾
  drawOWBottomOverlay();

  // 文字の基本設定を戻す
  ctx.textAlign = "left";
  ctx.font = "14px sans-serif";
}

function drawOWBottomOverlay() {
  ctx.save();
  const baseY = floor.y + 12;

  // --- 左下：OWヒーローアイコン枠（斜めフレーム） ---
  ctx.beginPath();
  ctx.moveTo(22, baseY);
  ctx.lineTo(74, baseY);
  ctx.lineTo(66, baseY + 46);
  ctx.lineTo(14, baseY + 46);
  ctx.closePath();
  ctx.fillStyle = "#111829";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#f99e1a";
  ctx.stroke();

  // 枠内のロールバッジ風マーク（盾＆クロスヘア風）
  ctx.fillStyle = "rgba(249, 158, 26, 0.85)";
  ctx.beginPath();
  ctx.arc(44, baseY + 19, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111829";
  ctx.fillRect(42, baseY + 13, 4, 12);
  ctx.fillRect(38, baseY + 17, 12, 4);
  ctx.fillStyle = "#dce6ff";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STREAMER", 44, baseY + 40);

  // --- OW風HPバー（メンタル値と連動） ---
  const hpNow = typeof player !== "undefined" ? Math.max(0, player.hp) : 4;
  const hpMax = typeof MAX_HP !== "undefined" ? MAX_HP : 4;
  const hpVal = hpNow * 50;
  const hpMaxVal = hpMax * 50;

  ctx.textAlign = "left";
  ctx.fillStyle = "#e8eeff";
  ctx.font = "bold 13px monospace";
  ctx.fillText(hpVal + " / " + hpMaxVal, 84, baseY + 16);
  ctx.fillStyle = "rgba(180, 200, 240, 0.65)";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("MENTAL SHIELD", 168, baseY + 15);

  // 斜めセグメントのHPバー（8セグメント）
  const segCount = 8;
  const filledSeg = Math.round((hpNow / hpMax) * segCount);
  const segW = 20;
  const segGap = 4;
  for (let i = 0; i < segCount; i++) {
    const sx = 84 + i * (segW + segGap);
    const sy = baseY + 24;
    ctx.beginPath();
    ctx.moveTo(sx + 5, sy);
    ctx.lineTo(sx + segW + 5, sy);
    ctx.lineTo(sx + segW, sy + 16);
    ctx.lineTo(sx, sy + 16);
    ctx.closePath();

    if (i < filledSeg) {
      if (hpNow <= 1) {
        ctx.fillStyle = "#ff4d4f";
      } else if (hpNow === 2) {
        ctx.fillStyle = "#faad14";
      } else {
        ctx.fillStyle = "#38bdf8";
      }
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    }
    ctx.fill();
  }

  // --- 中央下：ウルト風 BAN チャージ円形ゲージ ---
  const cx = canvas.width / 2;
  const cy = floor.y + 36;
  const banNow = typeof banCount !== "undefined" ? banCount : 0;
  const banGoal = typeof TARGET_BAN !== "undefined" ? TARGET_BAN : 15;
  const pct = Math.min(1, banNow / banGoal);

  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10, 15, 28, 0.9)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.strokeStyle = pct >= 1 ? "#ffd43b" : "#f99e1a";
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(Math.floor(pct * 100) + "%", cx, cy + 4);

  // --- 右下：OW風アビリティ装飾 ---
  const skills = [
    { key: "A/D", label: "MOVE" },
    { key: "SPC", label: "2x JUMP" },
    { key: "STOMP", label: "BAN!" }
  ];
  for (let i = 0; i < skills.length; i++) {
    const bx = canvas.width - 210 + i * 66;
    const by = baseY + 4;
    drawRoundRect(ctx, bx, by, 56, 36, 4);
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fill();
    ctx.strokeStyle = i === 2 ? "rgba(249, 158, 26, 0.55)" : "rgba(160, 185, 235, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = i === 2 ? "#f99e1a" : "#cfd9f2";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(skills[i].key, bx + 28, by + 16);
    ctx.fillStyle = "rgba(200, 215, 245, 0.65)";
    ctx.font = "9px sans-serif";
    ctx.fillText(skills[i].label, bx + 28, by + 30);
  }

  ctx.restore();
}
