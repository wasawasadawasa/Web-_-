// 共通ユーティリティ

function aabb(a, b) {
  return a.x < b.x + b.w &&   // a の左の辺が、b の右の辺より左
         a.x + a.w > b.x &&   // a の右の辺が、b の左の辺より右
         a.y < b.y + b.h &&   // a の上の辺が、b の下の辺より上
         a.y + a.h > b.y;     // a の下の辺が、b の上の辺より下
}

// 角丸矩形のパスを描く
function drawRoundRect(context, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + w - radius, y);
  context.quadraticCurveTo(x + w, y, x + w, y + radius);
  context.lineTo(x + w, y + h - radius);
  context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  context.lineTo(x + radius, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
