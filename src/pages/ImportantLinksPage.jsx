import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { getItems } from '../api/itemApi';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import LinkCard from '../components/common/LinkCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';

export default function ImportantLinksPage() {
  const [search, setSearch] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await getItems();
        setLinks(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const handleItemClick = (itemId) => {
    navigate(`/link/${itemId}`);
  };

  const handleDelete = (id) => console.log('Delete:', id);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full">
      <PageHeader
        title="중요"
        iconType="close"
        onBackClick={() => navigate(-1)}
      >
        <IconButton
          icon={MoreHorizontal}
          onClick={() => console.log('더보기 클릭')}
          aria-label="더보기"
        />
      </PageHeader>

      <main className="flex-1 px-6 pt-6 pb-2 flex flex-col overflow-y-auto">
        <div className="mb-6">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="flex flex-col">
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
                    <div
                      onClick={() => handleItemClick(link.itemId)}
                      className="cursor-pointer"
                    >
                      <LinkCard link={link} />
                    </div>
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
