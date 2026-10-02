// 성경 시대 2.5등신 치비 아바타 정교한 파츠 합성 및 보행 애니메이션 렌더러

export class AvatarRenderer {
  constructor() {}

  // 아바타 전신 렌더링
  draw(ctx, player, scale = 1.0) {
    const { x, y, nickname, isMoving, walkCycle, style } = player;
    const s = style || this.getDefaultStyle();

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const cycle = walkCycle || 0;
    const moving = isMoving || false;

    // 보행 시 상하 통통 튐(Bobbing) 및 틸트(Tilt)
    const bob = moving ? Math.abs(Math.sin(cycle * 2)) * 3.5 : Math.sin(Date.now() * 0.003) * 1.0;
    const tilt = moving ? Math.sin(cycle) * 0.04 : 0;

    // 팔/다리 회전 각도 (라디안)
    const legAngle = moving ? Math.sin(cycle) * 0.45 : 0;
    const armAngle = moving ? -Math.sin(cycle) * 0.45 : 0;

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(tilt);

    // 1. 등에 멘 짐 (침낭/돗자리) - 몸 뒤쪽 렌더링
    if (s.accessory === 'bedroll') {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-18, -32 - bob, 10, 24, 4);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 2. 다리 & 샌들 (좌/우)
    this.drawLeg(ctx, -6, -bob, -legAngle, s.skinColor, s.shoesColor);
    this.drawLeg(ctx, 6, -bob, legAngle, s.skinColor, s.shoesColor);

    // 3. 하의 (치마 또는 바지)
    this.drawBottom(ctx, -bob, s.pantsColor, s.pantsType);

    // 4. 상의 튜닉 & 허리띠
    this.drawTunic(ctx, -bob, s.shirtColor, s.beltColor || '#78350f');

    // 5. 어깨 망토 / 숄 (있을 경우)
    if (s.robeColor) {
      this.drawCape(ctx, -bob, s.robeColor);
    }

    // 6. 크로스백 (몸통 앞)
    if (s.accessory === 'bag') {
      this.drawBag(ctx, -bob);
    }

    // 7. 팔 (왼팔 - 몸 뒤쪽)
    this.drawArm(ctx, -12, -bob, armAngle, s.skinColor, s.shirtColor);

    // 8. 머리, 얼굴, 표정, 머리카락, 헤드기어
    this.drawHead(ctx, -bob, s);

    // 9. 팔 (오른팔 - 몸 앞쪽) & 목자의 지팡이
    this.drawArm(ctx, 12, -bob, -armAngle, s.skinColor, s.shirtColor, s.accessory === 'staff');

    ctx.restore();

    // 10. 머리 위 닉네임 명찰
    if (nickname) {
      this.drawNicknameTag(ctx, nickname, -bob);
    }

    ctx.restore();
  }

  // 다리 & 고대 스트랩 샌들
  drawLeg(ctx, offsetX, bob, angle, skinColor, shoesColor) {
    ctx.save();
    ctx.translate(offsetX, -10 - bob);
    ctx.rotate(angle);

    // 다리 (피부)
    ctx.fillStyle = skinColor || '#fed7aa';
    ctx.fillRect(-3, 0, 6, 12);

    // 샌들 밑창
    ctx.fillStyle = shoesColor || '#78350f';
    ctx.beginPath();
    ctx.roundRect(-4, 9, 8, 4, 2);
    ctx.fill();

    // 샌들 가죽 끈
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3, 4);
    ctx.lineTo(3, 7);
    ctx.moveTo(3, 4);
    ctx.lineTo(-3, 7);
    ctx.stroke();

    ctx.restore();
  }

  // 하의 (치마형 튜닉 밑단 또는 바지)
  drawBottom(ctx, bob, color, type) {
    ctx.fillStyle = color || '#2563eb';
    ctx.beginPath();
    if (type === 'pants') {
      ctx.fillRect(-7, -14 - bob, 6, 8);
      ctx.fillRect(1, -14 - bob, 6, 8);
    } else {
      // 주름진 튜닉 치마
      ctx.moveTo(-9, -15 - bob);
      ctx.lineTo(9, -15 - bob);
      ctx.lineTo(12, -6 - bob);
      ctx.lineTo(-12, -6 - bob);
      ctx.closePath();
      ctx.fill();
      // 밑단 장식선
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // 상의 튜닉 & 허리끈
  drawTunic(ctx, bob, color, beltColor) {
    ctx.fillStyle = color || '#ea580c';
    ctx.beginPath();
    ctx.roundRect(-10, -28 - bob, 20, 16, [4, 4, 1, 1]);
    ctx.fill();

    // 튜닉 브이넥 목깃
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.moveTo(-4, -28 - bob);
    ctx.lineTo(0, -22 - bob);
    ctx.lineTo(4, -28 - bob);
    ctx.closePath();
    ctx.fill();

    // 허리띠
    ctx.fillStyle = beltColor;
    ctx.fillRect(-10, -18 - bob, 20, 3.5);

    // 벨트 끈 매듭
    ctx.fillRect(-2, -18 - bob, 4, 7);
  }

  // 어깨 망토 / 숄
  drawCape(ctx, bob, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-11, -28 - bob);
    ctx.quadraticCurveTo(0, -24 - bob, 11, -28 - bob);
    ctx.lineTo(13, -12 - bob);
    ctx.lineTo(-13, -12 - bob);
    ctx.closePath();
    ctx.fill();
  }

  // 크로스백
  drawBag(ctx, bob) {
    // 어깨 끈
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10, -28 - bob);
    ctx.lineTo(7, -14 - bob);
    ctx.stroke();

    // 가방 본체
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(4, -16 - bob, 9, 8, 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(7, -13 - bob, 3, 2); // 버클
  }

  // 팔 및 손
  drawArm(ctx, offsetX, bob, angle, skinColor, shirtColor, hasStaff = false) {
    ctx.save();
    ctx.translate(offsetX, -25 - bob);
    ctx.rotate(angle);

    // 소매
    ctx.fillStyle = shirtColor || '#ea580c';
    ctx.fillRect(-3, 0, 6, 8);

    // 팔 & 손
    ctx.fillStyle = skinColor || '#fed7aa';
    ctx.beginPath();
    ctx.roundRect(-2.5, 7, 5, 7, 2);
    ctx.fill();

    // 목자의 지팡이
    if (hasStaff) {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1, -16);
      ctx.lineTo(1, 20);
      // 지팡이 곡선 손잡이
      ctx.quadraticCurveTo(8, -22, 1, -24);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 머리, 눈망울, 헤어스타일, 헤드기어
  drawHead(ctx, bob, s) {
    const headY = -37 - bob;

    // 1. 얼굴 베이스
    ctx.fillStyle = s.skinColor || '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // 2. 사랑스러운 볼터치
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-7, headY + 3, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.ellipse(7, headY + 3, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. 또렷하고 맑은 눈망울 (초롱초롱한 눈)
    this.drawEyes(ctx, headY);

    // 4. 머리카락
    this.drawHair(ctx, headY, s.hairColor || '#451a03', s.hairStyle || 'short');

    // 5. 헤드기어 / 터번 / 머리수건 / 모자
    if (s.headgear && s.headgear !== 'none') {
      this.drawHeadgear(ctx, headY, s.headgear);
    }
  }

  // 눈망울 디테일
  drawEyes(ctx, headY) {
    // 왼쪽 눈
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(-5, headY - 1, 2.4, 0, Math.PI * 2);
    ctx.arc(5, headY - 1, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 눈 하이라이트 (반짝임)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5.8, headY - 2, 1.0, 0, Math.PI * 2);
    ctx.arc(4.2, headY - 2, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // 미소 입
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, headY + 4, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // 8종 헤어스타일
  drawHair(ctx, headY, color, style) {
    ctx.fillStyle = color;

    if (style === 'curly_boy') {
      // 뽀글 곱슬머리
      for (let a = -10; a <= 10; a += 4.5) {
        ctx.beginPath();
        ctx.arc(a, headY - 9, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (style === 'veil_girl' || style === 'long') {
      // 긴 생머리
      ctx.beginPath();
      ctx.arc(0, headY - 2, 14, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.fillRect(-13, headY - 2, 6, 20);
      ctx.fillRect(7, headY - 2, 6, 20);
    } else if (style === 'braided_girl') {
      // 땋은 머리 (앞머리 + 옆 땋기)
      ctx.beginPath();
      ctx.arc(0, headY - 3, 13.5, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // 땋은 매듭
      [-11, 11].forEach(x => {
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(x, headY + 3 + i * 4, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (style === 'twin_orange') {
      // 양갈래 묶음
      ctx.beginPath();
      ctx.arc(0, headY - 3, 13.5, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-14, headY - 4, 5, 9, -0.4, 0, Math.PI * 2);
      ctx.ellipse(14, headY - 4, 5, 9, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 단정한 소년 숏컷
      ctx.beginPath();
      ctx.arc(0, headY - 2, 13.5, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // 앞머리 잔머리
      ctx.beginPath();
      ctx.moveTo(-10, headY - 7);
      ctx.lineTo(-4, headY - 2);
      ctx.lineTo(2, headY - 7);
      ctx.lineTo(7, headY - 2);
      ctx.lineTo(11, headY - 7);
      ctx.fill();
    }
  }

  // 6종 헤드기어 (성경 광야 양식)
  drawHeadgear(ctx, headY, headgear) {
    if (headgear === 'blue_band') {
      // 푸른 머리띠
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-12, headY - 8, 24, 4.5);
      // 묶음 리본
      ctx.beginPath();
      ctx.moveTo(-12, headY - 6);
      ctx.lineTo(-17, headY + 2);
      ctx.lineTo(-13, headY - 2);
      ctx.fill();
    } else if (headgear === 'white_veil') {
      // 순백 머리수건
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, headY - 3, 15, Math.PI * 0.85, Math.PI * 2.15);
      ctx.lineTo(15, headY + 12);
      ctx.quadraticCurveTo(0, headY + 8, -15, headY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (headgear === 'turban_white' || headgear === 'striped_keffiyeh') {
      // 사막 케피예 / 터번
      ctx.fillStyle = headgear === 'striped_keffiyeh' ? '#3b82f6' : '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-14, headY - 14, 28, 12, 6);
      ctx.fill();
      ctx.fillStyle = '#b45309'; // 터번 밴드
      ctx.fillRect(-14, headY - 6, 28, 3.5);
    } else if (headgear === 'purple_hood') {
      // 보라 후드
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.arc(0, headY - 2, 16, Math.PI * 0.75, Math.PI * 2.25);
      ctx.lineTo(16, headY + 14);
      ctx.lineTo(-16, headY + 14);
      ctx.closePath();
      ctx.fill();
    } else if (headgear === 'gold_band') {
      // 오리엔탈 금빛 머리띠
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-12, headY - 8, 24, 3.5);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, headY - 6, 2, 0, Math.PI * 2); // 이마 보석
      ctx.fill();
    }
  }

  // 닉네임 태그
  drawNicknameTag(ctx, nickname, bob) {
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(nickname).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 8, -74 - bob, textWidth + 16, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nickname, 0, -58 - bob);
  }

  getDefaultStyle() {
    return {
      skinColor: '#fed7aa',
      hairColor: '#3d2314',
      hairStyle: 'band_boy',
      shirtColor: '#ffffff',
      pantsColor: '#2563eb',
      pantsType: 'skirt',
      robeColor: null,
      headgear: 'blue_band',
      accessory: 'bag',
      shoesColor: '#78350f'
    };
  }
}

export const avatarRenderer = new AvatarRenderer();
