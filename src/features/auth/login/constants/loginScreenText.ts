/*
 * 필요: 로그인 UI에 고정으로 필요한 문구만 관리한다.
 * 연결: LoginPage, LoginForm.
 * 설명: 계정 일치 여부와 서버 응답은 API에서만 판단하고, 이 파일에는 가짜 계정이나 가짜 검증 결과를 두지 않는다.
 * 수정: 화면 문구가 바뀌면 이 파일에서만 조정한다.
 */
export const loginScreenText = {
  logoAlt: 'MG EMS 로고',
  pageTitle: 'MG EMS 로그인',
  idPlaceholder: '아이디',
  passwordPlaceholder: '패스워드',
  autoLoginLabel: '자동로그인',
  autoLoginOnLabel: 'ON',
  autoLoginOffLabel: 'OFF',
  submitLabel: '로그인',
  submittingSubmitLabel: '확인 중',
  validationMessages: {
    idRequired: '아이디를 입력해 주세요.',
    passwordRequired: '비밀번호를 입력해 주세요.',
    loginChecking: '로그인 정보를 확인 중입니다.',
    loginServerWaiting: '서버 인증 응답을 기다리는 중입니다.'
  }
};
