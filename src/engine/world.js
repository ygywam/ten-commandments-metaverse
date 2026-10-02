// 2D 시내산 광야 메타버스 월드 매니저 (4프레임 실제 보행 스프라이트 연동)

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

    // 4프레임 걷기 스프라이트 시트 로드
    this.walkSheet = new Image();
    this.isWalkSheetLoaded = false;
    this.walkSheet.src = './src/assets/walk_cycle_sheet.png';
    this.walkSheet.onload = () => {
      this.isWalkSheetLoaded = true;
    };

    // 모세 NPC 위치
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

    // 이동 불가 장애물 구역
    this.obstacles = [
      { type: 'box', x: 0, y: 0, w: 1950, h: 650 },
      { type: 'box', x: 2260, y: 0, w: 1836, h: 650 },
      { type: 'box', x: 1950, y: 0, w: 310, h: 520 },
      { type: 'circle', x: 420, y: 1470, r: 120 },
      { type: 'circle', x: 3630, y: 1880, r: 110 },
      { type: 'circle', x: 3670, y: 1060, r: 90 },
      { type: 'circle', x: 810, y: 1420, r: 85 }
    ];
  }

  isWalkable(x, y) {
    if (x < 70 || x > this.width - 70 || y < 150 || y > this.height - 90) {
      return false;
    }
    for (const obs of this.obstacles) {
      if (obs.type === 'box') {
        if (x >= obs.x && x <= obs.x + obs.w && y >= obs.y && y <= obs.y + obs.h) {
          return false;
        }
      } else if (obs.type === 'circle') {
        if (Math.hypot(x - obs.x, y - obs.y) < obs.r) {
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

    // 10개 계명 스팟
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

  // 진짜 4프레임 보행 스프라이트 렌더러
  renderAvatar(ctx, player) {
    const { x, y, nickname, isMoving, walkCycle, custom } = player;

    ctx.save();
    ctx.translate(x, y);

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.isWalkSheetLoaded) {
      // 걷는 중일 때는 walkCycle에 따른 4프레임 교체, 멈췄을 때는 0번(기본 서있는 모습)
      const frameIndex = isMoving ? Math.floor((walkCycle * 2) % 4) : 0;
      const frameW = 150;
      const frameH = 180;
      const srcX = frameIndex * frameW;

      const targetW = 68;
      const targetH = 82;
      const targetX = -targetW / 2;
      const targetY = -targetH + 4;

      ctx.save();

      // 스프라이트 드로우
      ctx.drawImage(
        this.walkSheet,
        srcX, 0, frameW, frameH,
        targetX, targetY, targetW, targetH
      );

      // 머리 장식 악세서리
      if (custom?.accessory && custom.accessory.id !== 'none') {
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(custom.accessory.icon, 8, targetY + 14);
      }

      // 소품 장비
      if (custom?.equipment && custom.equipment.id !== 'none') {
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(custom.equipment.icon, targetX + 4, targetY + 62);
      }

      ctx.restore();
    }

    // 머리 위 닉네임 명찰
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const nick = nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 8, -82, textWidth + 16, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, 0, -66);

    ctx.restore();
  }
}
