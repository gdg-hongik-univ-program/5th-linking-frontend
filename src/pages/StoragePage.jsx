import Input from '../components/common/Input';

const StoragePage = () => {
  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col font-family-sans">
      {/* 헤더: 타이틀 '저장소'와 ... 버튼 */}
      <header className="flex items-center justify-between px-6 py-5">
        <h1 className="text-2xl font-bold font-family-logo">저장소</h1>
        {/*
                <button className="p-1 hover:bg-bg-nav rounded-full transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        */}
      </header>

      <main className="flex-1 px-6 flex flex-col gap-8 overflow-y-auto pb-24">
        {/* 검색창: 포커스 시 테마 컬러 링 적용 */}
        <section>
          <Input
            placeholder="링크 또는 폴더 검색"
            type="search"
            //leftIcon={<Search className="w-5 h-5 text-text-disabled" />}
          />
        </section>
      </main>
    </div>
  );
};

export default StoragePage;
