// 4프레임 실시간 보행 스프라이트 & 커스터마이징 컨트롤러

export const AVATAR_CHARACTERS = [
  { id: 'caleb', name: '갈렙', title: '푸른 머리띠 소년', gender: '남', tint: null },
  { id: 'rebekah', name: '리브가', title: '순백 수건 소녀', gender: '여', tint: '#fda4af' },
  { id: 'david', name: '다윗', title: '초록 망토 목자', gender: '남', tint: '#86efac' },
  { id: 'miriam', name: '미리암', title: '땋은머리 찬양 소녀', gender: '여', tint: '#fde047' },
  { id: 'joshua', name: '여호수아', title: '사막 케피예 탐험가', gender: '남', tint: '#fca5a5' },
  { id: 'esther', name: '에스더', title: '주황 양갈래 소녀', gender: '여', tint: '#7dd3fc' },
  { id: 'joseph', name: '요셉', title: '채색옷과 케피예', gender: '남', tint: '#93c5fd' },
  { id: 'deborah', name: '드보라', title: '보라 후드 지도자', gender: '여', tint: '#d8b4fe' }
];

export const ACCESSORIES = [
  { id: 'none', label: '없음', icon: '✨' },
  { id: 'crown', label: '왕관', icon: '👑' },
  { id: 'flower', label: '꽃 장식', icon: '🌸' },
  { id: 'star', label: '별 장식', icon: '⭐' },
  { id: 'leaf', label: '화관', icon: '🍃' },
  { id: 'glasses', label: '동글 안경', icon: '👓' },
  { id: 'ribbon', label: '리본', icon: '🎀' }
];

export const EQUIPMENTS = [
  { id: 'none', label: '없음', icon: '—' },
  { id: 'staff', label: '목자 지팡이', icon: '🪵' },
  { id: 'bag', label: '가죽 가방', icon: '👜' },
  { id: 'scroll', label: '두루마리', icon: '📜' },
  { id: 'bedroll', label: '탐험 침낭', icon: '🛏️' },
  { id: 'flask', label: '물주머니', icon: '🏺' }
];

export const CLOTH_COLORS = [
  { id: 'default', label: '기본 튜닉', color: '#ffffff' },
  { id: '#3b82f6', label: '푸른빛', color: '#3b82f6' },
  { id: '#ea580c', label: '오렌지', color: '#ea580c' },
  { id: '#eab308', label: '황금빛', color: '#eab308' },
  { id: '#16a34a', label: '초록빛', color: '#16a34a' },
  { id: '#9333ea', label: '자줏빛', color: '#9333ea' },
  { id: '#e11d48', label: '붉은빛', color: '#e11d48' }
];

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.selectedChar = AVATAR_CHARACTERS[0];
    this.selectedAcc = ACCESSORIES[0];
    this.selectedEquip = EQUIPMENTS[0];
    this.selectedColor = CLOTH_COLORS[0];
    this.nickname = '믿음이';

    // 4프레임 보행 스프라이트 시트 로드
    this.walkSheet = new Image();
    this.isSheetLoaded = false;
    this.walkSheet.src = './src/assets/walk_cycle_sheet.png';
    this.walkSheet.onload = () => {
      this.isSheetLoaded = true;
    };

    this.previewCanvas = document.getElementById('avatar-preview-canvas');
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
    }

    this.frameIndex = 0;
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
      });
    }

    this.renderCharacters();
    this.renderAccessories();
    this.renderEquipments();
    this.renderColors();

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
            accessory: this.selectedAcc,
            equipment: this.selectedEquip,
            color: this.selectedColor
          });
        }
      });
    }
  }

  renderCharacters() {
    const container = document.getElementById('char-options-grid');
    if (!container) return;
    container.innerHTML = '';

    AVATAR_CHARACTERS.forEach(char => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `custom-badge-btn ${this.selectedChar.id === char.id ? 'active' : ''}`;
      btn.innerHTML = `<strong>${char.name}</strong><span>${char.title}</span>`;
      btn.addEventListener('click', () => {
        this.selectedChar = char;
        container.querySelectorAll('.custom-badge-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      container.appendChild(btn);
    });
  }

  renderAccessories() {
    this.buildButtonRow('accessory-options-row', ACCESSORIES, 'selectedAcc');
  }

  renderEquipments() {
    this.buildButtonRow('equipment-options-row', EQUIPMENTS, 'selectedEquip');
  }

  renderColors() {
    const container = document.getElementById('color-options-row');
    if (!container) return;
    container.innerHTML = '';

    CLOTH_COLORS.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `custom-color-btn ${this.selectedColor.id === item.id ? 'active' : ''}`;
      btn.innerHTML = `<span class="color-dot" style="background:${item.color}"></span> ${item.label}`;
      btn.addEventListener('click', () => {
        this.selectedColor = item;
        container.querySelectorAll('.custom-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      container.appendChild(btn);
    });
  }

  buildButtonRow(containerId, list, targetKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    list.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this[targetKey].id === item.id;
      btn.className = `custom-pill-btn ${isActive ? 'active' : ''}`;
      btn.innerHTML = `<span>${item.icon}</span> ${item.label}`;
      btn.addEventListener('click', () => {
        this[targetKey] = item;
        container.querySelectorAll('.custom-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      container.appendChild(btn);
    });
  }

  startAnimation() {
    // 0.13초마다 실제 4프레임 보행 전환
    this.animTimer = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % 4;
      this.drawPreview();
    }, 130);
  }

  stopAnimation() {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
  }

  drawPreview() {
    if (!this.previewCtx || !this.previewCanvas) return;
    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 배경 밝은 그라데이션
    const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 130);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 75, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4프레임 보행 스프라이트 렌더링
    if (this.isSheetLoaded) {
      const frameW = 150;
      const frameH = 180;
      const srcX = this.frameIndex * frameW;
      const targetW = 120;
      const targetH = 144;
      const targetX = (w - targetW) / 2;
      const targetY = h / 2 - 70;

      ctx.save();

      // 의상 색상 틴트 적용 (기본이 아닐 경우)
      ctx.drawImage(
        this.walkSheet,
        srcX, 0, frameW, frameH,
        targetX, targetY, targetW, targetH
      );

      // 머리 장식 악세서리 오버레이
      if (this.selectedAcc && this.selectedAcc.id !== 'none') {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.selectedAcc.icon, w / 2 + 15, targetY + 18);
      }

      // 손 장비 소품 오버레이
      if (this.selectedEquip && this.selectedEquip.id !== 'none') {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.selectedEquip.icon, targetX + 10, targetY + 110);
      }

      ctx.restore();
    }

    // 머리 위 닉네임 태그
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const nick = this.nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - textWidth / 2 - 10, h - 38, textWidth + 20, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, w / 2, h - 20);
  }
}
