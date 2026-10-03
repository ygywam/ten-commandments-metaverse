// 모세의 십계명 돌판 봉헌 모달, 완성 세레머니 및 수료증 발급 컴포넌트
import { COMMANDMENTS_DATA } from '../data/commandmentsData.js';
import { sound } from '../engine/soundEngine.js';

export class TabletModal {
  constructor(onCompleteCeremony) {
    this.onCompleteCeremony = onCompleteCeremony;
    this.isOpen = false;
    this.isCertificateOpen = false;
    this.confettiParticles = [];
    this.confettiAnimId = null;

    this.createDom();
  }

  createDom() {
    // 1. 돌판 모달 DOM 생성
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'tablet-modal';
    this.modalEl.className = 'modal-overlay hidden';
    this.modalEl.innerHTML = `
      <div class="tablet-card">
        <div class="tablet-header">
          <div class="tablet-title-wrap">
            <span class="tablet-icon">⛰️</span>
            <h2>선지자 모세의 십계명 돌판 제단</h2>
          </div>
          <button id="btn-close-tablet" class="close-btn" aria-label="닫기">✕</button>
        </div>

        <div class="moses-dialog-box">
          <div class="moses-avatar-badge">🧔🏽</div>
          <div class="moses-dialog-content">
            <h4 class="moses-name">선지자 모세</h4>
            <p id="moses-message-text">샬롬! 하나님께서 시내산에서 주신 거룩한 십계명 조각을 모두 모아오거라.</p>
          </div>
        </div>

        <div class="tablet-progress-container">
          <div class="tablet-progress-labels">
            <span>계명 봉헌 현황</span>
            <span id="tablet-progress-count"><strong>0</strong> / 10 조각</span>
          </div>
          <div class="tablet-progress-track">
            <div id="tablet-progress-bar" class="tablet-progress-fill" style="width: 0%;"></div>
          </div>
        </div>

        <!-- 십계명 양면 석판 뷰 -->
        <div class="tablets-double-view">
          <!-- 좌측 돌판 (1~5계명) -->
          <div class="single-tablet left-tablet">
            <div class="tablet-arch-top">
              <span class="tablet-numeral">I ~ V</span>
              <span class="tablet-subtitle">하나님 사랑 & 부모 공경</span>
            </div>
            <div id="tablet-slots-left" class="tablet-slots-column"></div>
          </div>

          <!-- 우측 돌판 (6~10계명) -->
          <div class="single-tablet right-tablet">
            <div class="tablet-arch-top">
              <span class="tablet-numeral">VI ~ X</span>
              <span class="tablet-subtitle">이웃 사랑 & 거룩한 삶</span>
            </div>
            <div id="tablet-slots-right" class="tablet-slots-column"></div>
          </div>
        </div>

        <div class="tablet-footer">
          <button id="btn-ceremony-action" class="primary-btn pulse-glow hidden">
            ✨ 거룩한 십계명 돌판 봉헌 세레머니 시작! ✨
          </button>
          <p id="tablet-hint-text" class="tablet-hint">광야 곳곳의 말씀 비석을 찾아 퀴즈를 풀면 계명 조각을 모을 수 있습니다.</p>
        </div>
      </div>
    `;
    document.body.appendChild(this.modalEl);

    // 2. 수료증 모달 DOM 생성
    this.certModalEl = document.createElement('div');
    this.certModalEl.id = 'certificate-modal';
    this.certModalEl.className = 'modal-overlay hidden';
    this.certModalEl.innerHTML = `
      <div class="certificate-card">
        <div class="cert-header">
          <h2>🎉 십계명 탐험 수료를 축하합니다!</h2>
          <button id="btn-close-cert" class="close-btn" aria-label="닫기">✕</button>
        </div>
        <div class="cert-canvas-wrap">
          <canvas id="cert-canvas" width="800" height="560"></canvas>
        </div>
        <div class="cert-actions">
          <button id="btn-download-cert" class="primary-btn">
            📥 수료증 이미지 저장하기 (PNG)
          </button>
          <button id="btn-continue-game" class="secondary-btn">
            광야 계속 탐험하기
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(this.certModalEl);

    // 3. 축하 전체화면 컨페티 캔버스 생성
    this.confettiCanvas = document.createElement('canvas');
    this.confettiCanvas.id = 'confetti-canvas';
    this.confettiCanvas.className = 'confetti-overlay hidden';
    document.body.appendChild(this.confettiCanvas);
    this.confettiCtx = this.confettiCanvas.getContext('2d');

    // 이벤트 리스너 바인딩
    this.bindEvents();
  }

  bindEvents() {
    // 돌판 모달 닫기
    const closeTabletBtn = this.modalEl.querySelector('#btn-close-tablet');
    if (closeTabletBtn) {
      closeTabletBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    // 모달 배경 클릭 시 닫기
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // 봉헌 세레머니 버튼 클릭
    const ceremonyBtn = this.modalEl.querySelector('#btn-ceremony-action');
    if (ceremonyBtn) {
      ceremonyBtn.addEventListener('click', () => {
        this.startCeremony();
      });
    }

    // 수료증 모달 닫기
    const closeCertBtn = this.certModalEl.querySelector('#btn-close-cert');
    if (closeCertBtn) {
      closeCertBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeCertificate();
      });
    }
    const continueBtn = this.certModalEl.querySelector('#btn-continue-game');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.closeCertificate();
      });
    }

    // 수료증 다운로드 버튼
    const downloadBtn = this.certModalEl.querySelector('#btn-download-cert');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadCertificate();
      });
    }

    // ESC 키로 닫기
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isCertificateOpen) {
          this.closeCertificate();
        } else if (this.isOpen) {
          this.close();
        }
      }
    });
  }

  // 돌판 모달 열기
  open(collectedSet, playerNickname = '믿음이') {
    this.isOpen = true;
    this.currentPlayerNickname = playerNickname;
    this.collectedSet = collectedSet;
    this.modalEl.classList.remove('hidden');
    sound.playSelect();

    this.renderTabletSlots();
  }

  // 돌판 모달 닫기
  close() {
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
    sound.playSelect();
  }

  // 10개 계명 슬롯 및 진행률 렌더링
  renderTabletSlots() {
    const leftContainer = this.modalEl.querySelector('#tablet-slots-left');
    const rightContainer = this.modalEl.querySelector('#tablet-slots-right');
    const countEl = this.modalEl.querySelector('#tablet-progress-count');
    const barEl = this.modalEl.querySelector('#tablet-progress-bar');
    const msgEl = this.modalEl.querySelector('#moses-message-text');
    const ceremonyBtn = this.modalEl.querySelector('#btn-ceremony-action');
    const hintEl = this.modalEl.querySelector('#tablet-hint-text');

    const totalCount = 10;
    const collectedCount = this.collectedSet.size;
    const pct = Math.round((collectedCount / totalCount) * 100);

    if (countEl) countEl.innerHTML = `<strong>${collectedCount}</strong> / 10 조각 (${pct}%)`;
    if (barEl) barEl.style.width = `${pct}%`;

    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';

    COMMANDMENTS_DATA.forEach((cmd) => {
      const isCollected = this.collectedSet.has(cmd.id);
      const slotEl = document.createElement('div');
      slotEl.className = `tablet-slot ${isCollected ? 'inscribed' : 'empty'}`;

      slotEl.innerHTML = `
        <div class="slot-num-badge">${cmd.id}</div>
        <div class="slot-info">
          <div class="slot-title">${isCollected ? cmd.title : `제${cmd.id}계명 (미발견)`}</div>
          <div class="slot-verse">${isCollected ? cmd.verse : '광야를 탐험하여 계명 조각을 찾아오세요'}</div>
        </div>
        <div class="slot-status-icon">${isCollected ? '✨' : '🔒'}</div>
      `;

      if (cmd.id <= 5) {
        leftContainer.appendChild(slotEl);
      } else {
        rightContainer.appendChild(slotEl);
      }
    });

    // 모세의 메시지 & 봉헌 버튼 분기
    if (collectedCount >= 10) {
      if (msgEl) {
        msgEl.innerHTML = `<strong>"할렐루야! ${this.currentPlayerNickname}아, 마침내 주님의 십계명이 모두 모였도다! 이제 하나님 앞에 성막과 시내산에서 거룩한 봉헌을 올리자!"</strong>`;
      }
      if (ceremonyBtn) ceremonyBtn.classList.remove('hidden');
      if (hintEl) hintEl.textContent = '아래 봉헌 버튼을 눌러 시내산 축복 세레머니를 시작하세요!';
    } else {
      const remaining = 10 - collectedCount;
      if (msgEl) {
        msgEl.textContent = `샬롬, ${this.currentPlayerNickname}! 현재 ${collectedCount}개의 계명을 찾았구나. 아직 ${remaining}개의 계명이 광야에 남아있단다. 힘을 내거라!`;
      }
      if (ceremonyBtn) ceremonyBtn.classList.add('hidden');
      if (hintEl) hintEl.textContent = '광야 곳곳의 말씀 비석을 찾아 퀴즈를 풀면 계명 조각을 모을 수 있습니다.';
    }
  }

  // 10개 완성 축하 세레머니 가동
  startCeremony() {
    this.close();

    // 1. 웅장한 승리 팡파레 사운드
    sound.playVictory();

    // 2. 전체화면 컨페티(금빛 별 및 무지개 꽃가루) 가동
    this.launchConfetti();

    if (this.onCompleteCeremony) {
      this.onCompleteCeremony();
    }

    // 3. 2.2초 후 수료증 팝업 표시
    setTimeout(() => {
      this.openCertificate();
    }, 2200);
  }

  // 컨페티 애니메이션 실행
  launchConfetti() {
    this.confettiCanvas.classList.remove('hidden');
    this.confettiCanvas.width = window.innerWidth;
    this.confettiCanvas.height = window.innerHeight;

    const colors = ['#f59e0b', '#fbbf24', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ffffff'];
    this.confettiParticles = [];

    for (let i = 0; i < 160; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.confettiCanvas.width,
        y: Math.random() * -this.confettiCanvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    let frames = 0;
    const animate = () => {
      frames++;
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

      this.confettiParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        this.confettiCtx.save();
        this.confettiCtx.translate(p.x, p.y);
        this.confettiCtx.rotate((p.rot * Math.PI) / 180);
        this.confettiCtx.fillStyle = p.color;
        this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.confettiCtx.restore();

        if (p.y > this.confettiCanvas.height) {
          p.y = -10;
          p.x = Math.random() * this.confettiCanvas.width;
        }
      });

      if (frames < 360) {
        this.confettiAnimId = requestAnimationFrame(animate);
      } else {
        this.confettiCanvas.classList.add('hidden');
        cancelAnimationFrame(this.confettiAnimId);
      }
    };

    if (this.confettiAnimId) cancelAnimationFrame(this.confettiAnimId);
    animate();
  }

  // 수료증 모달 열기 & 캔버스 렌더링
  openCertificate() {
    this.isCertificateOpen = true;
    this.certModalEl.classList.remove('hidden');
    sound.playCorrect();

    const canvas = this.certModalEl.querySelector('#cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 수료증 디자인 그리기
    this.drawCertificate(ctx, canvas.width, canvas.height, this.currentPlayerNickname || '믿음이');
  }

  closeCertificate() {
    this.isCertificateOpen = false;
    this.certModalEl.classList.add('hidden');
    sound.playSelect();
  }

  // 고품질 캔버스 수료증 렌더링
  drawCertificate(ctx, w, h, nickname) {
    // 1. 양피지 배경
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fffdfa');
    grad.addColorStop(0.5, '#fef3c7');
    grad.addColorStop(1, '#fef9c3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. 화려한 금빛 이중 테두리
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);

    // 모서리 장식
    const cornerSize = 30;
    const drawCorner = (cx, cy) => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(36, 36);
    drawCorner(w - 36, 36);
    drawCorner(36, h - 36);
    drawCorner(w - 36, h - 36);

    // 3. 상단 엠블럼 및 타이틀
    ctx.textAlign = 'center';

    ctx.font = '28px sans-serif';
    ctx.fillText('⛰️ 📜 ⛰️', w / 2, 70);

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 32px "Malgun Gothic", sans-serif';
    ctx.fillText('십 계 명  탐 험  수 료 증', w / 2, 115);

    ctx.fillStyle = '#92400e';
    ctx.font = '14px sans-serif';
    ctx.fillText('CERTIFICATE OF THE TEN COMMANDMENTS', w / 2, 138);

    // 구분선
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 180, 150);
    ctx.lineTo(w / 2 + 180, 150);
    ctx.stroke();

    // 4. 수료자 이름
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px "Malgun Gothic", sans-serif';
    ctx.fillText(`용감한 성경 탐험가 :  ${nickname}`, w / 2, 195);

    // 5. 수료 본문
    ctx.fillStyle = '#334155';
    ctx.font = '16px "Malgun Gothic", sans-serif';
    ctx.fillText('위 어린이는 시내산 광야 메타버스 대탐험에 성실히 참여하여,', w / 2, 240);
    ctx.fillText('하나님께서 주신 거룩한 십계명 10가지를 모두 배우고 마음에 새겼으므로', w / 2, 270);
    ctx.fillText('주님의 사랑과 축복을 담아 이 수료증을 수여합니다.', w / 2, 300);

    // 6. 10대 계명 수료 확인 뱃지 그리드 (5x2)
    const startX = 75;
    const startY = 330;
    const slotW = 126;
    const slotH = 46;

    COMMANDMENTS_DATA.forEach((cmd, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const bx = startX + col * (slotW + 6);
      const by = startY + row * (slotH + 8);

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(bx, by, slotW, slotH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`제${cmd.id}계명 ✔`, bx + 8, by + 18);

      ctx.fillStyle = '#713f12';
      ctx.font = '10px sans-serif';
      const shortDesc = cmd.title.split(':')[1]?.trim() || '';
      ctx.fillText(shortDesc.substring(0, 9), bx + 8, by + 34);
    });

    // 7. 하단 날짜 및 발행인
    const now = new Date();
    const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText(dateStr, w / 2, 460);

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 18px "Malgun Gothic", sans-serif';
    ctx.fillText('시내산 성막 메타버스 본부 · 선지자 모세', w / 2, 495);

    // 모세 직인(스탬프) 연출
    ctx.save();
    ctx.translate(w / 2 + 180, 485);
    ctx.rotate(-0.1);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('모세', 0, -4);
    ctx.fillText('직인', 0, 14);
    ctx.restore();
  }

  // 수료증 PNG 다운로드
  downloadCertificate() {
    const canvas = this.certModalEl.querySelector('#cert-canvas');
    if (!canvas) return;

    sound.playItemGet();
    const link = document.createElement('a');
    link.download = `십계명_수료증_${this.currentPlayerNickname || '탐험가'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
