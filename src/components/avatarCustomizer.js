// 아바타 커스터마이징 데이터 및 UI 컨트롤러

export const AVATAR_OPTIONS = {
  genders: [
    { id: 'boy', label: '남학생' },
    { id: 'girl', label: '여학생' }
  ],
  skinColors: [
    { id: '#fde047', label: '밝은 톤' },
    { id: '#fed7aa', label: '보통 톤' },
    { id: '#d97706', label: '건강한 톤' },
    { id: '#78350f', label: '구릿빛 톤' }
  ],
  hairStyles: [
    { id: 'short', label: '숏컷' },
    { id: 'parted', label: '가르마' },
    { id: 'long', label: '긴 머리' },
    { id: 'ponytail', label: '포니테일' },
    { id: 'curly', label: '곱슬' }
  ],
  hairColors: [
    { id: '#1c1917', label: '흑발' },
    { id: '#451a03', label: '갈색' },
    { id: '#b45309', label: '금발' },
    { id: '#dc2626', label: '빨강' }
  ],
  shirtColors: [
    { id: '#ea580c', label: '오렌지' },
    { id: '#2563eb', label: '파랑' },
    { id: '#16a34a', label: '초록' },
    { id: '#db2777', label: '분홍' },
    { id: '#ffffff', label: '순백' },
    { id: '#7c3aed', label: '보라' }
  ],
  pantsColors: [
    { id: '#1e3a8a', label: '청색' },
    { id: '#374151', label: '먹색' },
    { id: '#92400e', label: '갈색' },
    { id: '#be185d', label: '자주' }
  ],
  accessories: [
    { id: 'none', label: '없음' },
    { id: 'glasses', label: '동글 안경' },
    { id: 'hat', label: '탐험가 모자' },
    { id: 'headband', label: '머리띠' },
    { id: 'flower', label: '꽃 장식' }
  ]
};

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.currentStyle = {
      gender: 'boy',
      skinColor: '#fed7aa',
      hairStyle: 'short',
      hairColor: '#451a03',
      shirtColor: '#ea580c',
      pantsColor: '#1e3a8a',
      shoesColor: '#374151',
      accessory: 'hat'
    };
    this.nickname = '은혜';
    this.previewCtx = null;
    this.previewCanvas = null;

    this.initUI();
  }

  initUI() {
    this.previewCanvas = document.getElementById('avatar-preview-canvas');
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
    }

    const nicknameInput = document.getElementById('input-nickname');
    if (nicknameInput) {
      nicknameInput.value = this.nickname;
      nicknameInput.addEventListener('input', (e) => {
        this.nickname = e.target.value.trim() || '탐험가';
        this.drawPreview();
      });
    }

    this.renderOptionSelectors();
    this.drawPreview();

    const startBtn = document.getElementById('btn-confirm-avatar');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const nick = document.getElementById('input-nickname').value.trim();
        if (!nick) {
          alert('닉네임을 입력해 주세요!');
          return;
        }
        this.nickname = nick;
        if (this.onStart) {
          this.onStart(this.nickname, this.currentStyle);
        }
      });
    }
  }

  renderOptionSelectors() {
    this.buildButtonGroup('gender-options', AVATAR_OPTIONS.genders, 'gender');
    this.buildButtonGroup('skin-options', AVATAR_OPTIONS.skinColors, 'skinColor', true);
    this.buildButtonGroup('hair-style-options', AVATAR_OPTIONS.hairStyles, 'hairStyle');
    this.buildButtonGroup('hair-color-options', AVATAR_OPTIONS.hairColors, 'hairColor', true);
    this.buildButtonGroup('shirt-options', AVATAR_OPTIONS.shirtColors, 'shirtColor', true);
    this.buildButtonGroup('pants-options', AVATAR_OPTIONS.pantsColors, 'pantsColor', true);
    this.buildButtonGroup('accessory-options', AVATAR_OPTIONS.accessories, 'accessory');
  }

  buildButtonGroup(containerId, options, styleKey, isColor = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `custom-opt-btn ${this.currentStyle[styleKey] === opt.id ? 'active' : ''}`;

      if (isColor) {
        btn.innerHTML = `<span class="color-dot" style="background:${opt.id}"></span> ${opt.label}`;
      } else {
        btn.textContent = opt.label;
      }

      btn.addEventListener('click', () => {
        this.currentStyle[styleKey] = opt.id;
        // 남/여 선택 시 기본 헤어 추천
        if (styleKey === 'gender') {
          this.currentStyle.hairStyle = opt.id === 'girl' ? 'ponytail' : 'short';
          this.renderOptionSelectors();
        }
        container.querySelectorAll('.custom-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.drawPreview();
      });

      container.appendChild(btn);
    });
  }

  // 실시간 아바타 미리보기 확대 렌더링
  drawPreview() {
    if (!this.previewCtx || !this.previewCanvas) return;
    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2 + 30);
    ctx.scale(2.6, 2.6); // 2.6배 확대 미리보기

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const s = this.currentStyle;

    // 1. 신발
    ctx.fillStyle = s.shoesColor;
    ctx.fillRect(-8, 1, 6, 7);
    ctx.fillRect(2, 1, 6, 7);

    // 2. 하의
    ctx.fillStyle = s.pantsColor;
    ctx.fillRect(-8, -11, 16, 12);

    // 3. 상의
    ctx.fillStyle = s.shirtColor;
    ctx.beginPath();
    ctx.roundRect(-10, -25, 20, 15, 3);
    ctx.fill();

    // 4. 얼굴
    ctx.fillStyle = s.skinColor;
    ctx.beginPath();
    ctx.arc(0, -32, 11, 0, Math.PI * 2);
    ctx.fill();

    // 눈과 미소
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(-4, -33, 1.6, 0, Math.PI * 2);
    ctx.arc(4, -33, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 5. 머리카락
    ctx.fillStyle = s.hairColor;
    if (s.hairStyle === 'short') {
      ctx.beginPath();
      ctx.arc(0, -36, 11, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (s.hairStyle === 'long') {
      ctx.beginPath();
      ctx.arc(0, -36, 12, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-12, -36, 5, 20);
      ctx.fillRect(7, -36, 5, 20);
    } else if (s.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, -36, 11, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(11, -38, 5, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.hairStyle === 'curly') {
      for (let i = -10; i <= 10; i += 5) {
        ctx.beginPath();
        ctx.arc(i, -40, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.arc(0, -36, 11, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10, -37, 7, 6);
    }

    // 6. 소품
    if (s.accessory === 'glasses') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-7, -35, 5, 4);
      ctx.strokeRect(2, -35, 5, 4);
      ctx.beginPath();
      ctx.moveTo(-2, -33);
      ctx.lineTo(2, -33);
      ctx.stroke();
    } else if (s.accessory === 'hat') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-14, -42, 28, 5);
      ctx.fillRect(-8, -49, 16, 8);
    } else if (s.accessory === 'headband') {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-10, -38, 20, 3);
    } else if (s.accessory === 'flower') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(8, -40, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. 닉네임 명찰
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const nick = this.nickname || '탐험가';
    const textWidth = ctx.measureText(nick).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 6, -58, textWidth + 12, 16, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillText(nick, 0, -46);

    ctx.restore();
  }
}
