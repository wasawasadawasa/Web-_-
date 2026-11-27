
function aabb(a, b) {
  return a.x < b.x + b.w &&   // a の左の辺が、b の右の辺より左
         a.x + a.w > b.x &&   // a の右の辺が、b の左の辺より右
         a.y < b.y + b.h &&   // a の上の辺が、b の下の辺より上
         a.y + a.h > b.y;     // a の下の辺が、b の上の辺より下
}