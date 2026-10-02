// 2D 카메라 시스템 (교사용 전체 조망 뷰 vs 학생용 클로즈업 팔로우 뷰)

export class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
    this.targetZoom = 1.35; // 학생용 클로즈업 줌 (기본값)
    this.zoom = 1.35;
    this.lerpSpeed = 0.1;
    this.mode = 'follow'; // 'follow' (학생) 또는 'overview' (교사 전체 뷰)
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
    } else {
      this.targetZoom = 1.35; // 학생 클로즈업
    }
  }

  calculateOverviewZoom() {
    // 맵 전체가 화면 안에 쏙 들어오도록 줌 계산
    const zoomX = this.viewportWidth / this.worldWidth;
    const zoomY = this.viewportHeight / this.worldHeight;
    this.targetZoom = Math.min(zoomX, zoomY) * 0.96;
  }

  update(targetX, targetY) {
    // 줌 스무스 보간
    this.zoom += (this.targetZoom - this.zoom) * 0.08;

    if (this.mode === 'overview') {
      // 맵 중앙 고정
      this.x += (this.worldWidth / 2 - this.x) * this.lerpSpeed;
      this.y += (this.worldHeight / 2 - this.y) * this.lerpSpeed;
    } else {
      // 플레이어 추적
      this.x += (targetX - this.x) * this.lerpSpeed;
      this.y += (targetY - this.y) * this.lerpSpeed;

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
