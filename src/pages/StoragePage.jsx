import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams 추가
import { MoreHorizontal, Folder, ArrowLeft } from 'lucide-react'; // 아이콘 추가
import { getItems } from '../api/itemApi';
import { getFolders } from '../api/folderApi'; // 폴더 API 추가 가정
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import LinkCard from '../components/common/LinkCard';
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
  const { folderId } = useParams(); // URL에서 현재 폴더 ID 가져오기
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [folderTree, setFolderTree] = useState([]); // 전체 폴더 구조
  const [currentLinks, setCurrentLinks] = useState([]); // 현재 폴더의 링크들
  const [loading, setLoading] = useState(true);

  // 1. 초기 로드: 전체 폴더 트리 가져오기 (한 번만 실행)
  useEffect(() => {
    const fetchTree = async () => {
      try {
        // Swagger의 GET /folder 연동
        const data = await getFolders();
        setFolderTree(data || []);
      } catch (error) {
        console.error('폴더 목록 로드 실패:', error);
      }
    };
    fetchTree();
  }, []);

  // 2. 폴더 이동 시: 해당 폴더의 링크 데이터 가져오기
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      try {
        // API가 folderId를 쿼리 파라미터로 받는다고 가정 (GET /item?folderId=...)
        // folderId가 없으면(null/undefined) 최상위 루트(Root) 링크를 가져옴
        const data = await getItems(folderId || null);
        setCurrentLinks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [folderId]); // folderId가 바뀔 때마다 실행

  // 3. 렌더링할 폴더 목록 계산
  const displayFolders = useMemo(() => {
    if (!folderId) return folderTree; // 루트면 최상위 폴더들 표시
    const currentNode = findFolderNode(folderTree, folderId);
    return currentNode ? currentNode.children : [];
  }, [folderTree, folderId]);

  // 4. 이벤트 핸들러
  const handleFolderClick = (id) => {
    navigate(`/storage/${id}`); // 하위 폴더로 이동
    setSearch(''); // 검색어 초기화
  };

  const handleLinkClick = (itemId) => {
    navigate(`/link/${itemId}`);
  };

  const handleBack = () => {
    navigate(-1); // 뒤로 가기
  };

  // 현재 폴더 이름 찾기 (헤더 표시용)
  const currentFolderName = useMemo(() => {
    if (!folderId) return '저장소';
    const node = findFolderNode(folderTree, folderId);
    return node ? node.folderName : '폴더';
  }, [folderTree, folderId]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
      {/* 헤더: 루트가 아니면 뒤로가기 버튼 표시 */}
      <TabHeader title={currentFolderName}>
        {folderId && (
          <div className="absolute left-4">
            <IconButton
              icon={ArrowLeft}
              onClick={handleBack}
              aria-label="뒤로가기"
            />
          </div>
        )}
        <IconButton
          icon={MoreHorizontal}
          onClick={() => console.log('더보기 클릭 (폴더 생성 등)')}
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
              {/* === [1] 폴더 리스트 영역 === */}
              {displayFolders.map((folder) => (
                <SwipeableWrapper
                  key={`folder-${folder.folderId}`}
                  leftAction={<SwipeActionButton type="edit" />}
                  rightAction={<SwipeActionButton type="delete" />}
                >
                  <div
                    onClick={() => handleFolderClick(folder.folderId)}
                    className="flex items-center py-4 cursor-pointer hover:bg-neutral-800/50"
                  >
                    {/* 폴더 아이콘과 이름 (FolderRow 컴포넌트로 분리 가능) */}
                    <div className="mr-4 text-yellow-500">
                      <Folder size={24} fill="currentColor" />
                    </div>
                    <span className="text-base font-medium">
                      {folder.folderName}
                    </span>
                  </div>
                </SwipeableWrapper>
              ))}

              {/* === [2] 링크 리스트 영역 === */}
              {currentLinks.map((link) => (
                <SwipeableWrapper
                  key={`link-${link.itemId}`}
                  leftAction={<SwipeActionButton type="edit" />}
                  rightAction={<SwipeActionButton type="delete" />}
                >
                  <div
                    onClick={() => handleLinkClick(link.itemId)}
                    className="cursor-pointer"
                  >
                    <LinkCard link={link} />
                  </div>
                </SwipeableWrapper>
              ))}

              {/* 비어있을 경우 안내 */}
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
