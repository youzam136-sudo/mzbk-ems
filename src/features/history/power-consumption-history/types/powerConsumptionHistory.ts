/*
 * 필요: 전력소비 이력의 검색 모드와 지표 타입을 고정한다.
 * 연결: 검색 조건 constants, API 이력 view model, 지표 탭.
 * 설명: 전력소비 전용 endpoint 확정 전까지 API 매핑 파일에서 사용할 최소 타입만 둔다.
 * 수정: 전력소비 이력 API가 별도 제공되면 constants와 result section의 resource만 조정한다.
 */
export type PowerConsumptionHistoryMode = 'Year' | 'Month' | 'Duration';

export type PowerConsumptionHistoryMetric = 'Max kWh' | 'Min kWh' | 'AVG kWh';
