export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center">
      {/* 커스텀 스피너 디자인 */}
      <div className="relative h-12 w-12">
        {/* 바깥쪽 회전 링 */}
        <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />
        {/* 실제로 돌아가는 강조 포인트 */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-500 border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      </div>

      {/* 로딩 텍스트 (선택 사항) */}
      <p className="mt-4 text-sm font-medium text-neutral-400 tracking-wider animate-pulse">
        Linking . . .
      </p>
    </div>
  );
}
