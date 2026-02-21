const TabHeader = ({
  title,
  isSelectMode = false,
  children,
  className = '',
  collapseBottomGap = false,
}) => {
  return (
    <header
      className={`relative flex items-center justify-between px-3 pt-8 pb-3 z-10 shrink-0 bg-bg-main ${collapseBottomGap ? '-mb-3' : ''} ${className}`}
    >
      {/* 1. 좌측 탭 제목 */}
      {!isSelectMode ? (
        <h1 className="pl-3 text-3xl font-semibold font-family-logo text-text-main tracking-tight leading-none">
          {title}
        </h1>
      ) : (
        <div />
      )}

      {/* 2. 우측 버튼 영역 */}
      <div className="flex-none flex justify-end items-center gap-0">
        {children || <div className="w-12 h-12" />}
      </div>
    </header>
  );
};

export default TabHeader;
