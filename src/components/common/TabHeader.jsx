const TabHeader = ({ title, children, className = '' }) => {
  return (
    <header
      className={`flex items-center justify-between px-3 pt-8 pb-3 bg-bg-main shrink-0 ${className}`}
    >
      {/* 1. 좌측 탭 제목 텍스트 */}
      <h1 className="pl-3 text-3xl font-extrabold font-family-logo text-text-main tracking-tight leading-none">
        {title}
      </h1>

      {/* 2. 우측 가변 버튼  */}
      <div className="flex items-center gap-0">{children}</div>
    </header>
  );
};

export default TabHeader;
