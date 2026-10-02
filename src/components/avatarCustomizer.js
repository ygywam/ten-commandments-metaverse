// 8인 8색 성경 탐험가 고화질 아바타 & 파츠 커스터마이저 모듈

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

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.selectedChar = AVATAR_CHARACTERS[0]; // 기본 갈렙
    this.selectedAcc = ACCESSORIES[0];
    this.selectedEquip = EQUIPMENTS[0];
    this.nickname = '믿음이';

    // 8인 고화질 투명 아틀라스 로드 (화살표 100% 제거)
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
    this.renderAccessories();
    this.renderEquipments();

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
            equipment: this.selectedEquip
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

      // 미니 썸네일 캔버스
      const mini = document.createElement('canvas');
      mini.width = 44;
      mini.height = 54;
      const mCtx = mini.getContext('2d');

      if (this.isAtlasLoaded) {
        mCtx.drawImage(
          this.atlas,
          char.index * 132, 0, 132, 187,
          0, 0, 44, 54
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

  renderAccessories() {
    this.buildButtonRow('accessory-options-row', ACCESSORIES, 'selectedAcc');
  }

  renderEquipments() {
    this.buildButtonRow('equipment-options-row', EQUIPMENTS, 'selectedEquip');
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

    // 걸음 모션 계산 (상하 밥빙 & 좌우 스텝 틸트)
    const bob = Math.abs(Math.sin(this.walkCycle)) * 6;
    const tilt = Math.sin(this.walkCycle) * 0.05;

    // 그림자
    const shadowScale = 1 - bob * 0.04;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 75, 38 * shadowScale, 13 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    const char = this.selectedChar;
    const targetW = 110;
    const targetH = 156;
    const targetX = -targetW / 2;
    const targetY = -targetH;

    ctx.save();
    ctx.translate(w / 2, h / 2 + 70 - bob);
    ctx.rotate(tilt);

    // 선택된 캐릭터의 고유 고화질 스프라이트 렌더링 (화살표 없는 100% 투명 누끼)
    ctx.drawImage(
      this.atlas,
      char.index * 132, 0, 132, 187,
      targetX, targetY, targetW, targetH
    );

    // 머리 장식 악세서리
    if (this.selectedAcc && this.selectedAcc.id !== 'none') {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.selectedAcc.icon, 12, targetY + 24);
    }

    // 소품 장비
    if (this.selectedEquip && this.selectedEquip.id !== 'none') {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.selectedEquip.icon, targetX + 12, targetY + 118);
    }

    ctx.restore();

    // 머리 위 닉네임 태그
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    const nick = this.nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = char.color || '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - textWidth / 2 - 10, h - 38, textWidth + 20, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, w / 2, h - 20);
  }
}
