// PC 키보드 및 모바일 터치 조이스틱 통합 입력기

export class InputController {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };

    // 조이스틱 벡터 (-1.0 ~ 1.0)
    this.joystickVector = { x: 0, y: 0 };
    this.isJoystickActive = false;

    // 조이스틱 DOM 요소
    this.joystickZone = null;
    this.joystickBase = null;
    this.joystickStick = null;
    this.touchId = null;
    this.baseCenter = { x: 0, y: 0 };
    this.maxRadius = 45; // 조이스틱 가동 반경(px)

    this.initKeyboard();
    this.initTouchControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // 방향키 스크롤 방지
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = true;
          break;
        case 'KeyE':
        case 'Space':
          this.keys.action = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'KeyE':
        case 'Space':
          this.keys.action = false;
          break;
      }
    });
  }

  initTouchControls() {
    this.joystickZone = document.getElementById('joystick-zone');
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickStick = document.getElementById('joystick-stick');
    const actionBtn = document.getElementById('btn-mobile-action');

    if (!this.joystickZone || !actionBtn) return;

    // 조이스틱 터치 시작
    this.joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.isJoystickActive) return;

      const touch = e.changedTouches[0];
      this.touchId = touch.identifier;
      this.isJoystickActive = true;

      const rect = this.joystickZone.getBoundingClientRect();
      this.baseCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      this.updateStickPosition(touch.clientX, touch.clientY);
    }, { passive: false });

    // 조이스틱 드래그
    window.addEventListener('touchmove', (e) => {
      if (!this.isJoystickActive) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchId) {
          this.updateStickPosition(touch.clientX, touch.clientY);
          break;
        }
      }
    }, { passive: false });

    // 조이스틱 터치 종료
    const endTouch = (e) => {
      if (!this.isJoystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.isJoystickActive = false;
          this.touchId = null;
          this.joystickVector = { x: 0, y: 0 };
          if (this.joystickStick) {
            this.joystickStick.style.transform = `translate(0px, 0px)`;
          }
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);

    // 모바일 상호작용 액션 버튼
    actionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.action = true;
    }, { passive: false });

    actionBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.action = false;
    }, { passive: false });
  }

  updateStickPosition(clientX, clientY) {
    const dx = clientX - this.baseCenter.x;
    const dy = clientY - this.baseCenter.y;
    const dist = Math.hypot(dx, dy);

    let angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, this.maxRadius);

    const stickX = Math.cos(angle) * clampedDist;
    const stickY = Math.sin(angle) * clampedDist;

    if (this.joystickStick) {
      this.joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;
    }

    // 정규화된 벡터 계산 (-1.0 ~ 1.0)
    const factor = clampedDist / this.maxRadius;
    this.joystickVector = {
      x: Math.cos(angle) * factor,
      y: Math.sin(angle) * factor
    };
  }

  // 최종 이동 방향 및 강도 반환 { dx, dy }
  getMovement() {
    let dx = 0;
    let dy = 0;

    // 1. 키보드 입력 반영
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;
    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;

    // 대각선 이동 정규화
    if (dx !== 0 && dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    // 2. 가상 조이스틱 입력 합산
    if (this.isJoystickActive) {
      dx += this.joystickVector.x;
      dy += this.joystickVector.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 1) {
        dx /= mag;
        dy /= mag;
      }
    }

    return { dx, dy, action: this.keys.action };
  }
}
