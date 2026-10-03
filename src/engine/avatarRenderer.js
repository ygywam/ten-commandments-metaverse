// 고품질 성경 탐험가 아바타 보행 렌더러 (일러스트 얼굴 + 생동감 넘치는 몸·팔·다리 보행 모션)

export function drawExplorerAvatar(ctx, {
  atlas,
  isAtlasLoaded = true,
  charIndex = 0,
  charColor = '#2563eb',
  isDavid = false,
  walkCycle = 0,
  isMoving = false,
  facing = 'down',
  scale = 1.0
}) {
  ctx.save();
  ctx.scale(scale, scale);

  const bob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 4.5 : Math.sin(Date.now() * 0.003) * 1.5;
  const legAngleL = isMoving ? Math.sin(walkCycle) * 0.6 : 0;
  const legAngleR = isMoving ? -Math.sin(walkCycle) * 0.6 : 0;
  const armAngleL = isMoving ? -Math.sin(walkCycle) * 0.65 : 0;
  const armAngleR = isMoving ? Math.sin(walkCycle) * 0.65 : 0;

  // 1. 발밑 그림자
  const shadowScale = isMoving ? 1 - Math.abs(Math.sin(walkCycle * 2)) * 0.12 : 1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 20 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  // 왼쪽 이동 시 좌우 대칭 반전
  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  const skinColor = '#fed7aa';
  const sandalsColor = '#78350f';

  // 2. 다리 & 샌들 (걸을 때 앞뒤로 번갈아 교차)
  // 왼다리
  ctx.save();
  ctx.translate(-6, -14 - bob);
  ctx.rotate(legAngleL);
  ctx.fillStyle = skinColor;
  ctx.fillRect(-2.5, 0, 5, 13);
  ctx.fillStyle = sandalsColor;
  ctx.fillRect(-3, 10, 7, 3.5);
  ctx.restore();

  // 오른다리
  ctx.save();
  ctx.translate(6, -14 - bob);
  ctx.rotate(legAngleR);
  ctx.fillStyle = skinColor;
  ctx.fillRect(-2.5, 0, 5, 13);
  ctx.fillStyle = sandalsColor;
  ctx.fillRect(-3, 10, 7, 3.5);
  ctx.restore();

  // 3. 뒷팔 (왼팔)
  ctx.save();
  ctx.translate(-13, -33 - bob);
  ctx.rotate(armAngleL);
  ctx.fillStyle = charColor;
  ctx.fillRect(-3, 0, 6, 9);
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. 몸통 (캐릭터 고유 튜닉)
  ctx.fillStyle = charColor;
  ctx.beginPath();
  ctx.roundRect(-12, -37 - bob, 24, 24, [4, 4, 2, 2]);
  ctx.fill();

  // 브이넥 목깃
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.moveTo(-4, -37 - bob);
  ctx.lineTo(0, -31 - bob);
  ctx.lineTo(4, -37 - bob);
  ctx.closePath();
  ctx.fill();

  // 허리띠 & 금빛 버클
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-12, -24 - bob, 24, 4);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-2.5, -25 - bob, 5, 6);

  // 5. 앞팔 (오른팔) & 다윗 목자 지팡이
  ctx.save();
  ctx.translate(13, -33 - bob);
  ctx.rotate(armAngleR);
  ctx.fillStyle = charColor;
  ctx.fillRect(-3, 0, 6, 9);
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(0, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 다윗인 경우 목자의 지팡이
  if (isDavid) {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(1, -12);
    ctx.lineTo(1, 18);
    ctx.quadraticCurveTo(7, -18, 1, -20);
    ctx.stroke();
  }
  ctx.restore();

  // 6. 머리/얼굴 (characters_atlas.png에서 고화질 헤드 크롭)
  if (isAtlasLoaded && atlas) {
    // 132x187 중 상단 0 ~ 116 (헤어, 눈망울, 얼굴, 터번)
    const headW = 58;
    const headH = 51;
    const headX = -headW / 2;
    const headY = -37 - bob - headH + 8; // 약 -80 - bob

    ctx.drawImage(
      atlas,
      charIndex * 132, 0, 132, 116,
      headX, headY, headW, headH
    );
  } else {
    // 로딩 중 기본 폴백 얼굴
    const headY = -58 - bob;
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-5, headY - 2, 3, 3);
    ctx.fillRect(2, headY - 2, 3, 3);
  }

  ctx.restore();
  ctx.restore();
}
