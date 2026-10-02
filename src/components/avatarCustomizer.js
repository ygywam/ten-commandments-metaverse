// 성경 탐험가 8인 고화질 캐릭터 프리셋 및 커스터마이저 모듈

export const AVATAR_PRESETS = [
  {
    id: 'caleb',
    name: '갈렙',
    title: '용감한 탐험가 소년',
    gender: '남',
    crop: { x: 12, y: 22, w: 136, h: 190 },
    iconCrop: { x: 12, y: 490, w: 90, h: 120 },
    color: '#3b82f6'
  },
  {
    id: 'rebekah',
    name: '리브가',
    title: '지혜로운 순백 수건 소녀',
    gender: '여',
    crop: { x: 156, y: 22, w: 136, h: 190 },
    iconCrop: { x: 134, y: 490, w: 90, h: 120 },
    color: '#f43f5e'
  },
  {
    id: 'david',
    name: '다윗',
    title: '초록 망토와 목자의 지팡이',
    gender: '남',
    crop: { x: 300, y: 22, w: 136, h: 190 },
    iconCrop: { x: 256, y: 490, w: 90, h: 120 },
    color: '#65a30d'
  },
  {
    id: 'miriam',
    name: '미리암',
    title: '땋은머리와 금빛 머리띠',
    gender: '여',
    crop: { x: 444, y: 22, w: 136, h: 190 },
    iconCrop: { x: 378, y: 490, w: 90, h: 120 },
    color: '#eab308'
  },
  {
    id: 'joshua',
    name: '여호수아',
    title: '사막 케피예와 탐험 침낭',
    gender: '남',
    crop: { x: 12, y: 232, w: 136, h: 190 },
    iconCrop: { x: 500, y: 490, w: 90, h: 120 },
    color: '#b91c1c'
  },
  {
    id: 'esther',
    name: '에스더',
    title: '주황 양갈래와 하늘색 숄',
    gender: '여',
    crop: { x: 156, y: 232, w: 136, h: 190 },
    iconCrop: { x: 622, y: 490, w: 90, h: 120 },
    color: '#0284c7'
  },
  {
    id: 'joseph',
    name: '요셉',
    title: '채색옷과 푸른 케피예',
    gender: '남',
    crop: { x: 300, y: 232, w: 136, h: 190 },
    iconCrop: { x: 744, y: 490, w: 90, h: 120 },
    color: '#1d4ed8'
  },
  {
    id: 'deborah',
    name: '드보라',
    title: '보라 후드와 지혜의 지팡이',
    gender: '여',
    crop: { x: 444, y: 232, w: 136, h: 190 },
    iconCrop: { x: 866, y: 490, w: 90, h: 120 },
    color: '#9333ea'
  }
];

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.selectedPreset = AVATAR_PRESETS[0];
    this.nickname = '믿음이';

    this.sheetImage = new Image();
    this.isLoaded = false;
    this.sheetImage.src = './src/assets/avatars_sheet.jpg';
    this.sheetImage.onload = () => {
      this.isLoaded = true;
      this.renderCards();
      this.drawPreview();
    };

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
          this.onStart(this.nickname, this.selectedPreset);
        }
      });
    }
  }

  renderCards() {
    const container = document.getElementById('preset-cards-container');
    if (!container) return;
    container.innerHTML = '';

    AVATAR_PRESETS.forEach((preset) => {
      const card = document.createElement('div');
      card.className = `avatar-card-item ${this.selectedPreset.id === preset.id ? 'active' : ''}`;

      // 미니 썸네일 캔버스
      const canvas = document.createElement('canvas');
      canvas.width = 68;
      canvas.height = 92;
      const ctx = canvas.getContext('2d');

      if (this.isLoaded) {
        ctx.drawImage(
          this.sheetImage,
          preset.crop.x, preset.crop.y, preset.crop.w, preset.crop.h,
          0, 0, 68, 92
        );
      }

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML = `
        <span class="card-name">${preset.name}</span>
        <span class="card-title">${preset.title}</span>
      `;

      card.appendChild(canvas);
      card.appendChild(meta);

      card.addEventListener('click', () => {
        this.selectedPreset = preset;
        container.querySelectorAll('.avatar-card-item').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.drawPreview();
      });

      container.appendChild(card);
    });
  }

  drawPreview() {
    if (!this.previewCtx || !this.previewCanvas || !this.isLoaded) return;
    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const p = this.selectedPreset;

    // 배경 부드러운 빛
    const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 120);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 고화질 캐릭터 일러스트 원본 렌더링
    const targetH = h - 60;
    const aspect = p.crop.w / p.crop.h;
    const targetW = targetH * aspect;
    const targetX = (w - targetW) / 2;
    const targetY = 12;

    ctx.drawImage(
      this.sheetImage,
      p.crop.x, p.crop.y, p.crop.w, p.crop.h,
      targetX, targetY, targetW, targetH
    );

    // 머리 위 닉네임 태그
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const nick = this.nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = p.color || '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - textWidth / 2 - 10, h - 38, textWidth + 20, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, w / 2, h - 20);
  }
}
