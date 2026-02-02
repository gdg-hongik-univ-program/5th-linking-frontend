import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, item: null });
  const deleteTimerRef = useRef(null);
  const pendingItemRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error('아이템 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleItemClick = (itemId) => {
    navigate(`/view/${itemId}`);
  };

  const handleEdit = (item) => {
    navigate(`/edit/${item.itemId}`, { state: { item } });
  };

  const handleDeleteRequest = (item) => {
    if (deleteTimerRef.current) {
      executeActualDelete();
    }

    const targetIndex = items.findIndex((i) => i.itemId === item.itemId);
    pendingItemRef.current = { item, index: targetIndex };

    setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));

    setSnackbar({ isVisible: true, message: '아이템이 삭제되었습니다.' });

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000); // 3초 대기
  };

  // 실제 서버 API를 호출하는 함수
  const executeActualDelete = async () => {
    if (!pendingItemRef.current) return;

    try {
      const { item } = pendingItemRef.current;
      await deleteItem(item.itemId);
      console.log('서버에서 완전히 삭제됨');
    } catch (error) {
      console.error('서버 삭제 실패:', error);
    } finally {
      clearDeleteState();
    }
  };

  // 실행 취소(Undo) 클릭 시 호출
  const handleUndo = () => {
    if (!pendingItemRef.current) return;

    // 1. 타이머 중단 (서버 요청 안 보냄)
    clearTimeout(deleteTimerRef.current);

    // 2. 원래 위치에 데이터 복원
    const { item, index } = pendingItemRef.current;
    setItems((prev) => {
      const newList = [...prev];
      newList.splice(index, 0, item);
      return newList;
    });

    // 3. 상태 초기화
    clearDeleteState();
  };

  const clearDeleteState = () => {
    setSnackbar({ isVisible: false, item: null });
    deleteTimerRef.current = null;
    pendingItemRef.current = null;
  };

  // 전역 이벤트로 스와이프 액션 닫기
  useEffect(() => {
    const handleGlobalClose = () => setOpenedItemId(null);
    window.addEventListener('scroll', handleGlobalClose, true);
    return () => window.removeEventListener('scroll', handleGlobalClose, true);
  }, []);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
      <TabHeader title="홈">
        <IconButton
          icon={Bell}
          onClick={() => navigate('/notification')}
          aria-label="알림함"
        />
      </TabHeader>

      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto">
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
          <h2 className="text-xl font-bold">최근 저장한 아이템</h2>{' '}
          <div className="flex flex-col divide-y divide-neutral-800">
            {loading ? (
              <div className="text-center py-10 text-text-sub">
                불러오는 중...
              </div>
            ) : (
              <div className="flex flex-col relative overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
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
                          onClick={() => handleDeleteRequest(item)}
                        />
                      }
                    >
                      <div
                        onClick={() => handleItemClick(item.itemId)}
                        className="cursor-pointer"
                      >
                        <ItemCard item={item} />{' '}
                      </div>
                    </SwipeableWrapper>
                  ))}
                </AnimatePresence>

                {!loading && items.length === 0 && (
                  <div className="text-center py-10 text-text-sub text-sm">
                    저장된 아이템이 없습니다.
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
  );
}
