import { sound } from './engine/soundEngine.js';
import { Camera } from './engine/camera.js';
import { World } from './engine/world.js';
import { InputController } from './controls/inputController.js';
import { AvatarCustomizer, AVATAR_CHARACTERS, ACCESSORIES, EQUIPMENTS } from './components/avatarCustomizer.js';
import { NetworkManager } from './network/networkManager.js';
import { getCommandments, saveCommandments } from './data/commandmentsData.js';
import { QuizModal } from './components/quizModal.js';
import { TabletModal } from './components/tabletModal.js';
import { QuizEditorModal } from './components/quizEditorModal.js';
import { LeaderboardWidget } from './components/leaderboardWidget.js';

// DOM 요소 참조
const soundToggleBtn = document.getElementById('btn-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const fullscreenBtn = document.getElementById('btn-fullscreen');
const fullscreenIcon = document.getElementById('fullscreen-icon');
const fullscreenText = document.getElementById('fullscreen-text');
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
const tabletHudBtn = document.getElementById('btn-tablet-hud');
const tabletHudText = document.getElementById('tablet-hud-text');
const gameControlBtn = document.getElementById('btn-game-control');
const controlIcon = document.getElementById('control-icon');
const controlBtnText = document.getElementById('control-btn-text');
const statusBadge = document.getElementById('badge-game-status');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const quizEditorBtn = document.getElementById('btn-quiz-editor');
const gameModeBtn = document.getElementById('btn-game-mode');
const modeIcon = document.getElementById('mode-icon');
const modeText = document.getElementById('mode-text');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 게임 진행 상태 ('waiting': 대기 중(자유 이동만 가능, 퀴즈 잠김), 'playing': 진행 중(퀴즈 활성화))
let gameStatus = 'waiting';

// 게임 모드 ('coop': 우리 반 협동전, 'individual': 개인전 랭킹 레이스)
let currentGameMode = 'coop';

// 최신 퀴즈 데이터셋 (교사가 편집한 내용 우선)
let currentQuizData = getCommandments();

// 플레이어 개인 보유 계명 세트 (1~10번 조각)
const collectedCommandments = new Set();

// 협동 모드용 전체 공유 돌판 세트 (1~10번 조각)
const coopSolvedSpots = new Set();

// 개인전 완주 여부
let isLocalFinished = false;
let gameStartTime = Date.now();

// 리더보드 & 진행도 위젯 초기화
const leaderboard = new LeaderboardWidget();

function updateGameStatusUi() {
  if (statusBadge && statusIcon && statusText) {
    if (gameStatus === 'waiting') {
      statusBadge.className = 'status-badge waiting';
      statusIcon.textContent = '⏳';
      statusText.textContent = '대기 중';
    } else {
      statusBadge.className = 'status-badge playing';
      statusIcon.textContent = '🔥';
      statusText.textContent = '탐험 진행 중';
    }
  }

  if (gameControlBtn && controlIcon && controlBtnText) {
    if (gameStatus === 'waiting') {
      controlIcon.textContent = '▶️';
      controlBtnText.textContent = '게임 시작!';
      gameControlBtn.className = 'nav-btn highlight-green pulse-glow';
    } else {
      controlIcon.textContent = '⏹️';
      controlBtnText.textContent = '대기로 전환';
      gameControlBtn.className = 'nav-btn';
    }
  }
}

// 퀴즈 편집기 인스턴스 초기화 (교사 전용)
const quizEditorModal = new QuizEditorModal((updatedQuizData) => {
  currentQuizData = updatedQuizData;
  console.log('[퀴즈 편집] 퀴즈 데이터 갱신 완료, 학생들에게 브로드캐스트 전송');
  network.broadcast({
    type: 'quiz_sync',
    quizData: currentQuizData
  });
});

function updateTabletHud() {
  if (tabletHudText) {
    if (currentGameMode === 'coop') {
      tabletHudText.textContent = `협동 돌판: ${coopSolvedSpots.size} / 10`;
    } else {
      tabletHudText.textContent = `내 돌판: ${collectedCommandments.size} / 10`;
    }
  }
  leaderboard.setCoopSolved(coopSolvedSpots);
}

// 모세 십계명 돌판 모달 및 세레머니 인스턴스 초기화
const tabletModal = new TabletModal(() => {
  console.log('[세레머니] 10개 계명 전체 봉헌 완료!');
  if (currentGameMode === 'individual' && !isLocalFinished) {
    isLocalFinished = true;
    const finishElapsed = Math.round((Date.now() - gameStartTime) / 1000);
    network.broadcast({
      type: 'rank_finish',
      id: network.peer?.id || 'local',
      nickname: player.nickname,
      finishTime: finishElapsed
    });
    network.sendToHost({
      type: 'rank_finish',
      nickname: player.nickname,
      finishTime: finishElapsed
    });
    leaderboard.updatePlayerProgress(network.peer?.id || 'local', {
      nickname: player.nickname,
      count: 10,
      isFinished: true,
      finishTime: finishElapsed
    });
  }
});

// 상단 돌판 배지 클릭 시 돌판 모달 오픈
if (tabletHudBtn) {
  tabletHudBtn.addEventListener('click', () => {
    const activeSet = (currentGameMode === 'coop') ? coopSolvedSpots : collectedCommandments;
    tabletModal.open(activeSet, player.nickname);
  });
}

// 퀴즈 모달 인스턴스 초기화
const quizModal = new QuizModal((commandmentId) => {
  collectedCommandments.add(commandmentId);
  coopSolvedSpots.add(commandmentId);
  updateTabletHud();
  sound.playItemGet();

  // 리더보드 내 진척도 갱신
  leaderboard.updatePlayerProgress(network.peer?.id || 'local', {
    nickname: player.nickname,
    count: collectedCommandments.size
  });

  // 네트워크로 계명 해결 패킷 전송
  const packet = {
    type: 'solve_commandment',
    commandmentId,
    nickname: player.nickname,
    personalCount: collectedCommandments.size,
    coopSolved: Array.from(coopSolvedSpots)
  };
  network.broadcast(packet);
  network.sendToHost(packet);

  // 모드별 10개 완료 시 안내
  if (currentGameMode === 'coop' && coopSolvedSpots.size === 10) {
    setTimeout(() => {
      alert('🎉 할렐루야! 우리 반이 10개의 계명을 모두 찾았습니다! 모세 선지자님 제단으로 모이세요!');
      tabletModal.open(coopSolvedSpots, player.nickname);
    }, 600);
  } else if (currentGameMode === 'individual' && collectedCommandments.size === 10) {
    setTimeout(() => {
      alert(`🏆 축하합니다 ${player.nickname}님! 10개 계명을 모두 모았습니다! 어서 모세 선지자님께 봉헌하여 완주 순위를 확정하세요!`);
      tabletModal.open(collectedCommandments, player.nickname);
    }, 600);
  }
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
    updateRoomDisplay(roomId);
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

// URL 파라미터 및 기기 환경 확인
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
const isMobileClient = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;

// 교사 / 학생 모드 판별: 명시적 교사 뷰(?view=teacher)이거나 PC 환경에서 파라미터 없이 열었을 때 교사 모드
const isExplicitTeacher = urlParams.get('view') === 'teacher';
const isTeacher = isExplicitTeacher || (!roomParam && !isMobileClient);

// 방 번호 표시 및 제어 요소
const roomBadgeBtn = document.getElementById('btn-room-badge');
const roomTagText = document.getElementById('room-tag-text');
const editRoomCodeBtn = document.getElementById('btn-edit-room-code');

function updateRoomDisplay(code) {
  if (roomCodeDisplay) roomCodeDisplay.textContent = code;
  if (roomTagText) roomTagText.textContent = code;
}

// 교사 고정 방 코드 변경 버튼 (플로팅 QR 박스 ⚙️ 버튼)
if (editRoomCodeBtn) {
  editRoomCodeBtn.addEventListener('click', () => {
    const currentCode = network.roomId || localStorage.getItem('sinai_fixed_room_code') || 'SINAI-777';
    const newCode = prompt(
      '우리 교회/학급의 고정 방 코드를 입력하세요:\n(예: 우리교회, SINAI-777, 예닮유년부)\n\n학생들은 이 코드로 언제든 홈화면 앱에서 바로 접속합니다.',
      currentCode
    );
    if (newCode && newCode.trim()) {
      const trimmed = newCode.trim().toUpperCase();
      localStorage.setItem('sinai_fixed_room_code', trimmed);
      sound.playSelect();
      network.createRoom(trimmed);
      updateRoomDisplay(trimmed);
      alert(`🎉 고정 방 코드가 [${trimmed}] 로 설정되었습니다!\n학생들은 이제 이 방으로 계속 접속할 수 있습니다.`);
    }
  });
}

// 상단 네비게이션 방 배지 (🏷️ 방 번호) 클릭 시
if (roomBadgeBtn) {
  roomBadgeBtn.addEventListener('click', () => {
    if (isTeacher) {
      if (editRoomCodeBtn) editRoomCodeBtn.click();
    } else {
      const currentCode = network.roomId || localStorage.getItem('sinai_last_joined_room') || 'SINAI-777';
      const newCode = prompt(
        '접속할 선생님의 방 코드를 입력하세요:\n(예: SINAI-777, 우리교회, 예닮초등부)',
        currentCode
      );
      if (newCode && newCode.trim()) {
        const trimmed = newCode.trim().toUpperCase();
        localStorage.setItem('sinai_last_joined_room', trimmed);
        sound.playSelect();
        window.location.search = `?room=${encodeURIComponent(trimmed)}`;
      }
    }
  });
}

function updateGameModeUi() {
  if (modeIcon && modeText) {
    if (currentGameMode === 'coop') {
      modeIcon.textContent = '🤝';
      modeText.textContent = '협동 모드';
    } else {
      modeIcon.textContent = '🏆';
      modeText.textContent = '개인전 모드';
    }
  }
  updateTabletHud();
}

if (isTeacher) {
  // 교사(호스트) 기본 모드: 고정 방 생성
  camera.setMode('overview');
  if (viewIcon && viewText) {
    viewIcon.textContent = '👤';
    viewText.textContent = '캐릭터 뷰';
  }
  const savedFixedRoom = localStorage.getItem('sinai_fixed_room_code') || 'SINAI-777';
  network.createRoom(savedFixedRoom);
  updateRoomDisplay(network.roomId);

  // 학생 참가 시 방의 최신 상태(진행 상태, 모드, 랜덤 비석 좌표, 퀴즈, 협동 상태) 전송 (중간 입장자 완벽 지원)
  network.onStudentJoin = (conn) => {
    conn.send({
      type: 'init_room_state',
      gameStatus,
      mode: currentGameMode,
      spots: world.commandmentSpots.map(s => ({ x: s.x, y: s.y })),
      quizData: currentQuizData,
      coopSolved: Array.from(coopSolvedSpots)
    });
  };

  // 교사 게임 시작 / 대기 전환 제어 버튼
  if (gameControlBtn) {
    gameControlBtn.addEventListener('click', () => {
      if (gameStatus === 'waiting') {
        gameStatus = 'playing';
        gameStartTime = Date.now();
        updateGameStatusUi();
        sound.playVictory();
        network.broadcast({ type: 'game_start' });
        alert('🔥 [게임 시작] 십계명 대탐험이 시작되었습니다! 모든 학생의 비석 퀴즈가 활성화되었습니다.');
      } else {
        if (confirm('게임을 대기 모드로 전환하시겠습니까?\n(학생들의 퀴즈 상호작용이 잠깁니다)')) {
          gameStatus = 'waiting';
          updateGameStatusUi();
          sound.playSelect();
          network.broadcast({ type: 'game_pause' });
        }
      }
    });
  }

  // 교사 퀴즈 편집 버튼 클릭
  if (quizEditorBtn) {
    quizEditorBtn.addEventListener('click', () => {
      quizEditorModal.open();
    });
  }

  // 교사 게임 모드 전환 버튼 클릭
  if (gameModeBtn) {
    gameModeBtn.addEventListener('click', () => {
      currentGameMode = (currentGameMode === 'coop') ? 'individual' : 'coop';
      leaderboard.setMode(currentGameMode);
      updateGameModeUi();
      sound.playSelect();

      // 학생들에게 모드 변경 브로드캐스트
      network.broadcast({
        type: 'mode_sync',
        mode: currentGameMode
      });
    });
  }
} else {
  // 학생 클라이언트 모드: 주어진 방 코드 또는 저장된 고정 방(localStorage) 또는 'SINAI-777'로 접속
  const targetRoom = roomParam || localStorage.getItem('sinai_last_joined_room') || 'SINAI-777';
  sessionStorage.setItem('joined_room', targetRoom);
  network.joinRoom(targetRoom);
  updateRoomDisplay(targetRoom);
  camera.setMode('follow');

  if (gameControlBtn) gameControlBtn.classList.add('hidden');
  if (quizEditorBtn) quizEditorBtn.classList.add('hidden');
  if (gameModeBtn) {
    gameModeBtn.style.cursor = 'default';
    gameModeBtn.title = '게임 모드 (선생님만 변경 가능)';
  }
}

updateGameModeUi();
updateGameStatusUi();

// --- P2P 네트워크 이벤트 핸들러 등록 ---

// 1. 방 초기화 데이터 수신 (학생 클라이언트가 방에 들어왔을 때 - 중간 입장도 즉시 상태 수신)
network.on('init_room_state', (data) => {
  console.log('[네트워크] 호스트 방 상태 수신:', data);
  if (data.gameStatus) {
    gameStatus = data.gameStatus;
    updateGameStatusUi();
  }
  if (data.mode) {
    currentGameMode = data.mode;
    leaderboard.setMode(currentGameMode);
    updateGameModeUi();
  }
  if (data.spots) {
    world.randomizeSpots(data.spots);
  }
  if (data.quizData) {
    currentQuizData = data.quizData;
  }
  if (data.coopSolved) {
    data.coopSolved.forEach(id => coopSolvedSpots.add(id));
    updateTabletHud();
  }
});

// 게임 시작 신호 수신 (학생)
network.on('game_start', () => {
  gameStatus = 'playing';
  gameStartTime = Date.now();
  updateGameStatusUi();
  sound.playVictory();
  alert('🔥 선생님이 게임을 시작하셨습니다! 광야 비석을 찾아 퀴즈를 풀어보세요!');
});

// 게임 대기 신호 수신 (학생)
network.on('game_pause', () => {
  gameStatus = 'waiting';
  updateGameStatusUi();
  sound.playSelect();
  alert('⏳ 선생님이 게임을 대기 상태로 전환하셨습니다.');
});

// 2. 게임 모드 전환 수신
network.on('mode_sync', (data) => {
  currentGameMode = data.mode;
  leaderboard.setMode(currentGameMode);
  updateGameModeUi();
  sound.playItemGet();
  alert(`📢 게임 모드가 [${currentGameMode === 'coop' ? '우리 반 협동 모드' : '개인전 랭킹 레이스'}]로 변경되었습니다!`);
});

// 3. 퀴즈 데이터 갱신 수신 (교사가 퀴즈 수정 시)
network.on('quiz_sync', (data) => {
  if (data.quizData) {
    currentQuizData = data.quizData;
    console.log('[네트워크] 선생님의 최신 퀴즈 동기화 완료!');
  }
});

// 4. 누군가 계명 해결 패킷 수신
network.on('solve_commandment', (data, senderId) => {
  if (data.commandmentId) {
    coopSolvedSpots.add(data.commandmentId);
    updateTabletHud();
  }
  if (data.nickname) {
    leaderboard.updatePlayerProgress(senderId || data.nickname, {
      nickname: data.nickname,
      count: data.personalCount || 1
    });
  }
  if (network.isHost) {
    network.broadcast({
      type: 'coop_update',
      commandmentId: data.commandmentId,
      solverNickname: data.nickname,
      coopSolved: Array.from(coopSolvedSpots),
      senderId,
      personalCount: data.personalCount
    });
  }
});

// 5. 호스트가 브로드캐스트한 협동 상태 수신
network.on('coop_update', (data) => {
  if (data.coopSolved) {
    data.coopSolved.forEach(id => coopSolvedSpots.add(id));
    updateTabletHud();
  }
  if (data.senderId && data.solverNickname) {
    leaderboard.updatePlayerProgress(data.senderId, {
      nickname: data.solverNickname,
      count: data.personalCount || 1
    });
  }
});

// 6. 개인전 완주 수신
network.on('rank_finish', (data, senderId) => {
  sound.playVictory();
  leaderboard.updatePlayerProgress(data.id || senderId, {
    nickname: data.nickname,
    count: 10,
    isFinished: true,
    finishTime: data.finishTime
  });
  if (network.isHost) {
    network.broadcast({
      type: 'rank_finish',
      id: senderId,
      nickname: data.nickname,
      finishTime: data.finishTime
    });
  }
});

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

// 줌 확대 / 축소 버튼 바인딩 (모바일 및 PC 공용)
const zoomInBtn = document.getElementById('btn-zoom-in');
const zoomOutBtn = document.getElementById('btn-zoom-out');

if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    camera.zoomIn();
    sound.playSelect();
  });
}
if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    camera.zoomOut();
    sound.playSelect();
  });
}

// 모바일 환경이거나 학생 접속 시 불필요한 QR 버튼 및 위젯 자동 숨김
if (roomParam || isMobileClient) {
  if (roomModalBtn) roomModalBtn.classList.add('hidden');
  if (floatingQrWidget) floatingQrWidget.classList.add('hidden');
}

// 로컬 플레이어 아바타 상태 (기본 커스텀 즉시 보장)
const player = {
  x: 2110,      // 모세 앞마당(성막 앞)에서 시작
  y: 1100,
  speed: 4.8,
  nickname: '믿음이',
  isMoving: false,
  walkCycle: 0,
  facing: 'down',
  custom: {
    character: AVATAR_CHARACTERS[0],
    accessory: ACCESSORIES[0],
    equipment: EQUIPMENTS[0]
  }
};

// 캐릭터 생성 완료 여부 (캐릭터 생성을 마친 후에만 인게임 진입 및 가로모드 체크)
let isAvatarCustomized = false;

// 아바타 커스터마이저 초기화 (4프레임 보행 스프라이트 & 파츠 연동)
new AvatarCustomizer((nickname, custom) => {
  player.nickname = nickname;
  player.custom = custom;
  avatarModal.style.display = 'none';
  isAvatarCustomized = true;

  sound.playSelect();
  sound.startBgm();

  // 아바타 설정을 마친 후 인게임 진입 시 화면 방향 체크
  checkOrientation();
});

// 가로 모드 감지 (캐릭터 생성이 완료된 후 인게임에서만 가로 전환 안내)
function checkOrientation() {
  if (!isAvatarCustomized) {
    orientationOverlay.classList.add('hidden');
    return;
  }
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

// 전체화면 토글 기능 (아이폰 Safari PWA 가이드 & 안드로이드/PC Fullscreen API)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const iosModal = document.getElementById('ios-fullscreen-modal');
const closeIosBtn = document.getElementById('btn-close-ios-fs');
const confirmIosBtn = document.getElementById('btn-confirm-ios-fs');

if (closeIosBtn) {
  closeIosBtn.addEventListener('click', () => {
    if (iosModal) iosModal.classList.add('hidden');
    sound.playSelect();
  });
}
if (confirmIosBtn) {
  confirmIosBtn.addEventListener('click', () => {
    if (iosModal) iosModal.classList.add('hidden');
    sound.playSelect();
  });
}
if (iosModal) {
  iosModal.addEventListener('click', (e) => {
    if (e.target === iosModal) {
      iosModal.classList.add('hidden');
    }
  });
}

function updateFullscreenBtn() {
  const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (fullscreenIcon) fullscreenIcon.textContent = isFull ? '🗗' : '🖥️';
  if (fullscreenText) fullscreenText.textContent = isFull ? '창모드' : '전체화면';
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    // 1. 아이폰(Safari)의 경우 브라우저 정책상 버튼을 통한 전체화면 미지원 -> 홈화면 추가 100% 전체화면 앱 가이드 안내
    if (isIOS && !document.documentElement.requestFullscreen) {
      if (iosModal) {
        iosModal.classList.remove('hidden');
      }
      window.scrollTo(0, 1);
      sound.playSelect();
      return;
    }

    // 2. 안드로이드 / PC / 지원 브라우저: Fullscreen API 토글
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFull) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          if (iosModal) iosModal.classList.remove('hidden');
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    sound.playSelect();
  });
}

document.addEventListener('fullscreenchange', updateFullscreenBtn);
document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);

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

// 키보드 확대(+) / 축소(-) 지원 (텍스트 입력 중 제외)
window.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
    return;
  }
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

    // 좌우 이동 방향에 따른 바라보는 방향(facing) 갱신
    if (dx > 0.05) {
      player.facing = 'right';
    } else if (dx < -0.05) {
      player.facing = 'left';
    }
  } else {
    player.isMoving = false;
    player.walkCycle = 0;
  }

  // 플레이어 이동에 따른 근접 비석 탐험 발견 처리
  world.updateDiscovery(player.x, player.y);

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

  // 0. 대기 상태일 때는 상호작용 잠금 및 대기 안내 표시
  if (gameStatus === 'waiting') {
    const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
    let nearSpot = false;
    for (const spot of world.commandmentSpots) {
      if (Math.hypot(player.x - spot.x, player.y - spot.y) < 85) {
        nearSpot = true;
        break;
      }
    }
    if (distMoses < 95 || nearSpot) {
      proximityHint.innerHTML = `<span class="hint-key">⏳ 대기 중</span> 선생님의 시작 신호를 기다리고 있습니다! 광야를 자유롭게 탐험해보세요.`;
      proximityHint.classList.remove('hidden');
      return;
    }
    proximityHint.classList.add('hidden');
    return;
  }

  // 1. 모세와의 거리
  const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
  if (distMoses < 95) {
    const isCompleted = (currentGameMode === 'coop') ? (coopSolvedSpots.size >= 10) : (collectedCommandments.size >= 10);
    proximityHint.innerHTML = `<span class="hint-key">Space</span> 모세 선지자 십계명 돌판 제단 ${isCompleted ? '🌟 봉헌 가능!' : '📜'}`;
    proximityHint.classList.remove('hidden');
    return;
  }

  // 2. 10개 계명 장소와의 거리
  for (const spot of world.commandmentSpots) {
    const dist = Math.hypot(player.x - spot.x, player.y - spot.y);
    if (dist < 85) {
      const isSolved = (currentGameMode === 'coop') ? coopSolvedSpots.has(spot.id) : collectedCommandments.has(spot.id);
      proximityHint.innerHTML = `<span class="hint-key">Space</span> ${spot.name} 퀴즈 풀기 ${isSolved ? '✔' : '✨'}`;
      proximityHint.classList.remove('hidden');
      return;
    }
  }

  proximityHint.classList.add('hidden');
}

function checkInteraction() {
  // 대기 상태에서는 퀴즈 및 봉헌 팝업 잠금
  if (gameStatus === 'waiting') {
    sound.playWrong();
    alert('⏳ 아직 게임이 시작되지 않았습니다!\n선생님께서 [게임 시작!] 버튼을 누르시면 퀴즈가 열립니다. 광야를 자유롭게 탐험하며 잠시만 기다려주세요!');
    return;
  }

  // 모세와의 거리 확인 (십계명 돌판 봉헌 모달 오픈)
  const distMoses = Math.hypot(player.x - world.moses.x, player.y - world.moses.y);
  if (distMoses < 95) {
    sound.playStonePlace();
    const activeSet = (currentGameMode === 'coop') ? coopSolvedSpots : collectedCommandments;
    tabletModal.open(activeSet, player.nickname);
    return;
  }

  // 10개 계명 장소와의 거리 확인
  for (const spot of world.commandmentSpots) {
    const dist = Math.hypot(player.x - spot.x, player.y - spot.y);
    if (dist < 85) {
      // 교사가 수정한 최신 퀴즈 데이터셋 참조
      const quizData = currentQuizData.find(q => q.id === spot.id);
      if (quizData) {
        const isSolved = (currentGameMode === 'coop') ? coopSolvedSpots.has(spot.id) : collectedCommandments.has(spot.id);
        quizModal.open(quizData, isSolved);
      }
      break;
    }
  }
}

function render() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  camera.applyTransform(ctx);

  // 1. 제공된 시내산 광야 맵 및 랜드마크 렌더링 (모드별 돌판 완료 및 교사 관제 시야 반영)
  const activeSolved = (currentGameMode === 'coop') ? coopSolvedSpots : collectedCommandments;
  const isOverview = camera.mode === 'overview';
  world.renderBackground(ctx, activeSolved, isOverview);

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
