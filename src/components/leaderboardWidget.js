// 2대 게임 모드 (협동전 vs 개인전) 실시간 리더보드 & 현황 위젯
import { sound } from '../engine/soundEngine.js';

export class LeaderboardWidget {
  constructor(onModeToggleCallback) {
    this.onModeToggleCallback = onModeToggleCallback;
    this.mode = 'coop'; // 'coop' (협동전) 또는 'individual' (개인전)
    this.coopSolvedSpots = new Set(); // 협동 모드에서 반 전체가 푼 계명 ID 세트 (1~10)
    this.playerProgressMap = new Map(); // id -> { nickname, count, finishedTime }
    this.isCollapsed = false;

    this.createDom();
  }

  createDom() {
    this.widgetEl = document.createElement('div');
    this.widgetEl.id = 'leaderboard-widget';
    this.widgetEl.className = 'leaderboard-box';
    this.widgetEl.innerHTML = `
      <div class="lb-header">
        <div class="lb-title-wrap">
          <span id="lb-mode-badge" class="lb-badge coop">🤝 협동 모드</span>
          <span id="lb-summary-text" class="lb-summary">0 / 10 완성</span>
        </div>
        <button id="btn-toggle-lb" class="lb-min-btn" title="접기/펼치기">➖</button>
      </div>

      <div id="lb-body" class="lb-body">
        <!-- 협동 모드 전용 뷰 -->
        <div id="lb-coop-view" class="lb-sub-view">
          <div class="lb-coop-chips" id="lb-coop-chips"></div>
          <div class="lb-student-contrib-list" id="lb-contrib-list"></div>
        </div>

        <!-- 개인전 모드 전용 뷰 (랭킹 순위표) -->
        <div id="lb-indiv-view" class="lb-sub-view hidden">
          <div class="lb-rank-list" id="lb-rank-list"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.widgetEl);
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const minBtn = this.widgetEl.querySelector('#btn-toggle-lb');
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        this.isCollapsed = !this.isCollapsed;
        this.widgetEl.classList.toggle('minimized', this.isCollapsed);
        minBtn.textContent = this.isCollapsed ? '➕' : '➖';
        sound.playSelect();
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  // 협동 모드 계명 세트 갱신
  setCoopSolved(solvedSet) {
    this.coopSolvedSpots = new Set(solvedSet);
    this.render();
  }

  // 참가자 진행도 갱신 (id, nickname, count, isFinished, finishTime)
  updatePlayerProgress(id, info) {
    this.playerProgressMap.set(id, {
      id,
      nickname: info.nickname || '익명',
      count: info.count || 0,
      isFinished: !!info.isFinished,
      finishTime: info.finishTime || null
    });
    this.render();
  }

  render() {
    const modeBadge = this.widgetEl.querySelector('#lb-mode-badge');
    const summaryText = this.widgetEl.querySelector('#lb-summary-text');
    const coopView = this.widgetEl.querySelector('#lb-coop-view');
    const indivView = this.widgetEl.querySelector('#lb-indiv-view');
    const chipsContainer = this.widgetEl.querySelector('#lb-coop-chips');
    const contribList = this.widgetEl.querySelector('#lb-contrib-list');
    const rankList = this.widgetEl.querySelector('#lb-rank-list');

    if (this.mode === 'coop') {
      modeBadge.className = 'lb-badge coop';
      modeBadge.textContent = '🤝 우리 반 협동전';
      summaryText.textContent = `${this.coopSolvedSpots.size} / 10 계명`;
      coopView.classList.remove('hidden');
      indivView.classList.add('hidden');

      // 1~10 칩 렌더링
      chipsContainer.innerHTML = '';
      for (let i = 1; i <= 10; i++) {
        const chip = document.createElement('span');
        const isDone = this.coopSolvedSpots.has(i);
        chip.className = `lb-chip ${isDone ? 'done' : ''}`;
        chip.textContent = `${i}계명 ${isDone ? '✔' : ''}`;
        chipsContainer.appendChild(chip);
      }

      // 기여 학생 목록
      contribList.innerHTML = '<div class="lb-sec-title">참여 학생 현황</div>';
      const players = Array.from(this.playerProgressMap.values());
      if (players.length === 0) {
        contribList.innerHTML += '<div class="lb-empty">참여 학생을 기다리는 중...</div>';
      } else {
        players.sort((a, b) => b.count - a.count);
        players.forEach((p) => {
          const row = document.createElement('div');
          row.className = 'lb-contrib-row';
          row.innerHTML = `
            <span class="contrib-name">👤 ${p.nickname}</span>
            <span class="contrib-badge">${p.count}개 발견</span>
          `;
          contribList.appendChild(row);
        });
      }
    } else {
      // 개인전 모드
      modeBadge.className = 'lb-badge indiv';
      modeBadge.textContent = '🏆 개인전 랭킹 레이스';
      coopView.classList.add('hidden');
      indivView.classList.remove('hidden');

      const players = Array.from(this.playerProgressMap.values());
      // 정렬 기준: 완주자 우선 (finishTime 빠른 순), 그 다음은 푼 개수(count) 높은 순
      players.sort((a, b) => {
        if (a.isFinished && !b.isFinished) return -1;
        if (!a.isFinished && b.isFinished) return 1;
        if (a.isFinished && b.isFinished) return (a.finishTime || 0) - (b.finishTime || 0);
        return b.count - a.count;
      });

      summaryText.textContent = `참가자 ${players.length}명`;
      rankList.innerHTML = '<div class="lb-sec-title">실시간 순위표 (선착순 완주)</div>';

      if (players.length === 0) {
        rankList.innerHTML += '<div class="lb-empty">레이스를 시작하세요!</div>';
      } else {
        players.forEach((p, idx) => {
          const row = document.createElement('div');
          const isTop3 = idx < 3;
          const medals = ['🥇', '🥈', '🥉'];
          const medal = medals[idx] || `${idx + 1}위`;

          row.className = `lb-rank-row ${p.isFinished ? 'finished' : ''} ${isTop3 ? 'top' : ''}`;
          row.innerHTML = `
            <span class="rank-pos">${medal}</span>
            <span class="rank-name">${p.nickname}</span>
            <span class="rank-stat">${p.isFinished ? '🏆 완주!' : `${p.count}/10`}</span>
          `;
          rankList.appendChild(row);
        });
      }
    }
  }
}
