import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Save, Hourglass, CircleX, Folder, Hash, X } from 'lucide-react';
import { useFolders } from '../hooks/useFolders';
import { useItem } from '../hooks/useItem';
import { findFolderPath } from '../utils/findFolderPath';
import { useModalStore } from '../store/useModalStore';
import FolderPicker from '../components/common/FolderPicker';
import DatePickerModal from '../components/common/DatePickerModal';
import { format } from 'date-fns';
import IconButton from '../components/common/IconButton';
import PageHeader from '../components/common/PageHeader';

export default function ItemEditorPage() {
  const { itemId } = useParams();

  const [searchParams] = useSearchParams();

  const folderIdParam = searchParams.get('folderId');

  const navigate = useNavigate();

  const { openAlert, openConfirm } = useModalStore();

  const { item: fetchedItem, handleCreate, handleUpdate } = useItem(itemId);
  const { folders: folderTree, refetch: refetchFolders } = useFolders();

  const tagInputRef = useRef(null);
  const memoRef = useRef(null);
  const titleRef = useRef(null);
  const urlRef = useRef(null);

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isPickerOpen) {
      refetchFolders();
    }
  }, [isPickerOpen, refetchFolders]);

  const folderPathString = useMemo(() => {
    if (!formData.folderId) return '저장소 최상단';

    // 현재 타입 그대로 탐색 시도
    let pathArray = findFolderPath(folderTree, formData.folderId);

    // 숫자로 변환하여 재탐색
    if (!pathArray && !isNaN(Number(formData.folderId))) {
      pathArray = findFolderPath(folderTree, Number(formData.folderId));
    }

    if (pathArray) return pathArray.join('/');
    return '폴더 표시하는 중';
  }, [folderTree, formData.folderId]);

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
      setIsDirty(false);
    } else if (folderIdParam) {
      setFormData((prev) => {
        if (String(prev.folderId) === String(folderIdParam)) return prev;
        return { ...prev, folderId: folderIdParam };
      });
    }
  }, [fetchedItem, folderIdParam]);

  useEffect(() => {
    if (!memoRef.current) return;
    memoRef.current.style.height = 'auto';
    memoRef.current.style.height = `${memoRef.current.scrollHeight}px`;
  }, [formData.memo]);

  const handleBack = () => {
    if (isDirty) {
      openConfirm({
        title: '링크 작성 취소',
        message: '나가면 작성 중인 내용이 저장되지 않아요. 정말 나가시겠어요?',
        confirmText: '나가기',
        isDanger: true,
        onConfirm: () => navigate(-1),
      });
    } else {
      navigate(-1);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      openAlert({
        title: '링크 제목 입력',
        message: '링크의 제목을 입력해 주세요.',
        isDanger: true,
      });
      titleRef.current?.focus();
      return;
    }

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

    setIsDirty(false);

    if (itemId) await handleUpdate(payload);
    else await handleCreate(payload);
  };

  const handleDateSelect = (dateObj) => {
    setFormData((prev) => ({ ...prev, deadline: format(dateObj, 'yyyy-MM-dd') }));
    setIsDatePickerOpen(false);
    setIsDirty(true);
  };

  const handleCalendarClick = () => {
    setIsDatePickerOpen(true);
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, deadline: '' }));
    setIsDirty(true);
  };

  const handleClearTitle = () => {
    setFormData((prev) => ({ ...prev, title: '' }));
    setIsDirty(true);
    titleRef.current?.focus();
  };

  const handleClearUrl = () => {
    setFormData((prev) => ({ ...prev, url: '' }));
    setIsDirty(true);
    urlRef.current?.focus();
  };

  const handleClearTagInput = () => {
    setTagInput('');
    tagInputRef.current?.focus();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'title' && value.length > 70) {
      openAlert({
        title: '제목 입력 제한',
        message: '제목은 최대 70자까지만 입력할 수 있어요.',
        isDanger: true,
      });
      return;
    }

    if (name === 'url' && value.length > 2048) {
      openAlert({
        title: 'URL 입력 제한',
        message: 'URL은 최대 2048자까지만 입력할 수 있어요.',
        isDanger: true,
      });
      return;
    }

    if (name === 'memo' && value.length > 1000) {
      openAlert({
        title: '메모 입력 제한',
        message: '메모는 최대 1000자까지만 입력할 수 있어요.',
        isDanger: true,
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const toggleImportant = () => {
    setIsImportant((prev) => !prev);
    setIsDirty(true);
  };

  const handleTagKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (formData.tags.length >= 10) {
        openAlert({
          title: '태그 개수 제한',
          message: '태그는 최대 10개까지만 추가할 수 있어요.',
          isDanger: true,
        });
        setTagInput('');
        return;
      }
      if (newTag.length > 35) {
        openAlert({
          title: '태그 입력 제한',
          message: '태그 하나엔 최대 35자까지만 입력할 수 있어요.',
          isDanger: true,
        });
        return;
      }

      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag].sort((a, b) => a.localeCompare(b, 'ko')),
        }));
        setTagInput('');
        setIsDirty(true);
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
      setIsDirty(true);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
    setIsDirty(true);
  };

  const handleFolderSelect = (selectedId) => {
    setFormData((prev) => ({ ...prev, folderId: selectedId || '' }));
    setIsPickerOpen(false);
    setIsDirty(true);
  };

  const formattedDateString = useMemo(() => {
    if (!formData.deadline) return '';
    const date = new Date(formData.deadline);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  }, [formData.deadline]);

  return (
    <div className="h-full flex flex-col font-family-sans bg-bg-main overflow-y-auto scrollbar-hide">
      <PageHeader onBack={handleBack}>
        <IconButton icon={Save} onClick={handleSave} aria-label="저장하기" />
      </PageHeader>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col px-5 py-4 gap-4 min-h-full">
          <div className="flex flex-col gap-1 shrink-0 min-w-0">
            <div className="flex items-center gap-2">
              <input
                ref={titleRef}
                type="text"
                name="title"
                placeholder="제목 입력"
                value={formData.title || ''}
                onChange={handleChange}
                maxLength={70}
                className="flex-1 min-w-0 bg-transparent text-xl font-bold text-text-main placeholder:text-text-disabled focus:outline-none h-10"
              />
              {formData.title && (
                <button
                  type="button"
                  onClick={handleClearTitle}
                  className="text-text-disabled p-1 shrink-0"
                >
                  <CircleX size={20} />
                </button>
              )}
              <button
                type="button"
                onClick={toggleImportant}
                className={`p-1 rounded-full transition-colors shrink-0 ${
                  isImportant ? 'text-primary-500' : 'text-text-disabled'
                }`}
              >
                <Star
                  size={24}
                  fill={isImportant ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 text-text-sub">
              <input
                ref={urlRef}
                type="text"
                name="url"
                placeholder="URL 입력"
                value={formData.url || ''}
                onChange={handleChange}
                className="flex-1 min-w-0 bg-transparent text-sm text-text-sub placeholder:text-text-disabled focus:outline-none h-8"
              />
              {formData.url && (
                <button
                  type="button"
                  onClick={handleClearUrl}
                  className="text-text-disabled p-1 shrink-0"
                >
                  <CircleX size={16} />
                </button>
              )}
            </div>
          </div>

          <hr className="border-neutral-800 shrink-0" />

          <div className="flex flex-col gap-0 shrink-0">
            <div className="flex items-center justify-between py-2.5 -mx-2 px-2">
              <div className="flex items-center gap-3 text-text-sub">
                <Folder size={20} />
                <span className="text-sm font-medium">위치</span>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className={`text-sm truncate text-right max-w-[200px] py-1 px-2 -mr-2 rounded transition-colors ${
                    !formData.folderId ? 'text-text-sub' : 'text-text-main'
                  }`}
                >
                  {folderPathString}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 -mx-2 px-2">
              <div className="flex items-center gap-3 text-text-sub shrink-0">
                <Hourglass size={20} />
                <span className="text-sm font-medium">마감일</span>
              </div>
              <div className="flex items-center justify-end relative">
                {formData.deadline ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCalendarClick}
                      className="text-sm text-text-main tabular-nums py-1 px-2 -mr-2 rounded"
                    >
                      {formattedDateString}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="text-text-disabled p-1 ml-1"
                    >
                      <CircleX size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCalendarClick}
                    className="text-sm text-text-sub py-1 px-2 -mr-2 rounded text-right"
                  >
                    마감일 없음
                  </button>
                )}
              </div>
            </div>

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
                  className="flex-1 min-w-0 bg-transparent text-sm text-text-main placeholder:text-text-disabled focus:outline-none h-8"
                />
                {tagInput && (
                  <button
                    type="button"
                    onClick={handleClearTagInput}
                    className="text-text-disabled p-1 shrink-0"
                  >
                    <CircleX size={16} />
                  </button>
                )}
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
                        className="text-neutral-400 ml-0.5"
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
        title="저장할 위치 선택"
      />

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateSelect}
        initialDate={formData.deadline}
      />
    </div>
  );
}
