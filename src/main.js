import { sound } from './engine/soundEngine.js';
import { Camera } from './engine/camera.js';
import { World } from './engine/world.js';
import { InputController } from './controls/inputController.js';
import { AvatarCustomizer } from './components/avatarCustomizer.js';
import { NetworkManager } from './network/networkManager.js';
import { COMMANDMENTS_DATA } from './data/commandmentsData.js';
import { QuizModal } from './components/quizModal.js';

// DOM 요소 참조
const soundToggleBtn = document.getElementById('btn-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const viewToggleBtn = document.getElementById('btn-view-toggle');
const viewIcon = document.getElementById('view-icon');
const viewText = document.getElementById('view-text');
const orientationOverlay = document.getElementById('orientation-overlay');
const avatarModal = document.getElementById('avatar-modal');
const floatingQrWidget = document.getElementById('floating-qr-widget');
const roomModalBtn = document.getElementById('btn-room-modal');
const toggleQrSizeBtn = document.getElementById('btn-toggle-qr-size');
const closeQrWidgetBtn = document.getElementById('btn-close-qr-widget');
const roomCodeDisplay = document.getElementById('room-code-display');
const playerCountDisplay = document.getElementById('player-count-display');
const joinUrlInput = document.getElementById('input-join-url');
const copyUrlBtn = document.getElementById('btn-copy-url');
const qrcodeBox = document.getElementById('qrcode-box');
const proximityHint = document.getElementById('proximity-hint');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 플레이어 보유 계명 세트 (1~10번 조각)
const collectedCommandments = new Set();

// 퀴즈 모달 인스턴스 초기화
const quizModal = new QuizModal((commandmentId) => {
  collectedCommandments.add(commandmentId);
  console.log(`[계명 획득] 제${commandmentId}계명 획득 완료! (보유 중: ${collectedCommandments.size}/10)`);
});

// 게임 시스템 인스턴스
const world = new World();
const camera = new Camera(window.innerWidth, window.innerHeight, world.width, world.height);
const input = new InputController();

// 원격 접속 플레이어 맵 (ID -> 플레이어 객체)
const remotePlayers = new Map();

// 네트워크 매니저 인스턴스
const network = new NetworkManager(
  // 1. 원격 플레이어 상태 갱신 콜백
  (updatedPlayers) => {
    remotePlayers.clear();
    for (const [id, p] of updatedPlayers.entries()) {
      remotePlayers.set(id, p);
    }
    if (playerCountDisplay) {
      playerCountDisplay.textContent = (remotePlayers.size + 1).toString();
    }
  },
  // 2. 호스트 준비 완료 콜백 (QR 생성)
  (roomId, joinUrl) => {
    if (roomCodeDisplay) roomCodeDisplay.textContent = roomId;
    if (joinUrlInput) joinUrlInput.value = joinUrl;
    if (qrcodeBox && window.QRCode) {
      qrcodeBox.innerHTML = '';
      new window.QRCode(qrcodeBox, {
        text: joinUrl,
        width: 180,
        height: 180,
        colorDark: '#78350f',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }
  }
);

// URL 파라미터 확인 (교사용 전체 뷰 기본 모드 및 룸 코드)
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');

if (urlParams.get('view') === 'teacher' || (!roomParam && !sessionStorage.getItem('joined_room'))) {
  // 교사(호스트) 기본 모드 또는 첫 개설자: 방 자동 생성
  camera.setMode('overview');
  if (viewIcon && viewText) {
    viewIcon.textContent = '👤';
    viewText.textContent = '캐릭터 뷰';
  }
  // 교사 방 개설
  network.createRoom();
} else if (roomParam) {
  // 학생 클라이언트 모드: 주어진 방 코드로 접속
  sessionStorage.setItem('joined_room', roomParam);
  network.joinRoom(roomParam);
  // 학생은 아바타 팔로우 뷰 기본
  camera.setMode('follow');
}

// 플로팅 QR코드 위젯 제어 (토글/최소화/감추기)
if (roomModalBtn && floatingQrWidget) {
  roomModalBtn.addEventListener('click', () => {
    // 이미 열려 있으면 감추고, 닫혀 있으면 열기
    const isHidden = floatingQrWidget.classList.contains('hidden');
    if (isHidden) {
      floatingQrWidget.classList.remove('hidden');
      roomModalBtn.classList.add('highlight');
    } else {
      floatingQrWidget.classList.add('hidden');
      roomModalBtn.classList.remove('highlight');
    }
    sound.playSelect();
  });
}

// ✕ 버튼: 위젯 완전히 숨기기 (상단 '방 QR코드' 버튼으로 언제든 다시 열 수 있음)
if (closeQrWidgetBtn && floatingQrWidget) {
  closeQrWidgetBtn.addEventListener('click', () => {
    floatingQrWidget.classList.add('hidden');
    if (roomModalBtn) roomModalBtn.classList.remove('highlight');
    sound.playSelect();
  });
}

// ➖ 버튼: 내용만 접기(최소화) / 펼치기
if (toggleQrSizeBtn && floatingQrWidget) {
  toggleQrSizeBtn.addEventListener('click', () => {
    const isMin = floatingQrWidget.classList.toggle('minimized');
    toggleQrSizeBtn.textContent = isMin ? '➕' : '➖';
    sound.playSelect();
  });
}

if (copyUrlBtn && joinUrlInput) {
  copyUrlBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(joinUrlInput.value).then(() => {
      copyUrlBtn.textContent = '✔ 완료';
      sound.playItemGet();
      setTimeout(() => {
        copyUrlBtn.textContent = '복사';
      }, 2000);
    });
  });
}

// 로컬 플레이어 아바타 상태
const player = {
  x: 2110,      // 모세 앞마당(성막 앞)에서 시작
  y: 1100,
  speed: 4.8,
  nickname: '믿음이',
  isMoving: false,
  walkCycle: 0,
  facing: 'down',
  custom: null
};

// 아바타 커스터마이저 초기화 (4프레임 보행 스프라이트 & 파츠 연동)
new AvatarCustomizer((nickname, custom) => {
  player.nickname = nickname;
  player.custom = custom;
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

// 카메라 뷰 모드 토글 (교사 전체 뷰 vs 학생 캐릭터 뷰)
if (viewToggleBtn) {
  viewToggleBtn.addEventListener('click', () => {
    const isOverview = camera.mode === 'overview';
    const nextMode = isOverview ? 'follow' : 'overview';
    camera.setMode(nextMode);

    viewIcon.textContent = nextMode === 'overview' ? '👤' : '🔍';
    viewText.textContent = nextMode === 'overview' ? '캐릭터 뷰' : '전체 뷰';
    sound.playSelect();
  });
}

// 마우스 휠 줌 조절 (화면 자유 확대/축소)
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  camera.handleWheel(e.deltaY);
}, { passive: false });

// 키보드 확대(+) / 축소(-) 지원
window.addEventListener('keydown', (e) => {
  if (e.key === '+' || e.key === '=') {
    camera.zoomIn();
  } else if (e.key === '-' || e.key === '_') {
    camera.zoomOut();
  }
});

// 캔버스 클릭 이벤트: 캐릭터 클릭 시 관찰 포커스, 빈 배경 클릭 시 고정 전체 뷰
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;
  const worldPos = camera.screenToWorld(screenX, screenY);

  // 1. 내 아바타 근처 클릭 검사
  const dist = Math.hypot(worldPos.x - player.x, worldPos.y - player.y);
  if (dist < 50) {
    camera.setFollowTarget(player);
    viewIcon.textContent = '🔍';
    viewText.textContent = '전체 뷰';
    sound.playSelect();
    return;
  }

  // 2. 접속 중인 다른 학생 캐릭터 근처 클릭 검사 (선택 학생 추적 관찰)
  for (const remotePlayer of remotePlayers.values()) {
    const distRemote = Math.hypot(worldPos.x - remotePlayer.x, worldPos.y - remotePlayer.y);
    if (distRemote < 50) {
      camera.setFollowTarget(remotePlayer);
      viewIcon.textContent = '🔍';
      viewText.textContent = '전체 뷰';
      sound.playSelect();
      return;
    }
  }

  // 3. 빈 배경 클릭 시 배경 고정 전체 뷰로 전환
  camera.clearFollowTarget();
  viewIcon.textContent = '👤';
  viewText.textContent = '캐릭터 뷰';
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

  // 실시간 네트워크 상태 동기화 전송
  network.setLocalState(player);

  // 주변 랜드마크(계명 비석, 모세) 근접 검사 및 힌트 툴팁 표시
  updateProximityHint();

  // 상호작용 액션 감지 (1회성 트리거 소비)
  if (action) {
    input.keys.action = false;
    checkInteraction();
  }
}

// 비석이나 모세 근처에 다가갔을 때 힌트 띄우기
function updateProximityHint() {
  if (!proximityHint) return;

  // 1. 모세와의 거리
  const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
  if (distMoses < 95) {
    proximityHint.innerHTML = `<span class="hint-key">Space</span> 모세 선지자님과 대화하기 📜`;
    proximityHint.classList.remove('hidden');
    return;
  }

  // 2. 10개 계명 장소와의 거리
  for (const spot of world.commandmentSpots) {
    const dist = Math.hypot(player.x - spot.x, player.y - spot.y);
    if (dist < 85) {
      const isSolved = collectedCommandments.has(spot.id);
      proximityHint.innerHTML = `<span class="hint-key">Space</span> ${spot.name} 퀴즈 풀기 ${isSolved ? '✔' : '✨'}`;
      proximityHint.classList.remove('hidden');
      return;
    }
  }

  proximityHint.classList.add('hidden');
}

function checkInteraction() {
  // 모세와의 거리 확인
  const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
  if (distMoses < 95) {
    sound.playStonePlace();
    alert(`모세 선지자: "샬롬! 현재 ${collectedCommandments.size}/10개의 계명 조각을 모았구나! 광야 곳곳을 탐험하며 10개의 계명을 모두 완성해 오너라!"`);
    return;
  }

  // 10개 계명 장소와의 거리 확인
  for (const spot of world.commandmentSpots) {
    const dist = Math.hypot(player.x - spot.x, player.y - spot.y);
    if (dist < 85) {
      const quizData = COMMANDMENTS_DATA.find(q => q.id === spot.id);
      if (quizData) {
        const isSolved = collectedCommandments.has(spot.id);
        quizModal.open(quizData, isSolved);
      }
      break;
    }
  }
}

function render() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  camera.applyTransform(ctx);

  // 1. 제공된 시내산 광야 맵 및 랜드마크 렌더링 (획득한 계명 비석에는 금빛 후광 및 체크 표시)
  world.renderBackground(ctx, collectedCommandments);

  // 2. 다른 접속 학생들의 아바타 렌더링
  for (const remotePlayer of remotePlayers.values()) {
    if (remotePlayer.custom) {
      world.renderAvatar(ctx, remotePlayer);
    }
  }

  // 3. 로컬 내 플레이어 아바타 렌더링
  if (player.custom) {
    world.renderAvatar(ctx, player);
  }

  camera.restoreTransform(ctx);
}

// 초기화 및 게임 루프 가동
checkOrientation();
resizeCanvas();
requestAnimationFrame(gameLoop);
