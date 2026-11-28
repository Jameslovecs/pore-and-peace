// Normalized skin coordinates keep each layout stable when the screen resizes.
export function generatePores(count = 16, random = Math.random) {
  const points = [];
  function candidate() {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    return { x: 50 + Math.cos(angle) * radius * 39,
      y: 57 + Math.sin(angle) * radius * 33 };
  }
  for (let i = 0; i < count; i++) {
    let best, bestDistance = -1;
    // Choose the most spacious of random candidates, without rows or columns.
    // A bounded search keeps generation fast even on a crowded board.
    for (let attempt = 0; attempt < 300; attempt++) {
      const p = candidate();
      const distance = Math.min(...points.map(q => Math.hypot(p.x - q.x, p.y - q.y)));
      if (distance > bestDistance) { best = p; bestDistance = distance; }
    }
    points.push({ ...best, size: 9 + random() * 7, angle: (random() - .5) * 50,
      shade: .85 + random() * .3 });
  }
  return points;
}
