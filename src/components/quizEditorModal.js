// 교사용 10개 계명 퀴즈 편집기 모달 컴포넌트
// OX 퀴즈 및 가변형 객관식(기본 2지선다 ~ 최대 4지선다, 보기 추가/삭제) 지원
import { getCommandments, saveCommandments, resetCommandments } from '../data/commandmentsData.js';
import { sound } from '../engine/soundEngine.js';

export class QuizEditorModal {
  constructor(onSaveCallback) {
    this.onSaveCallback = onSaveCallback;
    this.isOpen = false;
    this.data = getCommandments();
    this.currentIdx = 0; // 0 ~ 9 (1~10계명)

    this.createDom();
  }

  createDom() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'quiz-editor-modal';
    this.modalEl.className = 'modal-overlay hidden';
    this.modalEl.innerHTML = `
      <div class="editor-card">
        <div class="editor-header">
          <div class="editor-title-wrap">
            <span class="editor-icon">✏️</span>
            <div>
              <h2>선생님용 십계명 퀴즈 편집기</h2>
              <p class="editor-sub">OX 퀴즈 또는 2~4지선다형 객관식 문제를 자유롭게 구성하세요.</p>
            </div>
          </div>
          <button id="btn-close-editor" class="close-btn" aria-label="닫기">✕</button>
        </div>

        <!-- 1~10계명 선택 탭 -->
        <div id="editor-tabs-bar" class="editor-tabs-row"></div>

        <!-- 편집 폼 바디 -->
        <div class="editor-form-body">
          <div class="editor-row-grid">
            <div class="editor-row">
              <label for="edit-title">계명 이름 / 표제어</label>
              <input type="text" id="edit-title" placeholder="예: 제1계명: 오직 하나님만 섬겨요">
            </div>

            <!-- 문제 유형 선택 (OX vs 객관식) -->
            <div class="editor-row">
              <label>문제 유형 선택</label>
              <div class="quiz-type-selector">
                <button type="button" id="btn-type-ox" class="type-sel-btn">
                  <span>⭕/❌</span> OX 퀴즈
                </button>
                <button type="button" id="btn-type-multiple" class="type-sel-btn active">
                  <span>📝</span> 객관식 (2~4지선다)
                </button>
              </div>
            </div>
          </div>

          <div class="editor-row">
            <label for="edit-verse">성경 말씀 요절 구절</label>
            <input type="text" id="edit-verse" placeholder="예: 너는 나 외에는 다른 신들을 네게 두지 말라 (출 20:3)">
          </div>

          <div class="editor-row">
            <label for="edit-question">문제 질문</label>
            <textarea id="edit-question" rows="2" placeholder="아이들에게 낼 질문을 입력하세요"></textarea>
          </div>

          <!-- 동적 보기 편집 영역 (OX 또는 가변형 2~4지선다) -->
          <div class="editor-options-group">
            <div class="options-header-row">
              <label id="options-group-title">보기 및 정답 선택 (초록색 동그라미가 정답)</label>
              <button type="button" id="btn-add-option" class="small-action-btn highlight">
                ➕ 보기 추가 (최대 4개)
              </button>
            </div>
            <div id="dynamic-options-container" class="dynamic-options-list"></div>
          </div>

          <div class="editor-row">
            <label for="edit-explanation">정답 교훈 및 해설</label>
            <input type="text" id="edit-explanation" placeholder="정답을 맞췄을 때 배울 말씀 교훈을 적어주세요">
          </div>
        </div>

        <!-- 푸터 버튼군 -->
        <div class="editor-footer">
          <button id="btn-reset-quiz-defaults" class="secondary-btn btn-danger-soft">
            🔄 기본 문항으로 복구
          </button>
          <div class="editor-footer-right">
            <button id="btn-prev-quiz" class="secondary-btn">◀ 이전 계명</button>
            <button id="btn-next-quiz" class="secondary-btn">다음 계명 ▶</button>
            <button id="btn-save-quiz-all" class="primary-btn">
              💾 퀴즈 저장 및 학생에게 배포
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    this.renderTabs();
  }

  bindEvents() {
    const closeBtn = this.modalEl.querySelector('#btn-close-editor');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // 문제 유형 변경 (OX vs 객관식)
    const btnTypeOx = this.modalEl.querySelector('#btn-type-ox');
    const btnTypeMulti = this.modalEl.querySelector('#btn-type-multiple');

    if (btnTypeOx && btnTypeMulti) {
      btnTypeOx.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        const item = this.data[this.currentIdx];
        item.type = 'ox';
        item.options = ['O (그렇다/맞다)', 'X (아니다/틀리다)'];
        if (item.answer > 1) item.answer = 0;
        this.loadFormFromMemory();
        sound.playSelect();
      });

      btnTypeMulti.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        const item = this.data[this.currentIdx];
        item.type = 'multiple';
        if (!item.options || item.options.length < 2) {
          item.options = ['보기 1', '보기 2'];
        }
        if (item.answer >= item.options.length) item.answer = 0;
        this.loadFormFromMemory();
        sound.playSelect();
      });
    }

    // 보기 추가 버튼 (최대 4개)
    const btnAddOption = this.modalEl.querySelector('#btn-add-option');
    if (btnAddOption) {
      btnAddOption.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        const item = this.data[this.currentIdx];
        if (item.type === 'ox') return;
        if (!item.options) item.options = [];
        if (item.options.length < 4) {
          item.options.push(`새 보기 ${item.options.length + 1}`);
          this.loadFormFromMemory();
          sound.playSelect();
        }
      });
    }

    // 이전/다음 계명 이동
    const prevBtn = this.modalEl.querySelector('#btn-prev-quiz');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        if (this.currentIdx > 0) {
          this.currentIdx--;
          this.renderTabs();
          this.loadFormFromMemory();
          sound.playSelect();
        }
      });
    }

    const nextBtn = this.modalEl.querySelector('#btn-next-quiz');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        if (this.currentIdx < 9) {
          this.currentIdx++;
          this.renderTabs();
          this.loadFormFromMemory();
          sound.playSelect();
        }
      });
    }

    // 기본 문항으로 리셋
    const resetBtn = this.modalEl.querySelector('#btn-reset-quiz-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('모든 퀴즈 문항을 최초 기본 십계명 문제(OX 및 2~4지선다)로 복구하시겠습니까?')) {
          this.data = resetCommandments();
          this.loadFormFromMemory();
          sound.playItemGet();
          alert('기본 퀴즈로 복구되었습니다.');
        }
      });
    }

    // 저장 및 배포 버튼
    const saveBtn = this.modalEl.querySelector('#btn-save-quiz-all');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        const success = saveCommandments(this.data);
        if (success) {
          sound.playItemGet();
          alert('✅ 십계명 퀴즈가 성공적으로 저장되었습니다! 접속한 학생들에게도 실시간 동기화됩니다.');
          if (this.onSaveCallback) {
            this.onSaveCallback(this.data);
          }
          this.close();
        } else {
          alert('저장 중 오류가 발생했습니다.');
        }
      });
    }
  }

  // 1~10번 탭 바 렌더링
  renderTabs() {
    const tabsBar = this.modalEl.querySelector('#editor-tabs-bar');
    if (!tabsBar) return;
    tabsBar.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const item = this.data[i];
      const isOx = item?.type === 'ox';
      const btn = document.createElement('button');
      btn.className = `editor-tab-btn ${this.currentIdx === i ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="tab-num">${i + 1}</span> 계명
        <span class="tab-badge-type">${isOx ? '⭕OX' : `${item?.options?.length || 2}선다`}</span>
      `;
      btn.addEventListener('click', () => {
        this.saveCurrentFormToMemory();
        this.currentIdx = i;
        this.renderTabs();
        this.loadFormFromMemory();
        sound.playSelect();
      });
      tabsBar.appendChild(btn);
    }
  }

  // 현재 활성화된 계명 데이터를 입력 폼에 로드
  loadFormFromMemory() {
    const item = this.data[this.currentIdx];
    if (!item) return;

    // 제목, 요절, 문제, 해설
    this.modalEl.querySelector('#edit-title').value = item.title || '';
    this.modalEl.querySelector('#edit-verse').value = item.verse || '';
    this.modalEl.querySelector('#edit-question').value = item.question || '';
    this.modalEl.querySelector('#edit-explanation').value = item.explanation || '';

    // 유형 버튼 스타일 업데이트
    const isOx = item.type === 'ox';
    const btnTypeOx = this.modalEl.querySelector('#btn-type-ox');
    const btnTypeMulti = this.modalEl.querySelector('#btn-type-multiple');
    const btnAddOption = this.modalEl.querySelector('#btn-add-option');
    const optionsGroupTitle = this.modalEl.querySelector('#options-group-title');

    if (btnTypeOx && btnTypeMulti) {
      btnTypeOx.classList.toggle('active', isOx);
      btnTypeMulti.classList.toggle('active', !isOx);
    }

    if (isOx) {
      if (btnAddOption) btnAddOption.classList.add('hidden');
      if (optionsGroupTitle) optionsGroupTitle.textContent = '⭕/❌ 정답 선택 (초록색 체크가 정답)';
    } else {
      if (btnAddOption) {
        btnAddOption.classList.remove('hidden');
        btnAddOption.disabled = (item.options?.length >= 4);
        btnAddOption.textContent = item.options?.length >= 4 ? '보기 4개 (최대)' : '➕ 보기 추가 (최대 4개)';
      }
      if (optionsGroupTitle) optionsGroupTitle.textContent = `${item.options?.length || 2}지선다 보기 및 정답 선택 (초록색 체크가 정답)`;
    }

    // 동적 보기 렌더링
    this.renderDynamicOptions(item);
  }

  // 동적 보기 리스트 렌더링
  renderDynamicOptions(item) {
    const container = this.modalEl.querySelector('#dynamic-options-container');
    if (!container) return;
    container.innerHTML = '';

    const isOx = item.type === 'ox';
    const options = item.options || [];

    options.forEach((optText, idx) => {
      const row = document.createElement('div');
      row.className = `edit-opt-item ${isOx ? 'ox-row' : ''}`;

      const radioName = 'correct-radio-active';
      const isChecked = item.answer === idx;

      if (isOx) {
        // OX 퀴즈용 보기
        const symbol = idx === 0 ? '⭕' : '❌';
        row.innerHTML = `
          <input type="radio" name="${radioName}" value="${idx}" ${isChecked ? 'checked' : ''} id="rad-opt-${idx}">
          <span class="opt-badge ox-badge ${idx === 0 ? 'badge-o' : 'badge-x'}">${symbol}</span>
          <input type="text" class="input-opt-text" data-idx="${idx}" value="${optText}">
        `;
      } else {
        // 객관식 (2~4지선다) 보기
        const canDelete = options.length > 2; // 최소 2개 유지
        row.innerHTML = `
          <input type="radio" name="${radioName}" value="${idx}" ${isChecked ? 'checked' : ''} id="rad-opt-${idx}">
          <span class="opt-badge">${idx + 1}번</span>
          <input type="text" class="input-opt-text" data-idx="${idx}" value="${optText}" placeholder="${idx + 1}번 보기 내용">
          ${canDelete ? `<button type="button" class="btn-del-opt" data-del="${idx}" title="보기 삭제">✕</button>` : ''}
        `;
      }

      container.appendChild(row);
    });

    // 보기 삭제 이벤트 바인딩
    if (!isOx) {
      const delBtns = container.querySelectorAll('.btn-del-opt');
      delBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const delIdx = parseInt(e.currentTarget.getAttribute('data-del'), 10);
          this.saveCurrentFormToMemory();
          if (item.options.length > 2) {
            item.options.splice(delIdx, 1);
            if (item.answer >= item.options.length) {
              item.answer = item.options.length - 1;
            }
            this.loadFormFromMemory();
            sound.playSelect();
          }
        });
      });
    }
  }

  // 현재 입력 폼에 적힌 내용을 메모리 배열에 반영
  saveCurrentFormToMemory() {
    const item = this.data[this.currentIdx];
    if (!item) return;

    item.title = this.modalEl.querySelector('#edit-title').value.trim();
    item.verse = this.modalEl.querySelector('#edit-verse').value.trim();
    item.question = this.modalEl.querySelector('#edit-question').value.trim();
    item.explanation = this.modalEl.querySelector('#edit-explanation').value.trim();

    // 텍스트 인풋에서 보기 내용 읽기
    const inputs = this.modalEl.querySelectorAll('.input-opt-text');
    const newOptions = [];
    inputs.forEach((inp) => {
      newOptions.push(inp.value.trim());
    });
    if (newOptions.length >= 2) {
      item.options = newOptions;
    }

    // 선택된 정답 라디오 읽기
    const checkedRad = this.modalEl.querySelector('input[name="correct-radio-active"]:checked');
    if (checkedRad) {
      item.answer = parseInt(checkedRad.value, 10);
    }
  }

  open() {
    this.isOpen = true;
    this.data = getCommandments();
    this.renderTabs();
    this.loadFormFromMemory();
    this.modalEl.classList.remove('hidden');
    sound.playSelect();
  }

  close() {
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
    sound.playSelect();
  }
}
