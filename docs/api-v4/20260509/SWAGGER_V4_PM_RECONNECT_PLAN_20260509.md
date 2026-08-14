# MZBK Swagger API 4차 정리 및 재연결 기준

- 작성일: 2026-05-09 KST
- 기준 Swagger UI: `http://efd.iptime.org:2016/swagger-ui/index.html`
- 기준 OpenAPI JSON: `http://efd.iptime.org:2016/v3/api-docs`
- 비교 기준: `.plan_data/20260503/openapi-v3-20260503.json`
- 이번 문서는 PM/분석 문서다. React 코드, CSS, ECharts 옵션, API 구현 코드는 변경하지 않았다.

## 1. 결론

- API 계약이 또 흔들린 것은 맞다. 기존 v3 연결표를 그대로 쓰면 일부 화면은 403 또는 500으로 떨어진다.
- v4 핵심 변경은 `Dashboard`, `Monitoring`, `Trend`, `Report` 쪽이다.
- 더 이상 화면 API 기준으로 쓰면 안 되는 경로는 `/monitoring/dashboard/*`, `/monitoring/base/*`, `/monitoring/assist`, `/monitoring/standby`, `/monitoring/dispatch`, `/analysis/*`다.
- 페이지 디자인/컴포넌트는 건드리지 말고, 퍼블리싱 코어 방에서는 공통 API adapter가 v4 응답을 기존 화면 ViewModel로 변환하도록 작업해야 한다.
- 보고서 API는 경로가 유지됐지만 응답이 배열 계열에서 `PowerPageResponse` 객체로 바뀌었다. 현재 배열 처리 로직과 충돌 가능성이 높다.

## 2. Swagger v4 현황

| 항목 | 값 |
| --- | --- |
| OpenAPI 조회 시각 | 2026-05-09T04:33:09.409Z |
| path item 수 | 48 |
| operation 수 | 76 |
| tag 수 | 15 |
| schema 수 | 94 |
| v3 대비 추가 operation | 15 |
| v3 대비 삭제 operation | 12 |
| v3 대비 변경 operation | 29 |
| v3 대비 추가 schema | 24 |
| v3 대비 삭제 schema | 18 |
| 대표 API 실호출 | 37개 중 29개 2xx, 8개 실패 |

## 3. v3 대비 추가된 operation

| Method | Path | Response | 화면 영향 |
| --- | --- | --- | --- |
| GET | `/dashboard/integrated` | `ApiResponseDashboardIntegratedResponse` | 발전소 운영현황 통합 대시보드 신규 기준 |
| GET | `/dashboard/individual` | `ApiResponseDashboardIndividualResponse` | 발전소 운영현황 개별 대시보드 신규 기준 |
| GET | `/monitoring/baseline` | `ApiResponsePowerPageResponse` | 기저전력 운전현황 신규 기준 |
| GET | `/monitoring/baseline/detail` | `ApiResponseListPowerDetailResponse` | 기저전력 상세/팝업 후보 |
| GET | `/monitoring/peak-respond` | `ApiResponsePowerPageResponse` | 보조전력 운전현황 신규 기준 |
| GET | `/monitoring/peak-respond/detail` | `ApiResponseListPowerDetailResponse` | 보조전력 상세/팝업 후보 |
| GET | `/monitoring/reserved` | `ApiResponsePowerPageResponse` | 예비전력 운전현황 신규 기준 |
| GET | `/monitoring/reserved/detail` | `ApiResponseListPowerDetailResponse` | 예비전력 상세/팝업 후보 |
| GET | `/monitoring/power-supply` | `ApiResponsePowerPageResponse` | 전력급전 운영현황 신규 기준 |
| GET | `/monitoring/power-supply/detail` | `ApiResponseListPowerDetailResponse` | 전력급전 상세/팝업 후보 |
| GET | `/trend/baseline` | `ApiResponsePowerPageResponse` | 기저전력 운영이력 신규 기준 |
| GET | `/trend/peak-respond` | `ApiResponsePowerPageResponse` | 보조전력 운영이력 신규 기준 |
| GET | `/trend/reserved` | `ApiResponsePowerPageResponse` | 예비전력 운영이력 신규 기준 |
| GET | `/trend/power-supply` | `ApiResponsePowerPageResponse` | 전력급전 운영이력 신규 기준 |
| GET | `/master/plants/init` | `ApiResponseMasterInitResponse` | 마스터 화면 초기 로딩 데이터 신규 기준 |

## 4. v3 대비 삭제된 operation

| Method | 삭제된 Path | 대체 Path |
| --- | --- | --- |
| GET | `/monitoring/dashboard/total` | `/dashboard/integrated` |
| GET | `/monitoring/dashboard/plant` | `/dashboard/individual` |
| GET | `/monitoring/base/total` | `/monitoring/baseline` |
| GET | `/monitoring/base/plant` | `/monitoring/baseline` |
| GET | `/monitoring/assist` | `/monitoring/peak-respond` |
| GET | `/monitoring/standby` | `/monitoring/reserved` |
| GET | `/monitoring/dispatch` | `/monitoring/power-supply` |
| GET | `/analysis/base/total/history` | `/trend/baseline` |
| GET | `/analysis/base/plant/history` | `/trend/baseline` |
| GET | `/analysis/assist/history` | `/trend/peak-respond` |
| GET | `/analysis/standby/history` | `/trend/reserved` |
| GET | `/analysis/dispatch/history` | `/trend/power-supply` |

## 5. 응답 형태가 바뀐 operation

| Operation | v3 | v4 | 영향 |
| --- | --- | --- | --- |
| `GET /report/daily` | `ApiResponseListOperationReportResponse` | `ApiResponsePowerPageResponse` | 배열 처리 제거 또는 adapter 변환 필요 |
| `GET /report/weekly` | `ApiResponseListOperationReportResponse` | `ApiResponsePowerPageResponse` | 배열 처리 제거 또는 adapter 변환 필요 |
| `GET /report/monthly` | `ApiResponseListOperationReportResponse` | `ApiResponsePowerPageResponse` | 배열 처리 제거 또는 adapter 변환 필요 |
| `GET /report/yearly` | `ApiResponseListOperationReportResponse` | `ApiResponsePowerPageResponse` | 배열 처리 제거 또는 adapter 변환 필요 |
| `POST /master/plants` | `ApiResponseVoid` | `ApiResponsePlantMasterResponse` | 저장 후 반환 객체 사용 가능 |
| `PUT /master/plants/{plntId}/{plntSeq}` | `ApiResponseVoid` | `ApiResponsePlantMasterResponse` | 수정 후 반환 객체 사용 가능 |
| `POST /master/pcs` | `ApiResponseVoid` | `ApiResponsePcsMasterResponse` | 저장 후 반환 객체 사용 가능 |
| `PUT /master/pcs/{pcsId}/{pcsSeq}` | `ApiResponseVoid` | `ApiResponsePcsMasterResponse` | 수정 후 반환 객체 사용 가능 |
| `POST /master/batteries` | `ApiResponseVoid` | `ApiResponseBatteryMasterResponse` | 저장 후 반환 객체 사용 가능 |
| `PUT /master/batteries/{batId}/{batSeq}` | `ApiResponseVoid` | `ApiResponseBatteryMasterResponse` | 수정 후 반환 객체 사용 가능 |
| `POST /master/inverters` | `ApiResponseVoid` | `ApiResponseInverterMasterResponse` | 저장 후 반환 객체 사용 가능 |
| `PUT /master/inverters/{ivtId}/{ivtSeq}` | `ApiResponseVoid` | `ApiResponseInverterMasterResponse` | 수정 후 반환 객체 사용 가능 |
| `POST /master/diesels` | `ApiResponseVoid` | `ApiResponseDieselMasterResponse` | 저장 후 반환 객체 사용 가능 |
| `PUT /master/diesels/{dslId}/{dslSeq}` | `ApiResponseVoid` | `ApiResponseDieselMasterResponse` | 수정 후 반환 객체 사용 가능 |

## 6. 페이지에 보이는 화면 기준 재연결표

| 화면/메뉴 | 현재 화면/라우트 | v4 API 기준 | 요청 | 응답 | PM 처리 기준 |
| --- | --- | --- | --- | --- | --- |
| 로그인 | `/login` | `POST /auth/login` | `LoginRequest(userId, password)` | `LoginResponse` | 로그인 필드명은 `usrId/usrPw`가 아니라 `userId/password`로 확정 |
| 세션 확인 | `AuthSessionProvider` | `GET /me` | 없음 | `MeResponse` | 새로고침/세션복구 기준. 401이면 로그인 이동 |
| 사이드바 메뉴 | `Sidebar/navigationMenuAdapter` | `GET /me/menus` | 없음 | `MyMenuResponse[]` | 화면 메뉴는 `/system/menus`가 아니라 `/me/menus` 기준 |
| 발전소 운영현황 통합 | `/monitoring/dashboard/total` | `GET /dashboard/integrated` | `DashboardSearchRequest` | `DashboardIntegratedResponse` | UI 라우트는 유지해도 API만 새 경로로 교체 |
| 발전소 운영현황 개별 | `/monitoring/dashboard/plant` | `GET /dashboard/individual` | `DashboardSearchRequest(inverterId optional)` | `DashboardIndividualResponse` | 개별 선택 기준은 `inverterId` 사용 여부 확인 필요 |
| 기저전력 통합/개별 운전현황 | `/monitoring/base/total`, `/monitoring/base/plant` | `GET /monitoring/baseline` | `MonitoringSearchRequest(operYmd, operTime)` | `PowerPageResponse` | v4에는 total/plant 분기 경로가 없음. 라우트는 유지하되 API 분기 기준 확인 필요 |
| 기저전력 상세 | 상세/팝업/테이블 확장 | `GET /monitoring/baseline/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` | `detailYn` 행에서 상세 테이블/팝업 연결 후보 |
| 보조전력 운전현황 | `/monitoring/assist` | `GET /monitoring/peak-respond` | `MonitoringSearchRequest` | `PowerPageResponse` | `assist` API명 제거, `peak-respond`로 고정 |
| 보조전력 상세 | 상세/팝업/테이블 확장 | `GET /monitoring/peak-respond/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` | 보조전력 상세 데이터 |
| 예비전력 운전현황 | `/monitoring/standby` | `GET /monitoring/reserved` | `MonitoringSearchRequest` | `PowerPageResponse` | `standby` API명 제거, `reserved`로 고정 |
| 예비전력 상세 | 상세/팝업/테이블 확장 | `GET /monitoring/reserved/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` | 예비전력 상세 데이터 |
| 전력급전 운영현황 | `/monitoring/dispatch` | `GET /monitoring/power-supply` | `MonitoringSearchRequest` | `PowerPageResponse` | `dispatch` API명 제거, `power-supply`로 고정 |
| 전력급전 상세 | 상세/팝업/테이블 확장 | `GET /monitoring/power-supply/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` | 전력급전 상세 데이터 |
| 기저전력 운영이력 | `/analysis/base/*/history` | `GET /trend/baseline` | `TrendSearchRequest` | `PowerPageResponse` | `analysis` API 제거. total/plant 이력 분기 기준 없음 |
| 보조전력 운영이력 | `/analysis/assist/history` | `GET /trend/peak-respond` | `TrendSearchRequest` | `PowerPageResponse` | `analysis/assist` 제거 |
| 예비전력 운영이력 | `/analysis/standby/history` | `GET /trend/reserved` | `TrendSearchRequest` | `PowerPageResponse` | `analysis/standby` 제거 |
| 전력급전 운영이력 | `/analysis/dispatch/history` | `GET /trend/power-supply` | `TrendSearchRequest` | `PowerPageResponse` | `analysis/dispatch` 제거 |
| 일간/주간/월간/년간 보고서 | `/report/daily`, `/report/weekly`, `/report/monthly`, `/report/yearly` | 동일 경로 | `ReportSearchRequest` | `PowerPageResponse` | 경로는 유지됐지만 응답이 배열에서 객체로 변경 |
| 마스터 초기 로딩 | `/master/*` 페이지 진입 | `GET /master/plants/init` | 없음 | `MasterInitResponse` | 발전소/PCS/배터리/인버터/디젤 init 묶음 |
| 발전소 마스터 | `/master/plants` | `/master/plants...` | `MasterSearchRequest`, `PlantMasterRequest` | `PageResponseDtoPlantMasterResponse`, `PlantMasterResponse` | POST/PUT 응답이 void에서 객체로 변경 |
| PCS 마스터 | `/master/pcs` | `/master/pcs...` | `MasterSearchRequest`, `PcsMasterRequest` | `PageResponseDtoPcsMasterResponse`, `PcsMasterResponse` | 목록/상세는 유지, 저장 응답 객체화 |
| 배터리 마스터 | `/master/batteries` | `/master/batteries...` | `MasterSearchRequest`, `BatteryMasterRequest` | `PageResponseDtoBatteryMasterResponse`, `BatteryMasterResponse` | 2026-05-09 실호출 200 |
| 인버터 마스터 | `/master/inverters` | `/master/inverters...` | `MasterSearchRequest`, `InverterMasterRequest` | `PageResponseDtoInverterMasterResponse`, `InverterMasterResponse` | 저장 응답 객체화 |
| 디젤발전기 마스터 | `/master/diesels` | `/master/diesels...` | `MasterSearchRequest`, `DieselMasterRequest` | `PageResponseDtoDieselMasterResponse`, `DieselMasterResponse` | 저장 응답 객체화 |
| 사용자 관리 | `/system/users` | `/system/users...` | `SearchRequestDto`, `UserSaveRequest` | `PageResponseDtoUserResponse`, `UserResponse` | 실호출 200 |
| 권한 관리 | `/system/roles` | `/system/roles...` | `SearchRequestDto`, `RoleSaveRequest` | `PageResponseDtoRoleResponse`, `RoleResponse` | 실호출 200 |
| 메뉴 관리 | `/system/menus` | `/system/menus...` | `SearchRequestDto`, `MenuSaveRequest` | `PageResponseDtoMenuResponse`, `MenuResponse` | admin 실호출 GET 목록은 403/C003 |
| 코드 관리 | `/system/codes` | `/system/codes...` | `SearchRequestDto`, `CodeSaveRequest` | `PageResponseDtoCodeResponse`, `CodeResponse` | 실호출 200 |
| 엑셀 다운로드 | `ExcelSaveButton` | `GET /excel/{type}` | `ExcelDownloadRequest` | byte/string | `{type}` 허용값 업체 확인 필요 |

## 7. 대표 API 실호출 결과

| 구분 | 요청 | 결과 |
| --- | --- | --- |
| 로그인 | `POST /auth/login` | 200 / 성공 / tokenPresent=true |
| 세션 | `GET /me` | 200 성공 |
| 메뉴 | `GET /me/menus` | 200 성공 |
| 대시보드 통합 | `GET /dashboard/integrated` | 200 성공 |
| 대시보드 개별 | `GET /dashboard/individual` | 200 성공 |
| 기저전력 현황 | `GET /monitoring/baseline` | 200 성공 |
| 보조전력 현황 | `GET /monitoring/peak-respond` | 200 성공 |
| 예비전력 현황 | `GET /monitoring/reserved` | 200 성공 |
| 전력급전 현황 | `GET /monitoring/power-supply` | 200 성공 |
| 기저전력 이력 | `GET /trend/baseline` | 200 성공 |
| 보조전력 이력 | `GET /trend/peak-respond` | 200 성공 |
| 예비전력 이력 | `GET /trend/reserved` | 200 성공 |
| 전력급전 이력 | `GET /trend/power-supply` | 200 성공 |
| 일간 보고서 | `GET /report/daily` | 200 성공 |
| 주간 보고서 | `GET /report/weekly` | 200 성공, 단 chart/table 0건 |
| 월간 보고서 | `GET /report/monthly` | 200 성공 |
| 년간 보고서 | `GET /report/yearly` | 200 성공 |
| 배터리 마스터 | `GET /master/batteries?page=1&size=10` | 200 성공 |
| 메뉴 관리 목록 | `GET /system/menus?page=1&size=10` | 403/C003 실패 |
| 구 v3 대시보드 | `GET /monitoring/dashboard/plant` | 403/C003 실패 |
| 구 v3 기저전력 | `GET /monitoring/base/total` | 403/C003 실패 |
| 구 v3 보조전력 | `GET /monitoring/assist` | 403/C003 실패 |
| 구 v3 예비전력 | `GET /monitoring/standby` | 403/C003 실패 |
| 구 v3 전력급전 | `GET /monitoring/dispatch` | 403/C003 실패 |
| 구 v3 분석 이력 | `GET /analysis/base/total/history` | 500/C999 실패 |

## 8. 현재 코드 영향 분석

- `submit-react-publishing/src/shared/api/monitoringApi.ts`의 `MONITORING_DOMAIN_PATHS`가 삭제된 v3 경로를 보고 있다.
- 같은 파일의 `ANALYSIS_RESOURCE_PATHS`가 삭제된 `/analysis/*` 경로를 보고 있다. v4 기준은 `/trend/*`다.
- 같은 파일의 `getDashboardStatus()`가 `/monitoring/dashboard/${mode}`를 호출한다. v4 기준은 `/dashboard/integrated`, `/dashboard/individual`이다.
- 같은 파일의 `getReport()`는 `T[]` 배열 응답을 기대한다. v4 report는 `PowerPageResponse` 객체이므로 `tableList`를 기존 rows로 변환해야 한다.
- `submit-react-publishing/src/pages/report/OperationReportPage.tsx`는 `sortReportRows(nextRows)`처럼 배열을 전제로 한다. report adapter에서 배열로 변환하지 않으면 런타임 오류 가능성이 높다.
- `submit-react-publishing/src/shared/navigation/navigationMenuAdapter.ts`는 서버 menuUrl을 내부 화면 route로 치환하는 역할이므로 화면 route는 유지 가능하다. 단, API 호출 경로와 화면 route를 혼동하면 안 된다.

## 9. 미확정/업체 확인 필요

- v4에서 기저전력 `통합/개별` 구분이 API 경로에서 사라졌다. query 기준인지, 화면 통합인지 업체 확인 필요.
- `TrendSearchRequest`에 `resolvedStartDate`, `resolvedEndDate`가 포함되어 있다. 이름상 서버 계산값처럼 보이나 request schema로 노출되어 있어 실제 프론트가 보내야 하는지 확인 필요.
- `/system/menus?page=1&size=10`은 admin 계정으로도 403/C003이다. 메뉴관리 화면 권한 미부여인지, 해당 API가 실제 납품 범위 제외인지 확인 필요.
- `GET /excel/{type}`의 `{type}` 허용값이 Swagger에서 명확하지 않다. 화면별 엑셀 버튼 연결 전에 type enum을 받아야 한다.
- 주간 보고서 실호출은 200이지만 chart/table이 0건이었다. API 오류가 아니라 기간 데이터 부재일 수 있으므로 업체 기준 날짜 샘플 필요.
- `PowerPageResponse.tableList.detailYn`이 상세 조회 버튼 기준인지 확인 필요. 현재는 detail endpoint가 따로 있으므로 UI 연결 기준을 하나로 정해야 한다.

## 10. 퍼블리싱 코어 방 다음 1개 작업

다음 턴 1개 작업은 `submit-react-publishing/src/shared/api/monitoringApi.ts`만 대상으로 v4 endpoint map과 adapter 변환 기준을 반영하는 것이다. 디자인 컴포넌트, CSS, 라우터, ECharts 옵션은 건드리지 않는다.

목표는 기존 화면이 기대하는 rows/latest/chart 형태를 v4의 `Dashboard*Response`와 `PowerPageResponse`에서 안전하게 만들어 주는 것이다.

작업 순서:

1. `getDashboardStatus()`를 `/dashboard/integrated|individual`로 교체한다.
2. `MONITORING_DOMAIN_PATHS`를 `/monitoring/baseline|peak-respond|reserved|power-supply`로 교체한다.
3. `ANALYSIS_RESOURCE_PATHS`를 `/trend/baseline|peak-respond|reserved|power-supply`로 교체한다.
4. `PowerPageResponse.summary/chartList/tableList`를 기존 화면 row/chart contract로 변환한다.
5. report는 v4 `PowerPageResponse.tableList`를 배열 rows로 반환하게 맞춘다.

검수 기준:

- 구 v3 API 경로 직접 호출이 `monitoringApi.ts`에서 제거되어야 한다.
- `/dashboard/*`, `/monitoring/*`, `/trend/*`, `/report/*` 대표 화면 진입 시 API 오류 모달이 뜨지 않아야 한다.
- 차트/테이블 데이터가 없을 때도 빈 화면 fallback으로 처리되고 런타임 오류가 없어야 한다.
- 이번 단계에서도 디자인/레이아웃 변경은 없어야 한다.
