// ステージ：OWランクマッチ配信画面オーバーレイ風の背景と床

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const floor = {
  x: 0,
  y: 304,
  w: canvas.width,
  h: 56
};

function drawStage() {
  // 暗い配信オーバーレイ風の背景グラデーション（濃いチャコール・ネイビー基調）
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, "#0c101c");
  bgGrad.addColorStop(0.7, "#141b2e");
  bgGrad.addColorStop(1, "#1c243b");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 背景のうっすらとしたグリッドライン
  ctx.strokeStyle = "rgba(120, 150, 220, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, floor.y);
    ctx.stroke();
  }
  for (let y = 40; y < floor.y; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 右側のうっすらした配信チャット欄の枠線装飾
  const chatX = canvas.width - 178;
  const chatY = 44;
  const chatW = 166;
  const chatH = floor.y - 54;
  ctx.fillStyle = "rgba(10, 14, 24, 0.42)";
  ctx.fillRect(chatX, chatY, chatW, chatH);
  ctx.strokeStyle = "rgba(130, 160, 220, 0.16)";
  ctx.lineWidth = 1;
  ctx.strokeRect(chatX, chatY, chatW, chatH);

  // チャット欄ヘッダーとダミー行
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  ctx.fillRect(chatX, chatY, chatW, 18);
  ctx.fillStyle = "rgba(180, 195, 230, 0.3)";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("LIVE CHAT", chatX + 8, chatY + 13);

  for (let i = 0; i < 8; i++) {
    const ly = chatY + 30 + i * 26;
    ctx.fillStyle = i % 3 === 0 ? "rgba(255, 107, 107, 0.14)" : "rgba(160, 185, 235, 0.09)";
    ctx.fillRect(chatX + 8, ly, 42 + (i * 19) % 30, 7);
    ctx.fillStyle = "rgba(210, 225, 255, 0.06)";
    ctx.fillRect(chatX + 8, ly + 10, 110 + (i * 17) % 38, 6);
  }

  // 床（OWのUI下部バー風）
  ctx.fillStyle = "#1c2336";
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h);

  // 床の上辺アクセントライン（OWオレンジ＆シアン）
  ctx.fillStyle = "#f99e1a";
  ctx.fillRect(0, floor.y, 175, 3);
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(175, floor.y, canvas.width - 175, 2);

  // 画面下部左：OWヒーローアイコン枠＆HPバー風装飾
  ctx.save();
  ctx.strokeStyle = "rgba(249, 158, 26, 0.7)";
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, floor.y + 10);
  ctx.lineTo(54, floor.y + 10);
  ctx.lineTo(48, floor.y + 46);
  ctx.lineTo(8, floor.y + 46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ヒーロー枠内の簡易マーク
  ctx.fillStyle = "#f99e1a";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("TANK", 16, floor.y + 32);

  // OW風セグメントHPバー装飾
  const barX = 64;
  const barY = floor.y + 24;
  const totalSeg = 12;
  const filledSeg = Math.max(0, Math.round((player.hp / MAX_HP) * totalSeg));
  for (let i = 0; i < totalSeg; i++) {
    ctx.fillStyle = i < filledSeg
      ? (player.hp <= 1 ? "#ff4d4f" : "#ffffff")
      : "rgba(255, 255, 255, 0.14)";
    ctx.fillRect(barX + i * 11, barY, 8, 12);
  }
  ctx.fillStyle = "rgba(220, 232, 255, 0.7)";
  ctx.font = "bold 10px monospace";
  ctx.fillText("MENTAL " + Math.max(0, player.hp * 125) + " / " + (MAX_HP * 125), barX, barY - 5);

  // 画面下部中央：ウルトゲージ風サークル装飾
  const ultX = canvas.width / 2;
  const ultY = floor.y + 28;
  const ultRatio = Math.min(1, banCount / TARGET_BAN);
  ctx.beginPath();
  ctx.arc(ultX, ultY, 19, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(ultX, ultY, 19, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ultRatio);
  ctx.strokeStyle = ultRatio >= 1 ? "#ffd43b" : "#38bdf8";
  ctx.stroke();

  ctx.fillStyle = "#e8eeff";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText(Math.floor(ultRatio * 100) + "%", ultX, ultY + 4);
  ctx.textAlign = "left";

  // 画面下部右：アビリティ枠風装飾
  const abX = canvas.width - 150;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.fillRect(abX + i * 44, floor.y + 13, 36, 30);
    ctx.strokeRect(abX + i * 44, floor.y + 13, 36, 30);
  }
  ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
  ctx.font = "bold 9px monospace";
  ctx.fillText("JUMP", abX + 6, floor.y + 31);
  ctx.fillText("BAN", abX + 53, floor.y + 31);
  ctx.fillText("MUTE", abX + 94, floor.y + 31);
  ctx.restore();

  // 左上の赤い「● LIVE」バッジと「ランクマッチ配信中」テキスト
  ctx.save();
  ctx.fillStyle = "#e03131";
  ctx.fillRect(10, 8, 54, 20);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("● LIVE", 17, 22);

  ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
  ctx.fillRect(68, 8, 118, 20);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("ランクマッチ配信中", 75, 22);
  ctx.restore();

  // 文字の基本設定
  ctx.font = "14px sans-serif";
}
