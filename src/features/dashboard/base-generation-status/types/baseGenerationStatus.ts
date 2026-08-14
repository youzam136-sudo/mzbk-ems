/*
 * 필요: 기저 발전현황 확인용 표, 차트, 지표 타입.
 * 연결: BaseGenerationStatusScaffoldSection.
 * 설명: 별도 화면 확정 전까지 GRID API view model을 재사용하되 화면명 기준 타입을 남긴다.
 * 수정: 정식 화면 전환 시 API 대응 view model에 맞춰 재정리한다.
 */
export type BaseGenerationStatusMetric = {
  label: string;
  values: string[];
};
