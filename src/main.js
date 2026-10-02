import { sound } from './engine/soundEngine.js';

// DOM 요소 참조
const soundToggleBtn = document.getElementById('btn-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const orientationOverlay = document.getElementById('orientation-overlay');
const welcomeModal = document.getElementById('welcome-modal');
const startExploreBtn = document.getElementById('btn-start-exploration');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 테스트 버튼들
const btnTestBgm = document.getElementById('btn-test-bgm');
const btnTestCorrect = document.getElementById('btn-test-correct');
const btnTestItem = document.getElementById('btn-test-item');
const btnTestStone = document.getElementById('btn-test-stone');
const btnTestVictory = document.getElementById('btn-test-victory');

// 가로 모드 감지 (모바일 환경)
function checkOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
  if (isPortrait) {
    orientationOverlay.classList.remove('hidden');
  } else {
    orientationOverlay.classList.add('hidden');
  }
}

window.addEventListener('resize', () => {
  resizeCanvas();
  checkOrientation();
});
window.addEventListener('orientationchange', checkOrientation);

// 캔버스 크기 맞춤
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  drawPreview();
}

// 시내산 광야 초기 배경 프리뷰 렌더링
function drawPreview() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // 광야 모래 바닥
  ctx.fillStyle = '#f6edd9';
  ctx.fillRect(0, 0, w, h);

  // 모래 질감 도트 패턴
  ctx.fillStyle = '#eddcb9';
  for (let i = 0; i < 40; i++) {
    const x = (i * 137) % w;
    const y = (i * 89) % h;
    ctx.fillRect(x, y, 6, 6);
  }

  // 상단 시내산 실루엣
  ctx.fillStyle = '#d3b895';
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.5);
  ctx.lineTo(w * 0.35, h * 0.15);
  ctx.lineTo(w * 0.6, h * 0.55);
  ctx.lineTo(w * 0.85, h * 0.2);
  ctx.lineTo(w, h * 0.5);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // 중앙 모세 NPC 플레이스홀더
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.55, 20, 0, Math.PI * 2);
  ctx.fill();

  // 이름표
  ctx.fillStyle = '#3d312a';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('모세 (십계명 돌판)', w * 0.5, h * 0.55 - 28);
}

// 오디오 컨트롤러 이벤트 리스너
soundToggleBtn.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  soundIcon.textContent = isMuted ? '🔇' : '🔊';
});

// 테스트 버튼 리스너
btnTestBgm.addEventListener('click', () => {
  if (sound.isPlayingBgm) {
    sound.stopBgm();
    btnTestBgm.textContent = '🎵 BGM 재생';
  } else {
    sound.startBgm();
    btnTestBgm.textContent = '⏸️ BGM 정지';
  }
});

btnTestCorrect.addEventListener('click', () => sound.playCorrect());
btnTestItem.addEventListener('click', () => sound.playItemGet());
btnTestStone.addEventListener('click', () => sound.playStonePlace());
btnTestVictory.addEventListener('click', () => sound.playVictory());

startExploreBtn.addEventListener('click', () => {
  sound.playSelect();
  sound.startBgm();
  btnTestBgm.textContent = '⏸️ BGM 정지';
  welcomeModal.style.display = 'none';
});

// 초기 실행
checkOrientation();
resizeCanvas();
