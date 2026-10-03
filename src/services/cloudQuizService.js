// Firebase Firestore 기반 퀴즈 클라우드 저장 및 불러오기 서비스
// 무료 한도(Spark 요금제: 하루 5만 회 읽기/2만 회 쓰기) 내에서 안전하게 작동합니다.
// 브라우저 로컬스토리지에도 함께 백업하여 오프라인 환경에서도 안전하게 복원됩니다.

const CLOUD_STORAGE_KEY = 'sinai_cloud_quiz_list_v1';
const TEACHER_CODE_KEY = 'sinai_teacher_auth_code_v1';
const FIREBASE_CONFIG_KEY = 'sinai_custom_firebase_cfg_v1';

// 기본 교사 접속 마스터 코드 (초기값: sinai777)
const DEFAULT_TEACHER_CODE = 'sinai777';

export class CloudQuizService {
  constructor() {
    this.teacherCode = localStorage.getItem(TEACHER_CODE_KEY) || DEFAULT_TEACHER_CODE;
    this.firebaseConfig = this.loadFirebaseConfig();
    this.firestoreInitialized = false;
  }

  // 교사 비밀번호 인증 검사
  verifyTeacherCode(inputCode) {
    if (!inputCode) return false;
    return inputCode.trim() === this.teacherCode.trim();
  }

  // 교사 비밀번호 변경
  setTeacherCode(newCode) {
    if (!newCode || newCode.trim().length < 4) {
      throw new Error('교사 접속 코드는 4자리 이상이어야 합니다.');
    }
    this.teacherCode = newCode.trim();
    localStorage.setItem(TEACHER_CODE_KEY, this.teacherCode);
  }

  // 커스텀 Firebase 설정 불러오기
  loadFirebaseConfig() {
    try {
      const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // 커스텀 Firebase 설정 저장
  saveFirebaseConfig(config) {
    if (config) {
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
      this.firebaseConfig = config;
    } else {
      localStorage.removeItem(FIREBASE_CONFIG_KEY);
      this.firebaseConfig = null;
    }
  }

  // 로컬/클라우드 저장소에서 퀴즈 세트 목록 가져오기
  async getQuizList() {
    // 1. Firebase Firestore 연동 시도 (설정이 등록된 경우)
    if (this.firebaseConfig && window.firebase) {
      try {
        const remoteList = await this.fetchFromFirestore();
        if (remoteList && remoteList.length > 0) {
          // 로컬에도 동기화 캐시
          localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(remoteList));
          return remoteList;
        }
      } catch (err) {
        console.warn('[CloudQuizService] Firestore 목록 조회 실패, 로컬 캐시로 전환:', err);
      }
    }

    // 2. 브라우저 로컬 클라우드 저장소 반환
    try {
      const localData = localStorage.getItem(CLOUD_STORAGE_KEY);
      if (localData) {
        return JSON.parse(localData);
      }
    } catch (e) {
      console.error(e);
    }

    // 기본 내장 프리셋 제공
    const defaultPresets = [
      {
        id: 'preset_standard',
        title: '🌱 기본 십계명 탐험 퀴즈 (표준)',
        createdAt: new Date().toISOString(),
        itemCount: 10,
        description: '출애굽기 20장 기반 OX 퀴즈 및 다지선다 기본 문항'
      }
    ];
    return defaultPresets;
  }

  // 특정 퀴즈 세트 데이터 불러오기
  async getQuizById(id) {
    if (this.firebaseConfig && window.firebase) {
      try {
        const item = await this.fetchQuizDetailFromFirestore(id);
        if (item) return item;
      } catch (err) {
        console.warn('[CloudQuizService] Firestore 퀴즈 상세 로드 실패:', err);
      }
    }

    const list = await this.getQuizList();
    const found = list.find((q) => q.id === id);
    if (found && found.quizData) {
      return found.quizData;
    }
    return null;
  }

  // 퀴즈 세트 클라우드 저장
  async saveQuiz(title, description, quizData) {
    const list = await this.getQuizList();
    const newId = 'quiz_' + Date.now();
    const newEntry = {
      id: newId,
      title: title.trim(),
      description: description.trim() || '주일학교 십계명 퀴즈 세트',
      createdAt: new Date().toISOString(),
      itemCount: quizData.length,
      quizData
    };

    // 1. Firebase Firestore에 원격 업로드 시도
    let firestoreSuccess = false;
    if (this.firebaseConfig && window.firebase) {
      try {
        firestoreSuccess = await this.uploadToFirestore(newEntry);
      } catch (err) {
        console.warn('[CloudQuizService] Firestore 업로드 실패:', err);
      }
    }

    // 2. 로컬 브라우저 저장소에도 즉시 동기화 보존
    const updatedList = [newEntry, ...list.filter((q) => q.id !== newId)];
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(updatedList));

    return {
      success: true,
      entry: newEntry,
      remoteUploaded: firestoreSuccess
    };
  }

  // 퀴즈 세트 삭제
  async deleteQuiz(id) {
    let list = await this.getQuizList();
    list = list.filter((q) => q.id !== id);
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(list));

    if (this.firebaseConfig && window.firebase) {
      try {
        await this.deleteFromFirestore(id);
      } catch (e) {
        console.warn('[CloudQuizService] Firestore 삭제 실패:', e);
      }
    }
    return true;
  }

  // --- Firestore 연동 헬퍼 ---
  ensureFirebaseApp() {
    if (!window.firebase || !this.firebaseConfig) return null;
    if (!firebase.apps.length) {
      firebase.initializeApp(this.firebaseConfig);
    }
    return firebase.firestore();
  }

  async fetchFromFirestore() {
    const db = this.ensureFirebaseApp();
    if (!db) return null;
    const snapshot = await db.collection('commandment_quizzes').orderBy('createdAt', 'desc').get();
    const list = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      list.push({ ...data, id: doc.id });
    });
    return list;
  }

  async fetchQuizDetailFromFirestore(id) {
    const db = this.ensureFirebaseApp();
    if (!db) return null;
    const doc = await db.collection('commandment_quizzes').doc(id).get();
    if (doc.exists) {
      return doc.data().quizData;
    }
    return null;
  }

  async uploadToFirestore(entry) {
    const db = this.ensureFirebaseApp();
    if (!db) return false;
    await db.collection('commandment_quizzes').doc(entry.id).set(entry);
    return true;
  }

  async deleteFromFirestore(id) {
    const db = this.ensureFirebaseApp();
    if (!db) return false;
    await db.collection('commandment_quizzes').doc(id).delete();
    return true;
  }
}

export const cloudQuizService = new CloudQuizService();
