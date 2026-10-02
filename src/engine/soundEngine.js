// Web Audio API 기반 순수 프로그래밍 신디사이저 엔진 (BGM & 효과음)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.currentStep = 0;

    // 시내산 광야 테마 음계 (평화롭고 신비로운 펜타토닉/동방 모드: D, F, G, A, C)
    this.bgmNotes = [
      293.66, 349.23, 392.00, 440.00, 523.25, // D4, F4, G4, A4, C5
      587.33, 698.46, 783.99, 880.00          // D5, F5, G5, A5
    ];
    // 잔잔한 아르페지오 패턴
    this.melodyPattern = [0, 2, 4, 3, 1, 3, 5, 4, 2, 4, 6, 5, 3, 2, 1, 0];
    this.bassPattern = [146.83, 146.83, 174.61, 196.00]; // D3, D3, F3, G3
  }

  // 사용자 인터랙션 후 오디오 컨텍스트 초기화
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  // 음소거 토글
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.7,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  // BGM 시작
  startBgm() {
    this.init();
    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;
    this.currentStep = 0;
    this.scheduleNextBgmBeat();
  }

  // BGM 중지
  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // BGM 비트 스케줄러 (분당 약 75 BPM의 잔잔한 템포)
  scheduleNextBgmBeat() {
    if (!this.isPlayingBgm || !this.ctx) return;

    const stepInterval = 280; // ms
    this.playBgmStep(this.currentStep);
    this.currentStep = (this.currentStep + 1) % this.melodyPattern.length;

    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBgmBeat();
    }, stepInterval);
  }

  // BGM 한 스텝 연주
  playBgmStep(step) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. 아르페지오 리드 멜로디 (플루트/오르간 느낌의 사인파)
    const noteIdx = this.melodyPattern[step];
    const freq = this.bgmNotes[noteIdx];

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // 부드러운 ADSR 엔벨로프
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(noteGain);
    noteGain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + 0.52);

    // 2. 4박자마다 베이스 패드 (풍성한 삼각파)
    if (step % 4 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFreq = this.bassPattern[Math.floor(step / 4) % this.bassPattern.length];

      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.18, now + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);

      bassOsc.start(now);
      bassOsc.stop(now + 1.15);
    }
  }

  // --- 효과음(SFX) 함수군 ---

  // UI 클릭/선택
  playSelect() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 퀴즈 정답 차임
  playCorrect() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  // 퀴즈 오답
  playWrong() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 계명 조각 획득 (반짝이는 아르페지오)
  playItemGet() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const chord = [440, 554.37, 659.25, 880, 1108.73];
    chord.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.42);
    });
  }

  // 모세의 돌판에 계명 안착 (묵직한 석판 + 거룩한 차임)
  playStonePlace() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // 돌 쿵 소리
    const oscThud = this.ctx.createOscillator();
    const gainThud = this.ctx.createGain();
    oscThud.type = 'square';
    oscThud.frequency.setValueAtTime(120, now);
    oscThud.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gainThud.gain.setValueAtTime(0.35, now);
    gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    oscThud.connect(gainThud);
    gainThud.connect(this.sfxGain);
    oscThud.start(now);
    oscThud.stop(now + 0.2);

    // 빛나는 고음 차임
    setTimeout(() => {
      this.playItemGet();
    }, 150);
  }

  // 최종 10계명 완성 팡파르
  playVictory() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const victoryMelody = [
      { f: 523.25, d: 0.15 }, { f: 659.25, d: 0.15 }, { f: 783.99, d: 0.15 },
      { f: 1046.50, d: 0.45 }, { f: 880.00, d: 0.2 }, { f: 1046.50, d: 0.8 }
    ];
    let offset = 0;
    victoryMelody.forEach((item) => {
      const now = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + item.d + 0.05);

      offset += item.d + 0.04;
    });
  }
}

export const sound = new SoundEngine();
