import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import BottomSheet from '../components/common/BottomSheet';
import {
  Star,
  MoreHorizontal,
  FolderSearch,
  Link as LinkIcon,
  Save,
  Calendar as CalendarIcon,
  XCircle,
  X,
  Minus,
} from 'lucide-react';

const LinkEditorPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const location = useLocation();

  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const hiddenDateRef = useRef(null);
  const tagInputRef = useRef(null);

  const [connectedLinks, setConnectedLinks] = useState([]);
  const [pendingLinks, setPendingLinks] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    deadline: '',
    tags: [],
    memo: '',
    folderId: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [dateParts, setDateParts] = useState({ year: '', month: '', day: '' });
  const [isImportant, setIsImportant] = useState(false);

  const hasInput = dateParts.year || dateParts.month || dateParts.day;

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (itemId) {
        try {
          let currentData = location.state?.data;
          if (!currentData) {
            const detailRes = await axiosInstance.get(`/item/${itemId}`);
            currentData = detailRes.data;
          }

          // 폼 데이터 세팅
          setFormData({
            title: currentData.title || '',
            url: currentData.url || '',
            deadline: currentData.deadline || '',
            tags: currentData.tags || [],
            memo: currentData.memo || '',
            folderId: currentData.folderId || '',
          });
          setIsImportant(currentData.importance || false);

          // 연결된 링크 불러오기
          try {
            const connectedRes = await axiosInstance.get(
              `/item/link/${itemId}`,
            );
            const validConnected = connectedRes.data.filter(
              (item) => (item.itemId || item.id) && item.itemId !== 0,
            );
            setConnectedLinks(validConnected);
          } catch (err) {
            console.warn('연결된 링크 로드 실패 (무시함):', err);
            setConnectedLinks([]);
          }
        } catch (error) {
          console.error('상세 데이터 로드 실패:', error);
          alert('데이터를 불러오는데 실패했습니다.');
        }
      }
    };
    loadData();
  }, [itemId, location.state]);

  // 마감일이 변경되면 dateParts 업데이트
  useEffect(() => {
    if (formData.deadline) {
      const cleanDate = formData.deadline.split('T')[0];
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        setDateParts({ year: parts[0], month: parts[1], day: parts[2] });
      }
    }
  }, [formData.deadline]);

  // 날짜 입력 포커스 이동 로직
  useEffect(() => {
    if (
      dateParts.year.length === 4 &&
      document.activeElement === yearRef.current
    ) {
      monthRef.current?.focus();
    }
    if (
      dateParts.month.length === 2 &&
      document.activeElement === monthRef.current
    ) {
      dayRef.current?.focus();
    }
  }, [dateParts.year, dateParts.month]);

  // 연결 토글
  const handleConnectToggle = async (targetLink) => {
    const myId = Number(itemId);
    const targetId = Number(targetLink?.itemId || targetLink?.id);

    if (itemId && (!myId || !targetId)) {
      alert('링크 연결에 필요한 ID 정보가 없습니다.');
      return;
    }

    // 수정 모드
    if (itemId) {
      const isAlreadyConnected = connectedLinks.some(
        (link) => (link.itemId || link.id) === targetId,
      );

      try {
        if (isAlreadyConnected) {
          await axiosInstance.delete('/item/link', {
            data: { itemId: myId, linkItemId: targetId },
          });
          setConnectedLinks((prev) =>
            prev.filter((link) => (link.itemId || link.id) !== targetId),
          );
        } else {
          await axiosInstance.post('/item/link', {
            itemId: myId,
            linkItemId: targetId,
          });
          setConnectedLinks((prev) => [...prev, targetLink]);
        }
      } catch (error) {
        console.error('연결 상태 변경 실패:', error);
        alert('요청 처리 중 오류가 발생했습니다.');
      }
    }
    // 생성 모드
    else {
      const isSelected = pendingLinks.some(
        (link) => (link.itemId || link.id) === targetId,
      );
      if (isSelected) {
        setPendingLinks((prev) =>
          prev.filter((link) => (link.itemId || link.id) !== targetId),
        );
      } else {
        setPendingLinks((prev) => [...prev, targetLink]);
      }
    }
  };

  // ID로 연결
  const handleConnectById = async (inputItemId) => {
    const targetId = Number(inputItemId);
    if (!targetId) return;

    const currentList = itemId ? connectedLinks : pendingLinks;
    if (currentList.some((link) => (link.itemId || link.id) === targetId)) {
      return alert('이미 연결된 링크입니다.');
    }
    if (itemId && Number(itemId) === targetId) {
      return alert('자기 자신은 연결할 수 없습니다.');
    }

    try {
      const res = await axiosInstance.get(`/item/${targetId}`);
      const targetItem = res.data;
      if (!targetItem) throw new Error('아이템 정보 없음');

      const safeItem = {
        ...targetItem,
        itemId: targetItem.itemId || targetItem.id || targetId,
      };

      await handleConnectToggle(safeItem);
      alert(`'${targetItem.title || '링크'}'가 연결되었습니다.`);
    } catch (error) {
      alert('해당 ID의 링크를 찾을 수 없거나 연결에 실패했습니다.');
    }
  };

  const handleSave = async () => {
    // 제목 필수 입력 체크 로직
    if (!formData.title.trim()) {
      return alert('제목을 입력해주세요.');
    }

    if (!formData.folderId) return alert('폴더 ID를 입력해주세요.');

    let finalDeadline = null;
    if (dateParts.year && dateParts.month && dateParts.day) {
      finalDeadline = `${dateParts.year}-${dateParts.month.padStart(2, '0')}-${dateParts.day.padStart(2, '0')}`;
    } else if (formData.deadline && !hasInput) {
      finalDeadline = formData.deadline.split('T')[0];
    }

    const payload = {
      url: formData.url,
      title: formData.title,
      folderId: Number(formData.folderId),
      memo: formData.memo,
      importance: isImportant,
      deadline: finalDeadline,
      tags: formData.tags,
      ...(itemId && { itemId: Number(itemId) }),
    };

    try {
      if (itemId) {
        await axiosInstance.put('/item', payload);
        alert('수정되었습니다.');
      } else {
        const response = await axiosInstance.post('/item', payload);
        const newItemId = response.data.itemId;

        if (newItemId && pendingLinks.length > 0) {
          try {
            await Promise.all(
              pendingLinks.map((link) =>
                axiosInstance.post('/item/link', {
                  itemId: newItemId,
                  linkItemId: link.itemId || link.id,
                }),
              ),
            );
          } catch (linkError) {
            console.error('링크 연결 실패', linkError);
          }
        }
        alert('성공적으로 저장되었습니다!');
      }
      navigate(-1);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // UI 핸들러들
  const handleDateChange = (e, part) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const maxLength = part === 'year' ? 4 : 2;
    const newValue = rawValue.slice(0, maxLength);
    setDateParts((prev) => ({ ...prev, [part]: newValue }));
  };

  const handleBlur = (part) => {
    const value = dateParts[part];
    if (!value) return;
    let newValue = value;
    if (part !== 'year' && value.length === 1) {
      newValue = value.padStart(2, '0');
      setDateParts((prev) => ({ ...prev, [part]: newValue }));
    }
  };

  const handleClearDate = () => {
    setDateParts({ year: '', month: '', day: '' });
    setFormData((prev) => ({ ...prev, deadline: '' }));
  };

  const focusInput = (ref) => ref.current?.focus();

  const handleCalendarClick = () => {
    try {
      hiddenDateRef.current?.showPicker();
    } catch {
      hiddenDateRef.current?.focus();
    }
  };

  const handleHiddenDateChange = (e) => {
    if (e.target.value)
      setFormData((prev) => ({ ...prev, deadline: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleImportant = () => setIsImportant((prev) => !prev);

  const handleTagKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const getColor = (val) => (val ? 'text-text-main' : 'text-text-disabled');

  const displayLinks = itemId ? connectedLinks : pendingLinks;
  const displayCount = displayLinks.length;

  return (
    <div className="h-full flex flex-col font-family-sans relative overflow-hidden bg-bg-main">
      {/* 헤더 컴포넌트 적용 */}
      <PageHeader>
        {/* 수정됨: IconButton 사용 */}
        <IconButton icon={Save} onClick={handleSave} aria-label="저장하기" />

        <IconButton
          icon={Star}
          onClick={toggleImportant}
          color={
            isImportant ? 'text-primary-500 fill-primary-500' : 'text-text-main'
          }
          aria-label="중요도 토글"
        />

        <IconButton icon={MoreHorizontal} aria-label="더보기" />
      </PageHeader>

      <main className="flex-1 px-6 pt-2 pb-40 flex flex-col gap-8 overflow-y-auto scrollbar-hide">
        <input
          type="text"
          name="title"
          placeholder="제목 입력"
          value={formData.title || ''}
          onChange={handleChange}
          className="w-full bg-transparent text-2xl font-bold text-text-main placeholder:text-text-disabled focus:outline-none shrink-0 py-2"
        />

        <div className="flex flex-col gap-8 shrink-0">
          <div className="flex items-center">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              URL
            </label>
            <input
              type="text"
              name="url"
              placeholder="URL 입력"
              value={formData.url || ''}
              onChange={handleChange}
              className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-base py-2"
            />
          </div>

          <div className="flex items-center">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              마감일
            </label>
            <div className="flex items-center flex-1 relative">
              <div
                onClick={() => focusInput(yearRef)}
                className="flex items-center mr-1 cursor-text"
              >
                <input
                  ref={yearRef}
                  type="text"
                  maxLength={4}
                  placeholder="YYYY"
                  value={dateParts.year}
                  onChange={(e) => handleDateChange(e, 'year')}
                  onBlur={() => handleBlur('year')}
                  className={`w-9 bg-transparent focus:outline-none text-base py-2 placeholder:text-text-disabled text-right ${getColor(dateParts.year)}`}
                />
                <span className={`text-base ${getColor(dateParts.year)}`}>
                  년
                </span>
              </div>
              <div
                onClick={() => focusInput(monthRef)}
                className="flex items-center mr-1 cursor-text"
              >
                <input
                  ref={monthRef}
                  type="text"
                  maxLength={2}
                  placeholder="MM"
                  value={dateParts.month}
                  onChange={(e) => handleDateChange(e, 'month')}
                  onBlur={() => handleBlur('month')}
                  className={`w-6 bg-transparent focus:outline-none text-base py-2 placeholder:text-text-disabled text-right ${getColor(dateParts.month)}`}
                />
                <span className={`text-base ${getColor(dateParts.month)}`}>
                  월
                </span>
              </div>
              <div
                onClick={() => focusInput(dayRef)}
                className="flex items-center mr-auto cursor-text"
              >
                <input
                  ref={dayRef}
                  type="text"
                  maxLength={2}
                  placeholder="DD"
                  value={dateParts.day}
                  onChange={(e) => handleDateChange(e, 'day')}
                  onBlur={() => handleBlur('day')}
                  className={`w-6 bg-transparent focus:outline-none text-base py-2 placeholder:text-text-disabled text-right ${getColor(dateParts.day)}`}
                />
                <span className={`text-base ${getColor(dateParts.day)}`}>
                  {hasInput ? '일' : '일 입력'}
                </span>
              </div>
              <div className="flex items-center -mr-2">
                {hasInput && (
                  <button
                    type="button"
                    onClick={handleClearDate}
                    className="p-2 text-text-sub hover:text-text-main"
                  >
                    <XCircle size={20} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCalendarClick}
                  className="p-2 text-text-sub hover:text-primary-500"
                >
                  <CalendarIcon size={20} />
                </button>
              </div>
              <input
                ref={hiddenDateRef}
                type="date"
                onChange={handleHiddenDateChange}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                tabIndex={-1}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <label className="w-20 text-text-sub text-sm font-medium shrink-0">
                태그
              </label>
              <input
                ref={tagInputRef}
                type="text"
                placeholder="태그 입력 후 엔터"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-base py-2"
              />
            </div>
            <div className="flex flex-wrap gap-2 pl-20">
              {formData.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 text-text-main rounded-full text-sm font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              위치
            </label>
            <div className="flex items-center flex-1 relative">
              <input
                type="number"
                name="folderId"
                placeholder="폴더 ID (임시)"
                value={formData.folderId || ''}
                onChange={handleChange}
                className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-base py-2 mr-auto"
              />
              <button
                type="button"
                className="p-2 text-text-sub hover:text-primary-500 transition-colors -mr-2"
              >
                <FolderSearch size={20} />
              </button>
            </div>
          </div>
        </div>

        <textarea
          name="memo"
          placeholder="메모 입력"
          value={formData.memo || ''}
          onChange={handleChange}
          className="w-full flex-1 min-h-[200px] bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none resize-none text-base leading-loose py-2"
        />
      </main>

      <BottomSheet
        title="연결된 링크"
        count={`${displayCount}개 연결됨`}
        onConnectById={handleConnectById}
      >
        <div className="flex flex-col h-full mt-2">
          {displayLinks.length > 0 ? (
            <div className="flex flex-col gap-2 pb-6">
              {displayLinks.map((item) => (
                <div
                  key={item.itemId || item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800">
                    <LinkIcon size={18} className="text-text-sub" />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-sm text-text-main truncate">
                      {item.title || '제목 없음'}
                    </div>
                    <div className="text-xs text-text-sub truncate">
                      {item.url || 'URL 없음'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectToggle(item);
                    }}
                    className="p-2 rounded-full bg-neutral-700 text-text-sub hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                    title="연결 해제"
                  >
                    <Minus size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-text-sub gap-2">
              <LinkIcon size={32} className="opacity-20" />
              <div className="text-sm">연결된 링크가 없습니다.</div>
              <div className="text-xs opacity-60">
                상단의 입력창을 통해 ID로 연결해보세요.
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default LinkEditorPage;
