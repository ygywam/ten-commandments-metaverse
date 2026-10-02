// 2D 카메라 시스템 (마우스 휠 줌 & 캐릭터 관찰 타겟팅 지원)

export class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
    this.targetZoom = 1.35;
    this.zoom = 1.35;
    this.minZoom = 0.22;
    this.maxZoom = 2.6;
    this.lerpSpeed = 0.12;

    this.mode = 'follow'; // 'follow' (캐릭터 추적) 또는 'overview' (배경 고정 관제)
    this.followTarget = null; // 특정 학생 관찰 대상 { x, y }
  }

  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    if (this.mode === 'overview') {
      this.calculateOverviewZoom();
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (this.mode === 'overview') {
      this.calculateOverviewZoom();
      this.followTarget = null;
    } else {
      this.targetZoom = 1.35;
    }
  }

  // 특정 캐릭터 관찰 모드
  setFollowTarget(target) {
    this.followTarget = target;
    this.mode = 'follow';
    this.targetZoom = 1.45; // 캐릭터 관찰 시 선명하게 확대
  }

  clearFollowTarget() {
    this.followTarget = null;
    this.mode = 'overview';
    this.calculateOverviewZoom();
  }

  calculateOverviewZoom() {
    const zoomX = this.viewportWidth / this.worldWidth;
    const zoomY = this.viewportHeight / this.worldHeight;
    this.targetZoom = Math.min(zoomX, zoomY) * 0.98;
  }

  // 마우스 휠 줌 조절
  handleWheel(deltaY) {
    const factor = deltaY < 0 ? 1.15 : 0.87;
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * factor));
  }

  zoomIn() {
    this.targetZoom = Math.min(this.maxZoom, this.targetZoom * 1.2);
  }

  zoomOut() {
    this.targetZoom = Math.max(this.minZoom, this.targetZoom * 0.83);
  }

  update(playerX, playerY) {
    // 줌 스무스 보간
    this.zoom += (this.targetZoom - this.zoom) * 0.12;

    // 관찰 대상 결정 (선택된 캐릭터 또는 로컬 플레이어)
    const target = this.followTarget || (this.mode === 'follow' ? { x: playerX, y: playerY } : null);

    if (this.mode === 'overview' && !this.followTarget) {
      // 배경 고정 (맵 중심)
      this.x += (this.worldWidth / 2 - this.x) * this.lerpSpeed;
      this.y += (this.worldHeight / 2 - this.y) * this.lerpSpeed;
    } else if (target) {
      // 캐릭터 스무스 추적
      this.x += (target.x - this.x) * this.lerpSpeed;
      this.y += (target.y - this.y) * this.lerpSpeed;

      // 맵 경계 클램핑
      const visibleWidth = this.viewportWidth / this.zoom;
      const visibleHeight = this.viewportHeight / this.zoom;

      const minX = visibleWidth / 2;
      const maxX = Math.max(minX, this.worldWidth - visibleWidth / 2);
      const minY = visibleHeight / 2;
      const maxY = Math.max(minY, this.worldHeight - visibleHeight / 2);

      this.x = Math.max(minX, Math.min(maxX, this.x));
      this.y = Math.max(minY, Math.min(maxY, this.y));
    }
  }

  // 화면 좌표를 월드 좌표로 변환 (클릭 대상 감지용)
  screenToWorld(screenX, screenY) {
    const worldX = (screenX - this.viewportWidth / 2) / this.zoom + this.x;
    const worldY = (screenY - this.viewportHeight / 2) / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }

  applyTransform(ctx) {
    ctx.save();
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  restoreTransform(ctx) {
    ctx.restore();
  }
}
