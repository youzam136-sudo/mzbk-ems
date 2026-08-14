# 대시보드 v2 껍데기/외형 퍼블리싱 작업 기획

- 작성일: 2026-05-22 KST
- 기준 시안: `C:\_dev\__dev_depo\os_react_mzbk\.plan_data\대시보드_260522.png`
- 참고 문서: `docs/api-v5/20260522/DASHBOARD_V2_API_VALUE_CHECK_20260522.md`
- 목적: API가 아직 v2 시안 구조를 완전히 제공하지 못하는 상태에서, 퍼블리싱 방이 대시보드 v2 외형을 먼저 정확히 구현할 수 있도록 작업 범위를 고정한다.
- 성격: React 퍼블리싱 작업 지시서다. 백엔드/API 완성 지시서가 아니다.

## 1. 이번 작업 결론

대시보드 v2는 1차로 "껍데기/외형"만 구현한다.

실데이터 완성 구현이 아니다. 현재 API는 `/dashboard/integrated`만 정상이며, 시안의 `Bank #1~#5`, 다건 IVT, 디젤 2대 개별 데이터를 실제로 줄 수 없다. 따라서 퍼블리싱 방에서는 API 연결을 완성하려고 하지 말고, 시안 기준의 고정 topology 외형을 먼저 만든다.

이번 작업의 성공 기준은 아래다.

- 사용자가 보는 화면이 `대시보드_260522.png`의 구조와 최대한 같아야 한다.
- 각 설비 박스, 표, 라벨, 연결선, 외곽 패널이 한 화면 안에서 배치되어야 한다.
- 값은 실제 API값이 아니라 shell용 placeholder 또는 시안에 보이는 예시값으로 둔다.
- API 실패 모달, 로딩 오류, 개별 조회 실패 때문에 대시보드 v2 외형이 깨지면 안 된다.

## 2. 작업 대상 화면

기존 라우트 기준으로 대시보드 진입 화면이 대상이다.

| 구분 | 기준 |
| --- | --- |
| 대표 route | `/monitoring/dashboard/plant` |
| 호환 route | `/monitoring/dashboard`, `/monitoring/dashboard/total`, `/dashboard/plant-operation-status` |
| 현재 page 후보 | `src/features/dashboard/plant-operation-status/page/PlantOperationStatusPage.tsx` |
| 현재 diagram 후보 | `src/features/dashboard/plant-operation-status/sections/PlantOperationDiagramSection.tsx` |
| 현재 layout 후보 | `src/features/dashboard/plant-operation-status/constants/plantOperationTopologyLayout.ts` |
| 현재 style 후보 | `src/features/dashboard/plant-operation-status/styles/PlantOperationDiagramSection.css` |

퍼블리싱 방에서 실제 파일 구조를 바꿀지는 코드 확인 후 결정하되, 새 화면을 만들더라도 위 route에서 v2 shell이 보여야 한다.

## 3. 이번 작업 범위

포함한다.

- 대시보드 v2 topology board 외형.
- 외곽 대형 패널과 내부 blue border.
- 상단 Bank 5개 카드.
- 좌측 `환경 및 시스템 상태` 표.
- 중앙 `AGC-BTB` 이미지/라벨 박스와 전력 표.
- 좌하단 `AGC-Solar` 이미지/라벨 박스와 전력 표.
- Solar 하단 IVT 카드 7개.
- 중앙 하단 `AGC-Storage`, PCS, 배터리, rack/pack 표.
- 우측 디젤 라인 2개와 각 디젤 계측 표.
- connector line, bus line, vertical/horizontal branch line.
- 기존 사이드바/상단바/다크톤 레이아웃과 어울리는 스타일.

포함하지 않는다.

- `/dashboard/individual` 연결.
- `groupBySerial=true` 연결.
- Bank/IVT/디젤 다건 API 연결.
- API adapter 구조 개편.
- ECharts 작업.
- 백엔드/SQL/Swagger 수정.
- 실데이터 정합성 판단.
- 임의로 API 값을 복제해서 실제 데이터처럼 표시하는 작업.

## 4. 데이터 처리 기준

이번 shell 작업은 API 데이터가 아니라 고정 shell fixture를 사용한다.

권장 fixture 성격:

- 위치: 대시보드 v2 작업 파일 근처의 constants 또는 fixture 파일.
- 이름 예시: `dashboardV2ShellData`, `plantOperationV2ShellTopology`, `DASHBOARD_V2_PLACEHOLDER_DATA`.
- 목적: 외형 검수용 고정 데이터.
- 주석 또는 파일명에서 shell/placeholder임을 명확히 한다.

placeholder 표시 기준:

| 영역 | 표시 기준 |
| --- | --- |
| Bank 5개 | `Bank #1` ~ `Bank #5`, `Status`, `D.Accm`, `kW`, `PF` 구조 유지 |
| 공통 전력 표 | `P ( kW)(A/R/P)`, `V ( V)(L12/L23/31)`, `A ( A)(L1/L2/L3)`, `FR ( Hz)(L1/L2/L3)`, `PF ( % )` 구조 유지 |
| 값 | 시안처럼 `00/00/00`, `00.0%`, 빈 칸 등 고정 placeholder 사용 |
| A/C 표 | `A/C 상태`, `A/C 배출공기 온도`, `온도(℃)`, `습도(%)` 행 유지 |
| PCS 표 | `STATUS`, `DC V`, `DC A`, `MDL.T(℃)`, `ABN.TT(℃)`, `CABN.T(℃)` 행 유지 |
| 배터리 표 | `SoC(%)`, `SoH(%)`, `RACK V`, `RACK A`, `PACK Temp`, `MAX/MIN/AVG` 구조 유지 |
| 디젤 표 | `P`, `V`, `A`, `PF`, `Fre`, `RPM`, `FUEL`, `Cool.Tmp`, `Oil.Tmp`, `Oil.Psr` 행 유지 |

중요:

- 현재 `/dashboard/integrated`에서 값이 일부 나오더라도, 이번 shell 작업에서는 그 값을 억지로 섞지 않는다.
- 외형 먼저 맞춘 뒤 다음 단계에서 API 매핑을 별도 작업으로 한다.
- 다건 영역은 실제 API가 없으므로 "API 반복 렌더링"이 아니라 "시안 고정 구조 렌더링"으로 본다.

## 5. 화면 구조 기준

대시보드 v2 board는 하나의 큰 topology canvas로 본다.

권장 구조:

1. `DashboardLayout` 안의 content 영역은 기존 구조를 유지한다.
2. 페이지 title/heading은 기존 대시보드 규칙을 따르되, 시안처럼 topology board가 중심이 되게 한다.
3. 큰 외곽 board 안에 CSS grid 또는 absolute layout 중 하나로 고정 배치한다.
4. 설비 박스와 표는 재사용 가능한 작은 presentational component로 나눈다.
5. 연결선은 SVG overlay 또는 기존 topology line 렌더링 방식을 재사용한다.
6. 모든 설비 노드는 고정 ID를 가진다.

권장 component 후보:

| component 성격 | 예시 이름 |
| --- | --- |
| 전체 board | `DashboardV2ShellBoard` |
| 설비 아이콘/라벨 박스 | `DashboardV2EquipmentNode` |
| 소형 계측 표 | `DashboardV2MetricTable` |
| Bank 표 | `DashboardV2BankCard` |
| Battery rack 표 | `DashboardV2BatteryTable` |
| Diesel 표 | `DashboardV2DieselTable` |
| 연결선 layer | `DashboardV2ConnectionLines` |

이름은 실제 코드 구조에 맞게 바꿔도 된다. 단, 데이터 fetching component와 presentational component는 섞지 않는다.

## 6. 배치 순서

퍼블리싱 작업 순서는 아래로 고정한다.

1. route 진입 시 v2 shell board가 보이게 한다.
2. outer board 크기, 배경, border, padding을 먼저 맞춘다.
3. 상단 Bank 5개를 배치한다.
4. 좌측 환경 표를 배치한다.
5. 중앙 AGC-BTB와 중앙 전력 표를 배치한다.
6. 하단 Solar, Storage, PCS, Battery, Diesel 2개 축을 배치한다.
7. IVT 7개 카드를 배치한다.
8. connector line을 마지막에 맞춘다.
9. 1920px 이상 desktop에서 시안과 비교한다.
10. 작은 화면에서는 board 내부 스크롤로 깨짐 없이 접근 가능하게 한다.

## 7. 스타일 기준

기존 프로젝트의 visual language를 유지한다.

- dark background 유지.
- blue border/line 계열 유지.
- 기존 root token이 있으면 우선 사용한다.
- 외곽선은 최근 정리된 `--mzbk-outer-border-color` 기준을 우선 확인한다.
- sidebar/topbar 구조는 건드리지 않는다.
- 대시보드 board 내부에서만 필요한 스타일을 추가한다.
- 전역 `foundation.css`, `utilities.css`는 반드시 필요한 경우가 아니면 수정하지 않는다.

화면 크기 기준:

| 기준 | 처리 |
| --- | --- |
| Desktop 1920px | 1차 검수 기준 |
| 2048px 이상 | 첨부 시안 비율과 가장 유사해야 함 |
| Tablet/mobile | 완전 재배치가 아니라 board 내부 scroll 허용으로 깨짐 방지 |

## 8. API 관련 주의

현재 API 상태:

- `/dashboard/integrated`만 200 정상.
- `/dashboard/individual`은 500/C007.
- `/dashboard/integrated?groupBySerial=true`는 500/C007.
- master 기준 인버터/디젤도 1건만 확인됨.

따라서 이번 shell 작업에서 하면 안 되는 것:

- `usePlantOperationStatus`가 실패해서 board가 안 뜨는 구조로 두지 않는다.
- shell 외형 표시를 API 성공 여부에 종속시키지 않는다.
- 개별 API가 정상이라고 가정하지 않는다.
- `bankList[0]`을 복제해 Bank 5개 실데이터처럼 보이게 하지 않는다.
- `inverterList[0]`을 복제해 IVT 7개 실데이터처럼 보이게 하지 않는다.
- 단일 `diesel` 값을 복제해 디젤 2대 실데이터처럼 보이게 하지 않는다.

이번 단계에서는 "외형 검수용 placeholder"가 맞다.

## 9. 검수 기준

퍼블리싱 완료 후 확인할 항목:

- `/monitoring/dashboard/plant` 진입 시 대시보드 v2 외형이 보인다.
- API가 500이어도 shell board 자체는 깨지지 않는다.
- Bank 5개가 상단에 균등하게 배치되어 있다.
- IVT 7개가 Solar 하단에 배치되어 있다.
- 디젤 표 2개가 우측에 배치되어 있다.
- Battery/PCS/Storage/Solar/BTB/A/C 영역이 시안 위치와 대략 일치한다.
- connector line이 설비 박스 중심 또는 지정 anchor에 맞는다.
- board 외곽이 한 덩어리로 보이고, 내부 표 선이 과하게 밝거나 흐리지 않다.
- 1920px desktop에서 주요 박스가 잘리지 않는다.
- 작은 화면에서 페이지 전체가 망가지지 않고 board 내부 스크롤로 접근 가능하다.
- 기존 로그인, sidebar, topbar, 다른 대시보드/이력/보고서 화면이 영향을 받지 않는다.

## 10. 퍼블리싱 방 다음 작업 1개

다음 작업은 아래 1개로 넘긴다.

`대시보드 v2 shell board 1차 구현 - API 연결 없이 고정 placeholder 데이터로 대시보드_260522.png 외형 재현`

작업 완료 정의:

- route에서 v2 shell board 확인 가능.
- 시안의 주요 설비/표/연결선이 모두 존재.
- 값은 placeholder로 표시.
- API 실패와 무관하게 외형 표시.
- 실데이터 연결은 다음 턴 이슈로 남김.
