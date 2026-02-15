const TabHeader = ({
  title,
  isSelectMode = false,
  children,
  className = '',
}) => {
  return (
    <header
      className={`relative flex items-center justify-between px-3 pt-8 pb-3 z-10 shrink-0 bg-bg-main ${className}`}
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
      <div className="flex items-center gap-0">{children}</div>
    </header>
  );
};

export default TabHeader;
