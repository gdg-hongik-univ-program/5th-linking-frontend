import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { buildMenu } from '../utils/buildMenu';
import { sortData } from '../utils/sortData';
import ActionSheet from '../components/common/ActionSheet';
import IconButton from '../components/common/IconButton';
import ListView from '../components/common/ListView';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';

export default function SearchPage() {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      document.querySelector('input[name="keyword"]')?.focus?.();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);

  const { items, isLoading, handleGoToView, refetch } = useItems(
    null,
    null,
    submittedKeyword,
    { enabled: searchEnabled },
  );

  // 기본 정렬 옵션
  const [sortOption, setSortOption] = useState({
    type: 'name',
    order: 'asc',
  });

  const [showImportantOnly, setShowImportantOnly] = useState(false);

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    let result = items || [];
    if (showImportantOnly) result = result.filter((i) => i.importance);
    return result;
  }, [items, showImportantOnly]);

  // 정렬된 아이템
  const sortedItems = useMemo(
    () => sortData(filteredItems, sortOption.type, sortOption.order),
    [filteredItems, sortOption],
  );

  const actionSheetSections = useMemo(() => {
    return buildMenu({
      actions: [],
      sortOption,
      setSortOption,
      sortKeys: ['name', 'createdAt', 'dDay'],
      showImportantOnly,
      setShowImportantOnly,
      filterKeys: ['important'],
    });
  }, [sortOption, showImportantOnly]);

  const runSearch = useCallback(() => {
    const keyword = searchQuery.trim();

    if (!keyword) {
      setSearchEnabled(false);
      setSubmittedKeyword('');
      return;
    }

    if (searchEnabled && submittedKeyword === keyword) {
      refetch();
      return;
    }

    setSubmittedKeyword(keyword);
    setSearchEnabled(true);
  }, [searchQuery, searchEnabled, submittedKeyword, refetch]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"
      >
        <div className="relative w-full shrink-0">
          <PageHeader
            title="검색"
            iconType="close"
            onBack={() => navigate(-1)}
            collapseBottomGap
          >
            <IconButton
              icon={MoreHorizontal}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="더보기"
            />
          </PageHeader>
        </div>

        <div className="sticky top-0 z-20 bg-bg-main px-6 pt-4 pb-4">
          <form
            role="search"
            aria-label="링크 검색"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="내 모든 링크 통합 검색"
              mb="mb-0"
              type="text"
              inputMode="search"
              name="keyword"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-label="검색어 입력"
            />

            <button type="submit" className="sr-only">
              검색
            </button>
          </form>
        </div>

        <div className="flex-1 min-h-0">
          <ListView
            data={searchEnabled ? sortedItems : []}
            isLoading={searchEnabled ? isLoading : false}
            searchQuery={searchQuery}
            openedId={null}
            setOpenedId={() => {}}
            scrollParentRef={scrollRef}
            onToggleSelection={() => {}}
            isSelectionMode={false}
            selectedIds={{ folders: [], items: [] }}
            onNavigate={(entry) => handleGoToView(entry.itemId)}
            swipeEnabled={false}
            renderLeftAction={null}
            renderRightAction={null}
            emptyText={
              searchEnabled
                ? '검색 결과가 없어요.'
                : '검색어를 입력하고 엔터를 눌러 주세요.'
            }
          />
        </div>
      </main>

      <ActionSheet
        isOpen={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        sections={actionSheetSections}
        anchorEl={menuAnchor}
      />
    </div>
  );
}
