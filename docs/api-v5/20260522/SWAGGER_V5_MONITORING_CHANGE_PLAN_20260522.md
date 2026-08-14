# MZBK Swagger API v5 모니터링 변경 정리

- 작성일: 2026-05-22 KST
- 기준 Swagger UI: `http://efd.iptime.org:2016/swagger-ui/index.html`
- 기준 OpenAPI JSON: `http://efd.iptime.org:2016/v3/api-docs`
- 비교 기준: `docs/api-v4/20260509/openapi-v4-20260509.json`
- 이번 문서는 PM/분석 문서다. React 코드, CSS, ECharts 옵션, API 구현 코드는 변경하지 않는다.

## 1. 결론

v4 대비 API가 바뀌었다. v5로 별도 기준을 잡아야 한다.

| 항목 | v4 2026-05-09 | v5 2026-05-22 | 변경 |
| --- | ---: | ---: | ---: |
| path item | 48 | 52 | +4 |
| operation | 76 | 80 | +4 |
| schema | 94 | 95 | +1 |

핵심 변경은 모니터링/트렌드/보고서 계열이다.

- `/trend/*/detail` 상세 조회 API 4개가 새로 추가됐다.
- `/monitoring/*/detail`은 path와 response는 유지됐지만 summary와 operationId가 바뀌었다.
- `Dashboard*`, `MonitoringSearchRequest`, `TrendSearchRequest`, `ReportSearchRequest`, `PowerPageResponse`, `Power*Response` schema 필드가 크게 바뀌었다.
- `PowerMetricSummaryResponse`가 신규 추가됐다.
- 실데이터 GET 확인은 현재 `admin/admin` 로그인 실패로 막혔다. v4 당시에는 성공했으나, 2026-05-22 기준 `POST /auth/login`이 `401/C002`를 반환한다.

## 2. v5 산출물

| 파일 | 용도 |
| --- | --- |
| `openapi-v5-20260522.json` | 2026-05-22 현재 Swagger 원본 스냅샷 |
| `swagger-v5-diff-summary-20260522.json` | v4 대비 operation/schema 변경 기계 비교 결과 |
| `swagger-v5-schema-field-diff-20260522.json` | 모니터링 관련 schema 필드 추가/삭제/변경 상세 |
| `swagger-v5-live-check-20260522.json` | 주요 API 실호출 시도 결과. 현재 인증 실패 기록 포함 |
| `SWAGGER_V5_MONITORING_CHANGE_PLAN_20260522.md` | PM 기준 변경 정리 및 작업 방향 |
| `SWAGGER_V5_SCHEMA_RESPONSE_REFERENCE_20260522.md` | 퍼블리싱 코어 작업용 요청/응답 필드 기준 |

## 3. 새로 추가된 operation

| Method | Path | Tag | Request | Response | PM 판단 |
| --- | --- | --- | --- | --- | --- |
| GET | `/trend/baseline/detail` | `03. Trend` | `TrendSearchRequest` | `ApiResponseListPowerDetailResponse` | 기저전력 이력 상세용 신규 API |
| GET | `/trend/peak-respond/detail` | `03. Trend` | `TrendSearchRequest` | `ApiResponseListPowerDetailResponse` | 보조전력 이력 상세용 신규 API |
| GET | `/trend/reserved/detail` | `03. Trend` | `TrendSearchRequest` | `ApiResponseListPowerDetailResponse` | 예비전력 이력 상세용 신규 API |
| GET | `/trend/power-supply/detail` | `03. Trend` | `TrendSearchRequest` | `ApiResponseListPowerDetailResponse` | 전력급전 이력 상세용 신규 API |

기존 v4에서는 Trend 목록만 있었고 상세는 Monitoring 쪽에만 있었다. v5에서는 이력 화면에서도 상세 팝업/상세 테이블 연결 근거가 생겼다.

## 4. 기존 operation 변경

| Path | v4 | v5 | 영향 |
| --- | --- | --- | --- |
| `/monitoring/baseline/detail` | operationId `baselineDetail`, summary `기저전력 운전현황 상세 조회` | operationId `baselineDetail_1`, summary `기저전력 상세 조회` | path/response 유지. Swagger client 자동생성 시 함수명 충돌 가능 |
| `/monitoring/peak-respond/detail` | operationId `peakRespondDetail` | operationId `peakRespondDetail_1` | path/response 유지. 명칭만 변경 |
| `/monitoring/reserved/detail` | operationId `reservedDetail` | operationId `reservedDetail_1` | path/response 유지. 명칭만 변경 |
| `/monitoring/power-supply/detail` | operationId `powerSupplyDetail` | operationId `powerSupplyDetail_1` | path/response 유지. 명칭만 변경 |
| `/report/daily`, `/report/weekly`, `/report/monthly`, `/report/yearly` | tag `04. Report` | tag `03. Report` | path/request/response 유지. 문서 분류만 변경 |

프론트 직접 호출 코드는 path 기준이면 큰 영향이 없다. 단, Swagger에서 operationId 기준으로 생성하거나 mapping하는 구조라면 함수명이 바뀔 수 있다.

## 5. schema 변경 핵심

### 5.1 검색 조건 확장

`DashboardSearchRequest`, `MonitoringSearchRequest`, `ReportSearchRequest`에 설비 시리얼 기준 조회 필드가 추가됐다.

| 필드 | 의미 |
| --- | --- |
| `serialType` | 설비 구분. 예: `GRID`, `PCS`, `BAT`, `ESS`, `DSL`, `AC` |
| `serialNo` | 설비 시리얼 번호 |
| `groupBySerial` | 시리얼별 그룹 조회 여부 |

`DashboardSearchRequest`에서는 기존 `inverterId`가 제거됐다. 이제 인버터 단일 조회도 `serialType/serialNo/groupBySerial` 체계로 맞추는 방향으로 보인다.

### 5.2 TrendSearchRequest 변경

| 구분 | 필드 |
| --- | --- |
| 추가 | `baseYear`, `baseMonth`, `searchType`, `serialType`, `serialNo`, `groupBySerial` |
| 제거 | `resolvedStartDate`, `resolvedEndDate`, `searchDateType` |
| 유지/변경 | `startDate`, `endDate`, `outputUnit` |

기존에 서버 계산값처럼 보였던 `resolvedStartDate/resolvedEndDate`가 빠졌다. 이력/현황 검색 조건은 `searchType`, `baseYear`, `baseMonth`, `startDate`, `endDate`, `outputUnit` 기준으로 다시 정리해야 한다.

### 5.3 PowerPageResponse 확장

`PowerPageResponse`에 조회 기준과 설비 기준 필드가 추가됐다.

| 추가 필드 | 의미 |
| --- | --- |
| `operYmd`, `operTime` | 운전 기준일/시간 |
| `startDate`, `endDate` | 기간 기준 |
| `serialType`, `serialNo`, `groupBySerial` | 설비 시리얼 기준 |
| `metrics` | 신규 `PowerMetricSummaryResponse` |

기존 `summary`, `chartList`, `tableList`만 보는 구조는 그대로 살릴 수 있지만, v5에서는 `metrics`와 시리얼 기준 필드를 같이 받을 수 있게 adapter를 열어 둬야 한다.

### 5.4 Dashboard 응답 확장

`DashboardIntegratedResponse`와 `DashboardIndividualResponse`에 `serialType`, `serialNo`, `groupBySerial`이 추가됐다. 통합 대시보드에는 아래 총합 필드도 추가됐다.

| 필드 | 의미 |
| --- | --- |
| `totalSolarActivePower` | 태양광 총 유효전력 |
| `totalSolarReactivePower` | 태양광 총 무효전력 |
| `totalPcsPower` | PCS 총 전력량 |
| `totalDieselPower` | 디젤 발전 총 전력량 |
| `totalBatteryCharge` | 배터리 총 충전량 |
| `totalBatteryDischarge` | 배터리 총 방전량 |
| `totalLoadPower` | 부하 총 사용 전력량 |
| `useRate` | 전력 사용률 |

장비별 응답(`DashboardBatteryResponse`, `DashboardPcsResponse`, `DashboardInverterResponse`, `DashboardBankResponse`, `DashboardDieselResponse`, `DashboardAcResponse`)에도 `serialNo`가 추가됐다.

## 6. 퍼블리싱 코어 작업 방향

이번 v5 반영은 디자인 변경이 아니라 API adapter 기준 변경이다. 화면 구조와 컴포넌트 디자인은 건드리지 않는다.

작업 순서:

1. `src/shared/api/monitoringApi.ts`의 request type과 adapter에서 `serialType`, `serialNo`, `groupBySerial`을 optional로 받을 수 있게 기준을 잡는다.
2. dashboard adapter에서 `inverterId` 의존을 제거하고 `serialType/serialNo` 체계로 매핑한다.
3. `PowerPageResponse.metrics`를 optional로 수용한다. 기존 `summary/chartList/tableList` 렌더링은 유지한다.
4. 현황 상세는 기존 `/monitoring/*/detail` path를 유지하되, operationId 변경은 코드 영향 없음으로 처리한다.
5. 이력 상세는 신규 `/trend/*/detail` 4개를 별도 API 함수로 추가할 수 있게 준비한다.
6. 보고서 API는 path/response 변화는 없고 tag만 바뀌었으므로, 보고서 화면은 schema 필드 확장 수용만 확인한다.

## 7. 확인 필요 항목

- 현재 `admin/admin` 로그인이 실패한다. 실데이터 확인용 계정을 업체에 다시 받아야 한다.
- `serialType` 허용값은 schema description 기준이며, 실제 enum validation 여부는 실호출로 확인해야 한다.
- `groupBySerial=true`일 때 `chartList/tableList`가 시리얼별로 몇 row/series를 반환하는지 실데이터 확인이 필요하다.
- `PowerMetricSummaryResponse`를 화면에 노출할지, 내부 계산/요약 보조값으로만 둘지 PM 판단이 필요하다.
- `/trend/*/detail` 신규 API를 어느 화면의 상세 버튼에 연결할지 퍼블리싱 코어에서 화면별로 매핑해야 한다.

## 8. 다음 작업 1개

퍼블리싱 코어 방의 다음 작업은 `monitoringApi.ts v5 adapter 기준 반영` 1개로 고정한다.

범위는 API 호출/응답 변환만이다. 디자인, CSS, 차트 옵션, 레이아웃은 건드리지 않는다.
