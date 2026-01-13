function HomePage() {
  return (
    <div className="p-6 bg-bg-main min-h-full">
      <h1 className="text-2xl font-bold text-text-main mb-4">홈</h1>
      <p className="text-text-sub">홈은 구현 중입니다.</p>
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-40 bg-bg-card rounded-xl border border-border-default flex items-center justify-center text-text-disabled"
          >
            게시물 {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
