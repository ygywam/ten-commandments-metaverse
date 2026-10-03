// 2D 시내산 광야 메타버스 월드 매니저 (8인 고화질 캐릭터 아틀라스 연동)
import { drawExplorerAvatar } from './avatarRenderer.js';

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

    // 8인 고화질 투명 아틀라스 로드 (화살표 잔상 100% 제거)
    this.atlas = new Image();
    this.isAtlasLoaded = false;
    this.atlas.src = './src/assets/characters_atlas.png';
    this.atlas.onload = () => {
      this.isAtlasLoaded = true;
    };

    // 모세 NPC 위치
    this.moses = {
      x: 2110,
      y: 920,
      radius: 36,
      name: '모세 선지자 (십계명 돌판)',
      title: '십계명 완성 제단'
    };

    // 광야 내 안전하고 넓은 30개 후보 스폰 좌표 풀 (오아시스, 장막, 바위골짜기 등)
    this.candidatePool = [
      { x: 550, y: 820 },   { x: 920, y: 780 },   { x: 1350, y: 850 },  { x: 1680, y: 820 },
      { x: 620, y: 1100 },  { x: 1050, y: 1150 }, { x: 1450, y: 1120 }, { x: 1820, y: 1150 },
      { x: 2450, y: 1080 }, { x: 2850, y: 920 },  { x: 3250, y: 880 },  { x: 3620, y: 820 },
      { x: 2380, y: 1320 }, { x: 2750, y: 1250 }, { x: 3150, y: 1280 }, { x: 3580, y: 1350 },
      { x: 520, y: 1720 },  { x: 920, y: 1650 },  { x: 1280, y: 1580 }, { x: 1720, y: 1520 },
      { x: 750, y: 1950 },  { x: 1150, y: 1980 }, { x: 1580, y: 1920 }, { x: 1920, y: 1850 },
      { x: 2280, y: 1820 }, { x: 2650, y: 1780 }, { x: 3050, y: 1850 }, { x: 3450, y: 1750 },
      { x: 2850, y: 2050 }, { x: 3300, y: 2020 }
    ];

    // 기본 10개 계명 미션 장소 정의
    this.commandmentSpots = [
      { id: 1, name: '제1계명 (오직 하나님)', x: 620, y: 780, icon: '📜', discovered: false },
      { id: 2, name: '제2계명 (우상 숭배 금지)', x: 1200, y: 1100, icon: '📜', discovered: false },
      { id: 3, name: '제3계명 (주의 이름 망령되이)', x: 1750, y: 1350, icon: '📜', discovered: false },
      { id: 4, name: '제4계명 (안식일 거룩히)', x: 2500, y: 1300, icon: '📜', discovered: false },
      { id: 5, name: '제5계명 (부모님 공경)', x: 3100, y: 1050, icon: '📜', discovered: false },
      { id: 6, name: '제6계명 (살인하지 말라)', x: 3550, y: 920, icon: '📜', discovered: false },
      { id: 7, name: '제7계명 (간음하지 말라)', x: 3350, y: 1650, icon: '📜', discovered: false },
      { id: 8, name: '제8계명 (도둑질하지 말라)', x: 2600, y: 1850, icon: '📜', discovered: false },
      { id: 9, name: '제9계명 (거짓말 금지)', x: 1550, y: 1800, icon: '📜', discovered: false },
      { id: 10, name: '제10계명 (탐내지 말라)', x: 800, y: 1720, icon: '📜', discovered: false }
    ];

    // 시작 시 무작위 좌표 셔플 배치
    this.randomizeSpots();

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

  // 10개 비석 위치 무작위 셔플 (givenCoords가 있으면 동기화 좌표 사용)
  randomizeSpots(givenCoords = null) {
    if (givenCoords && Array.isArray(givenCoords) && givenCoords.length === 10) {
      this.commandmentSpots.forEach((spot, idx) => {
        spot.x = givenCoords[idx].x;
        spot.y = givenCoords[idx].y;
        spot.discovered = false;
      });
      return givenCoords;
    }

    // 30개 후보 풀에서 10개 무작위 비복원 추출 (Fisher-Yates 셔플)
    const pool = [...this.candidatePool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const chosen = pool.slice(0, 10);
    this.commandmentSpots.forEach((spot, idx) => {
      spot.x = chosen[idx].x;
      spot.y = chosen[idx].y;
      spot.discovered = false;
    });

    return chosen.map(c => ({ x: c.x, y: c.y }));
  }

  // 플레이어 이동 시 근접 비석 탐험 발견 처리
  updateDiscovery(px, py) {
    this.commandmentSpots.forEach((spot) => {
      if (!spot.discovered) {
        const dist = Math.hypot(px - spot.x, py - spot.y);
        if (dist < 200) {
          spot.discovered = true;
        }
      }
    });
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

  renderBackground(ctx, solvedSpots = new Set(), isTeacherView = false) {
    if (this.isMapLoaded) {
      ctx.drawImage(this.mapImage, 0, 0, this.width, this.height);
    } else {
      ctx.fillStyle = '#eddcb9';
      ctx.fillRect(0, 0, this.width, this.height);
    }
    this.renderLandmarks(ctx, solvedSpots, isTeacherView);
  }

  renderLandmarks(ctx, solvedSpots = new Set(), isTeacherView = false) {
    const time = Date.now() * 0.003;

    // 10개 계명 스팟
    this.commandmentSpots.forEach((spot) => {
      const isSolved = solvedSpots.has(spot.id);
      const isVisible = isTeacherView || isSolved || spot.discovered;
      const floatY = Math.sin(time + spot.id) * 6;

      if (!isVisible) {
        // [미발견 상태: 원거리 숨김] 모래바람 속 은은한 신비의 반짝임 이펙트만 표시
        const pulse = (Math.sin(time * 2 + spot.id) + 1) * 0.5; // 0 ~ 1
        ctx.fillStyle = `rgba(245, 158, 11, ${0.15 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y - 10, 16 + pulse * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${14 + pulse * 4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('✨', spot.x, spot.y - 8);
        return;
      }

      // [발견 완료 또는 교사 화면]: 찬란한 비석 렌더링
      // 그림자
      ctx.fillStyle = isSolved ? 'rgba(34, 197, 94, 0.35)' : 'rgba(230, 156, 36, 0.28)';
      ctx.beginPath();
      ctx.ellipse(spot.x, spot.y, 34, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // 완료 시 찬란한 회전 후광
      if (isSolved) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(spot.x, spot.y - 28 + floatY, 32, time, time + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 비석 상자
      ctx.fillStyle = isSolved ? '#f0fdf4' : '#fffdf7';
      ctx.strokeStyle = isSolved ? '#22c55e' : '#c2923d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(spot.x - 24, spot.y - 52 + floatY, 48, 48, 8);
      ctx.fill();
      ctx.stroke();

      // 아이콘 및 체크 배지
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(spot.icon, spot.x, spot.y - 20 + floatY);

      if (isSolved) {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.fillText('✔', spot.x + 18, spot.y - 42 + floatY);
      }

      // 이름 텍스트
      ctx.fillStyle = isSolved ? '#15803d' : '#ffffff';
      ctx.strokeStyle = isSolved ? '#ffffff' : 'rgba(0,0,0,0.65)';
      ctx.lineWidth = 4;
      ctx.font = 'bold 13px sans-serif';
      ctx.strokeText(spot.name, spot.x, spot.y - 60 + floatY);
      ctx.fillText(spot.name, spot.x, spot.y - 60 + floatY);
    });

    // 모세 NPC
    const m = this.moses;
    const mosesFloat = Math.sin(time) * 3;
    const isCompleted = solvedSpots.size >= 10;

    // 모세 발밑 금빛 원형 후광
    ctx.fillStyle = isCompleted ? 'rgba(234, 179, 8, 0.6)' : 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y + 10, 52, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isCompleted) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(m.x, m.y - 20 + mosesFloat, 38, time, time + Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 20 + mosesFloat, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(m.x, m.y - 14 + mosesFloat, 12, 0, Math.PI);
    ctx.fill();

    // 두 개의 돌판을 품에 안고 있는 모세 (회색 석판 2개)
    ctx.fillStyle = '#78716c';
    ctx.strokeStyle = isCompleted ? '#fbbf24' : '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(m.x - 18, m.y - 28 + mosesFloat, 12, 20, 3);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(m.x + 6, m.y - 28 + mosesFloat, 12, 20, 3);
    ctx.fill();
    ctx.stroke();

    // 모세 명찰 및 돌판 진행 상태
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.strokeText(`👑 ${m.name}`, m.x, m.y - 54 + mosesFloat);
    ctx.fillText(`👑 ${m.name}`, m.x, m.y - 54 + mosesFloat);

    // 진척도 서브태그
    ctx.font = 'bold 12px sans-serif';
    const statusText = isCompleted ? '🌟 십계명 완성! 봉헌하기' : `📜 십계명 돌판 [${solvedSpots.size}/10]`;
    ctx.fillStyle = isCompleted ? '#fef08a' : '#fed7aa';
    ctx.strokeText(statusText, m.x, m.y - 72 + mosesFloat);
    ctx.fillText(statusText, m.x, m.y - 72 + mosesFloat);
  }

  // 8인 고유 캐릭터 실시간 렌더러 (얼굴 일러스트 + 움직이는 몸·팔·다리)
  renderAvatar(ctx, player) {
    const { x, y, nickname, isMoving, walkCycle, custom } = player;

    ctx.save();
    ctx.translate(x, y);

    const bob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 4.5 : Math.sin(Date.now() * 0.003) * 1.5;
    const charIndex = custom?.character?.index !== undefined ? custom.character.index : 0;
    const charColor = custom?.character?.color || '#2563eb';
    const isDavid = custom?.character?.id === 'david';

    // 몸통/팔/다리 보행 모션 + 고화질 얼굴 합성 렌더링
    drawExplorerAvatar(ctx, {
      atlas: this.atlas,
      isAtlasLoaded: this.isAtlasLoaded,
      charIndex,
      charColor,
      isDavid,
      walkCycle,
      isMoving,
      facing: player.facing || 'down',
      scale: 1.0
    });

    // 머리 위 닉네임 명찰
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    const nick = nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 8, -96 - bob, textWidth + 16, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, 0, -80 - bob);

    ctx.restore();
  }
}
