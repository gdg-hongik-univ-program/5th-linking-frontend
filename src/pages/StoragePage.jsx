import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreHorizontal, ArrowLeft } from 'lucide-react';
import { getItems } from '../api/itemApi';
import { getFolders } from '../api/folderApi';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import LinkCard from '../components/common/LinkCard';
import FolderCard from '../components/common/FolderCard'; // 새로 만든 컴포넌트
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';

// 폴더 트리에서 현재 폴더 객체를 찾는 재귀 함수
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

export default function StoragePage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [folderTree, setFolderTree] = useState([]);
  const [currentLinks, setCurrentLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 스와이프 제어용 상태 (하나만 열리게)
  const [openedId, setOpenedId] = useState(null);

  // 1. 초기 로드: 전체 폴더 트리
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const data = await getFolders();
        setFolderTree(data || []);
      } catch (error) {
        console.error('폴더 목록 로드 실패:', error);
      }
    };
    fetchTree();
  }, []);

  // 2. 링크 데이터 로드
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        const data = await getItems(folderId || null);
        setCurrentLinks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [folderId]);

  // 3. 렌더링할 폴더 목록
  const displayFolders = useMemo(() => {
    if (!folderId) return folderTree;
    const currentNode = findFolderNode(folderTree, folderId);
    return currentNode ? currentNode.children : [];
  }, [folderTree, folderId]);

  // 핸들러
  const handleFolderClick = (id) => {
    navigate(`/storage/${id}`);
    setSearch('');
    setOpenedId(null);
  };

  const handleLinkClick = (itemId) => {
    navigate(`/link/${itemId}`);
  };

  const currentFolderName = useMemo(() => {
    if (!folderId) return '저장소';
    const node = findFolderNode(folderTree, folderId);
    return node ? node.folderName : '폴더';
  }, [folderTree, folderId]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
      <TabHeader title={currentFolderName}>
        {folderId && (
          <div className="absolute left-4">
            <IconButton
              icon={ArrowLeft}
              onClick={() => navigate(-1)}
              aria-label="뒤로가기"
            />
          </div>
        )}
        <IconButton
          icon={MoreHorizontal}
          onClick={() => console.log('더보기')}
          aria-label="더보기"
        />
      </TabHeader>

      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto">
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
              {/* === [1] 폴더 리스트 (FolderCard 적용) === */}
              {displayFolders.map((folder) => (
                <SwipeableWrapper
                  key={`folder-${folder.folderId}`}
                  itemId={`folder-${folder.folderId}`}
                  isOpen={openedId === `folder-${folder.folderId}`}
                  onOpen={setOpenedId}
                  onClose={() => setOpenedId(null)}
                  leftAction={<SwipeActionButton type="edit" />}
                  rightAction={<SwipeActionButton type="delete" />}
                >
                  <div onClick={() => handleFolderClick(folder.folderId)}>
                    <FolderCard folder={folder} />
                  </div>
                </SwipeableWrapper>
              ))}

              {/* === [2] 링크 리스트 (LinkCard 유지) === */}
              {currentLinks.map((link) => (
                <SwipeableWrapper
                  key={`link-${link.itemId}`}
                  itemId={`link-${link.itemId}`}
                  isOpen={openedId === `link-${link.itemId}`}
                  onOpen={setOpenedId}
                  onClose={() => setOpenedId(null)}
                  leftAction={<SwipeActionButton type="edit" />}
                  rightAction={<SwipeActionButton type="delete" />}
                >
                  <div onClick={() => handleLinkClick(link.itemId)}>
                    <LinkCard link={link} />
                  </div>
                </SwipeableWrapper>
              ))}

              {displayFolders.length === 0 && currentLinks.length === 0 && (
                <div className="text-center py-10 text-text-sub">
                  폴더가 비어있습니다.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
