import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { getItems, deleteItem } from '../api/itemApi';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';
import LinkCard from '../components/common/LinkCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, item: null });
  const deleteTimerRef = useRef(null);
  const pendingItemRef = useRef(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await getItems();
        setLinks(data);
      } catch (error) {
        console.error('아이템 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const handleItemClick = (itemId) => {
    navigate(`/link/${itemId}`);
  };

  const handleEdit = (link) => {
    navigate(`/edit/${link.itemId}`, { state: { link } });
  };

  const handleDeleteRequest = (item) => {
    if (deleteTimerRef.current) {
      executeActualDelete();
    }

    const targetIndex = links.findIndex((l) => l.itemId === item.itemId);
    pendingItemRef.current = { item, index: targetIndex };

    setLinks((prev) => prev.filter((l) => l.itemId !== item.itemId));

    setSnackbar({ isVisible: true, message: '링크가 삭제되었습니다.' });

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
      // 실패 시 UI 복구 로직이 필요하다면 여기에 추가 (여기선 생략)
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
    setLinks((prev) => {
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
          <h2 className="text-xl font-bold">최근 저장한 링크</h2>
          <div className="flex flex-col divide-y divide-neutral-800">
            {loading ? (
              <div className="text-center py-10 text-text-sub">
                불러오는 중...
              </div>
            ) : (
              <div className="flex flex-col relative overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {links.map((link) => (
                    <SwipeableWrapper
                      key={link.itemId}
                      itemId={link.itemId}
                      isOpen={openedItemId === link.itemId}
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
                          onClick={() => handleEdit(link)}
                        />
                      }
                      rightAction={
                        <SwipeActionButton
                          type="delete"
                          onClick={() => handleDeleteRequest(link)}
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
                </AnimatePresence>

                {/* 데이터 없을 때 안내 문구 추가 (선택 사항) */}
                {!loading && links.length === 0 && (
                  <div className="text-center py-10 text-text-sub text-sm">
                    저장된 링크가 없습니다.
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
