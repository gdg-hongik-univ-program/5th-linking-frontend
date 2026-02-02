import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { getItems } from '../api/itemApi';
import { getFolders } from '../api/folderApi';
import TabHeader from '../components/common/TabHeader';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import LinkCard from '../components/common/LinkCard';
import FolderCard from '../components/common/FolderCard';
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

  // 스와이프 제어용 상태
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

  // 2. 링크 데이터 로드 (핵심 수정 부분)
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        const data = await getItems(folderId || null);

        let finalData = data;

        if (!folderId) {
          finalData = data.filter((link) => {
            // folderId가 없거나, 0이거나, 문자열 'null' 인 것들 (루트 아이템)
            return (
              !link.folderId ||
              link.folderId === 0 ||
              String(link.folderId) === 'null'
            );
          });
        }
        // folderId가 있으면 filter 과정을 생략하고 data를 그대로 finalData로 씀

        setCurrentLinks(finalData);
      } catch (error) {
        console.error('링크 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [folderId]);

  // 3. 렌더링할 폴더 목록 (직계 자식만)
  const displayFolders = useMemo(() => {
    if (!folderId) return folderTree;
    const currentNode = findFolderNode(folderTree, folderId);
    return currentNode?.children || [];
  }, [folderTree, folderId]);

  // 4. 현재 폴더 이름
  const currentFolderName = useMemo(() => {
    if (!folderId) return '저장소';
    const node = findFolderNode(folderTree, folderId);
    return node ? node.folderName : '폴더';
  }, [folderTree, folderId]);

  // 더보기 버튼
  const renderMoreButton = (
    <IconButton
      icon={MoreHorizontal}
      onClick={() => console.log('더보기')}
      aria-label="더보기"
    />
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
      {/* 헤더 조건부 렌더링 */}
      {!folderId ? (
        <TabHeader title="저장소">{renderMoreButton}</TabHeader>
      ) : (
        <PageHeader title={currentFolderName} onBack={() => navigate(-1)}>
          {renderMoreButton}
        </PageHeader>
      )}

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
              {/* 폴더 리스트 */}
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
                  <div
                    onClick={() => {
                      navigate(`/storage/${folder.folderId}`);
                      setSearch('');
                      setOpenedId(null);
                    }}
                  >
                    <FolderCard folder={folder} />
                  </div>
                </SwipeableWrapper>
              ))}

              {/* 링크 리스트 */}
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
                  <div onClick={() => navigate(`/link/${link.itemId}`)}>
                    <LinkCard link={link} />
                  </div>
                </SwipeableWrapper>
              ))}

              {/* 빈 상태 메시지 */}
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
