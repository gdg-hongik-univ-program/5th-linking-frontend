import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { getItems, deleteItem } from '../api/itemApi';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';
import ItemCard from '../components/common/ItemCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, item: null });

  const deleteTimerRef = useRef(null);
  const pendingItemRef = useRef(null);

  // [수정] 검색 필터링 로직 추가 (search와 items 상태가 정의된 직후에 위치)
  const filteredItems = items.filter((item) => {
    if (!search) return true;
    // item.itemName이 있다고 가정 (실제 데이터 구조에 맞게 수정 필요: item.title 등)
    const title = item.itemName || item.title || '';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  // 최근 생성한 아이템 불러오기
  useEffect(() => {
    const fetchRecentItems = async () => {
      setLoading(true);
      try {
        const data = await getItems();
        // 배열인지 확인 후 설정
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('아이템 로딩 실패:', error);
        setItems([]); // 에러 시 빈 배열 처리
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
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

  // 아이템 에디터 페이지로 이동하기
  const handleEdit = (item) => {
    navigate(`/edit/${item.itemId}`, { state: { item } });
  };

  // 아이템 삭제하기 (3초 대기)
  const handleDelete = (item) => {
    if (deleteTimerRef.current) {
      executeActualDelete();
    }

    const targetIndex = items.findIndex((i) => i.itemId === item.itemId);
    pendingItemRef.current = { item, index: targetIndex };

    setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));

    setSnackbar({ isVisible: true, message: '링크를 삭제했어요.' });

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000);
  };

  // 서버에서 아이템 삭제하기
  const executeActualDelete = async () => {
    if (!pendingItemRef.current) return;

    try {
      const { item } = pendingItemRef.current;
      await deleteItem(item.itemId);
      console.log('아이템 삭제 성공');
    } catch (error) {
      console.error('아이템 삭제 실패:', error);
    } finally {
      clearDeleteState();
    }
  };

  // 아이템 삭제 취소하기
  const handleUndo = () => {
    if (!pendingItemRef.current) return;

    clearTimeout(deleteTimerRef.current);

    const { item, index } = pendingItemRef.current;
    setItems((prev) => {
      const newList = [...prev];
      newList.splice(index, 0, item);
      return newList;
    });

    clearDeleteState();
  };

  // 아이템 삭제 관련 초기화하기
  const clearDeleteState = () => {
    setSnackbar({ isVisible: false, item: null });
    deleteTimerRef.current = null;
    pendingItemRef.current = null;
  };

  // 홈 탭에서 벗어날 시 아이템 삭제 대기 무시하고 즉시 삭제하기
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current && pendingItemRef.current) {
        clearTimeout(deleteTimerRef.current);

        const { item } = pendingItemRef.current;
        deleteItem(item.itemId).catch((err) => console.error(err));
        localStorage.setItem('latestDeletedItem', JSON.stringify(item));

        deleteTimerRef.current = null;
        pendingItemRef.current = null;
      }
    };
  }, []);

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

      <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden h-full">
        <TabHeader title="홈">
          <IconButton
            icon={Bell}
            onClick={() => navigate('/notification')}
            aria-label="알림함"
          />
        </TabHeader>

        <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto scrollbar-hide">
          <div className="mb-6">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex justify-center shrink-0 mb-10">
            <QuickActionBar />
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">최근 저장한 링크</h2>{' '}
            <div className="flex flex-col divide-y divide-neutral-800">
              {loading ? (
                <div className="text-center py-10 text-text-sub">
                  불러오는 중...
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
                        initial={{ opacity: -1, y: 0 }}
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
                        leftAction={
                          <SwipeActionButton
                            type="edit"
                            onClick={() => handleEdit(item)}
                          />
                        }
                        rightAction={
                          <SwipeActionButton
                            type="delete"
                            onClick={() => handleDelete(item)}
                          />
                        }
                      >
                        <div
                          onClick={() => handleView(item.itemId)}
                          className="cursor-pointer"
                        >
                          <ItemCard item={item} />{' '}
                        </div>
                      </SwipeableWrapper>
                    ))}
                  </AnimatePresence>

                  {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-10 text-text-sub text-sm">
                      {search
                        ? '검색 결과가 없어요'
                        : '최근 저장한 링크가 없어요.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
        <Snackbar
          isVisible={snackbar.isVisible}
          message={snackbar.message}
          onUndo={handleUndo}
        />
      </div>
    </>
  );
}
