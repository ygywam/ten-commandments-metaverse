import { sound } from './engine/soundEngine.js';
import { Camera } from './engine/camera.js';
import { World } from './engine/world.js';
import { InputController } from './controls/inputController.js';

// DOM 요소 참조
const soundToggleBtn = document.getElementById('btn-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const orientationOverlay = document.getElementById('orientation-overlay');
const welcomeModal = document.getElementById('welcome-modal');
const startExploreBtn = document.getElementById('btn-start-exploration');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 게임 시스템 인스턴스
const world = new World();
const camera = new Camera(window.innerWidth, window.innerHeight, world.width, world.height);
const input = new InputController();

// 로컬 플레이어 아바타 상태
const player = {
  x: 2110,      // 모세 앞마당에서 시작
  y: 1100,
  speed: 4.8,
  nickname: '믿음이',
  isMoving: false,
  walkCycle: 0,
  facing: 'down',
  style: {
    skinColor: '#fed7aa',
    hairColor: '#451a03',
    shirtColor: '#ea580c',
    pantsColor: '#1d4ed8',
    shoesColor: '#374151',
    accessory: 'hat' // 모자 착용
  }
};

// 가로 모드 감지 (모바일 환경)
function checkOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
  if (isPortrait) {
    orientationOverlay.classList.remove('hidden');
  } else {
    orientationOverlay.classList.add('hidden');
  }
}

// 캔버스 크기 맞춤
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  camera.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  checkOrientation();
});
window.addEventListener('orientationchange', checkOrientation);

// 오디오 토글
soundToggleBtn.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  soundIcon.textContent = isMuted ? '🔇' : '🔊';
});

// 시작 모달 닫기 및 게임 시작
startExploreBtn.addEventListener('click', () => {
  sound.playSelect();
  sound.startBgm();
  welcomeModal.style.display = 'none';
});

// 게임 루프
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  const { dx, dy, action } = input.getMovement();

  if (dx !== 0 || dy !== 0) {
    player.x += dx * player.speed;
    player.y += dy * player.speed;
    player.isMoving = true;
    player.walkCycle += 0.25;

    // 맵 경계 클램핑
    player.x = Math.max(60, Math.min(world.width - 60, player.x));
    player.y = Math.max(120, Math.min(world.height - 80, player.y));
  } else {
    player.isMoving = false;
    player.walkCycle = 0;
  }

  // 카메라가 플레이어를 추적
  camera.update(player.x, player.y);

  // 상호작용 액션 감지
  if (action) {
    checkInteraction();
  }
}

function checkInteraction() {
  // 모세와의 거리 확인
  const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
  if (distMoses < 75) {
    sound.playStonePlace();
    return;
  }

  // 10개 계명 장소와의 거리 확인
  for (const spot of world.commandmentSpots) {
    const dist = Math.hypot(player.x - spot.x, player.y - spot.y);
    if (dist < 65) {
      sound.playItemGet();
      break;
    }
  }
}

function render() {
  // 화면 지우기
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // 카메라 월드 좌표 변환 적용
  camera.applyTransform(ctx);

  // 1. 제공된 시내산 광야 맵 및 랜드마크 렌더링
  world.renderBackground(ctx);

  // 2. 플레이어 아바타 렌더링
  world.renderAvatar(ctx, player);

  // 카메라 변환 복원
  camera.restoreTransform(ctx);
}

// 초기화
checkOrientation();
resizeCanvas();
requestAnimationFrame(gameLoop);
