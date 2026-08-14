# MZBK Swagger API v5 요청/응답 필드 기준

- 작성일: 2026-05-22 KST
- 기준: `docs/api-v5/20260522/openapi-v5-20260522.json`
- 목적: 퍼블리싱 코어 방에서 API adapter를 구현할 때 확인할 요청/응답 필드 기준을 고정한다.

## 1. 요청 schema

### DashboardSearchRequest

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `operYmd` | string | 조회 기준일자 |
| `operTime` | string | 조회 기준시간 |
| `serialType` | string | 설비 구분. `GRID`, `PCS`, `BAT`, `ESS`, `DSL`, `AC` |
| `serialNo` | string | 설비 시리얼 번호 |
| `groupBySerial` | boolean | 시리얼 그룹 조회 여부 |

v4 대비 `inverterId`가 제거되고 `serialType/serialNo/groupBySerial`이 추가됐다.

### MonitoringSearchRequest

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `operYmd` | string | 운전 기준일자 |
| `operTime` | string | 운전 기준시간. `HH` 또는 `HH:mm:ss` |
| `serialType` | string | 설비 구분. `GRID`, `PCS`, `BAT`, `ESS`, `DSL` |
| `serialNo` | string | 설비 시리얼 번호 |
| `groupBySerial` | boolean | 시리얼별 그룹 조회 여부 |

현황 화면의 통합/개별/설비별 필터는 이 schema를 기준으로 맞춘다.

### TrendSearchRequest

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `startDate` | string | 조회 시작일 |
| `endDate` | string | 조회 종료일 |
| `baseYear` | string | 기준년도 |
| `baseMonth` | string | 기준월 |
| `searchType` | string | 조회 유형. `YEAR`, `MONTH`, `PERIOD` |
| `outputUnit` | string | 출력 단위. `HOUR`, `DAY`, `MONTH` |
| `serialType` | string | 설비 구분. `GRID`, `PCS`, `BAT`, `ESS`, `DSL` |
| `serialNo` | string | 설비 시리얼 번호 |
| `groupBySerial` | boolean | 시리얼별 그룹 조회 여부 |

v4 대비 `resolvedStartDate`, `resolvedEndDate`, `searchDateType`는 제거됐다. 이력 조회는 `searchType/baseYear/baseMonth/startDate/endDate/outputUnit` 기준으로 다시 맞춘다.

### ReportSearchRequest

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `operYmd` | string | 조회 기준일 |
| `baseYear` | string | 기준년도 |
| `baseMonth` | string | 기준월 |
| `baseWeek` | string | 기준주차 |
| `serialType` | string | 설비 구분. `GRID`, `PCS`, `BAT`, `ESS`, `DSL` |
| `serialNo` | string | 설비 시리얼 번호 |
| `groupBySerial` | boolean | 시리얼 그룹 조회 여부 |

보고서 endpoint path와 response wrapper는 v4와 동일하지만, 요청 필드는 설비 시리얼 기준을 받을 수 있게 확장됐다.

## 2. 공통 응답 wrapper

현황/이력/보고서 목록 계열은 `ApiResponsePowerPageResponse`를 기준으로 본다.

### PowerPageResponse

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `powerFlowType` | string | `BASELINE`, `PEAK_RESPOND`, `RESERVED`, `POWER_SUPPLY` |
| `pageTitle` | string | 페이지 제목 |
| `operYmd` | string | 조회 기준일자 |
| `operTime` | string | 조회 기준시간 |
| `startDate` | string | 조회 시작일 |
| `endDate` | string | 조회 종료일 |
| `outputUnit` | string | 출력 단위 |
| `serialType` | string | 설비 구분 |
| `serialNo` | string | 설비 시리얼 번호 |
| `groupBySerial` | boolean | 시리얼 그룹 조회 여부 |
| `summary` | `PowerSummaryResponse` | 기존 요약 |
| `metrics` | `PowerMetricSummaryResponse` | v5 신규 지표 요약 |
| `chartList` | `PowerChartResponse[]` | 차트 데이터 |
| `tableList` | `PowerTableResponse[]` | 테이블 데이터 |

adapter는 `summary`, `metrics`, `chartList`, `tableList`가 모두 없거나 빈 값인 경우를 안전하게 처리해야 한다.

## 3. 요약 응답

### PowerSummaryResponse

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `startDate`, `endDate` | string | 조회 기간 |
| `dataCount` | integer | 조회 데이터 건수 |
| `totalPowerKwh` | string | 총 전력량 |
| `chargeKwh`, `dischargeKwh` | string | 충전/방전 전력량 |
| `avgVoltage`, `avgCurrent`, `avgFrequency`, `avgPf` | string | 평균 전기 계측값 |
| `avgSoc`, `avgSoh`, `avgTemperature` | string | ESS/배터리 계측값 |
| `avgRpm`, `avgTankLevel`, `avgOilPress` | string | 디젤 계측값 |
| `metrics` | `PowerMetricSummaryResponse` | v5 신규 상세 지표 |

### PowerMetricSummaryResponse

| 필드 그룹 | 필드 |
| --- | --- |
| 충전량 | `maxChargeKwh`, `minChargeKwh`, `avgChargeKwh` |
| 방전량 | `maxDischargeKwh`, `minDischargeKwh`, `avgDischargeKwh` |
| 전력량 | `maxPowerKwh`, `minPowerKwh`, `avgPowerKwh` |
| 전압 | `maxVoltage`, `minVoltage`, `avgVoltage` |
| 전류 | `maxCurrent`, `minCurrent`, `avgCurrent` |
| 주파수 | `maxFrequency`, `minFrequency`, `avgFrequency` |
| 역률 | `maxPf`, `minPf`, `avgPf` |
| SOC | `maxSoc`, `minSoc`, `avgSoc` |
| 온도 | `maxTemperature`, `minTemperature`, `avgTemperature` |

이 값들은 화면에 바로 노출할지 확정되지 않았다. 우선 adapter에서 optional 필드로 보존하는 것이 안전하다.

## 4. 차트/테이블/상세 응답

### PowerChartResponse

| 필드 | 설명 |
| --- | --- |
| `serialNo` | 설비 시리얼 번호 |
| `baseLabel` | 시간/일자/월 라벨 |
| `outputUnit` | `HOUR`, `DAY`, `MONTH` |
| `barValue`, `barName` | Bar series 값/이름 |
| `lineValue1`, `lineName1` | Line series 1 값/이름 |
| `lineValue2`, `lineName2` | Line series 2 값/이름 |
| `maxChargeKwh`, `minChargeKwh`, `avgChargeKwh` | 충전량 통계 |
| `maxDischargeKwh`, `minDischargeKwh`, `avgDischargeKwh` | 방전량 통계 |

### PowerTableResponse

| 필드 | 설명 |
| --- | --- |
| `serialNo` | 설비 시리얼 번호 |
| `operYmd`, `operTime`, `baseLabel` | 행 기준 |
| `powerKwh`, `chargeKwh`, `dischargeKwh` | 전력량 |
| `maxChargeKwh`, `minChargeKwh`, `avgChargeKwh` | 충전량 통계 |
| `maxDischargeKwh`, `minDischargeKwh`, `avgDischargeKwh` | 방전량 통계 |
| `voltage`, `current`, `frequency`, `pf` | 전기 계측값 |
| `soc`, `soh`, `temperature` | 배터리/ESS 계측값 |
| `rpm`, `tankLevel`, `oilPress` | 디젤 계측값 |
| `statusValue` | 상태 코드 |
| `detailYn` | 상세 조회 가능 여부 |

### PowerDetailResponse

| 필드 | 설명 |
| --- | --- |
| `serialNo` | 설비 시리얼 번호 |
| `esmtOperYmd`, `esmtOperTime` | 운전 일자/시간 |
| `powerFlowType` | 전력 흐름 구분 |
| `sourceTable`, `powerColumn`, `calculationDesc`, `formula` | 계산 근거 |
| `rawPower` | 원본 전력값 |
| `chargeKwh`, `dischargeKwh` | 충전/방전 전력량 |
| `maxChargeKwh`, `minChargeKwh`, `avgChargeKwh` | 충전량 통계 |
| `maxDischargeKwh`, `minDischargeKwh`, `avgDischargeKwh` | 방전량 통계 |
| `voltageL1`, `voltageL2`, `voltageL3` | 상별 전압 |
| `currentL1`, `currentL2`, `currentL3` | 상별 전류 |
| `frequency`, `pf` | 주파수/역률 |
| `soc`, `soh`, `temperature` | 배터리/ESS 계측값 |
| `rpm`, `tankLevel`, `oilPress` | 디젤 계측값 |
| `statusValue` | 상태 코드 |

## 5. Dashboard 응답

### DashboardIntegratedResponse

| 필드 | 설명 |
| --- | --- |
| `menuId`, `pageTitle` | 메뉴/페이지 정보 |
| `operYmd`, `operTime` | 조회 기준 |
| `serialType`, `serialNo`, `groupBySerial` | 설비 시리얼 조회 기준 |
| `refreshSeconds` | 자동 새로고침 주기 |
| `totalSolarActivePower`, `totalSolarReactivePower` | 태양광 총 전력 |
| `totalPcsPower`, `totalDieselPower` | PCS/디젤 총 전력 |
| `totalBatteryCharge`, `totalBatteryDischarge` | 배터리 총 충전/방전 |
| `totalLoadPower`, `useRate` | 부하 총 사용 전력/사용률 |
| `ac`, `battery`, `pcs`, `diesel`, `solar`, `btb`, `storage` | 장비별 요약 |
| `inverterList`, `bankList` | 인버터/Bank 목록 |

### DashboardIndividualResponse

통합 응답과 같은 장비별 구조를 사용하되, 통합 총합 필드보다는 `serialType`, `serialNo`, `groupBySerial` 기준의 개별 장비 조회에 맞춘다.

## 6. Endpoint 매핑 기준

| 화면/용도 | v5 endpoint | 요청 | 응답 |
| --- | --- | --- | --- |
| 대시보드 통합 | `GET /dashboard/integrated` | `DashboardSearchRequest` | `DashboardIntegratedResponse` |
| 대시보드 개별 | `GET /dashboard/individual` | `DashboardSearchRequest` | `DashboardIndividualResponse` |
| 기저전력 현황 | `GET /monitoring/baseline` | `MonitoringSearchRequest` | `PowerPageResponse` |
| 보조전력 현황 | `GET /monitoring/peak-respond` | `MonitoringSearchRequest` | `PowerPageResponse` |
| 예비전력 현황 | `GET /monitoring/reserved` | `MonitoringSearchRequest` | `PowerPageResponse` |
| 전력급전 현황 | `GET /monitoring/power-supply` | `MonitoringSearchRequest` | `PowerPageResponse` |
| 기저전력 현황 상세 | `GET /monitoring/baseline/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` |
| 보조전력 현황 상세 | `GET /monitoring/peak-respond/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` |
| 예비전력 현황 상세 | `GET /monitoring/reserved/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` |
| 전력급전 현황 상세 | `GET /monitoring/power-supply/detail` | `MonitoringSearchRequest` | `PowerDetailResponse[]` |
| 기저전력 이력 | `GET /trend/baseline` | `TrendSearchRequest` | `PowerPageResponse` |
| 보조전력 이력 | `GET /trend/peak-respond` | `TrendSearchRequest` | `PowerPageResponse` |
| 예비전력 이력 | `GET /trend/reserved` | `TrendSearchRequest` | `PowerPageResponse` |
| 전력급전 이력 | `GET /trend/power-supply` | `TrendSearchRequest` | `PowerPageResponse` |
| 기저전력 이력 상세 | `GET /trend/baseline/detail` | `TrendSearchRequest` | `PowerDetailResponse[]` |
| 보조전력 이력 상세 | `GET /trend/peak-respond/detail` | `TrendSearchRequest` | `PowerDetailResponse[]` |
| 예비전력 이력 상세 | `GET /trend/reserved/detail` | `TrendSearchRequest` | `PowerDetailResponse[]` |
| 전력급전 이력 상세 | `GET /trend/power-supply/detail` | `TrendSearchRequest` | `PowerDetailResponse[]` |
| 일간/주간/월간/년간 보고서 | `GET /report/daily`, `/weekly`, `/monthly`, `/yearly` | `ReportSearchRequest` | `PowerPageResponse` |

## 7. 구현 시 주의

- 모든 신규 필드는 optional로 수용한다. 업체 API가 계속 바뀌고 있으므로 필수 가정으로 박으면 다시 깨질 가능성이 높다.
- 기존 화면이 쓰는 rows/chart contract를 먼저 유지하고, v5 필드는 adapter에서 확장 보존한다.
- `serialNo`가 chart/table/detail에 들어왔으므로, 추후 시리얼별 series/table grouping을 고려해야 한다.
- `metrics`는 v5 신규 값이다. 화면 노출 확정 전에는 adapter 반환값에만 보존하고 UI는 기존 summary 표시를 유지한다.
- `/trend/*/detail`은 새 API이므로 이력 화면의 상세 버튼/팝업 연결 후보로 분리한다.
