import React, { useState } from 'react';
import { Bell, Pencil, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { getItems } from '../api/itemApi';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';
import LinkCard from '../components/common/LinkCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';

const INITIAL_LINKS = [
  {
    itemId: 1,
    title:
      '초보자들이 실수하는 사레레 잘못된 자세 : 어깨 운동의 꽃, 사레레의 정석을 배워보세요.',
    image: null,
    tags: ['헬스', '어깨', '사레레'],
    createaAt: '2026-01-25',
  },
  {
    itemId: 2,
    title: '26년 서울 청약 총정리 모음',
    tags: ['건축', '부동산', '아파트'],
    memo: '내 집 마련을 위한 필승 전략과 일정 안내',
    isImportant: true,
    image: null,
    createaAt: '오전 11:34',
  },
  {
    itemId: 15,
    url: 'https://www.youtube.com/watch?v=kYI_U7u66K0',
    title: '최강록의 무조림 비법 레시피',
    tags: [],
    memo: '이번 주말에 꼭 도전해보기. 무를 두껍게 써는 게 포인트!',
    importance: true,
    deadline: '2026-01-20',
    createdAt: '2026-01-16',
  },
  {
    itemId: 14,
    url: 'https://github.com/gdg-linking/linking-backend',
    title: '우리 팀 백엔드 저장소',
    tags: [],
    memo: 'PR 올리기 전에 컨벤션 다시 확인할 것',
    importance: false,
    deadline: '2026-01-25',
    createdAt: '2026-01-15',
  },
  {
    itemId: 12,
    url: 'https://spring.io/projects/spring-boot',
    title: '스프링 부트 공식 문서',
    tags: [],
    memo: 'JPA Auditing 설정 방법 참고용',
    importance: false,
    deadline: null,
    createdAt: '2026-01-10',
  },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  //const [links, setLinks] = useState([]);
  const [links] = useState(INITIAL_LINKS);
  const [loading, setLoading] = useState(false);

  /*useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await getItems();
        setLinks(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);
*/
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
          <div className="flex flex-col divide-y divide-neutral-800">
            {loading ? (
              <div className="text-center py-10 text-text-sub">
                불러오는 중...
              </div>
            ) : (
              <div className="flex flex-col">
                {links.map((link) => (
                  <SwipeableWrapper
                    key={link.itemId}
                    leftAction={<SwipeActionButton type="edit" />}
                    rightAction={
                      <SwipeActionButton
                        type="delete"
                        onClick={() => handleDelete(link.itemId)}
                      />
                    }
                  >
                    <LinkCard link={link} />
                  </SwipeableWrapper>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
