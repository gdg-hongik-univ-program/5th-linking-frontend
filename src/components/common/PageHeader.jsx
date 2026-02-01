const PageHeader = ({ title, children, className = '' }) => {
  return (
    <header
      className={`flex items-center justify-between px-3 pt-8 pb-3 bg-bg-main shrink-0 ${className}`}
    >
      <h1 className="pl-3 text-3xl font-bold font-family-logo text-text-main tracking-tight leading-none">
        {title}
      </h1>

      <div className="flex items-center gap-0">{children}</div>
    </header>
  );
};

export default PageHeader;
