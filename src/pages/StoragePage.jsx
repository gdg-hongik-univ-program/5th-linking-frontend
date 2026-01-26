import SearchBar from '../components/common/SearchBar';

const StoragePage = () => {
  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
      {/* 헤더: 타이틀 '저장소'와 ... 버튼 */}
      <header className="flex items-center justify-between px-6 py-5">
        <h1 className="text-2xl font-bold font-family-logo">저장소</h1>
      </header>

      <main className="flex-1 px-6 flex flex-col gap-8 overflow-y-auto pb-24">
        <SearchBar />
      </main>
    </div>
  );
};

export default StoragePage;
