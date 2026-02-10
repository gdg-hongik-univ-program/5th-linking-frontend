import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { getItems, restoreItem, deleteItemPermanently } from '../api/itemApi';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ItemCard from '../components/common/ItemCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';

export default function TrashPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const itemName = item.itemName || item.title || '';
    return itemName.toLowerCase().includes(search.toLowerCase());
  });

  // 휴지통 내 아이템 불러오기
  useEffect(() => {
    const fetchTrashItems = async () => {
      setLoading(true);
      try {
        // filter='trash' 파라미터 전달
        const serverData = await getItems(null, 'trash');
        const localItemStr = localStorage.getItem('latestDeletedItem');

        let finalData = Array.isArray(serverData) ? serverData : [];

        // 로컬 스토리지에 방금 삭제한 아이템이 있다면 추가 (싱크 맞추기용)
        if (localItemStr) {
          const localItem = JSON.parse(localItemStr);
          // 서버 데이터에 아직 반영 안 됐을 수도 있으니 중복 체크 후 추가
          const exists = finalData.some((i) => i.itemId === localItem.itemId);
          if (!exists) {
            finalData = [localItem, ...finalData];
          }
          // 한번 가져오면 삭제 (중복 방지)
          localStorage.removeItem('latestDeletedItem');
        }
        setItems(finalData);
      } catch (error) {
        console.error('아이템 로딩 실패:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrashItems();
  }, [location]);

  // 스크롤 시 열려 있는 스와이프 닫기
  useEffect(() => {
    const handleGlobalClose = () => setOpenedItemId(null);
    window.addEventListener('scroll', handleGlobalClose, true);
    return () => window.removeEventListener('scroll', handleGlobalClose, true);
  }, []);

  // 아이템 뷰어 페이지로 이동하기
  const handleView = (itemId) => {
    navigate(`/view/${itemId}`);
  };

  // 아이템 복구하기
  const handleRestore = async (id) => {
    if (!window.confirm('이 링크를 복구할까요?')) return;
    try {
      await restoreItem(id);
      // 성공 시 목록에서 즉시 제거
      setItems((prev) => prev.filter((item) => item.itemId !== id));
      setOpenedItemId(null);
    } catch (error) {
      console.error('링크를 복구하는데 오류가 생겼어요:', error);
      alert('링크를 복구하는데 오류가 생겼어요.');
    }
  };

  // 아이템 영구 삭제
  const handleDeleteForever = async (id) => {
    if (
      !window.confirm(
        '링크를 영구적으로 삭제할까요? 한 번 영구적으로 삭제하면 되돌릴 수 없어요',
      )
    )
      return;
    try {
      await deleteItemPermanently(id);
      // 성공 시 목록에서 즉시 제거
      setItems((prev) => prev.filter((item) => item.itemId !== id));
      setOpenedItemId(null);
    } catch (error) {
      console.error('아이템 영구 삭제 실패:', error);
      alert('링크를 영구적으로 삭제하는데 오류가 생겼어요.');
    }
  };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
        <PageHeader
          title="휴지통"
          // iconType="close" // PageHeader 컴포넌트 스펙에 따라 필요 시 주석 해제
          onBack={() => navigate(-1)} // onBackClick -> onBack (PageHeader prop 이름 확인 필요)
        >
          <IconButton
            icon={MoreHorizontal}
            onClick={() => console.log('더보기 클릭')}
            aria-label="더보기"
          />
        </PageHeader>

        <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto scrollbar-hide">
          <div className="mb-6">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="삭제된 항목 검색"
            />
          </div>

          <section className="flex flex-col">
            <div className="flex flex-col divide-y divide-neutral-800">
              {loading ? (
                <div className="text-center py-10 text-text-sub">
                  불러오는 중...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-10 text-text-sub opacity-50">
                  {search ? '검색 결과가 없어요.' : '휴지통이 비어있어요.'}
                </div>
              ) : (
                <div className="flex flex-col relative overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <SwipeableWrapper
                        key={item.itemId}
                        itemId={item.itemId}
                        isOpen={openedItemId === item.itemId}
                        onOpen={(id) => setOpenedItemId(id)}
                        onClose={() => setOpenedItemId(null)}
                        actionWidth={80}
                        layout
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{
                          opacity: 0,
                          x: -100,
                          transition: { duration: 0.2, ease: 'easeIn' },
                        }}
                        transition={{
                          duration: 0.2,
                          ease: 'easeOut',
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                        // 왼쪽: 복구, 오른쪽: 영구 삭제
                        leftAction={
                          <SwipeActionButton
                            type="restore"
                            onClick={() => handleRestore(item.itemId)}
                          />
                        }
                        rightAction={
                          <SwipeActionButton
                            type="delete" // 아이콘 타입이 permanent_delete가 없다면 delete로 대체
                            onClick={() => handleDeleteForever(item.itemId)}
                          />
                        }
                      >
                        <div
                          onClick={() => handleView(item.itemId)}
                          className="cursor-pointer"
                        >
                          <ItemCard item={item} />
                        </div>
                      </SwipeableWrapper>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
