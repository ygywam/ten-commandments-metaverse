// 성경 시대 탐험가 아바타 프리셋 & 커스터마이저 모듈

export const AVATAR_PRESETS = [
  {
    id: 'boy_blue_band',
    name: '갈렙 (푸른 머리띠)',
    gender: '남학생',
    crop: { x: 12, y: 22, w: 136, h: 190 },
    desc: '용감하게 광야를 앞장서는 탐험 소년',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#3d2314',
      hairStyle: 'band_boy',
      shirtColor: '#ffffff',
      pantsColor: '#2563eb',
      robeColor: null,
      headgear: 'blue_band',
      accessory: 'bag',
      shoesColor: '#78350f'
    }
  },
  {
    id: 'girl_white_veil',
    name: '리브가 (순백 수건)',
    gender: '여학생',
    crop: { x: 156, y: 22, w: 136, h: 190 },
    desc: '지혜롭고 단정한 사막의 소녀',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#27170c',
      hairStyle: 'veil_girl',
      shirtColor: '#f43f5e',
      pantsColor: '#be123c',
      robeColor: null,
      headgear: 'white_veil',
      accessory: 'bag',
      shoesColor: '#78350f'
    }
  },
  {
    id: 'boy_shepherd_green',
    name: '다윗 (초록 망토 목자)',
    gender: '남학생',
    crop: { x: 300, y: 22, w: 136, h: 190 },
    desc: '양을 치며 찬양하는 소년 목자',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#78350f',
      hairStyle: 'curly_boy',
      shirtColor: '#fef08a',
      pantsColor: '#65a30d',
      robeColor: '#4d7c0f',
      headgear: 'none',
      accessory: 'staff',
      shoesColor: '#78350f'
    }
  },
  {
    id: 'girl_braid_yellow',
    name: '미리암 (땋은머리 찬양)',
    gender: '여학생',
    crop: { x: 444, y: 22, w: 136, h: 190 },
    desc: '소고를 치며 기뻐 춤추는 소녀',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#1c1917',
      hairStyle: 'braided_girl',
      shirtColor: '#eab308',
      pantsColor: '#a16207',
      robeColor: null,
      headgear: 'gold_band',
      accessory: 'bag',
      shoesColor: '#78350f'
    }
  },
  {
    id: 'boy_desert_turban',
    name: '여호수아 (광야 탐험가)',
    gender: '남학생',
    crop: { x: 12, y: 232, w: 136, h: 190 },
    desc: '든든하게 짐을 메고 행진하는 소년',
    style: {
      skinColor: '#d97706',
      hairColor: '#1c1917',
      hairStyle: 'turban_boy',
      shirtColor: '#f8fafc',
      pantsColor: '#dc2626',
      robeColor: '#b91c1c',
      headgear: 'turban_white',
      accessory: 'bedroll',
      shoesColor: '#451a03'
    }
  },
  {
    id: 'girl_blue_scarf',
    name: '에스더 (하늘색 스카프)',
    gender: '여학생',
    crop: { x: 156, y: 232, w: 136, h: 190 },
    desc: '맑고 밝은 눈망울의 순종 소녀',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#ea580c',
      hairStyle: 'twin_orange',
      shirtColor: '#38bdf8',
      pantsColor: '#0284c7',
      robeColor: '#0ea5e9',
      headgear: 'blue_scarf',
      accessory: 'bag',
      shoesColor: '#78350f'
    }
  },
  {
    id: 'boy_striped_keffiyeh',
    name: '요셉 (채색옷 케피예)',
    gender: '남학생',
    crop: { x: 300, y: 232, w: 136, h: 190 },
    desc: '꿈을 품고 나아가는 푸른 튜닉 소년',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#292524',
      hairStyle: 'short',
      shirtColor: '#2563eb',
      pantsColor: '#1d4ed8',
      robeColor: null,
      headgear: 'striped_keffiyeh',
      accessory: 'bag',
      shoesColor: '#451a03'
    }
  },
  {
    id: 'girl_purple_hood',
    name: '드보라 (보랏빛 기도자)',
    gender: '여학생',
    crop: { x: 444, y: 232, w: 136, h: 190 },
    desc: '지혜로운 지팡이를 짚은 믿음의 소녀',
    style: {
      skinColor: '#fed7aa',
      hairColor: '#451a03',
      hairStyle: 'braided_girl',
      shirtColor: '#9333ea',
      pantsColor: '#7e22ce',
      robeColor: '#a855f7',
      headgear: 'purple_hood',
      accessory: 'staff',
      shoesColor: '#451a03'
    }
  }
];

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.sheetImage = new Image();
    this.sheetLoaded = false;
    this.sheetImage.src = './src/assets/avatars_sheet.jpg';
    this.sheetImage.onload = () => {
      this.sheetLoaded = true;
      this.drawPreview();
      this.renderPresetCards();
    };

    this.selectedPreset = AVATAR_PRESETS[0];
    this.nickname = '믿음이';
    this.currentStyle = { ...this.selectedPreset.style };

    this.previewCanvas = document.getElementById('avatar-preview-canvas');
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
    }

    this.initUI();
  }

  initUI() {
    const nickInput = document.getElementById('input-nickname');
    if (nickInput) {
      nickInput.value = this.nickname;
      nickInput.addEventListener('input', (e) => {
        this.nickname = e.target.value.trim() || '탐험가';
        this.drawPreview();
      });
    }

    const startBtn = document.getElementById('btn-confirm-avatar');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const val = nickInput ? nickInput.value.trim() : '';
        if (!val) {
          alert('닉네임을 입력해 주세요!');
          return;
        }
        this.nickname = val;
        if (this.onStart) {
          this.onStart(this.nickname, this.currentStyle, this.selectedPreset);
        }
      });
    }

    this.renderPresetCards();
  }

  renderPresetCards() {
    const container = document.getElementById('preset-cards-container');
    if (!container) return;
    container.innerHTML = '';

    AVATAR_PRESETS.forEach((preset) => {
      const card = document.createElement('div');
      card.className = `avatar-preset-card ${this.selectedPreset.id === preset.id ? 'active' : ''}`;

      // 미니 캔버스로 크롭 썸네일 렌더링
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 72;
      thumbCanvas.height = 92;
      const tCtx = thumbCanvas.getContext('2d');

      if (this.sheetLoaded) {
        tCtx.drawImage(
          this.sheetImage,
          preset.crop.x, preset.crop.y, preset.crop.w, preset.crop.h,
          0, 0, 72, 92
        );
      }

      const info = document.createElement('div');
      info.className = 'preset-card-info';
      info.innerHTML = `
        <span class="preset-name">${preset.name}</span>
        <span class="preset-gender">${preset.gender}</span>
      `;

      card.appendChild(thumbCanvas);
      card.appendChild(info);

      card.addEventListener('click', () => {
        this.selectedPreset = preset;
        this.currentStyle = { ...preset.style };
        container.querySelectorAll('.avatar-preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.drawPreview();
      });

      container.appendChild(card);
    });
  }

  drawPreview() {
    if (!this.previewCtx || !this.previewCanvas) return;
    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;

    ctx.clearRect(0, 0, w, h);

    if (this.sheetLoaded && this.selectedPreset) {
      const p = this.selectedPreset;
      // 카드 일러스트를 중앙에 크고 선명하게 렌더링
      const aspect = p.crop.w / p.crop.h;
      const targetH = h - 50;
      const targetW = targetH * aspect;
      const targetX = (w - targetW) / 2;
      const targetY = 10;

      ctx.drawImage(
        this.sheetImage,
        p.crop.x, p.crop.y, p.crop.w, p.crop.h,
        targetX, targetY, targetW, targetH
      );

      // 머리 위 닉네임 명찰 표시
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      const nick = this.nickname || '탐험가';
      const textWidth = ctx.measureText(nick).width;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w / 2 - textWidth / 2 - 8, targetH + 14, textWidth + 16, 22, 11);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1c1917';
      ctx.fillText(nick, w / 2, targetH + 30);
    }
  }
}
