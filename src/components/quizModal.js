// 십계명 퀴즈 모달 컴포넌트
import { sound } from '../engine/soundEngine.js';

export class QuizModal {
  constructor(onSuccessCallback) {
    this.onSuccess = onSuccessCallback; // (commandmentId) => void
    this.currentQuiz = null;

    this.modalEl = document.getElementById('quiz-modal');
    this.titleEl = document.getElementById('quiz-title');
    this.verseEl = document.getElementById('quiz-verse');
    this.questionEl = document.getElementById('quiz-question');
    this.optionsContainer = document.getElementById('quiz-options-container');
    this.feedbackEl = document.getElementById('quiz-feedback');
    this.closeBtn = document.getElementById('btn-close-quiz');
    this.actionBtn = document.getElementById('btn-quiz-action');

    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }
    if (this.actionBtn) {
      this.actionBtn.addEventListener('click', () => {
        this.hide();
      });
    }
  }

  open(quizData, isAlreadySolved = false) {
    this.currentQuiz = quizData;
    this.titleEl.textContent = quizData.title;
    this.verseEl.textContent = `📖 ${quizData.verse}`;
    this.questionEl.textContent = quizData.question;
    this.feedbackEl.className = 'quiz-feedback hidden';
    this.feedbackEl.innerHTML = '';
    this.actionBtn.classList.add('hidden');

    this.optionsContainer.innerHTML = '';

    quizData.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span class="opt-num">${idx + 1}</span> <span class="opt-txt">${optText}</span>`;

      if (isAlreadySolved) {
        if (idx === quizData.answer) {
          btn.classList.add('correct');
        } else {
          btn.disabled = true;
        }
      } else {
        btn.addEventListener('click', () => this.handleAnswer(idx, btn));
      }

      this.optionsContainer.appendChild(btn);
    });

    if (isAlreadySolved) {
      this.showFeedback(true, `이미 멋지게 완성한 계명입니다! ✨<br>${quizData.explanation}`);
      this.actionBtn.textContent = '확인';
      this.actionBtn.classList.remove('hidden');
    }

    this.modalEl.classList.remove('hidden');
    sound.playSelect();
  }

  handleAnswer(chosenIndex, buttonEl) {
    if (!this.currentQuiz) return;

    const allButtons = this.optionsContainer.querySelectorAll('.quiz-opt-btn');
    const isCorrect = chosenIndex === this.currentQuiz.answer;

    if (isCorrect) {
      // 정답 처리
      buttonEl.classList.add('correct');
      allButtons.forEach(b => b.disabled = true);

      sound.playItemGet();
      this.showFeedback(true, `🎉 샬롬! 정답입니다!<br>${this.currentQuiz.explanation}<br><strong>📜 ${this.currentQuiz.title} 조각을 획득했습니다!</strong>`);

      this.actionBtn.textContent = '계명 조각 챙기기 🎒';
      this.actionBtn.classList.remove('hidden');

      if (this.onSuccess) {
        this.onSuccess(this.currentQuiz.id);
      }
    } else {
      // 오답 처리
      buttonEl.classList.add('wrong');
      sound.playWrong();
      this.showFeedback(false, `다시 한번 곰곰이 생각해보세요! 힘내요! 💡`);
      setTimeout(() => {
        buttonEl.classList.remove('wrong');
      }, 700);
    }
  }

  showFeedback(isSuccess, htmlContent) {
    this.feedbackEl.className = `quiz-feedback ${isSuccess ? 'success' : 'fail'}`;
    this.feedbackEl.innerHTML = htmlContent;
    this.feedbackEl.classList.remove('hidden');
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }
}
