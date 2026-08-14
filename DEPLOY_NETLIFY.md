# Netlify 외부 공유 가이드

## 목적
- Git 연동 없이 Netlify에 수동 배포해서 외부 확인용 공개 URL을 빠르게 만든다.
- 이 프로젝트는 Vite 기반 React SPA이므로 빌드 결과물은 `dist` 폴더를 사용한다.
- React Router 새로고침 404를 막기 위해 `public/_redirects`가 포함되어 있어야 한다.
- Netlify가 아닌 일반 정적 서버에 올릴 때는 `DEPLOY_STATIC_SERVER.md`를 따른다.

## 배포 전에 알아둘 점
- Netlify 수동 배포 URL은 기본적으로 공개 URL이다.
- 링크를 받은 사람은 로그인 화면에서 실 API 인증 후 사이트에 접근한다.
- 현재 확인 기준 계정은 `admin / Admin123!`이다.
- Netlify 정적 배포에서는 `/api/*` 요청을 실제 API 서버로 프록시해야 하므로 `dist/_redirects`에 API rewrite가 포함되어 있어야 한다.
- 빌드 후 API 기준 주소는 `dist/mzbk-runtime-config.js`에서 바꿀 수 있다.

## 가장 빠른 배포 방법
1. 로컬에서 프로젝트 폴더로 이동한다.
2. 의존성을 설치한다.
3. 배포용 정적 파일을 빌드한다.
4. 생성된 `dist` 폴더를 Netlify에 수동 업로드한다.
5. 발급된 `https://사이트이름.netlify.app` URL을 외부에 전달한다.

## 실제 명령어
```bash
cd submit-react-publishing
npm install
npm run build
```

## 빌드 결과 확인
- 빌드가 끝나면 `submit-react-publishing/dist` 폴더가 생성된다.
- `dist/index.html`이 있어야 한다.
- `dist/_redirects`가 있어야 한다.
- 현재 `npm run build`에는 Netlify용 `_redirects`를 `dist`로 복사하는 준비 단계가 포함되어 있다.

## Netlify 수동 업로드 절차
1. [https://app.netlify.com/](https://app.netlify.com/) 에 로그인한다.
2. 팀 또는 개인 워크스페이스에서 새 사이트 생성 화면으로 이동한다.
3. `Deploy manually` 또는 드래그 앤 드롭 배포 영역을 연다.
4. `submit-react-publishing/dist` 폴더 자체를 브라우저에 드래그해서 올린다.
5. 업로드가 끝나면 Netlify가 기본 공개 URL을 생성한다.
6. 필요하면 사이트 이름을 변경해 URL을 읽기 쉬운 형태로 바꾼다.

## 외부 공유 시 전달 문구 예시
```text
외부 확인용 URL입니다.
브라우저에서 바로 열리며, 로그인 화면 진입 후 확인 가능합니다.
확인 계정: admin / Admin123!
```

## 주의 사항
- `src` 폴더나 프로젝트 루트 전체를 올리는 게 아니라 반드시 `dist` 폴더를 올린다.
- 새 수정 사항이 생기면 다시 `npm run build` 후 새 `dist`를 다시 올려야 한다.
- 현재 URL은 외부 공개 URL이므로 민감한 정보가 포함된 화면이나 실제 운영 데이터는 올리면 안 된다.
- Netlify에 수동 업로드한 뒤 특정 하위 경로를 새로고침해도 열리고 `/api/*`가 실제 API로 전달되도록 `dist/_redirects`가 포함되게 설정해 두었다.
- `_redirects`의 `/api/* http://efd.iptime.org:2016/:splat 200!` 규칙이 빠지면 Netlify 배포본에서 `/api/auth/login`이 404로 떨어진다.

## 이 프로젝트 기준 체크리스트
- [ ] `npm run build` 성공
- [ ] `dist/index.html` 생성 확인
- [ ] `dist/_redirects` 생성 확인
- [ ] Netlify 업로드 완료
- [ ] 발급 URL 접속 확인
- [ ] `/login` 또는 주요 화면 새로고침 확인
