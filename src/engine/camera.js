// 2D 카메라 시스템 (마우스 휠 줌 & 캐릭터 관찰 타겟팅 지원)

export class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
    this.updateMinZoom();
    this.maxZoom = 2.5;
    this.lerpSpeed = 0.12;

    this.mode = 'follow'; // 'follow' (캐릭터 추적) 또는 'overview' (배경 고정 관제)
    this.followTarget = null; // 특정 학생 관찰 대상 { x, y }

    const defaultFollowZoom = this.getDefaultFollowZoom();
    this.targetZoom = defaultFollowZoom;
    this.zoom = defaultFollowZoom;
  }

  // 화면 바깥의 흰 여백이 절대 노출되지 않도록 가로/세로 최대 커버 비율로 최소 줌 제한
  updateMinZoom() {
    const coverZoom = Math.max(
      this.viewportWidth / this.worldWidth,
      this.viewportHeight / this.worldHeight
    );
    this.minZoom = coverZoom;
    if (this.targetZoom < this.minZoom) {
      this.targetZoom = this.minZoom;
    }
    if (this.zoom < this.minZoom) {
      this.zoom = this.minZoom;
    }
  }

  getDefaultFollowZoom() {
    // 모바일 가로 화면(폭 950px 미만 또는 높이 550px 미만)에서는 광야 맵이 너무 확대되지 않고 시원하게 넓은 지형이 보이도록 0.30 배율 설정
    const isMobileSize = this.viewportWidth < 950 || this.viewportHeight < 550;
    const baseFollowZoom = isMobileSize ? 0.30 : 0.85;
    return Math.max(this.minZoom, baseFollowZoom);
  }

  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.updateMinZoom();
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
      this.targetZoom = this.getDefaultFollowZoom();
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
    this.updateMinZoom();
    // 전체 뷰에서도 화면 바깥 흰 여백이 생기지 않도록 minZoom(커버 배율) 적용
    this.targetZoom = this.minZoom;
  }

  // 마우스 휠 줌 조절
  handleWheel(deltaY) {
    this.updateMinZoom();
    const factor = deltaY < 0 ? 1.15 : 0.87;
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * factor));
  }

  zoomIn() {
    this.updateMinZoom();
    this.targetZoom = Math.min(this.maxZoom, this.targetZoom * 1.2);
  }

  zoomOut() {
    this.updateMinZoom();
    this.targetZoom = Math.max(this.minZoom, this.targetZoom * 0.83);
  }

  update(playerX, playerY) {
    this.updateMinZoom();
    // 줌 스무스 보간
    this.zoom += (this.targetZoom - this.zoom) * 0.12;
    if (this.zoom < this.minZoom) {
      this.zoom = this.minZoom;
    }

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
    }

    // 맵 경계 클램핑 (어떤 줌 배율에서도 카메라 뷰포트가 맵 바깥으로 나가지 않도록 고정)
    const visibleWidth = this.viewportWidth / this.zoom;
    const visibleHeight = this.viewportHeight / this.zoom;

    if (visibleWidth >= this.worldWidth) {
      this.x = this.worldWidth / 2;
    } else {
      const minX = visibleWidth / 2;
      const maxX = this.worldWidth - visibleWidth / 2;
      this.x = Math.max(minX, Math.min(maxX, this.x));
    }

    if (visibleHeight >= this.worldHeight) {
      this.y = this.worldHeight / 2;
    } else {
      const minY = visibleHeight / 2;
      const maxY = this.worldHeight - visibleHeight / 2;
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
