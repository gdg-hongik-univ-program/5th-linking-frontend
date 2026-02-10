import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { getItems, deleteItem } from '../api/itemApi';
import { getFolders, updateFolder, deleteFolder } from '../api/folderApi';
import TabHeader from '../components/common/TabHeader';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ItemCard from '../components/common/ItemCard';
import FolderCard from '../components/common/FolderCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

const findFolderNode = (nodes, targetId) => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (String(node.folderId) === String(targetId)) return node;
    if (node.children) {
      const found = findFolderNode(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

const EditModal = ({ isOpen, onClose, onSubmit, initialValue }) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-bg-main w-full max-w-xs rounded-xl p-5 shadow-lg border border-neutral-800">
        <h3 className="text-lg font-bold text-text-main mb-3">
          폴더 이름 변경
        </h3>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-neutral-800 text-text-main p-3 rounded-lg outline-none focus:ring-1 focus:ring-primary mb-4"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-sub text-sm rounded-lg hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            onClick={() => onSubmit(value)}
            disabled={!value.trim()}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg disabled:opacity-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default function StoragePage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [folderTree, setFolderTree] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedId, setOpenedId] = useState(null);

  // 스낵바 상태 (type으로 구분: 'item' | 'folder')
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: '',
    type: null,
  });

  // [로직 분리] 아이템 삭제 전용 Refs
  const itemDeleteTimerRef = useRef(null);
  const pendingItemRef = useRef(null); // { item, index }

  // [로직 분리] 폴더 삭제 전용 Refs
  const folderDeleteTimerRef = useRef(null);
  const pendingFolderRef = useRef(null); // { folder, oldTree }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  // 데이터 로드
  const fetchTree = async () => {
    try {
      const data = await getFolders();
      setFolderTree(data || []);
    } catch (error) {
      console.error('폴더 로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await getItems(folderId || null);
        let finalData = Array.isArray(data) ? data : [];
        // 데이터 정제
        finalData = finalData
          .filter((item) => item !== null && item !== undefined)
          .map((item) =>
            !item.itemId && item.id ? { ...item, itemId: item.id } : item,
          )
          .filter((item) => item.itemId);

        if (!folderId) {
          finalData = finalData.filter(
            (item) =>
              !item.folderId ||
              item.folderId === 0 ||
              String(item.folderId) === 'null',
          );
        }
        setCurrentItems(finalData);
      } catch (error) {
        console.error('아이템 로드 실패:', error);
        setCurrentItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [folderId]);

  useEffect(() => {
    const handleGlobalClose = () => setOpenedId(null);
    window.addEventListener('scroll', handleGlobalClose, true);
    return () => window.removeEventListener('scroll', handleGlobalClose, true);
  }, []);

  const displayFolders = useMemo(() => {
    if (!folderId) return folderTree;
    const currentNode = findFolderNode(folderTree, folderId);
    return currentNode?.children || [];
  }, [folderTree, folderId]);

  const currentFolderName = useMemo(() => {
    if (!folderId) return '저장소';
    const node = findFolderNode(folderTree, folderId);
    return node ? node.folderName : '폴더';
  }, [folderTree, folderId]);

  // ------------------------------------------------------------------
  // [1] 아이템 삭제 로직 (완전 분리)
  // ------------------------------------------------------------------

  const executeItemDelete = async (targetItem) => {
    // 인자로 받은 targetItem을 직접 사용 (Ref 의존성 최소화)
    if (!targetItem || !targetItem.itemId) {
      console.error('>>> [Item] 삭제할 데이터 손실됨');
      return;
    }

    // 이미 취소된 작업인지 확인 (Ref가 비었거나 다른 아이템이면 스킵)
    if (
      !pendingItemRef.current ||
      pendingItemRef.current.item.itemId !== targetItem.itemId
    ) {
      console.log('>>> [Item] 이미 취소된 작업이거나 새로운 작업이 시작됨');
      return;
    }

    console.log('>>> [Item] 서버 삭제 요청:', targetItem.itemId);
    try {
      await deleteItem(targetItem.itemId);
      console.log('>>> [Item] 삭제 성공');
    } catch (error) {
      console.error('>>> [Item] 삭제 실패:', error);
      // 실패 시 복구
      setCurrentItems((prev) => [...prev, targetItem]);
    } finally {
      // 정리 (아직도 내가 최신 작업이면)
      if (
        pendingItemRef.current &&
        pendingItemRef.current.item.itemId === targetItem.itemId
      ) {
        pendingItemRef.current = null;
        itemDeleteTimerRef.current = null;
        setSnackbar((prev) => ({ ...prev, isVisible: false }));
      }
    }
  };

  const handleDeleteItem = (item) => {
    // 1. 기존 폴더/아이템 작업 정리 (스낵바가 하나뿐이라 서로 간섭 방지)
    if (folderDeleteTimerRef.current) {
      clearTimeout(folderDeleteTimerRef.current);
      executeFolderDelete(pendingFolderRef.current.folder); // 즉시 실행
    }
    if (itemDeleteTimerRef.current) {
      clearTimeout(itemDeleteTimerRef.current);
      // 이전 아이템 즉시 실행 (덮어쓰기 아님, 이전 거 완료 처리)
      if (pendingItemRef.current)
        executeItemDelete(pendingItemRef.current.item);
    }

    // 2. Ref 설정
    const index = currentItems.findIndex((i) => i.itemId === item.itemId);
    pendingItemRef.current = { item, index };

    // 3. UI 반영
    setCurrentItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
    setSnackbar({
      isVisible: true,
      message: '링크를 삭제했어요.',
      type: 'item',
    });

    // 4. 타이머 설정 (클로저로 item 전달)
    console.log('>>> [Item] 타이머 설정:', item.itemId);
    itemDeleteTimerRef.current = setTimeout(() => {
      executeItemDelete(item);
    }, 3000);
  };

  // ------------------------------------------------------------------
  // [2] 폴더 삭제 로직 (완전 분리)
  // ------------------------------------------------------------------

  const executeFolderDelete = async (targetFolder) => {
    if (!targetFolder || !targetFolder.folderId) return;

    if (
      !pendingFolderRef.current ||
      pendingFolderRef.current.folder.folderId !== targetFolder.folderId
    ) {
      return;
    }

    console.log('>>> [Folder] 서버 삭제 요청:', targetFolder.folderId);
    try {
      await deleteFolder(targetFolder.folderId);
      console.log('>>> [Folder] 삭제 성공');
    } catch (error) {
      console.error('>>> [Folder] 삭제 실패:', error);
      fetchTree(); // 트리 복구
    } finally {
      if (
        pendingFolderRef.current &&
        pendingFolderRef.current.folder.folderId === targetFolder.folderId
      ) {
        pendingFolderRef.current = null;
        folderDeleteTimerRef.current = null;
        setSnackbar((prev) => ({ ...prev, isVisible: false }));
      }
    }
  };

  const handleDeleteFolder = (folder) => {
    // 기존 작업 정리
    if (itemDeleteTimerRef.current) {
      clearTimeout(itemDeleteTimerRef.current);
      if (pendingItemRef.current)
        executeItemDelete(pendingItemRef.current.item);
    }
    if (folderDeleteTimerRef.current) {
      clearTimeout(folderDeleteTimerRef.current);
      if (pendingFolderRef.current)
        executeFolderDelete(pendingFolderRef.current.folder);
    }

    // Ref 설정
    pendingFolderRef.current = { folder, oldTree: folderTree };

    // UI 반영
    const removeNode = (nodes, targetId) =>
      nodes
        .filter((n) => String(n.folderId) !== String(targetId))
        .map((n) => ({
          ...n,
          children: n.children ? removeNode(n.children, targetId) : [],
        }));
    setFolderTree((prev) => removeNode(prev, folder.folderId));
    setSnackbar({
      isVisible: true,
      message: '폴더를 삭제했어요.',
      type: 'folder',
    });

    // 타이머 설정
    console.log('>>> [Folder] 타이머 설정:', folder.folderId);
    folderDeleteTimerRef.current = setTimeout(() => {
      executeFolderDelete(folder);
    }, 3000);
  };

  // ------------------------------------------------------------------
  // [3] 실행 취소 (분기 처리)
  // ------------------------------------------------------------------

  const handleUndo = () => {
    // 현재 스낵바 타입에 따라 분기
    if (snackbar.type === 'item' && pendingItemRef.current) {
      console.log('>>> [Item] 실행 취소');
      clearTimeout(itemDeleteTimerRef.current);

      const { item, index } = pendingItemRef.current;
      setCurrentItems((prev) => {
        const newList = [...prev];
        if (index !== -1) newList.splice(index, 0, item);
        else newList.push(item);
        return newList;
      });

      pendingItemRef.current = null;
      itemDeleteTimerRef.current = null;
    } else if (snackbar.type === 'folder' && pendingFolderRef.current) {
      console.log('>>> [Folder] 실행 취소');
      clearTimeout(folderDeleteTimerRef.current);

      const { oldTree } = pendingFolderRef.current;
      if (oldTree) setFolderTree(oldTree);
      else fetchTree();

      pendingFolderRef.current = null;
      folderDeleteTimerRef.current = null;
    }

    setSnackbar({ isVisible: false, message: '', type: null });
  };

  // ------------------------------------------------------------------
  // [4] 페이지 이탈 처리
  // ------------------------------------------------------------------

  useEffect(() => {
    return () => {
      // 아이템 잔여 작업 처리
      if (itemDeleteTimerRef.current && pendingItemRef.current) {
        clearTimeout(itemDeleteTimerRef.current);
        const { item } = pendingItemRef.current;
        if (item) {
          const BASE_URL = 'https://api.thelinking.store';
          const token = localStorage.getItem('accessToken');
          const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          };
          fetch(`${BASE_URL}/item/${item.itemId}`, {
            method: 'DELETE',
            headers,
            keepalive: true,
          }).catch(console.error);
        }
      }

      // 폴더 잔여 작업 처리
      if (folderDeleteTimerRef.current && pendingFolderRef.current) {
        clearTimeout(folderDeleteTimerRef.current);
        const { folder } = pendingFolderRef.current;
        if (folder) {
          const BASE_URL = 'https://api.thelinking.store';
          const token = localStorage.getItem('accessToken');
          const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          };
          fetch(`${BASE_URL}/folder/${folder.folderId}`, {
            method: 'DELETE',
            headers,
            keepalive: true,
          }).catch(console.error);
        }
      }
    };
  }, []);

  // ------------------------------------------------------------------

  const handleEditFolderClick = (folder) => {
    setEditingFolder(folder);
    setIsModalOpen(true);
    setOpenedId(null);
  };
  const handleRenameSubmit = async (newName) => {
    if (!editingFolder) return;
    try {
      await updateFolder(editingFolder.folderId, newName);
      fetchTree();
    } catch (e) {
      console.error(e);
    }
    setIsModalOpen(false);
  };

  const renderMoreButton = (
    <IconButton
      icon={MoreHorizontal}
      onClick={() => console.log('더보기')}
      aria-label="더보기"
    />
  );

  return (
    <>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden h-full">
        {!folderId ? (
          <TabHeader title="저장소">{renderMoreButton}</TabHeader>
        ) : (
          <PageHeader title={currentFolderName} onBack={() => navigate(-1)}>
            {' '}
            {renderMoreButton}{' '}
          </PageHeader>
        )}
        <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto scrollbar-hide">
          <div className="mb-6">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col divide-y divide-neutral-800">
            {loading ? (
              <div className="text-center py-10 text-text-sub">로딩 중...</div>
            ) : (
              <>
                {displayFolders.map((folder) => (
                  <SwipeableWrapper
                    key={`folder-${folder.folderId}`}
                    itemId={`folder-${folder.folderId}`}
                    isOpen={openedId === `folder-${folder.folderId}`}
                    onOpen={setOpenedId}
                    onClose={() => setOpenedId(null)}
                    leftAction={
                      <SwipeActionButton
                        type="edit"
                        onClick={() => handleEditFolderClick(folder)}
                      />
                    }
                    rightAction={
                      <SwipeActionButton
                        type="delete"
                        onClick={() => handleDeleteFolder(folder)}
                      />
                    }
                  >
                    <div
                      onClick={() => {
                        navigate(`/storage/${folder.folderId}`);
                        setSearch('');
                        setOpenedId(null);
                      }}
                    >
                      {' '}
                      <FolderCard folder={folder} />{' '}
                    </div>
                  </SwipeableWrapper>
                ))}

                {currentItems
                  .filter((item) => item && item.itemId)
                  .map((item) => (
                    <SwipeableWrapper
                      key={`item-${item.itemId}`}
                      itemId={`item-${item.itemId}`}
                      isOpen={openedId === `item-${item.itemId}`}
                      onOpen={setOpenedId}
                      onClose={() => setOpenedId(null)}
                      leftAction={
                        <SwipeActionButton
                          type="edit"
                          onClick={() =>
                            navigate(`/edit/${item.itemId}`, {
                              state: { item },
                            })
                          }
                        />
                      }
                      rightAction={
                        <SwipeActionButton
                          type="delete"
                          onClick={() => handleDeleteItem(item)}
                        />
                      }
                    >
                      <div onClick={() => navigate(`/view/${item.itemId}`)}>
                        {' '}
                        <ItemCard item={item} />{' '}
                      </div>
                    </SwipeableWrapper>
                  ))}

                {displayFolders.length === 0 && currentItems.length === 0 && (
                  <div className="text-center py-10 text-text-sub">
                    폴더가 비어있습니다.
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Snackbar
          isVisible={snackbar.isVisible}
          message={snackbar.message}
          onUndo={handleUndo}
        />
        <EditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleRenameSubmit}
          initialValue={editingFolder?.folderName || ''}
        />
      </div>
    </>
  );
}
