import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';

const INITIAL_LINKS = [
  {
    id: '1',
    title: '초보자들이 실수하는 사레레 잘못된 자세',
    description: '어깨 운동의 꽃, 사레레의 정석을 배워보세요.',
    image: null,
    timestamp: '오후 3:12',
    tags: ['헬스', '어깨', '사레레'],
  },
  {
    id: '2',
    title: '26년 서울 청약 총정리 모음',
    description: '내 집 마련을 위한 필승 전략과 일정 안내',
    image: null,
    timestamp: '오전 11:34',
    tags: ['건축', '부동산', '아파트'],
    isImportant: true,
  },
  {
    id: '3',
    title: '화제성 2위의 남자, <흑백요리사> 최대 수혜자 김풍',
    description: '예능계의 블루칩 김풍의 요리 철학',
    image: null,
    timestamp: '오전 10:17',
    tags: ['예능', '나중에보기', '심심할때'],
  },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [links] = useState(INITIAL_LINKS);

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col font-family-sans">
      <header className="flex items-center justify-between px-6 py-6">
        <h1 className="text-3xl font-semibold font-family-logo">홈</h1>
        <button className="p-1 hover:bg-bg-nav rounded-full transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 px-6 py-3 flex flex-col gap-4 overflow-y-auto pb-24">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex justify-center shrink-0">
          <QuickActionBar />
        </div>

        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-bold">최근 저장한 링크</h2>
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <div key={link.id} className="flex gap-4">
                <div className="relative w-24 h-24 bg-neutral-200 rounded-xl shrink-0 overflow-hidden">
                  {link.isImportant && (
                    <div className="absolute top-1.5 right-1.5 text-primary-500 text-sm">
                      ★
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <h3 className="text-[15px] font-normal leading-snug line-clamp-2">
                    {link.title}
                  </h3>
                  <div className="text-right">
                    <p className="text-[11px] text-text-sub">
                      {link.timestamp}
                    </p>
                    <p className="text-[11px] text-text-sub">
                      {link.tags.map((t) => `#${t}`).join(' ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
