// 실시간 애니메이션 아바타 커스터마이저 모듈
import { avatarRenderer } from '../engine/avatarRenderer.js';

export const AVATAR_PRESETS = [
  {
    id: 'boy_blue_band',
    name: '갈렙',
    desc: '푸른 머리띠와 크로스백',
    style: {
      skinColor: '#fed7aa', hairColor: '#3d2314', hairStyle: 'band_boy',
      shirtColor: '#ffffff', pantsColor: '#2563eb', pantsType: 'skirt',
      robeColor: null, headgear: 'blue_band', accessory: 'bag', shoesColor: '#78350f'
    }
  },
  {
    id: 'girl_white_veil',
    name: '리브가',
    desc: '순백 수건과 분홍 튜닉',
    style: {
      skinColor: '#fed7aa', hairColor: '#27170c', hairStyle: 'veil_girl',
      shirtColor: '#f43f5e', pantsColor: '#be123c', pantsType: 'skirt',
      robeColor: null, headgear: 'white_veil', accessory: 'bag', shoesColor: '#78350f'
    }
  },
  {
    id: 'boy_shepherd_green',
    name: '다윗',
    desc: '초록 망토와 목자의 지팡이',
    style: {
      skinColor: '#fed7aa', hairColor: '#78350f', hairStyle: 'curly_boy',
      shirtColor: '#fef08a', pantsColor: '#65a30d', pantsType: 'skirt',
      robeColor: '#4d7c0f', headgear: 'none', accessory: 'staff', shoesColor: '#78350f'
    }
  },
  {
    id: 'girl_braid_yellow',
    name: '미리암',
    desc: '땋은머리와 금빛 머리띠',
    style: {
      skinColor: '#fed7aa', hairColor: '#1c1917', hairStyle: 'braided_girl',
      shirtColor: '#eab308', pantsColor: '#a16207', pantsType: 'skirt',
      robeColor: null, headgear: 'gold_band', accessory: 'bag', shoesColor: '#78350f'
    }
  },
  {
    id: 'boy_desert_turban',
    name: '여호수아',
    desc: '사막 케피예와 탐험 침낭',
    style: {
      skinColor: '#d97706', hairColor: '#1c1917', hairStyle: 'short',
      shirtColor: '#f8fafc', pantsColor: '#dc2626', pantsType: 'skirt',
      robeColor: '#b91c1c', headgear: 'turban_white', accessory: 'bedroll', shoesColor: '#451a03'
    }
  },
  {
    id: 'girl_blue_scarf',
    name: '에스더',
    desc: '주황 양갈래와 하늘색 숄',
    style: {
      skinColor: '#fed7aa', hairColor: '#ea580c', hairStyle: 'twin_orange',
      shirtColor: '#38bdf8', pantsColor: '#0284c7', pantsType: 'skirt',
      robeColor: '#0ea5e9', headgear: 'none', accessory: 'bag', shoesColor: '#78350f'
    }
  },
  {
    id: 'boy_striped_keffiyeh',
    name: '요셉',
    desc: '채색옷과 푸른 케피예',
    style: {
      skinColor: '#fed7aa', hairColor: '#292524', hairStyle: 'short',
      shirtColor: '#2563eb', pantsColor: '#1d4ed8', pantsType: 'pants',
      robeColor: null, headgear: 'striped_keffiyeh', accessory: 'bag', shoesColor: '#451a03'
    }
  },
  {
    id: 'girl_purple_hood',
    name: '드보라',
    desc: '보라 후드와 지혜의 지팡이',
    style: {
      skinColor: '#fed7aa', hairColor: '#451a03', hairStyle: 'braided_girl',
      shirtColor: '#9333ea', pantsColor: '#7e22ce', pantsType: 'skirt',
      robeColor: '#a855f7', headgear: 'purple_hood', accessory: 'staff', shoesColor: '#451a03'
    }
  }
];

export const CUSTOM_PARTS = {
  headgears: [
    { id: 'none', label: '모자 없음' },
    { id: 'blue_band', label: '푸른 머리띠' },
    { id: 'white_veil', label: '순백 수건' },
    { id: 'turban_white', label: '사막 케피예' },
    { id: 'striped_keffiyeh', label: '줄무늬 터번' },
    { id: 'purple_hood', label: '보라 후드' },
    { id: 'gold_band', label: '금빛 머리띠' }
  ],
  accessories: [
    { id: 'none', label: '소품 없음' },
    { id: 'staff', label: '목자의 지팡이' },
    { id: 'bag', label: '가죽 크로스백' },
    { id: 'bedroll', label: '탐험가 침낭' }
  ],
  shirtColors: [
    { id: '#ffffff', label: '순백' },
    { id: '#ea580c', label: '오렌지' },
    { id: '#fef08a', label: '황금' },
    { id: '#2563eb', label: '청색' },
    { id: '#9333ea', label: '자주' },
    { id: '#16a34a', label: '녹색' },
    { id: '#f43f5e', label: '분홍' }
  ],
  robes: [
    { id: null, label: '망토 없음' },
    { id: '#4d7c0f', label: '초록 망토' },
    { id: '#0ea5e9', label: '하늘색 숄' },
    { id: '#b91c1c', label: '붉은 망토' },
    { id: '#a855f7', label: '보라 망토' }
  ]
};

export class AvatarCustomizer {
  constructor(onStartCallback) {
    this.onStart = onStartCallback;
    this.currentPreset = AVATAR_PRESETS[0];
    this.currentStyle = { ...this.currentPreset.style };
    this.nickname = '믿음이';

    this.previewCanvas = document.getElementById('avatar-preview-canvas');
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
    }

    this.walkCycle = 0;
    this.animId = null;

    this.initUI();
    this.startPreviewLoop();
  }

  initUI() {
    const nickInput = document.getElementById('input-nickname');
    if (nickInput) {
      nickInput.value = this.nickname;
      nickInput.addEventListener('input', (e) => {
        this.nickname = e.target.value.trim() || '탐험가';
      });
    }

    this.renderPresets();
    this.renderCustomControls();

    const startBtn = document.getElementById('btn-confirm-avatar');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const val = nickInput ? nickInput.value.trim() : '';
        if (!val) {
          alert('닉네임을 입력해 주세요!');
          return;
        }
        this.stopPreviewLoop();
        if (this.onStart) {
          this.onStart(val, this.currentStyle);
        }
      });
    }
  }

  renderPresets() {
    const container = document.getElementById('preset-cards-container');
    if (!container) return;
    container.innerHTML = '';

    AVATAR_PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `preset-badge-btn ${this.currentPreset.id === preset.id ? 'active' : ''}`;
      btn.innerHTML = `<strong>${preset.name}</strong><span>${preset.desc}</span>`;

      btn.addEventListener('click', () => {
        this.currentPreset = preset;
        this.currentStyle = { ...preset.style };
        container.querySelectorAll('.preset-badge-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderCustomControls();
      });

      container.appendChild(btn);
    });
  }

  renderCustomControls() {
    this.buildButtonRow('headgear-options', CUSTOM_PARTS.headgears, 'headgear');
    this.buildButtonRow('accessory-options', CUSTOM_PARTS.accessories, 'accessory');
    this.buildButtonRow('shirt-options', CUSTOM_PARTS.shirtColors, 'shirtColor', true);
    this.buildButtonRow('robe-options', CUSTOM_PARTS.robes, 'robeColor', true);
  }

  buildButtonRow(containerId, list, key, isColor = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    list.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this.currentStyle[key] === item.id;
      btn.className = `custom-opt-btn ${isActive ? 'active' : ''}`;

      if (isColor && item.id) {
        btn.innerHTML = `<span class="color-dot" style="background:${item.id}"></span> ${item.label}`;
      } else {
        btn.textContent = item.label;
      }

      btn.addEventListener('click', () => {
        this.currentStyle[key] = item.id;
        container.querySelectorAll('.custom-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });

      container.appendChild(btn);
    });
  }

  // 실시간 보행 애니메이션 프리뷰 루프
  startPreviewLoop() {
    const loop = () => {
      this.walkCycle += 0.08;
      this.drawPreview();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stopPreviewLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  drawPreview() {
    if (!this.previewCtx || !this.previewCanvas) return;
    const ctx = this.previewCtx;
    const w = this.previewCanvas.width;
    const h = this.previewCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const mockPlayer = {
      x: w / 2,
      y: h / 2 + 50,
      nickname: this.nickname,
      isMoving: true, // 프리뷰에서 귀엽게 걷는 중!
      walkCycle: this.walkCycle,
      style: this.currentStyle
    };

    avatarRenderer.draw(ctx, mockPlayer, 2.2); // 2.2배 크기로 시원하게 렌더링
  }
}
