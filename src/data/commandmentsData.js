// 십계명 10개 미션 성경 퀴즈 및 요절 데이터
// OX 퀴즈 및 가변형 객관식(기본 2지선다 ~ 최대 4지선다, 보기 추가/삭제 지원)

export const COMMANDMENTS_DATA = [
  {
    id: 1,
    type: 'ox', // 'ox' 또는 'multiple'
    title: '제1계명: 오직 하나님만 섬겨요',
    verse: '너는 나 외에는 다른 신들을 네게 두지 말라 (출 20:3)',
    question: '하나님 외에 세상의 다른 신이나 우상을 섬겨도 괜찮을까요?',
    options: ['O (섬겨도 된다)', 'X (오직 하나님만 섬겨야 한다)'],
    answer: 1, // X (1번 인덱스)
    explanation: '우리를 창조하시고 구원하신 분은 오직 여호와 하나님 한 분뿐이에요!'
  },
  {
    id: 2,
    type: 'multiple',
    title: '제2계명: 우상을 만들거나 절하지 마세요',
    verse: '너를 위하여 새긴 우상을 만들지 말고... 그것들에게 절하지 말며 (출 20:4-5)',
    question: '하나님을 대신하여 돌이나 금으로 조각상을 만들고 빌면 될까요?',
    options: [
      '예쁘게 만들면 절해도 괜찮다',
      '절대로 어떤 형상이든 우상을 만들어 절하면 안 된다'
    ],
    answer: 1,
    explanation: '하나님은 눈에 보이는 인형이나 석판에 갇히지 않는 영이시며 온 세상의 주인이세요.'
  },
  {
    id: 3,
    type: 'ox',
    title: '제3계명: 하나님의 이름을 소중히 여겨요',
    verse: '너는 네 하나님 여호와의 이름을 망령되게 부르지 말라 (출 20:7)',
    question: '장난치거나 화가 날 때 하나님의 이름을 함부로 막 불러도 될까요?',
    options: ['O (함부로 불러도 된다)', 'X (거룩하고 존귀하게 불러야 한다)'],
    answer: 1,
    explanation: '하나님의 이름은 거룩해요. 언제나 존귀하고 사랑하는 마음으로 찬양해요.'
  },
  {
    id: 4,
    type: 'multiple',
    title: '제4계명: 안식일을 기억하여 거룩히 지켜요',
    verse: '안식일을 기억하여 거룩하게 지키라 (출 20:8)',
    question: '일주일 중 하나님께 예배드리고 거룩히 쉼을 얻는 날은 언제일까요?',
    options: [
      '주일(안식일)',
      '그냥 늦잠 자고 노는 평일',
      '숙제만 하루 종일 하는 날'
    ],
    answer: 0,
    explanation: '하나님께서 천지를 창조하시고 일곱째 날에 안식하셨듯이, 주일을 지켜 하나님께 예배해요.'
  },
  {
    id: 5,
    type: 'ox',
    title: '제5계명: 부모님을 공경해요',
    verse: '네 부모를 공경하라 그리하면 네 하나님 여호와가 네게 준 땅에서 네 생명이 길리라 (출 20:12)',
    question: '나를 사랑으로 낳아주시고 길러주신 부모님께 감사하고 순종하는 것은 하나님이 기뻐하시는 일일까요?',
    options: ['O (하나님이 기뻐하시는 약속의 계명이다)', 'X (내 마음대로 살아도 된다)'],
    answer: 0,
    explanation: '부모님을 공경하는 것은 하나님께서 약속하신 큰 축복의 첫 계명이에요!'
  },
  {
    id: 6,
    type: 'multiple',
    title: '제6계명: 생명을 소중히 여기고 사랑해요',
    verse: '살인하지 말라 (출 20:13)',
    question: '생명을 사랑하시는 하나님의 말씀에 따라 친구를 대하는 올바른 태도는 무엇일까요?',
    options: [
      '친구를 미워하고 욕을 한다',
      '친구가 다쳐도 모른 척한다',
      '하나님이 주신 모든 생명을 아끼고 친구를 축복한다',
      '내 마음에 안 들면 따돌린다'
    ],
    answer: 2,
    explanation: '예수님께서는 친구를 미워하는 것도 살인과 같다고 하셨어요. 서로 용서하고 축복해요.'
  },
  {
    id: 7,
    type: 'ox',
    title: '제7계명: 마음과 몸을 깨끗하게 지켜요',
    verse: '간음하지 말라 (출 20:14)',
    question: '우리의 몸과 마음은 성령님이 거하시는 거룩한 성전이므로 깨끗하고 순결하게 지켜야 할까요?',
    options: ['O (성령의 전이므로 정결하게 지켜야 한다)', 'X (더러운 영상이나 유혹을 봐도 상관없다)'],
    answer: 0,
    explanation: '하나님께서 주신 아름다운 가정과 나의 몸을 순결하고 거룩하게 지켜요.'
  },
  {
    id: 8,
    type: 'multiple',
    title: '제8계명: 남의 물건을 훔치지 말아요',
    verse: '도둑질하지 말라 (출 20:15)',
    question: '친구의 물건이나 다른 사람의 소유를 보았을 때 올바른 행동은?',
    options: [
      '주인 몰래 내 주머니에 챙긴다',
      '절대로 훔치지 않고, 필요하면 예의 바르게 빌린다'
    ],
    answer: 1,
    explanation: '정직하고 정당하게 하나님이 주신 것에 감사하며 남의 것을 소중히 여겨요.'
  },
  {
    id: 9,
    type: 'ox',
    title: '제9계명: 거짓말하지 않고 정직해요',
    verse: '네 이웃에 대하여 거짓 증거하지 말라 (출 20:16)',
    question: '혼날까 봐 두려울 때는 거짓말을 지어내 친구에게 덮어씌워도 괜찮을까요?',
    options: ['O (거짓말로 위기를 모면해도 된다)', 'X (용기 있게 정직을 말해야 한다)'],
    answer: 1,
    explanation: '하나님은 진실하신 분이에요. 언제나 거짓을 버리고 정직을 말해요.'
  },
  {
    id: 10,
    type: 'multiple',
    title: '제10계명: 남의 것을 탐내지 않고 감사해요',
    verse: '네 이웃의 집을 탐내지 말라... 네 이웃의 소유를 탐내지 말라 (출 20:17)',
    question: '친구가 가진 멋진 장난감을 보았을 때 성경적인 멋진 마음가짐은?',
    options: [
      '질투하고 빼앗고 싶어 떼를 쓴다',
      '친구를 험담하며 미워한다',
      '친구를 함께 축하해주고 내가 받은 은혜에 감사한다',
      '부모님께 무조건 사달라고 조른다'
    ],
    answer: 2,
    explanation: '욕심과 탐욕을 버리고 하나님이 내게 주신 은혜에 감사할 때 마음에 참 평안이 넘쳐요.'
  }
];

// 로컬스토리지 키 (버전 2로 개편)
const STORAGE_KEY = 'sinai_custom_commandments_v2';

// 최신 퀴즈 데이터셋 가져오기 (커스텀 데이터 우선, 없으면 기본값)
export function getCommandments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 10) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('커스텀 퀴즈 불러오기 실패, 기본값 사용:', e);
  }
  // 기본 데이터 깊은 복사본 반환
  return JSON.parse(JSON.stringify(COMMANDMENTS_DATA));
}

// 퀴즈 데이터셋 로컬 저장
export function saveCommandments(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('퀴즈 저장 실패:', e);
    return false;
  }
}

// 기본 퀴즈 데이터로 복구
export function resetCommandments() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // 무시
  }
  return JSON.parse(JSON.stringify(COMMANDMENTS_DATA));
}
