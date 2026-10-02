// 2D 카메라 시스템 (스무스 추적 및 월드 경계 클램프)

export class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
    this.zoom = 1.0;
    this.lerpSpeed = 0.1; // 부드러운 카메라 추적 계수
  }

  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setZoom(zoom) {
    this.zoom = zoom;
  }

  update(targetX, targetY) {
    // 부드러운 타겟 추적
    this.x += (targetX - this.x) * this.lerpSpeed;
    this.y += (targetY - this.y) * this.lerpSpeed;

    // 카메라 경계 제한 (맵 밖으로 나가지 않도록 클램핑)
    const visibleWidth = this.viewportWidth / this.zoom;
    const visibleHeight = this.viewportHeight / this.zoom;

    const minX = visibleWidth / 2;
    const maxX = Math.max(minX, this.worldWidth - visibleWidth / 2);
    const minY = visibleHeight / 2;
    const maxY = Math.max(minY, this.worldHeight - visibleHeight / 2);

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }

  // 캔버스 컨텍스트 변환 적용
  applyTransform(ctx) {
    ctx.save();
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  // 캔버스 컨텍스트 복원
  restoreTransform(ctx) {
    ctx.restore();
  }
}
