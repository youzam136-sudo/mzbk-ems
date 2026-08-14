# 대시보드 v2 API 값 체크

- 작성일: 2026-05-22 KST
- 확인 시각: 2026-05-22 17:12 KST
- 기준 시안: `C:\_dev\__dev_depo\os_react_mzbk\.plan_data\대시보드_260522.png`
- 기준 Swagger UI: `http://efd.iptime.org:2016/swagger-ui/index.html`
- 기준 OpenAPI JSON: `http://efd.iptime.org:2016/v3/api-docs`
- 목적: 대시보드 v2 퍼블리싱 전에 현재 API 값이 시안 구조를 실제로 채울 수 있는지 PM 기준으로 판정한다.
- 범위: API/데이터 가능 여부 체크만 한다. React 코드, CSS, 레이아웃, ECharts 옵션은 변경하지 않는다.

## 1. 결론

현재 API로 대시보드 v2 시안을 전부 실데이터로 채우는 것은 불가능하다.

가능한 것은 `GET /dashboard/integrated`의 통합/대표값 기반 표시다. 반대로 시안에 있는 `Bank #1~#5`, `IVT #01` 다건 카드, 디젤 2대처럼 개별 설비를 여러 개 펼쳐 보여주는 구조는 현재 API 응답만으로는 확정 구현하면 안 된다.

PM 판정:

- `/dashboard/integrated`는 200으로 정상 응답하며 A/C, 배터리, PCS, 디젤, Solar, BTB, Storage, Bank 통합, Inverter 통합 값이 내려온다.
- `/dashboard/integrated?groupBySerial=true`는 500/C007로 실패한다.
- `/dashboard/individual`은 기본 호출, `groupBySerial` 호출, `serialType/serialNo` 지정 호출 모두 500/C007로 실패한다.
- 마스터 목록은 정상 조회되지만 현재 개수는 PCS 1건, 배터리 1건, 인버터 1건, 디젤 1건이다.
- 따라서 v2 화면은 우선 `/dashboard/integrated` 기반으로 값이 있는 영역만 연결하고, 다건 topology 영역은 백엔드 개별 API 정상화 전까지 PM 이슈로 분리해야 한다.

## 2. Swagger 스펙 상태

2026-05-22 현재 Swagger 원본은 저장된 v5 스냅샷과 수량 기준으로 동일하다.

| 항목 | 저장된 v5 | 현재 Swagger | 판정 |
| --- | ---: | ---: | --- |
| path item | 52 | 52 | 동일 |
| operation | 80 | 80 | 동일 |
| schema | 95 | 95 | 동일 |
| dashboard path | `/dashboard/integrated`, `/dashboard/individual` | 동일 | 동일 |

`DashboardSearchRequest` 필드는 아래 5개다.

- `operYmd`
- `operTime`
- `serialType`
- `serialNo`
- `groupBySerial`

스펙상 개별/시리얼 조회를 받을 수 있게 보이지만, 실호출은 현재 500/C007이다.

## 3. 실 API 호출 결과

로그인은 기존 테스트 계정으로 200/success:true/tokenPresent:true를 확인했다.

| Endpoint | 결과 | PM 판단 |
| --- | --- | --- |
| `GET /dashboard/integrated` | 200/success:true | v2 기본 데이터 소스로 사용 가능 |
| `GET /dashboard/integrated?groupBySerial=false` | 200/success:true | 통합 조회와 동일하게 사용 가능 |
| `GET /dashboard/integrated?groupBySerial=true` | 500/C007 | 시리얼 그룹 표시 불가 |
| `GET /dashboard/individual` | 500/C007 | 개별 대시보드 연결 불가 |
| `GET /dashboard/individual?groupBySerial=false` | 500/C007 | 개별 대시보드 연결 불가 |
| `GET /dashboard/individual?groupBySerial=true` | 500/C007 | 개별 대시보드 연결 불가 |
| `GET /dashboard/individual?serialType=AC&serialNo=AC0006` | 500/C007 | A/C 개별 조회 불가 |
| `GET /dashboard/individual?serialType=BAT&serialNo=BAT0006` | 500/C007 | 배터리 개별 조회 불가 |
| `GET /dashboard/individual?serialType=PCS&serialNo=PCS0006` | 500/C007 | PCS 개별 조회 불가 |
| `GET /dashboard/individual?serialType=DSL&serialNo=DSL0006` | 500/C007 | 디젤 개별 조회 불가 |
| `GET /dashboard/individual?serialType=ESS&serialNo=ESS0006` | 500/C007 | ESS 개별 조회 불가 |
| `GET /dashboard/individual?serialType=GRID&serialNo=GRD0006` | 500/C007 | GRID 개별 조회 불가 |
| `GET /master/plants/init` | 200/success:true | 마스터 기준 목록 조회 가능 |
| `GET /master/inverters?page=1&size=20` | 200/totalCount:1 | 인버터 다건 시안과 불일치 |
| `GET /master/batteries?page=1&size=20` | 200/totalCount:1 | 배터리 1건만 확인 |
| `GET /master/pcs?page=1&size=20` | 200/totalCount:1 | PCS 1건만 확인 |
| `GET /master/diesels?page=1&size=20` | 200/totalCount:1 | 디젤 2대 시안과 불일치 |

## 4. `/dashboard/integrated` 현재 응답 핵심값

조회 기준:

| 필드 | 값 |
| --- | --- |
| `pageTitle` | `대시보드 통합` |
| `operYmd` | `2026-05-22` |
| `operTime` | `17:00:01` |
| `serialType` | `null` |
| `serialNo` | `null` |
| `groupBySerial` | `false` |
| `refreshSeconds` | `60` |

총합 값:

| 필드 | 값 |
| --- | ---: |
| `totalSolarActivePower` | `398.200` |
| `totalSolarReactivePower` | `71.800` |
| `totalPcsPower` | `595.800` |
| `totalDieselPower` | `437.000` |
| `totalBatteryCharge` | `600.000` |
| `totalBatteryDischarge` | `600.000` |
| `totalLoadPower` | `556.200` |
| `useRate` | `38.75` |

장비 serial:

| 영역 | serial |
| --- | --- |
| A/C | `AC0006` |
| Battery | `BAT0006` |
| PCS | `PCS0006` |
| Diesel | `DSL0006` |
| Solar | `GRD0006` |
| BTB | `GRD0006` |
| Storage | `ESS0006` |
| Inverter list | `GRID_TOTAL` 1건 |
| Bank list | `ESS_TOTAL` 1건 |

## 5. v2 시안 영역별 연결 가능 여부

| 시안 영역 | API 데이터 | 가능 여부 | PM 메모 |
| --- | --- | --- | --- |
| 환경 및 시스템 상태 | `ac.status`, `ac.dischargeAirTemperature`, `ac.temperature`, `ac.humidity` | 가능 | `status`는 코드값 `02`이므로 라벨 매핑 기준 확인 필요 |
| AGC-Solar | `solar` | 가능 | 단일/대표값 기준으로 표시 가능 |
| AGC-BTB | `btb` | 가능 | 현재 `serialNo`와 값이 Solar와 동일하게 내려오므로 backend 의미 확인 필요 |
| AGC-Storage | `storage` | 가능 | 단일/대표값 기준으로 표시 가능 |
| PCS | `pcs` | 가능 | DC V/A, 온도 계열 표시 가능 |
| 배터리 | `battery` | 가능 | SoC/SoH/RACK/PACK/DC/충방전 값 표시 가능 |
| 디젤 1개 | `diesel` | 부분 가능 | 단일 디젤 값만 있음 |
| 디젤 2개 | 없음 | 불가 | 시안은 2개 블록인데 API/master 모두 1건 |
| Bank #1~#5 | `bankList` 1건 | 불가 | `BANK_TOTAL` 통합 1건만 내려옴 |
| IVT 카드 다건 | `inverterList` 1건 | 불가 | `IVT_TOTAL` 통합 1건만 내려옴 |
| 시리얼별 상세/그룹 표시 | `/dashboard/individual`, `groupBySerial=true` | 불가 | 모두 500/C007 |

## 6. 퍼블리싱 방 작업 기준

대시보드 v2 퍼블리싱 방에 넘길 기준은 아래 1개로 고정한다.

`/dashboard/integrated` 응답만 기준으로 v2 화면의 값 연결 계약을 먼저 만든다.

세부 지시:

- 화면 디자인은 시안 기준으로 잡되, 실데이터 연결은 `/dashboard/integrated`에서 내려오는 필드만 사용한다.
- `Bank #1~#5`, 다건 IVT, 디젤 2대는 반복으로 가짜 복제하지 않는다.
- `bankList[0]`은 `BANK_TOTAL`, `inverterList[0]`은 `IVT_TOTAL` 통합값임을 표시/분리한다.
- `/dashboard/individual` 또는 `groupBySerial=true`를 전제로 구현하지 않는다.
- 상태 코드 `02`는 바로 문구로 단정하지 말고 기존 adapter 또는 시스템 코드 기준을 확인해 매핑한다.
- Solar와 BTB가 같은 `serialNo: GRD0006`과 동일 계측값으로 내려오는 점은 backend 확인 이슈로 남긴다.

## 7. backend 확인 요청 사항

업체에 확인해야 할 항목:

- `/dashboard/individual`이 모든 조건에서 500/C007인 이유.
- `/dashboard/integrated?groupBySerial=true`가 500/C007인 이유.
- v2 시안 기준 `Bank #1~#5`를 채울 개별 Bank 데이터 endpoint 또는 응답 구조.
- v2 시안 기준 IVT 다건 카드를 채울 개별 Inverter 데이터 endpoint 또는 응답 구조.
- v2 시안 기준 디젤 2대 데이터를 내려줄 방법.
- Solar와 BTB가 같은 `GRD0006` 값으로 내려오는 것이 의도인지 여부.
- 상태 코드 `01`, `02` 등의 공통 코드 라벨 조회 기준.

## 8. 이번 PM 체크에서 의도적으로 하지 않은 것

- React 컴포넌트 작성
- CSS/레이아웃 수정
- ECharts 옵션 작성
- API adapter 수정
- 목업 데이터 제거 또는 대체
- 빌드 산출물 생성
- 브라우저 시각 검수

## 9. 다음 작업 1개

퍼블리싱 코어 방 다음 작업:

`대시보드 v2 데이터 계약 1차 적용 - /dashboard/integrated만 연결하고, Bank/IVT/디젤 다건 영역은 backend 미제공 슬롯으로 분리`

완료 기준:

- `/dashboard/integrated`의 A/C, Battery, PCS, Diesel 단일값, Solar, BTB, Storage, totals, `bankList[0]`, `inverterList[0]`만 화면 VM으로 매핑한다.
- API가 주지 않는 다건 설비 값을 임의 복제하지 않는다.
- `/dashboard/individual`과 `groupBySerial=true`는 backend 500/C007 이슈가 해결될 때까지 호출하지 않는다.
