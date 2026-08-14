# 일반 정적 서버 배포 가이드

## 목적

Netlify가 본서버가 아니어도 같은 `dist`를 nginx, Apache, 사내 서버, NAS 정적 서버 등에 올릴 수 있게 기준을 고정한다.

이 프로젝트의 프론트는 빌드 후에도 `mzbk-runtime-config.js`에서 API 기준 주소를 바꿀 수 있다. 다만 브라우저 보안 정책 때문에 API 서버가 프론트와 다른 origin이면 아래 둘 중 하나는 반드시 필요하다.

- 정적 서버에서 `/api/*`를 실제 API 서버로 reverse proxy 한다.
- 백엔드가 해당 프론트 origin을 CORS 허용한다.

따라서 본서버, 임시 확인 서버, 사내 서버, NAS, nginx, Apache 어디에 올리더라도 배포 서버 기준으로 아래 정책 중 하나를 반드시 선택해야 한다.

- 권장: 프론트 서버의 `/api/*`를 실제 API 서버로 reverse proxy 한다.
- 대안: 백엔드 CORS에서 해당 프론트 origin을 명시 허용하고 `mzbk-runtime-config.js`에 절대 API 주소를 넣는다.

## 빌드 산출물

```bash
cd submit-react-publishing
npm install
npm run build
```

배포 대상은 `dist` 폴더다.

필수 파일:

- `dist/index.html`
- `dist/assets/*`
- `dist/mzbk-runtime-config.js`
- `dist/_redirects`

`_redirects`는 Netlify 전용이다. nginx/Apache에서는 자동으로 실행되지 않는다.

## 런타임 API 설정

배포 후 서버에 올라간 `mzbk-runtime-config.js`를 환경에 맞게 수정할 수 있다.

기본값:

```js
window.__MZBK_RUNTIME_CONFIG__ = {
  API_BASE_URL: '/api'
};
```

권장값:

```js
window.__MZBK_RUNTIME_CONFIG__ = {
  API_BASE_URL: '/api'
};
```

이 값은 프론트와 같은 origin의 `/api`로 요청을 보내고, 웹서버가 `/api`를 실제 API 서버로 프록시하는 구조다.

직접 API 서버를 지정하는 값:

```js
window.__MZBK_RUNTIME_CONFIG__ = {
  API_BASE_URL: 'http://efd.iptime.org:2016'
};
```

이 방식은 백엔드 CORS가 프론트 도메인을 허용할 때만 동작한다. 백엔드가 해당 배포 도메인을 CORS 허용하지 않는 경우 이 방식만으로는 로그인할 수 없다.

## nginx 공통 예시

nginx에 올리는 경우 정적 파일 location과 API proxy location을 함께 둔다. 포트와 도메인은 배포 서버에 맞게 바꾼다.

```nginx
server {
  listen 80;
  server_name frontend.example.com;

  root /path/to/mzbk/dist;
  index index.html;

  location /api/ {
    proxy_pass http://api.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

위 설정에서 프론트의 `POST /api/auth/login`은 nginx를 거쳐 API 서버의 `POST /auth/login`으로 전달된다.

## Apache 예시

Apache에서는 `mod_proxy`, `mod_proxy_http`, `mod_rewrite`가 필요하다.

```apache
DocumentRoot "/path/to/mzbk/dist"

ProxyPreserveHost On
ProxyPass "/api/" "http://api.example.com/"
ProxyPassReverse "/api/" "http://api.example.com/"

<Directory "/path/to/mzbk/dist">
  Options FollowSymLinks
  AllowOverride None
  Require all granted

  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</Directory>
```

## 서버 반영 후 확인

아래 결과가 나와야 한다.

```bash
curl -i http://frontend.example.com/login
curl -i -X POST http://frontend.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  --data "{\"userId\":\"admin\",\"password\":\"Admin123!\"}"
```

정상 기준:

- `/login`은 `200 OK`와 `index.html`을 반환한다.
- `/api/auth/login`은 nginx 405가 아니라 API JSON을 반환한다.
- 로그인 성공 시 `success:true`, `accessToken`이 내려온다.

## 현재 오류 원인 예시

특정 일반 정적 서버에서 `/_redirects`가 파일로 다운로드된다면, 그 서버는 Netlify의 `_redirects` 규칙을 해석하지 않는다는 뜻이다.

그 상태에서 브라우저가 `POST /api/auth/login`을 보내면 정적 서버가 직접 받아 `405 Not Allowed`를 반환할 수 있다. 이 경우 API 서버까지 요청이 전달되지 않은 것이다.

이 문제는 특정 포트나 특정 서버 한정 문제가 아니다. Netlify rewrite, nginx reverse proxy, Apache reverse proxy, 백엔드 CORS 중 하나가 환경별로 명확히 준비되어야 하는 배포 구조 문제다.
