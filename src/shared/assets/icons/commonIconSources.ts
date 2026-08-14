const localIcoSources = {
  operationStatus: new URL('../../../assets/ico/sidebar/operation-status.svg', import.meta.url).href,
  operationHistory: new URL('../../../assets/ico/sidebar/operation-history.svg', import.meta.url).href,
  operationReport: new URL('../../../assets/ico/sidebar/operation-report.svg', import.meta.url).href,
  adminManagement: new URL('../../../assets/ico/sidebar/admin-management.svg', import.meta.url).href,
  systemSamples: new URL('../../../assets/ico/sidebar/system-samples.svg', import.meta.url).href,
  excelSave: new URL('../../../assets/ico/common/excel-save.svg', import.meta.url).href
};

function createIconDataUri(fill: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" fill="${fill}" stroke="#EAF2FF" stroke-opacity="0.68" stroke-width="1.2"/><path d="M5 6H11" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/><path d="M5 8.5H11" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/><path d="M5 11H8.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const commonIconSources = {
  operationStatus: {
    src: localIcoSources.operationStatus,
    alt: '운영 현황 아이콘'
  },
  operationHistory: {
    src: localIcoSources.operationHistory,
    alt: '운영 이력 아이콘'
  },
  operationReport: {
    src: localIcoSources.operationReport,
    alt: '운영 리포트 아이콘'
  },
  adminManagement: {
    src: localIcoSources.adminManagement,
    alt: '관리자 화면 아이콘'
  },
  systemSamples: {
    src: localIcoSources.systemSamples,
    alt: '시스템 샘플 아이콘'
  },
  baseGeneration: {
    src: createIconDataUri('#9AB2FF'),
    alt: '기저발전 아이콘'
  },
  plantOperation: {
    src: createIconDataUri('#58C88A'),
    alt: '발전소 운영현황 아이콘'
  },
  supportGeneration: {
    src: createIconDataUri('#A7BFFF'),
    alt: '보조발전 아이콘'
  },
  chargeDischarge: {
    src: createIconDataUri('#B7C5FF'),
    alt: '충방전 현황 아이콘'
  },
  powerConsumption: {
    src: createIconDataUri('#6CD6D0'),
    alt: '전력 소비 현황 아이콘'
  },
  acStatus: {
    src: createIconDataUri('#6EC7FF'),
    alt: '공조기 현황 아이콘'
  },
  gridHistory: {
    src: createIconDataUri('#7DA4FF'),
    alt: 'GRID 기저발전 이력 아이콘'
  },
  supportHistory: {
    src: createIconDataUri('#93B8FF'),
    alt: '보조발전 이력 아이콘'
  },
  pcsHistory: {
    src: createIconDataUri('#8AC7FF'),
    alt: 'PCS 충방전 이력 아이콘'
  },
  powerHistory: {
    src: createIconDataUri('#7AD6D1'),
    alt: '전력소비 이력 아이콘'
  },
  operationDetail: {
    src: createIconDataUri('#7DA4FF'),
    alt: '운영 리포트 상세 아이콘'
  },
  masterManagement: {
    src: createIconDataUri('#8FA8FF'),
    alt: '마스터 관리 아이콘'
  },
  codeManagement: {
    src: createIconDataUri('#8FA8FF'),
    alt: '코드 관리 아이콘'
  },
  userManagement: {
    src: createIconDataUri('#8FA8FF'),
    alt: '사용자 관리 아이콘'
  },
  roleManagement: {
    src: createIconDataUri('#8FA8FF'),
    alt: '권한 관리 아이콘'
  },
  popupSamples: {
    src: createIconDataUri('#72C2FF'),
    alt: '팝업 샘플 아이콘'
  },
  excelSave: {
    src: localIcoSources.excelSave,
    alt: '엑셀 저장 아이콘'
  }
} as const;
