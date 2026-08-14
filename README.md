# MZBK React Publishing

## 실행
```bash
npm install
npm run dev
```

## 빌드
```bash
npm run build
npm run preview
```

## 외부 공유 배포
- Git 연결 없이 외부 확인용 URL만 빠르게 만들 때는 Netlify 수동 배포를 사용한다.
- Vite 빌드 결과물인 `dist` 폴더를 Netlify에 업로드하면 된다.
- `npm run build`에는 Netlify SPA 새로고침 대응용 `_redirects` 준비가 포함되어 있다.
- 자세한 절차는 `DEPLOY_NETLIFY.md` 문서를 따른다.
- Netlify가 아닌 nginx/Apache/사내 정적 서버에 올릴 때는 `DEPLOY_STATIC_SERVER.md` 문서를 따른다.
- API 기준 주소는 배포 후 `dist/mzbk-runtime-config.js`에서 조정할 수 있다.

## 목적
- EMS 화면 퍼블리싱 납품용 React 프로젝트
- 백엔드 분리 구조
- UI/레이아웃/차트/테이블 중심

## 포함 화면
- 로그인
- 기저발전
- 보조발전
- 충방전 현황
- 운영 리포트
- 마스터 관리
- 코드 관리
- 사용자 관리
- 권한 관리
- 팝업 샘플

## 폴더 개요
- `src/components`: 공통 UI
- `src/layouts`: 레이아웃
- `src/pages`: 화면 단위 페이지
- `src/data/mock`: 목업 데이터
- `src/styles`: 전역 스타일

## 비고
- 저장/조회/엑셀/인쇄는 퍼블리싱용 버튼 상태만 구현
- 실제 API 연결은 별도 개발 단계에서 교체
