// 2D 시내산 광야 메타버스 월드 매니저 (충돌 감지 및 디테일 아바타 렌더러)

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

    // 모세 NPC 위치 (성막 앞 제단)
    this.moses = {
      x: 2110,
      y: 920,
      radius: 36,
      name: '모세 선지자 (십계명 돌판)',
      title: '십계명 완성 제단'
    };

    // 10개 계명 미션 장소 좌표
    this.commandmentSpots = [
      { id: 1, name: '제1계명 (오직 하나님)', x: 620, y: 780, icon: '📜' },
      { id: 2, name: '제2계명 (우상 숭배 금지)', x: 1200, y: 1100, icon: '📜' },
      { id: 3, name: '제3계명 (주의 이름 망령되이)', x: 1750, y: 1350, icon: '📜' },
      { id: 4, name: '제4계명 (안식일 거룩히)', x: 2500, y: 1300, icon: '📜' },
      { id: 5, name: '제5계명 (부모님 공경)', x: 3100, y: 1050, icon: '📜' },
      { id: 6, name: '제6계명 (살인하지 말라)', x: 3550, y: 920, icon: '📜' },
      { id: 7, name: '제7계명 (간음하지 말라)', x: 3350, y: 1650, icon: '📜' },
      { id: 8, name: '제8계명 (도둑질하지 말라)', x: 2600, y: 1850, icon: '📜' },
      { id: 9, name: '제9계명 (거짓말 금지)', x: 1550, y: 1800, icon: '📜' },
      { id: 10, name: '제10계명 (탐내지 말라)', x: 800, y: 1720, icon: '📜' }
    ];

    // 이동 불가 장애물 구역 (하늘/시내산 꼭대기, 오아시스 연못 내부, 외곽 절벽)
    this.obstacles = [
      // 상단 하늘 및 험준한 산악 정상 (y < 620, 단 성막 진입 통로 1950~2250 제외)
      { type: 'box', x: 0, y: 0, w: 1950, h: 650 },
      { type: 'box', x: 2260, y: 0, w: 1836, h: 650 },
      { type: 'box', x: 1950, y: 0, w: 310, h: 520 },

      // 좌상단 오아시스 호수
      { type: 'circle', x: 420, y: 1470, r: 120 },
      // 우상단 오아시스 호수
      { type: 'circle', x: 3630, y: 1880, r: 110 },
      // 우측 중단 연못
      { type: 'circle', x: 3670, y: 1060, r: 90 },
      // 좌하단 오아시스 연못
      { type: 'circle', x: 810, y: 1420, r: 85 }
    ];
  }

  // 좌표 이동 가능 여부 검사 (충돌 감지)
  isWalkable(x, y) {
    // 맵 외곽 경계
    if (x < 70 || x > this.width - 70 || y < 150 || y > this.height - 90) {
      return false;
    }

    // 장애물 구역 검사
    for (const obs of this.obstacles) {
      if (obs.type === 'box') {
        if (x >= obs.x && x <= obs.x + obs.w && y >= obs.y && y <= obs.y + obs.h) {
          return false;
        }
      } else if (obs.type === 'circle') {
        const dist = Math.hypot(x - obs.x, y - obs.y);
        if (dist < obs.r) {
          return false;
        }
      }
    }
    return true;
  }

  renderBackground(ctx) {
    if (this.isMapLoaded) {
      ctx.drawImage(this.mapImage, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = '#eddcb9';
      ctx.fillRect(0, 0, this.width, this.height);
    }
    this.renderLandmarks(ctx);
  }

  renderLandmarks(ctx) {
    const time = Date.now() * 0.003;

    // 10개 계명 스팟 렌더링
    this.commandmentSpots.forEach((spot) => {
      const floatY = Math.sin(time + spot.id) * 6;

      ctx.fillStyle = 'rgba(230, 156, 36, 0.28)';
      ctx.beginPath();
      ctx.ellipse(spot.x, spot.y, 32, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fffdf7';
      ctx.strokeStyle = '#c2923d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(spot.x - 24, spot.y - 52 + floatY, 48, 48, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(spot.icon, spot.x, spot.y - 20 + floatY);

      // 이름표
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.65)';
      ctx.lineWidth = 4;
      ctx.font = 'bold 13px sans-serif';
      ctx.strokeText(spot.name, spot.x, spot.y - 60 + floatY);
      ctx.fillText(spot.name, spot.x, spot.y - 60 + floatY);
    });

    // 모세 NPC
    const m = this.moses;
    const mosesFloat = Math.sin(time) * 3;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y + 10, 48, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 20 + mosesFloat, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 14 + mosesFloat, 12, 0, Math.PI);
    ctx.fill();

    // 두 돌판
    ctx.fillStyle = '#78716c';
    ctx.fillRect(m.x - 18, m.y - 28 + mosesFloat, 12, 18);
    ctx.fillRect(m.x + 6, m.y - 28 + mosesFloat, 12, 18);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.strokeText(`👑 ${m.name}`, m.x, m.y - 54 + mosesFloat);
    ctx.fillText(`👑 ${m.name}`, m.x, m.y - 54 + mosesFloat);
  }

  // 아바타 렌더링 (커스텀 스타일 완벽 반영)
  renderAvatar(ctx, player) {
    const { x, y, nickname, isMoving, walkCycle, style } = player;

    ctx.save();
    ctx.translate(x, y);

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = isMoving ? Math.sin(walkCycle) * 3 : 0;
    const legOffset = isMoving ? Math.sin(walkCycle) * 5 : 0;

    // 1. 신발
    ctx.fillStyle = style?.shoesColor || '#4b5563';
    ctx.fillRect(-8 + legOffset, 0, 6, 8);
    ctx.fillRect(2 - legOffset, 0, 6, 8);

    // 2. 하의
    ctx.fillStyle = style?.pantsColor || '#2563eb';
    ctx.fillRect(-8, -12 + bob, 16, 14);

    // 3. 상의
    ctx.fillStyle = style?.shirtColor || '#f97316';
    ctx.beginPath();
    ctx.roundRect(-10, -26 + bob, 20, 16, 4);
    ctx.fill();

    // 4. 얼굴
    ctx.fillStyle = style?.skinColor || '#fde047';
    ctx.beginPath();
    ctx.arc(0, -32 + bob, 11, 0, Math.PI * 2);
    ctx.fill();

    // 눈
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(-4, -33 + bob, 1.6, 0, Math.PI * 2);
    ctx.arc(4, -33 + bob, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 5. 머리카락
    ctx.fillStyle = style?.hairColor || '#451a03';
    if (style?.hairStyle === 'long') {
      ctx.beginPath();
      ctx.arc(0, -36 + bob, 12, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-12, -36 + bob, 5, 20);
      ctx.fillRect(7, -36 + bob, 5, 20);
    } else if (style?.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, -36 + bob, 11, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(11, -38 + bob, 5, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (style?.hairStyle === 'curly') {
      for (let i = -10; i <= 10; i += 5) {
        ctx.beginPath();
        ctx.arc(i, -40 + bob, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.arc(0, -36 + bob, 11, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // 6. 소품
    if (style?.accessory === 'glasses') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-7, -35 + bob, 5, 4);
      ctx.strokeRect(2, -35 + bob, 5, 4);
    } else if (style?.accessory === 'hat') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-14, -42 + bob, 28, 5);
      ctx.fillRect(-8, -49 + bob, 16, 8);
    } else if (style?.accessory === 'headband') {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-10, -38 + bob, 20, 3);
    } else if (style?.accessory === 'flower') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(8, -40 + bob, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. 머리 위 닉네임 명찰
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(nickname || '탐험가').width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 8, -62 + bob, textWidth + 16, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#372719';
    ctx.fillText(nickname || '탐험가', 0, -47 + bob);

    ctx.restore();
  }
}
