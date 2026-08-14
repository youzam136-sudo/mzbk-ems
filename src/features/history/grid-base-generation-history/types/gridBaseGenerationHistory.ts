/*
 * 필요: GRID 기저발전 이력 검색 모드와 지표 타입을 고정한다.
 * 연결: 검색 조건 constants, API 이력 view model, 지표 탭.
 * 설명: 실제 데이터는 API에서 받고, 이 파일은 화면에서 선택 가능한 타입만 관리한다.
 * 수정: 검색 모드나 지표명이 바뀌면 이 파일 타입부터 맞춘다.
 */
export type GridBaseGenerationHistoryMode = 'Year' | 'Month' | 'Duration';

export type GridBaseGenerationHistoryMetric = 'Max kWh' | 'Min kWh' | 'AVG kWh';
