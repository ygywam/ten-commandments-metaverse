// 8인 8색 성경 탐험가 고화질 아바타 커스터마이저 모듈
import { drawExplorerAvatar } from '../engine/avatarRenderer.js';

export const AVATAR_CHARACTERS = [
  { id: 'caleb', index: 0, name: '갈렙', title: '푸른 머리띠 소년', color: '#2563eb' },
  { id: 'rebekah', index: 1, name: '리브가', title: '순백 수건 소녀', color: '#f43f5e' },
  { id: 'david', index: 2, name: '다윗', title: '초록 망토 목자', color: '#65a30d' },
  { id: 'miriam', index: 3, name: '미리암', title: '땋은머리 찬양 소녀', color: '#eab308' },
  { id: 'joshua', index: 4, name: '여호수아', title: '사막 케피예 탐험가', color: '#dc2626' },
  { id: 'esther', index: 5, name: '에스더', title: '주황 양갈래 소녀', color: '#0284c7' },
  { id: 'joseph', index: 6, name: '요셉', title: '채색옷과 케피예', color: '#1d4ed8' },
  { id: 'deborah', index: 7, name: '드보라', title: '보라 후드 지도자', color: '#9333ea' }
];

export const ACCESSORIES = [
  { id: 'none', label: '기본', icon: '✨' }
];

export const EQUIPMENTS = [
  { id: 'none', label: '기본', icon: '—' }
];

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.selectedChar = AVATAR_CHARACTERS[0]; // 기본 갈렙
    this.nickname = '믿음이';

    // 8인 고화질 투명 아틀라스 로드
    this.atlas = new Image();
    this.isAtlasLoaded = false;
    this.atlas.src = './src/assets/characters_atlas.png';
    this.atlas.onload = () => {
      this.isAtlasLoaded = true;
      this.renderCharacterButtons();
      this.drawPreview();
    };

    this.previewCanvas = document.getElementById('avatar-preview-canvas');
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
    }

    this.walkCycle = 0;
    this.animTimer = null;

    this.initUI();
    this.startAnimation();
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

    this.renderCharacterButtons();

    const startBtn = document.getElementById('btn-confirm-avatar');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const val = nickInput ? nickInput.value.trim() : '';
        if (!val) {
          alert('닉네임을 입력해 주세요!');
          return;
        }
        this.stopAnimation();
        if (this.onStart) {
          this.onStart(val, {
            character: this.selectedChar,
            accessory: ACCESSORIES[0],
            equipment: EQUIPMENTS[0]
          });
        }
      });
    }
  }

  renderCharacterButtons() {
    const container = document.getElementById('char-options-grid');
    if (!container) return;
    container.innerHTML = '';

    AVATAR_CHARACTERS.forEach(char => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this.selectedChar.id === char.id;
      btn.className = `custom-badge-btn ${isActive ? 'active' : ''}`;

      // 미니 썸네일 캔버스 (얼굴 클로즈업)
      const mini = document.createElement('canvas');
      mini.width = 44;
      mini.height = 44;
      const mCtx = mini.getContext('2d');

      if (this.isAtlasLoaded) {
        mCtx.drawImage(
          this.atlas,
          char.index * 132, 0, 132, 116,
          0, 0, 44, 44
        );
      }

      const textWrap = document.createElement('div');
      textWrap.className = 'badge-text-wrap';
      textWrap.innerHTML = `<strong>${char.name}</strong><span>${char.title}</span>`;

      btn.appendChild(mini);
      btn.appendChild(textWrap);

      btn.addEventListener('click', () => {
        this.selectedChar = char;
        container.querySelectorAll('.custom-badge-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.drawPreview();
      });

      container.appendChild(btn);
    });
  }

  startAnimation() {
    this.animTimer = setInterval(() => {
      this.walkCycle += 0.14;
      this.drawPreview();
    }, 50);
  }

  stopAnimation() {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
  }

  drawPreview() {
    if (!this.previewCtx || !this.previewCanvas || !this.isAtlasLoaded) return;
    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 배경 부드러운 빛
    const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 130);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const char = this.selectedChar;
    const charIndex = char.index !== undefined ? char.index : 0;
    const charColor = char.color || '#2563eb';
    const isDavid = char.id === 'david';

    ctx.save();
    ctx.translate(w / 2, h / 2 + 55);

    // 프리뷰는 1.7배 크기로 시원하게 렌더링
    drawExplorerAvatar(ctx, {
      atlas: this.atlas,
      isAtlasLoaded: this.isAtlasLoaded,
      charIndex,
      charColor,
      isDavid,
      walkCycle: this.walkCycle,
      isMoving: true,
      facing: 'down',
      scale: 1.7
    });

    ctx.restore();

    // 머리 위 닉네임 태그
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const nick = this.nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = charColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - textWidth / 2 - 10, h - 36, textWidth + 20, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, w / 2, h - 18);
  }
}
