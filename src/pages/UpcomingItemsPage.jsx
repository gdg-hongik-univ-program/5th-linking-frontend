import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { getItems } from '../api/itemApi';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ItemCard from '../components/common/ItemCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';

export default function UpcomingItemsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error('아이템 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleItemClick = (itemId) => {
    navigate(`/view/${itemId}`);
  };

  const handleDelete = (id) => console.log('Delete:', id);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full">
      <PageHeader
        title="임박"
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
                {items.map((item) => (
                  <SwipeableWrapper
                    key={item.itemId}
                    leftAction={<SwipeActionButton type="edit" />}
                    rightAction={
                      <SwipeActionButton
                        type="delete"
                        onClick={() => handleDelete(item.itemId)}
                      />
                    }
                  >
                    <div
                      onClick={() => handleItemClick(item.itemId)}
                      className="cursor-pointer"
                    >
                      <ItemCard item={item} />
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
