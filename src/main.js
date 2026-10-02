import { sound } from './engine/soundEngine.js';
import { Camera } from './engine/camera.js';
import { World } from './engine/world.js';
import { InputController } from './controls/inputController.js';
import { AvatarCustomizer } from './components/avatarCustomizer.js';

// DOM 요소 참조
const soundToggleBtn = document.getElementById('btn-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const orientationOverlay = document.getElementById('orientation-overlay');
const avatarModal = document.getElementById('avatar-modal');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 게임 시스템 인스턴스
const world = new World();
const camera = new Camera(window.innerWidth, window.innerHeight, world.width, world.height);
const input = new InputController();

// 로컬 플레이어 아바타 상태
const player = {
  x: 2110,      // 모세 앞마당(성막 앞)에서 시작
  y: 1100,
  speed: 4.8,
  nickname: '믿음이',
  isMoving: false,
  walkCycle: 0,
  facing: 'down',
  style: null
};

// 아바타 커스터마이저 초기화
new AvatarCustomizer((nickname, style) => {
  player.nickname = nickname;
  player.style = style;
  avatarModal.style.display = 'none';

  sound.playSelect();
  sound.startBgm();
});

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

// 오디오 음소거 토글
soundToggleBtn.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  soundIcon.textContent = isMuted ? '🔇' : '🔊';
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
    const nextX = player.x + dx * player.speed;
    const nextY = player.y + dy * player.speed;

    // 충돌 검사 (오아시스 연못 속이나 하늘/산악 정상 진입 방지)
    if (world.isWalkable(nextX, player.y)) {
      player.x = nextX;
    }
    if (world.isWalkable(player.x, nextY)) {
      player.y = nextY;
    }

    player.isMoving = true;
    player.walkCycle += 0.25;
  } else {
    player.isMoving = false;
    player.walkCycle = 0;
  }

  // 카메라가 플레이어를 스무스하게 추적
  camera.update(player.x, player.y);

  // 상호작용 액션 감지
  if (action) {
    checkInteraction();
  }
}

function checkInteraction() {
  // 모세와의 거리 확인
  const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
  if (distMoses < 85) {
    sound.playStonePlace();
    return;
  }

  // 10개 계명 장소와의 거리 확인
  for (const spot of world.commandmentSpots) {
    const dist = Math.hypot(player.x - spot.x, player.y - spot.y);
    if (dist < 75) {
      sound.playItemGet();
      break;
    }
  }
}

function render() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  camera.applyTransform(ctx);

  // 1. 제공된 시내산 광야 맵 및 랜드마크 렌더링
  world.renderBackground(ctx);

  // 2. 플레이어 아바타 렌더링 (커스텀 스타일 완벽 반영)
  if (player.style) {
    world.renderAvatar(ctx, player);
  }

  camera.restoreTransform(ctx);
}

// 초기화 및 게임 루프 가동
checkOrientation();
resizeCanvas();
requestAnimationFrame(gameLoop);
