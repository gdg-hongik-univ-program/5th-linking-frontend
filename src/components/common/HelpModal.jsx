import { useState } from 'react';
import { X, Network, Search, Zap, Calendar, Medal } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'LINKING', icon: Zap },
    { id: 'search', label: '액션/검색', icon: Search },
    { id: 'calendar', label: '캘린더', icon: Calendar },
    { id: 'tier', label: '계급/경험치', icon: Medal },
    { id: 'graph', label: '통계', icon: Network },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 text-sm text-text-sub leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
            <h3 className="text-lg font-bold text-text-main mb-2">
              LINKING에 오신 것을 환영합니다!
            </h3>
            <p>
              <strong>LINKING</strong>은 흩어진 정보와 아이디어를 저장하고, 서로
              연결하며 구조적인 아카이빙을 돕는 서비스입니다.
            </p>
            <p>
              아이디어 사이의 <strong>관계</strong>를 설정함으로써 새로운
              인사이트를 도출해낼 수 있습니다.
            </p>
            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-200 mt-4">
              <p className="font-semibold mb-2">💡 핵심 가이드</p>
              <ul className="list-disc list-inside">
                <li>
                  <strong>+ 버튼</strong>으로 빠르게 링크를 추가해보세요.
                </li>
                <li>
                  태그를 달아 쉽게 분류하고, 무한히 중첩되는 저장소에
                  정리해보세요.
                </li>
                <li>마감일을 관리하고 캘린더에서 일정을 확인해보세요.</li>
                <li>활동할수록 쌓이는 경험치와 통계를 확인해보세요.</li>
              </ul>
            </div>
          </div>
        );
      case 'graph':
        return (
          <div className="space-y-4 text-sm text-text-sub leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
            <h3 className="text-lg font-bold text-text-main mb-2">통계</h3>
            <p>LINKING이 제안하는 통계 서비스</p>
            <div className="p-3 bg-neutral-800/50 rounded-lg border border-text-main/5">
              <span className="font-bold text-text-main block mb-2 text-blue-400">
                📊 프로필 주요 통계
              </span>
              <ul className="space-y-2.5 text-xs">
                <li className="flex gap-2">
                  <span className="text-lg">🔗</span>
                  <div>
                    <strong className="text-white block mb-0.5">
                      총 저장된 링크
                    </strong>
                    지금까지 아카이빙한 모든 정보의 수를 확인해보세요.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-lg">💖</span>
                  <div>
                    <strong className="text-white block mb-0.5">
                      최애 태그
                    </strong>
                    가장 많이 사용한 최애 태그를 확인해보세요.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-lg">📉</span>
                  <div>
                    <strong className="text-white block mb-0.5">
                      태그 통계 및 분석
                    </strong>
                    많이 사용한 상위 5개 태그를 차트로 확인해보세요. <br />
                    가장 개인화된 분석 서비스가 곧 찾아옵니다!
                  </div>
                </li>
              </ul>
            </div>
            <div className="space-y-4 mt-3">
              <div className="p-3 bg-neutral-800/50 rounded-lg border border-text-main/5">
                <span className="font-bold text-text-main flex items-center gap-1.5 mb-1 text-primary-400">
                  ✨ 지식의 우주, 링크 그래프
                </span>
                <p className="mt-1">
                  프로필 탭의 <strong>그래프 화면</strong>에서 유기적으로
                  떠다니는 연결된 링크의 모습을 볼 수 있어요.
                </p>
              </div>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="space-y-4 text-sm text-text-sub leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
            <h3 className="text-lg font-bold text-text-main mb-2">
              빠른 액션과 강력한 검색
            </h3>
            <p>스와이프 액션과 검색으로 더 빠르고 쉽게.</p>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-neutral-800/50 rounded-lg border border-text-main/5">
                <p className="text-text-main font-bold flex items-center gap-1.5 mb-2 relative">
                  <span className="absolute -left-1">📌</span>
                  <span className="ml-5">빠른 이동 탭</span>
                </p>
                <p className="mb-2 ml-5 text-sm">
                  홈 화면에서 다음 기능들을 이용해보세요!
                </p>
                <ul className="space-y-1.5 text-sm text-text-sub">
                  <li>
                    <strong className="text-text-main">🔥 임박:</strong>{' '}
                    마감일이 7일 이내인 리스트만 모아봐요.
                  </li>
                  <li>
                    <strong className="text-text-main">⭐ 중요:</strong>{' '}
                    중요도가 높은 리스트만 모아봐요.
                  </li>
                  <li>
                    <strong className="text-text-main">🧹 정리:</strong>{' '}
                    정리해야 할 리스트를 제안해드려요.
                    <br />
                    <span className="pl-4 text-[11px] opacity-70">
                      삭제할 필요가 없다면 보관하세요! 50일 뒤에 다시
                      알려드려요.
                    </span>
                  </li>
                  <li>
                    <strong className="text-text-main">🗑️ 휴지통:</strong>{' '}
                    휴지통에서 복원/영구삭제할 수 있어요.
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-800/50 rounded-lg border border-text-main/5">
                <p className="flex items-center gap-1 text-text-main font-bold">
                  👉 링크를 좌우로 스와이프해보세요!
                </p>
                <p className=" ml-5 mb-2 text-sm">
                  쉽게 수정/보관/복원/삭제해요.
                </p>
              </div>

              <div className="p-3 bg-neutral-800/50 rounded-lg border border-text-main/5">
                <p className="text-text-main font-bold flex items-center gap-1 mb-2">
                  🔍 전체 검색
                </p>
                <ul className="space-y-1 text-sm text-text-sub list-disc list-inside">
                  <li>홈 화면에서 쉽게 검색하고 정보를 찾아봐요.</li>
                  <li>
                    <strong>필터링</strong> 기능으로 최신순, 중요도순으로
                    자유롭게 정렬해보세요.
                  </li>
                  <li>
                    태그나 폴더 기반 검색도 지원하여 방대한 아카이브도 쉽게
                    탐색할 수 있어요!
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-4 text-sm text-text-sub leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
            <h3 className="text-lg font-bold text-text-main mb-2">
              {' '}
              시간 기반 관리{' '}
            </h3>
            <p>
              작성한 문서나 아이디어를 시간의 흐름 위에. <br />
            </p>
            <div className="space-y-3 mt-3">
              <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl text-blue-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Calendar size={18} className="text-blue-400" />
                  캘린더 탭 200% 활용하기
                </div>
                <p>
                  1. 저장 시 마감일을 설정해보세요. 캘린더에서 빨간색 점으로
                  쉽게 확인할 수 있어요.
                </p>
                <p>
                  2. 날짜를 터치하고 <strong>'마감일'</strong> 탭을 누르면, 해당
                  일자까지 해결해야 하는 내용들만 모아볼 수 있어요!
                </p>
                <p>
                  3. 날짜를 터치하고 <strong>'생성일'</strong> 탭을 누르면 내가
                  그 날 어떤 영감을 기록했는지 시간순으로 발자취를 돌아볼 수
                  있어요!
                </p>
              </div>
            </div>
          </div>
        );
      case 'tier':
        return (
          <div className="space-y-4 text-sm text-text-sub leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
            <h3 className="text-lg font-bold text-text-main mb-2">
              성장 시스템
            </h3>
            <p>적극적으로 아이디어를 쌓고 연결할수록 상승하는 계급.</p>

            <div className="bg-neutral-800/50 rounded-lg border border-text-main/5 p-3 my-3">
              <span className="font-bold text-text-main block mb-2 text-primary-400">
                ⚡ 활동별 획득 경험치
              </span>
              <ul className="space-y-1.5 list-[square] pl-4">
                <li>
                  <span className="text-white">링크(URL) 저장 : </span> +10 XP
                </li>
                <li>
                  <span className="text-white">태그 등록 (개당) : </span> +5 XP
                  (최대 3개 인정)
                </li>
                <li>
                  <span className="text-white">메모 작성 (25자 이상) : </span>{' '}
                  +25 XP
                </li>
                <li>
                  <span className="text-white">아이템 간 연결 : </span> +20 XP
                </li>
              </ul>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-text-main/10 text-white bg-neutral-800/50">
                    <th className="py-2 px-2 whitespace-nowrap">등급</th>
                    <th className="py-2 px-2 whitespace-nowrap">레벨 범위</th>
                    <th className="py-2 px-2 whitespace-nowrap">
                      필요 누적 XP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-main/10">
                  <tr className="hover:bg-text-main/5">
                    <td className="py-2 px-2 whitespace-nowrap font-bold">
                      ♟ 폰 (Pawn)
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">Lv.1 ~ 10</td>
                    <td className="py-2 px-2 text-right">0 ~ 1,000</td>
                  </tr>
                  <tr className="hover:bg-text-main/5 text-success-400">
                    <td className="py-2 px-2 whitespace-nowrap font-bold">
                      ♞ 나이트 (Knight)
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">Lv.11 ~ 20</td>
                    <td className="py-2 px-2 text-right">~ 5,000</td>
                  </tr>
                  <tr className="hover:bg-text-main/5 text-blue-400">
                    <td className="py-2 px-2 whitespace-nowrap font-bold">
                      ♝ 비숍 (Bishop)
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">Lv.21 ~ 30</td>
                    <td className="py-2 px-2 text-right"> ~ 15,000</td>
                  </tr>
                  <tr className="hover:bg-text-main/5 text-purple-400">
                    <td className="py-2 px-2 whitespace-nowrap font-bold">
                      ♜ 룩 (Rook)
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">Lv.31 ~ 45</td>
                    <td className="py-2 px-2 text-right">~ 50,000</td>
                  </tr>
                  <tr className="hover:bg-text-main/5 text-yellow-400">
                    <td className="py-2 px-2 whitespace-nowrap font-bold">
                      ♛ 링'퀸' (Queen)
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">Lv.46 ~ 59</td>
                    <td className="py-2 px-2 text-right"> ~ 150k</td>
                  </tr>
                  <tr className="hover:bg-text-main/5 text-orange-400">
                    <td className="py-2 px-2 whitespace-nowrap font-bold">
                      ♚ 링'킹' (King)
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">Lv.60</td>
                    <td className="py-2 px-2 text-right"> ~</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 isolate animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/50" />
      <div className="bg-bg-main w-full max-w-[340px] h-[70vh] max-h-[550px] flex flex-col rounded-2xl shadow-lg border border-text-main/10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Header */}
        <div className="px-4 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-bg-main relative">
          <div className="flex items-center justify-start min-w-[40px]">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-text-sub hover:text-text-main rounded-full active:bg-neutral-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[180px]">
            <h2 className="text-base font-bold text-text-main truncate">
              서비스 이용 가이드
            </h2>
          </div>

          <div className="flex items-center justify-end min-w-[40px]" />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-text-main/10 bg-neutral-900/40 shrink-0">
          <div className="flex w-full overflow-x-auto scrollbar-hide p-1 gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-1 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400 shadow-inner'
                      : 'text-text-sub hover:bg-white/5 hover:text-text-main'
                  }`}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'opacity-100' : 'opacity-60'}
                  />
                  <span
                    className={`text-[9px] sm:text-[10px] whitespace-nowrap ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-gradient-to-b from-transparent to-neutral-900/20">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
