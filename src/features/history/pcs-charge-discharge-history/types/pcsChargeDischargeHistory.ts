/*
 * 필요: PCS 충방전 이력의 검색 모드와 지표 타입을 고정한다.
 * 연결: 검색 조건 constants, API 이력 view model, 지표 탭.
 * 설명: 실제 데이터는 API에서 받고, 이 파일은 화면에서 선택 가능한 타입만 관리한다.
 * 수정: 지표명이나 조회 모드가 바뀌면 이 파일과 constants를 같이 조정한다.
 */
export type PcsChargeDischargeHistoryMode = 'Year' | 'Month' | 'Duration';

export type PcsChargeDischargeHistoryMetric =
  | 'Max kWh'
  | 'Min kWh'
  | 'AVG kWh'
  | 'Max D kWh'
  | 'Min D kWh'
  | 'AVG D kWh';
