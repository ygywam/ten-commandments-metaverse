// PeerJS 기반 WebRTC P2P 실시간 네트워크 매니저
// 교사(호스트)와 학생(클라이언트) 간 아바타 위치 및 상태 동기화

export class NetworkManager {
  constructor(onRemotePlayersUpdate, onHostReady) {
    this.peer = null;
    this.connections = new Map(); // host: clientId -> DataConnection
    this.hostConnection = null;   // client: DataConnection to host
    this.isHost = false;
    this.roomId = null;
    this.onRemotePlayersUpdate = onRemotePlayersUpdate; // (playersMap) => void
    this.onHostReady = onHostReady;                     // (roomId, qrUrl) => void

    this.remotePlayers = new Map(); // id -> { x, y, nickname, isMoving, walkCycle, custom }
    this.localPlayerState = null;
    this.sendInterval = null;
  }

  // 1. 교사 모드: 방 개설 (호스트)
  createRoom() {
    this.isHost = true;
    // 읽기 쉬운 무작위 6자리 방 코드 (예: SINAI-742)
    const randomCode = Math.floor(100 + Math.random() * 900);
    this.roomId = `SINAI-${randomCode}`;
    const peerId = `metaverse-sinai-${this.roomId.toLowerCase()}`;

    // PeerJS 공식 클라우드 브로커 사용
    this.peer = new window.Peer(peerId, {
      debug: 1
    });

    this.peer.on('open', (id) => {
      console.log('[네트워크] 호스트 방 생성 성공:', this.roomId, id);
      const joinUrl = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
      if (this.onHostReady) {
        this.onHostReady(this.roomId, joinUrl);
      }
    });

    this.peer.on('connection', (conn) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.warn('[네트워크] 호스트 Peer 에러:', err);
      // 만약 이미 동일 ID가 있으면 무작위 방 코드로 재시도
      if (err.type === 'unavailable-id') {
        this.createRoom();
      }
    });

    this.startBroadcastLoop();
  }

  // 2. 학생 모드: 방 접속 (클라이언트)
  joinRoom(roomId) {
    this.isHost = false;
    this.roomId = roomId.toUpperCase();
    const peerId = `metaverse-sinai-${this.roomId.toLowerCase()}`;

    // 학생은 랜덤 ID로 피어 생성
    this.peer = new window.Peer({
      debug: 1
    });

    this.peer.on('open', (myId) => {
      console.log('[네트워크] 학생 클라이언트 피어 준비됨:', myId);
      this.hostConnection = this.peer.connect(peerId, {
        reliable: true
      });

      this.hostConnection.on('open', () => {
        console.log('[네트워크] 교사 호스트에 연결 성공!');
      });

      this.hostConnection.on('data', (data) => {
        this.handleClientReceivedData(data);
      });

      this.hostConnection.on('close', () => {
        console.warn('[네트워크] 교사 호스트와의 연결이 끊어졌습니다.');
      });
    });

    this.startClientSendLoop();
  }

  // 호스트가 학생 연결을 수락했을 때
  handleIncomingConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log(`[네트워크] 새 학생 참가 (총 ${this.connections.size}명 접속):`, conn.peer);
    });

    conn.on('data', (data) => {
      if (data.type === 'state_update') {
        this.remotePlayers.set(conn.peer, {
          id: conn.peer,
          x: data.x,
          y: data.y,
          nickname: data.nickname,
          isMoving: data.isMoving,
          walkCycle: data.walkCycle,
          custom: data.custom
        });
        if (this.onRemotePlayersUpdate) {
          this.onRemotePlayersUpdate(this.remotePlayers);
        }
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.remotePlayers.delete(conn.peer);
      console.log(`[네트워크] 학생 퇴장 (남은 접속자 ${this.connections.size}명):`, conn.peer);
      if (this.onRemotePlayersUpdate) {
        this.onRemotePlayersUpdate(this.remotePlayers);
      }
    });
  }

  // 클라이언트가 호스트로부터 전체 동기화 데이터를 받았을 때
  handleClientReceivedData(data) {
    if (data.type === 'room_state') {
      this.remotePlayers.clear();
      for (const [id, player] of Object.entries(data.players)) {
        if (id !== this.peer?.id) {
          this.remotePlayers.set(id, player);
        }
      }
      if (this.onRemotePlayersUpdate) {
        this.onRemotePlayersUpdate(this.remotePlayers);
      }
    }
  }

  // 내 아바타 실시간 상태 갱신
  setLocalState(playerState) {
    this.localPlayerState = {
      x: Math.round(playerState.x),
      y: Math.round(playerState.y),
      nickname: playerState.nickname,
      isMoving: playerState.isMoving,
      walkCycle: playerState.walkCycle,
      custom: playerState.custom
    };
  }

  // 호스트의 주기적 브로드캐스트 (초당 15회)
  startBroadcastLoop() {
    if (this.sendInterval) clearInterval(this.sendInterval);
    this.sendInterval = setInterval(() => {
      if (!this.isHost || this.connections.size === 0) return;

      const playersObj = {};
      // 호스트 자신 추가
      if (this.localPlayerState && this.peer?.id) {
        playersObj[this.peer.id] = { ...this.localPlayerState, id: this.peer.id };
      }
      // 접속한 학생들 추가
      for (const [id, player] of this.remotePlayers.entries()) {
        playersObj[id] = player;
      }

      const payload = {
        type: 'room_state',
        players: playersObj
      };

      for (const conn of this.connections.values()) {
        if (conn.open) {
          conn.send(payload);
        }
      }
    }, 66); // ~15 FPS
  }

  // 학생 클라이언트의 주기적 내 위치 전송 (초당 15회)
  startClientSendLoop() {
    if (this.sendInterval) clearInterval(this.sendInterval);
    this.sendInterval = setInterval(() => {
      if (this.isHost || !this.hostConnection || !this.hostConnection.open) return;
      if (!this.localPlayerState) return;

      this.hostConnection.send({
        type: 'state_update',
        ...this.localPlayerState
      });
    }, 66);
  }

  getConnectedCount() {
    return this.isHost ? this.connections.size : (this.hostConnection?.open ? 1 : 0);
  }
}
