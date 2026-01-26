import { useState, useEffect } from 'react';
import { Bell, Pencil, Trash2 } from 'lucide-react';
import { getItems } from '../api/itemApi';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';
import LinkCard from '../components/common/LinkCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
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
