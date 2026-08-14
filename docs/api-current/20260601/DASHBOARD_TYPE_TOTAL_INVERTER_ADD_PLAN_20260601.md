# Dashboard Type Total Inverter Add Plan - 2026-06-01

## 1. PM Interpretation

이번 요청은 대시보드 v2 좌측 AGC-Solar 하단의 인버터 영역에 `STATUS / DC P / AC P / Effi %` 표를 추가하는 퍼블리싱 작업이다.

코드 구현은 이 문서에서 하지 않는다. 퍼블리싱 방은 이 문서를 기준으로 별도 작업 단위를 받아 진행한다.

작업명은 다음으로 고정한다.

`대시보드 Type Total 인버터 상세표 추가`

파일/컴포넌트 명칭 후보는 다음처럼 잡는다.

- PM 문서명: `DASHBOARD_TYPE_TOTAL_INVERTER_ADD_PLAN_20260601`
- 화면 영역명: `dashboard type total inverter detail`
- 데이터 묶음명 후보: `dashboardTypeTotalInverters`
- UI 후보명: `DashboardTypeTotalInverterTable`

## 2. Source Of Truth

기준 화면은 사용자가 전달한 인버터 추가 이미지다.

핵심 형태는 다음이다.

- AGC-Solar 아래 IVT 아이콘 목록 오른쪽에 인버터별 상세 표를 붙인다.
- 각 인버터 표 컬럼은 `STATUS`, `DC P`, `AC P`, `Effi %`로 고정한다.
- 기존 AGC-Solar, 연결선, PCS, 배터리, AGC-Storage 영역은 밀리거나 흔들리면 안 된다.
- 기존 대시보드 선 정렬 검수 기준은 그대로 유지한다.

## 3. Live API Check

확인 일시: 2026-06-01

원격 API: `http://efd.iptime.org:2016`

로그인: `POST /auth/login`

계정: `admin`

원본 확인 파일:

`C:\_dev\__dev_depo\os_react_mzbk\submit-react-publishing\.ai\DASHBOARD_INVERTER_TOTAL_API_CHECK_20260601_090954.json`

## 4. API Result Summary

| Endpoint | Result | Inverter count | Unique inverter count | PM decision |
| --- | --- | ---: | ---: | --- |
| `GET /dashboard/integrated` | 200 | 1 | 1 | total 대표값 only |
| `GET /dashboard/integrated?groupBySerial=false` | 200 | 1 | 1 | total 대표값 only |
| `GET /dashboard/integrated?groupBySerial=true` | 200 | 6 | 6 | 인버터 다건 표시 후보 |
| `GET /dashboard/individual` | 200 | 6 | 6 | 인버터 다건 표시 후보 |
| `GET /dashboard/individual?groupBySerial=true` | 200 | 6 | 6 | 인버터 다건 표시 후보 |
| `GET /dashboard/individual?serialType=IVT&serialNo=IVT_TOTAL&groupBySerial=true` | 200 | 60 | 6 | 중복 응답. 사용 금지 |
| `GET /dashboard/individual?serialType=IVT&serialNo=IVT0001&groupBySerial=true` | 200 | 60 | 6 | 중복 응답. 사용 금지 |
| `GET /dashboard/individual?serialType=IVT&serialNo=IVT0002&groupBySerial=true` | 200 | 60 | 6 | 중복 응답. 사용 금지 |
| `GET /master/inverters?page=1&size=50` | 200 | - | - | master는 1건만 있음. 대시보드 표시값으로 사용 금지 |

## 5. API Data To Use

퍼블리싱 1차 기준 API는 아래 중 하나로 제한한다.

1. 우선 후보: `GET /dashboard/integrated?groupBySerial=true`
2. 대체 후보: `GET /dashboard/individual?groupBySerial=true`

현재 두 API 모두 인버터 6건을 내려준다.

인버터 serial 목록은 다음이다.

| Slot | API serialNo | API inverterId/name | Current values |
| --- | --- | --- | --- |
| IVT #01 | `GRD0001` | `GRD0001` | `status=01`, `acPower=70.9`, `pf=95.0` |
| IVT #02 | `GRD0002` | `GRD0002` | `status=01`, `acPower=67.0`, `pf=94.8` |
| IVT #03 | `GRD0003` | `GRD0003` | `status=01`, `acPower=80.4`, `pf=94.7` |
| IVT #04 | `GRD0004` | `GRD0004` | `status=01`, `acPower=67.0`, `pf=94.5` |
| IVT #05 | `GRD0005` | `GRD0005` | `status=01`, `acPower=51.2`, `pf=94.3` |
| IVT #06 | `GRD0006` | `GRD0006` | `status=01`, `acPower=61.7`, `pf=94.2` |
| IVT #07 | 없음 | 없음 | 빈 슬롯 유지 |

## 6. Field Mapping

인버터 상세 표는 다음 필드를 사용한다.

| UI column | API field | Formatting rule | Empty rule |
| --- | --- | --- | --- |
| `STATUS` | `status` | 기존 상태 매핑 함수가 있으면 재사용. 없으면 raw code 표시 | `-` |
| `DC P` | `dcPower` | 숫자 표시. 단위는 헤더에 없으므로 값만 표시 | `-` |
| `AC P` | `acPower` 우선, 없으면 `activePower` | 숫자 표시 | `-` |
| `Effi %` | `efficiency` | 퍼센트 표시 | `-` |

주의:

- 현재 API의 `dcPower`와 `efficiency`는 비어 있다.
- `pf`는 API에 있으나 이번 이미지의 컬럼은 `Effi %`이므로 임의로 `pf`를 `Effi %`에 넣지 않는다.
- 값이 없으면 blank가 아니라 `-`로 표시한다.

## 7. Publishing Scope

포함:

- AGC-Solar 하단 IVT 목록 오른쪽에 인버터 상세 표 7개 슬롯 추가
- 1~6번 슬롯은 API `inverterList[0..5]` 매핑
- 7번 슬롯은 기존 disabled/empty 슬롯 유지
- 표 헤더: `STATUS`, `DC P`, `AC P`, `Effi %`
- 기존 선/노드/표 스타일 토큰 재사용
- 모바일/축소 화면에서는 기존 대시보드 v2 내부 스크롤 정책 유지

제외:

- API endpoint 신규 설계
- 백엔드 수정
- `serialType=IVT` 지정조회 사용
- 60건 중복 응답을 그대로 렌더링
- `master/inverters`를 대시보드 실시간 값으로 사용
- 기존 대시보드 연결선 좌표 전체 재설계
- Bank/PCS/Battery/Diesel/Storage 영역 구조 변경

## 8. Implementation Direction For Publishing Room

퍼블리싱 방에 넘길 정확한 작업 단위:

`대시보드 Type Total 인버터 상세표 추가 - AGC-Solar 하단 IVT 1~7 슬롯 오른쪽에 STATUS/DC P/AC P/Effi% 표 추가`

작업 순서:

1. 현재 대시보드 v2 topology에서 IVT 아이콘 슬롯 좌표를 확인한다.
2. IVT 아이콘 오른쪽에 4컬럼 표를 7개 추가한다.
3. 기존 `inverterList` 매핑은 유지하되, 표 값용 row contract를 별도로 만든다.
4. API는 `groupBySerial=true` 응답의 unique inverter 6건만 사용한다.
5. 7번째 슬롯은 disabled/empty 상태로 유지한다.
6. 연결선은 기존 IVT 아이콘까지의 라인을 유지하고, 새 표 때문에 선 endpoint가 어긋나지 않는지 검증한다.
7. 1920x1080에서 좌측 AGC-Solar~IVT~표 영역이 기준 이미지 흐름과 맞는지 확인한다.

## 9. Acceptance Criteria

- `/dashboard/individual` 또는 현재 대시보드 진입 route에서 대시보드 화면이 열린다.
- AGC-Solar 하단에 IVT 7개 슬롯이 유지된다.
- IVT #01~#06 오른쪽에 각각 상세 표가 보인다.
- IVT #07은 빈값/disabled 상태로 보인다.
- 표 컬럼명은 정확히 `STATUS`, `DC P`, `AC P`, `Effi %`다.
- API `inverterList` 중복 60건이 화면에 60줄로 렌더링되지 않는다.
- 현재 6개 unique 인버터만 표시된다.
- `dcPower`, `efficiency`가 비어 있으면 `-`로 표시된다.
- 기존 topology connector 검증에서 선 어긋남이 없어야 한다.
- `npm run build`가 통과해야 한다.

## 10. Open Questions

- `status=01`의 화면 라벨이 무엇인지 시스템 코드 기준 확인 필요.
- `Effi %`에 `efficiency`가 계속 빈값이면 `-` 표시가 맞는지, 또는 backend가 값을 제공할 예정인지 확인 필요.
- API serial이 `IVT0001`이 아니라 `GRD0001` 형태로 내려오는 것이 의도인지 확인 필요.
- IVT 슬롯이 7개인데 API는 6개만 내려오는 것이 최종 수량인지 확인 필요.

## 11. Do Not Do In Publishing Turn

- 대시보드 전체 레이아웃 재작성 금지
- ECharts 작업 금지
- SQL/API/백엔드 작업 금지
- 임의 목업값으로 `DC P`, `Effi %` 채우기 금지
- `pf`를 `Effi %`로 대체 금지
- `serialType=IVT` 지정조회 결과 60건을 화면에 그대로 반영 금지
