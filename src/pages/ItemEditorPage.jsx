import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star, Save, Hourglass, CircleX, Folder, Hash, X } from 'lucide-react';
import { useItem } from '../hooks/useItem';
import { useFolders } from '../hooks/useFolders';
import { findFolderPath } from '../utils/findFolderPath';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import FolderPicker from '../components/common/FolderPicker';

export default function ItemEditorPage() {
  const { itemId } = useParams();

  const [searchParams] = useSearchParams();
  const folderIdParam = searchParams.get('folderId');

  const { item: fetchedItem, handleCreate, handleUpdate } = useItem(itemId);
  const { folders: folderTree } = useFolders();

  const hiddenDateRef = useRef(null);
  const tagInputRef = useRef(null);
  const memoRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    deadline: '',
    tags: [],
    memo: '',
    folderId: folderIdParam || '',
  });

  const [tagInput, setTagInput] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // 폴더 경로 표시
  const folderPathString = useMemo(() => {
    if (!formData.folderId) return '저장소 최상단';
    const pathArray = findFolderPath(folderTree, formData.folderId);
    if (pathArray) return pathArray.join('/');
    return `폴더 표시하는 중...`;
  }, [folderTree, formData.folderId]);

  // 불러오기
  useEffect(() => {
    if (fetchedItem) {
      setFormData({
        title: fetchedItem.title || '',
        url: fetchedItem.url || '',
        deadline: fetchedItem.deadline || '',
        tags: fetchedItem.tags || [],
        memo: fetchedItem.memo || '',
        folderId: fetchedItem.folderId || '',
      });
      setIsImportant(fetchedItem.importance || false);
    } else if (folderIdParam) {
      setFormData((prev) => {
        if (String(prev.folderId) === String(folderIdParam)) return prev;
        return { ...prev, folderId: folderIdParam };
      });
    }
  }, [fetchedItem, folderIdParam]);

  useEffect(() => {
    if (memoRef.current) {
      memoRef.current.style.height = 'auto';
      memoRef.current.style.height = memoRef.current.scrollHeight + 'px';
    }
  }, [formData.memo]);

  const handleSave = async () => {
    if (!formData.title.trim()) return alert('제목을 입력해주세요.');
    const targetFolderId = formData.folderId ? Number(formData.folderId) : null;
    const finalDeadline = formData.deadline
      ? formData.deadline.split('T')[0]
      : null;

    const payload = {
      url: formData.url,
      title: formData.title,
      folderId: targetFolderId,
      memo: formData.memo,
      importance: isImportant,
      deadline: finalDeadline,
      tags: formData.tags,
    };
    if (itemId) await handleUpdate(payload);
    else await handleCreate(payload);
  };

  const handleHiddenDateChange = (e) => {
    if (e.target.value) {
      setFormData((prev) => ({ ...prev, deadline: e.target.value }));
    }
  };

  // 마감일 선택기 열기
  const handleCalendarClick = () => {
    try {
      hiddenDateRef.current?.showPicker();
    } catch {
      hiddenDateRef.current?.focus();
    }
  };

  // 마감일 한 번에 지우기
  const handleClearDate = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, deadline: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 중요도 토글
  const toggleImportant = () => setIsImportant((prev) => !prev);

  // 태그 입력
  const handleTagKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (formData.tags.length >= 10) {
        alert('태그는 최대 10개까지 추가할 수 있어요.');
        setTagInput('');
        return;
      }
      if (newTag.length > 35) {
        alert('태그 하나엔 최대 35자까지 입력할 수 있어요.');
        return;
      }
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag].sort(),
        }));
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    }
  };

  // 태그 삭제
  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // 위치 선택기 열기
  const handleFolderSelect = (selectedId) => {
    setFormData((prev) => ({ ...prev, folderId: selectedId || '' }));
  };

  // 날짜 포맷 표시
  const formattedDateString = useMemo(() => {
    if (!formData.deadline) return '';
    const date = new Date(formData.deadline);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  }, [formData.deadline]);

  return (
    <div className="h-full flex flex-col font-family-sans bg-bg-main">
      <PageHeader>
        <IconButton icon={Save} onClick={handleSave} aria-label="저장하기" />
      </PageHeader>

      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <div className="flex-1 flex flex-col px-5 py-4 gap-4 min-h-full">
          {/* 제목 */}
          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex items-start gap-2">
              <input
                type="text"
                name="title"
                placeholder="제목을 입력하세요"
                value={formData.title || ''}
                onChange={handleChange}
                maxLength={70}
                className="flex-1 bg-transparent text-xl font-bold text-text-main placeholder:text-text-disabled focus:outline-none leading-tight py-1"
              />
              <button
                onClick={toggleImportant}
                className={`p-1 mt-1 rounded-full transition-colors ${isImportant ? 'text-primary-500' : 'text-text-disabled hover:text-text-sub'}`}
              >
                <Star
                  size={24}
                  fill={isImportant ? 'currentColor' : 'none'}
                  strokeWidth={isImportant ? 0 : 2}
                />
              </button>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 text-text-sub">
              <input
                type="text"
                name="url"
                placeholder="URL 입력"
                value={formData.url || ''}
                onChange={handleChange}
                className="flex-1 bg-transparent text-sm text-text-sub placeholder:text-text-disabled focus:outline-none focus:text-text-main transition-colors"
              />
            </div>
          </div>

          <hr className="border-neutral-800 shrink-0" />

          {/* 세부 사항 설정 */}
          <div className="flex flex-col gap-0 shrink-0">
            {/* 위치 */}
            <div className="flex items-center justify-between py-2.5 -mx-2 px-2">
              <div className="flex items-center gap-3 text-text-sub">
                <Folder size={20} />
                <span className="text-sm font-medium">위치</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className={`text-sm truncate text-right max-w-[200px] hover:text-text-main py-1 px-2 -mr-2 rounded transition-colors ${!formData.folderId ? 'text-text-sub' : 'text-text-main'}`}
                >
                  {folderPathString}
                </button>
              </div>
            </div>

            {/* 마감일 */}
            <div className="flex items-center justify-between py-2.5 -mx-2 px-2">
              <div className="flex items-center gap-3 text-text-sub shrink-0">
                <Hourglass size={20} />
                <span className="text-sm font-medium">마감일</span>
              </div>

              <div className="flex items-center justify-end relative">
                {formData.deadline ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCalendarClick}
                      className="text-sm text-text-main tabular-nums hover:text-primary-500 transition-colors py-1 px-2 -mr-2 rounded"
                    >
                      {formattedDateString}
                    </button>
                    <button
                      onClick={handleClearDate}
                      className="text-text-disabled hover:text-text-sub p-1 ml-1"
                    >
                      <CircleX size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCalendarClick}
                    className="text-sm text-text-sub hover:text-text-main py-1 px-2 -mr-2 rounded transition-colors text-right"
                  >
                    마감일 없음
                  </button>
                )}
                <input
                  ref={hiddenDateRef}
                  type="date"
                  value={
                    formData.deadline ? formData.deadline.split('T')[0] : ''
                  }
                  onChange={handleHiddenDateChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full pointer-events-none"
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* 태그 */}
            <div className="flex flex-col py-2.5 -mx-2 px-2 gap-2">
              <div className="flex items-center gap-3 text-text-sub">
                <Hash size={20} />
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="태그 입력 후 엔터로 추가"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-disabled focus:outline-none"
                />
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-8">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 text-text-main rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-neutral-400 hover:text-white ml-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="border-neutral-800 shrink-0" />

          {/* 메모 */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <textarea
              ref={memoRef}
              name="memo"
              placeholder="메모 입력"
              value={formData.memo || ''}
              onChange={handleChange}
              className="w-full min-h-[500px] bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none resize-none text-base leading-relaxed overflow-hidden"
            />
          </div>
        </div>
      </main>

      <FolderPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleFolderSelect}
        title="저장 위치 선택"
      />
    </div>
  );
}
