function HomePage() {
  return (
    <div className="p-6 bg-brand-bg min-h-full">
      <h1 className="text-2xl font-bold text-brand-text-main mb-4">
        홈 화면
      </h1>
      <p className="text-brand-text-sub">
        홈 화면은 구현 예정입니다.
      </p>

      {/* 임시 카드 */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-40 bg-brand-card rounded-xl border border-brand-border flex items-center justify-center text-brand-text-disabled">
            게시물 {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
