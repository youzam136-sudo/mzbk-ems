import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, ApiError } from '../../shared/api/apiClient';
import type { ApiPageResponse } from '../../shared/api/monitoringApi';
import { getPageContents } from '../../shared/api/monitoringApi';
import type { ApiRecord, ApiScalar } from '../../shared/api/apiDataUtils';
import { EMPTY_API_VALUE, getRawValue } from '../../shared/api/apiDataUtils';
import { PageHeading } from '../../shared/ui/PageHeading';
import './SearchResultsPage.css';

type SearchField = {
  label: string;
  keys: string[];
};

type SearchSectionConfig = {
  id: string;
  title: string;
  endpoint: string;
  targetPath: string;
  description: string;
  titleKeys: string[];
  subtitleKeys: string[];
  fields: SearchField[];
};

type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  fields: Array<{ label: string; value: string }>;
};

type SearchResultSection = {
  id: string;
  title: string;
  endpoint: string;
  targetPath: string;
  description: string;
  items: SearchResultItem[];
  errorMessage?: string;
};

const SEARCH_SIZE = 20;

const SEARCH_SECTIONS: SearchSectionConfig[] = [
  {
    id: 'users',
    title: '사용자',
    endpoint: '/system/users',
    targetPath: '/system/users',
    description: '사용자 ID, 사용자명, 이메일, 소속 정보를 기준으로 조회합니다.',
    titleKeys: ['usrNm', 'userNm', 'userName', 'name', 'usrId', 'userId'],
    subtitleKeys: ['usrId', 'userId', 'email'],
    fields: [
      { label: '아이디', keys: ['usrId', 'userId'] },
      { label: '이메일', keys: ['email'] },
      { label: '역할', keys: ['roleNm', 'roleName', 'roleId'] },
      { label: '소속', keys: ['corpNm', 'corporation', 'companyNm'] },
      { label: '부서', keys: ['deptNm', 'dept'] },
      { label: '사용 여부', keys: ['useYn'] }
    ]
  },
  {
    id: 'roles',
    title: '권한',
    endpoint: '/system/roles',
    targetPath: '/system/roles',
    description: '권한 ID, 권한명, 권한 설명을 기준으로 조회합니다.',
    titleKeys: ['roleNm', 'roleName', 'roleId'],
    subtitleKeys: ['roleDesc', 'description'],
    fields: [
      { label: '권한 ID', keys: ['roleId'] },
      { label: '권한명', keys: ['roleNm', 'roleName'] },
      { label: '설명', keys: ['roleDesc', 'description'] },
      { label: '사용 여부', keys: ['useYn'] }
    ]
  },
  {
    id: 'menus',
    title: '메뉴',
    endpoint: '/system/menus',
    targetPath: '/system/menus',
    description: '메뉴명, 메뉴 ID, 화면 경로를 기준으로 조회합니다.',
    titleKeys: ['menuNm', 'menuName', 'sysMenuNm', 'sysMenuId', 'menuId'],
    subtitleKeys: ['menuUrl', 'path'],
    fields: [
      { label: '메뉴 ID', keys: ['sysMenuId', 'menuId'] },
      { label: '메뉴명', keys: ['menuNm', 'menuName', 'sysMenuNm'] },
      { label: '경로', keys: ['menuUrl', 'path'] },
      { label: '상위 메뉴', keys: ['uprMenuId', 'parentMenuId'] },
      { label: '사용 여부', keys: ['useYn'] }
    ]
  },
  {
    id: 'codes',
    title: '시스템 코드',
    endpoint: '/system/codes',
    targetPath: '/system/codes',
    description: '코드 ID, 코드명, 설명을 기준으로 조회합니다.',
    titleKeys: ['cdNm', 'codeNm', 'cdId', 'codeId'],
    subtitleKeys: ['cdDesc', 'description'],
    fields: [
      { label: '코드 ID', keys: ['cdId', 'codeId'] },
      { label: '코드명', keys: ['cdNm', 'codeNm'] },
      { label: '설명', keys: ['cdDesc', 'description'] },
      { label: '상위 코드 ID', keys: ['uprCdId', 'parentCdId'] },
      { label: '사용 여부', keys: ['useYn'] }
    ]
  },
  {
    id: 'plants',
    title: '발전소',
    endpoint: '/master/plants',
    targetPath: '/master/plants',
    description: '발전소명, 발전소 ID, 주소 정보를 기준으로 조회합니다.',
    titleKeys: ['plntNm', 'plantNm', 'plantName', 'plntId', 'plantId'],
    subtitleKeys: ['addr', 'address'],
    fields: [
      { label: '발전소 ID', keys: ['plntId', 'plantId'] },
      { label: '발전소명', keys: ['plntNm', 'plantNm', 'plantName'] },
      { label: '주소', keys: ['addr', 'address'] },
      { label: '운영 시작일', keys: ['operStartYmd', 'operStartDate'] },
      { label: '사용 여부', keys: ['useYn'] }
    ]
  }
];

function readFirstValue(row: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = getRawValue(row[key] as ApiScalar);

    if (value) {
      return value;
    }
  }

  return '';
}

function toDisplayValue(value: string) {
  return value || EMPTY_API_VALUE;
}

function toSearchResultItem(row: ApiRecord, config: SearchSectionConfig, index: number): SearchResultItem {
  const title = readFirstValue(row, config.titleKeys);
  const subtitle = readFirstValue(row, config.subtitleKeys);

  return {
    id: `${config.id}-${readFirstValue(row, ['id', 'usrId', 'userId', 'roleId', 'sysMenuId', 'menuId', 'cdId', 'codeId', 'plntId', 'plantId']) || index}`,
    title: toDisplayValue(title),
    subtitle: toDisplayValue(subtitle),
    fields: config.fields.map((field) => ({
      label: field.label,
      value: toDisplayValue(readFirstValue(row, field.keys))
    }))
  };
}

async function searchSection(config: SearchSectionConfig, keyword: string): Promise<SearchResultSection> {
  const params = new URLSearchParams({
    page: '1',
    size: String(SEARCH_SIZE),
    keyword
  });

  try {
    const response = await apiClient<ApiPageResponse<ApiRecord> | ApiRecord[]>(`${config.endpoint}?${params.toString()}`, {
      operationName: `통합 검색 - ${config.title}`
    });
    const rows = getPageContents(response);

    return {
      id: config.id,
      title: config.title,
      endpoint: config.endpoint,
      targetPath: config.targetPath,
      description: config.description,
      items: rows.map((row, index) => toSearchResultItem(row, config, index))
    };
  } catch (error) {
    const message = error instanceof ApiError ? error.message : '검색 API 호출 중 오류가 발생했습니다.';

    return {
      id: config.id,
      title: config.title,
      endpoint: config.endpoint,
      targetPath: config.targetPath,
      description: config.description,
      items: [],
      errorMessage: message
    };
  }
}

export function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = useMemo(() => (searchParams.get('q') ?? '').trim(), [searchParams]);
  const [sections, setSections] = useState<SearchResultSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!keyword) {
      setSections([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    Promise.all(SEARCH_SECTIONS.map((section) => searchSection(section, keyword)))
      .then((nextSections) => {
        if (!ignore) {
          setSections(nextSections);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [keyword]);

  const totalCount = sections.reduce((sum, section) => sum + section.items.length, 0);
  const hasSectionError = sections.some((section) => section.errorMessage);

  return (
    <div className="search-results-page">
      <PageHeading title="검색 결과" preferMenuTitle={false} />

      <section className="search-results-page__summary" aria-label="검색 안내">
        <strong>{keyword ? `"${keyword}" 검색 결과` : '검색어를 입력해주세요.'}</strong>
        <p>
          현재 Swagger 기준 전용 통합 검색 API는 확인되지 않았습니다. 연결 가능한 목록 API의 keyword 조회 결과를 임시로 구분해
          표시합니다.
        </p>
        {keyword && (
          <span>
            결과 {totalCount}건
            {hasSectionError ? ' · 일부 API 오류가 있습니다.' : ''}
          </span>
        )}
      </section>

      {!keyword && <div className="search-results-page__empty">상단 검색창에 검색어를 입력하면 결과 페이지가 표시됩니다.</div>}

      {keyword && isLoading && <div className="search-results-page__empty">검색 결과를 불러오는 중입니다.</div>}

      {keyword && !isLoading && totalCount === 0 && !hasSectionError && (
        <div className="search-results-page__empty">검색 결과가 없습니다. 기획된 통합 검색 API가 없어 목록 API 기준으로만 조회했습니다.</div>
      )}

      {keyword && !isLoading && (
        <div className="search-results-page__sections">
          {sections.map((section) => (
            <section className="search-results-section" key={section.id} aria-label={`${section.title} 검색 결과`}>
              <header className="search-results-section__header">
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                  <span>{section.endpoint}</span>
                </div>
                <strong>{section.items.length}건</strong>
              </header>

              {section.errorMessage && <p className="search-results-section__error">{section.errorMessage}</p>}

              {!section.errorMessage && section.items.length === 0 && <p className="search-results-section__empty">해당 구분의 검색 결과가 없습니다.</p>}

              <div className="search-results-list">
                {section.items.map((item) => (
                  <button
                    type="button"
                    className="search-results-item"
                    key={item.id}
                    onClick={() => navigate(section.targetPath)}
                    aria-label={`${section.title} 화면으로 이동`}
                  >
                    <span className="search-results-item__eyebrow">{section.title}</span>
                    <strong>{item.title}</strong>
                    <em>{item.subtitle}</em>
                    <dl>
                      {item.fields.map((field) => (
                        <div key={`${item.id}-${field.label}`}>
                          <dt>{field.label}</dt>
                          <dd>{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
