// 2D 시내산 광야 메타버스 월드 매니저

export class World {
  constructor() {
    this.width = 4096;
    this.height = 2304;

    this.mapImage = new Image();
    this.isMapLoaded = false;
    this.mapImage.src = './src/assets/map_sinai.jpg';
    this.mapImage.onload = () => {
      this.isMapLoaded = true;
    };

    // 모세 NPC 위치 (중앙 상단 성막 앞 제단 부근)
    this.moses = {
      x: 2110,
      y: 920,
      radius: 36,
      name: '모세 선지자 (십계명 돌판)',
      title: '십계명 완성 제단'
    };

    // 10개 계명 미션 장소 좌표 정의 (맵 전역 분산)
    this.commandmentSpots = [
      { id: 1, name: '제1계명 (오직 여호와)', x: 620, y: 780, icon: '📜' },
      { id: 2, name: '제2계명 (우상 금지)', x: 1200, y: 1100, icon: '📜' },
      { id: 3, name: '제3계명 (주의 이름)', x: 1750, y: 1350, icon: '📜' },
      { id: 4, name: '제4계명 (안식일 기억)', x: 2500, y: 1300, icon: '📜' },
      { id: 5, name: '제5계명 (부모 공경)', x: 3100, y: 1050, icon: '📜' },
      { id: 6, name: '제6계명 (살인 금지)', x: 3550, y: 920, icon: '📜' },
      { id: 7, name: '제7계명 (간음 금지)', x: 3350, y: 1650, icon: '📜' },
      { id: 8, name: '제8계명 (도둑질 금지)', x: 2600, y: 1850, icon: '📜' },
      { id: 9, name: '제9계명 (거짓 증언)', x: 1550, y: 1800, icon: '📜' },
      { id: 10, name: '제10계명 (탐내지 말라)', x: 800, y: 1720, icon: '📜' }
    ];
  }

  // 맵 배경 렌더링
  renderBackground(ctx) {
    if (this.isMapLoaded) {
      ctx.drawImage(this.mapImage, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = '#eddcb9';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    this.renderLandmarks(ctx);
  }

  // 랜드마크(모세 및 계명 스팟) 렌더링
  renderLandmarks(ctx) {
    const time = Date.now() * 0.003;

    // 1. 10개 계명 스팟 렌더링 (빛나는 비석/기둥)
    this.commandmentSpots.forEach((spot) => {
      const floatY = Math.sin(time + spot.id) * 6;

      // 발밑 오라
      ctx.fillStyle = 'rgba(230, 156, 36, 0.25)';
      ctx.beginPath();
      ctx.ellipse(spot.x, spot.y, 32, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 석판 기둥 본체
      ctx.fillStyle = '#f8f4eb';
      ctx.strokeStyle = '#b8924b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(spot.x - 22, spot.y - 50 + floatY, 44, 46, 8);
      ctx.fill();
      ctx.stroke();

      // 아이콘 및 텍스트
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(spot.icon, spot.x, spot.y - 20 + floatY);

      // 이름표
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 4;
      ctx.font = 'bold 13px sans-serif';
      ctx.strokeText(spot.name, spot.x, spot.y - 58 + floatY);
      ctx.fillText(spot.name, spot.x, spot.y - 58 + floatY);
    });

    // 2. 모세 NPC 렌더링
    const m = this.moses;
    const mosesFloat = Math.sin(time) * 3;

    // 모세 발밑 거룩한 빛
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y + 10, 48, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 모세 로브 (붉은/황금색 의복)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 20 + mosesFloat, 22, 0, Math.PI * 2);
    ctx.fill();

    // 모세 머리 & 수염
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 14 + mosesFloat, 12, 0, Math.PI);
    ctx.fill();

    // 십계명 돌판 들고 있는 모습
    ctx.fillStyle = '#78716c';
    ctx.fillRect(m.x - 18, m.y - 28 + mosesFloat, 12, 18);
    ctx.fillRect(m.x + 6, m.y - 28 + mosesFloat, 12, 18);

    // 모세 이름표
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.strokeText(`👑 ${m.name}`, m.x, m.y - 52 + mosesFloat);
    ctx.fillText(`👑 ${m.name}`, m.x, m.y - 52 + mosesFloat);
  }

  // 플레이어 아바타 렌더링 (커스텀 스타일 지원)
  renderAvatar(ctx, player) {
    const { x, y, nickname, isMoving, walkCycle, facing, style } = player;

    ctx.save();
    ctx.translate(x, y);

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = isMoving ? Math.sin(walkCycle) * 3 : 0;
    const legOffset = isMoving ? Math.sin(walkCycle) * 5 : 0;

    // 1. 다리 / 신발
    ctx.fillStyle = style?.shoesColor || '#4b5563';
    ctx.fillRect(-8 + legOffset, 0, 6, 8);
    ctx.fillRect(2 - legOffset, 0, 6, 8);

    // 2. 하의 (바지/치마)
    ctx.fillStyle = style?.pantsColor || '#2563eb';
    ctx.fillRect(-8, -12 + bob, 16, 14);

    // 3. 상의 (셔츠/튜닉)
    ctx.fillStyle = style?.shirtColor || '#f97316';
    ctx.beginPath();
    ctx.roundRect(-10, -26 + bob, 20, 16, 4);
    ctx.fill();

    // 4. 얼굴 (피부톤)
    ctx.fillStyle = style?.skinColor || '#fde047';
    ctx.beginPath();
    ctx.arc(0, -32 + bob, 11, 0, Math.PI * 2);
    ctx.fill();

    // 5. 머리카락
    ctx.fillStyle = style?.hairColor || '#451a03';
    ctx.beginPath();
    ctx.arc(0, -36 + bob, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    // 6. 소품 (모자/안경 등)
    if (style?.accessory === 'glasses') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-6, -34 + bob, 5, 4);
      ctx.strokeRect(1, -34 + bob, 5, 4);
    } else if (style?.accessory === 'hat') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-12, -42 + bob, 24, 6);
      ctx.fillRect(-7, -48 + bob, 14, 8);
    }

    // 7. 머리 위 닉네임 명찰
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(nickname || '탐험가').width;

    // 닉네임 배경 태그
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.strokeStyle = '#c2a673';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 8, -60 + bob, textWidth + 16, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#372719';
    ctx.fillText(nickname || '탐험가', 0, -45 + bob);

    ctx.restore();
  }
}
