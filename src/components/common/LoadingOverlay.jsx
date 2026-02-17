export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-main/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* 커스텀 스피너 디자인 */}
      <div className="relative h-14 w-14">
        {/* 바깥쪽 회전 링 */}
        <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />

        {/* 실제로 돌아가는 강조 포인트 */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-500 border-t-transparent shadow-[0_0_20px_rgba(234,190,47,0.4)]" />
      </div>

      {/* 로딩 텍스트 */}
      <p className="mt-6 text-sm font-bold text-primary-500 tracking-[0.2em] animate-pulse uppercase">
        Linking . . .
      </p>
    </div>
  );
}
