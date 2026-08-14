/*
 * 필요: 보조발전 이력의 검색 모드와 지표 타입을 고정한다.
 * 연결: 검색 조건 constants, API 이력 view model, 지표 탭.
 * 설명: 실제 ESS/디젤 데이터는 API 어댑터에서 받고, 화면 선택 타입만 분리한다.
 * 수정: 보조발전 이력 구성이 바뀌면 이 파일과 result section의 API 필드를 같이 조정한다.
 */
export type SupportGenerationHistoryMode = 'Year' | 'Month' | 'Duration';

export type SupportGenerationHistoryMetric = 'Max kWh' | 'Min kWh' | 'AVG kWh' | 'Max D kWh' | 'Min D kWh' | 'AVG D kWh';
