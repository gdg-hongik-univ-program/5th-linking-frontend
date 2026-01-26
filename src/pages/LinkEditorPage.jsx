import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import BottomSheet from '../components/common/BottomSheet';
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  FolderSearch,
  Link as LinkIcon,
  Save,
  Calendar as CalendarIcon,
  XCircle,
  X,
} from 'lucide-react';

const LinkEditorPage = () => {
  const navigate = useNavigate();

  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const hiddenDateRef = useRef(null);
  const tagInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    deadline: '',
    tags: [],
    memo: '',
    folderId: '',
  });

  const [tagInput, setTagInput] = useState('');

  const [dateParts, setDateParts] = useState({
    year: '',
    month: '',
    day: '',
  });

  const [isImportant, setIsImportant] = useState(false);
  const hasInput = dateParts.year || dateParts.month || dateParts.day;

  useEffect(() => {
    if (formData.deadline) {
      const [y, m, d] = formData.deadline.split('-');
      setDateParts({ year: y, month: m, day: d });
    }
  }, [formData.deadline]);

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

  const focusInput = (ref) => {
    ref.current?.focus();
  };

  const handleCalendarClick = () => {
    try {
      hiddenDateRef.current?.showPicker();
    } catch {
      hiddenDateRef.current?.focus();
    }
  };
  const handleHiddenDateChange = (e) => {
    const val = e.target.value;
    if (val) setFormData((prev) => ({ ...prev, deadline: val }));
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
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.slice(0, -1),
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!formData.folderId) {
      alert('폴더 ID를 입력해주세요.');
      return;
    }
    const finalFolderId = Number(formData.folderId);
    if (isNaN(finalFolderId)) {
      alert('폴더 ID는 숫자여야 합니다.');
      return;
    }

    let finalDeadline = null;
    if (
      dateParts.year.length === 4 &&
      dateParts.month.length > 0 &&
      dateParts.day.length > 0
    ) {
      const m = dateParts.month.padStart(2, '0');
      const d = dateParts.day.padStart(2, '0');
      finalDeadline = `${dateParts.year}-${m}-${d}`;
    } else if (formData.deadline && !hasInput) {
      finalDeadline = formData.deadline;
    }

    const payload = {
      url: formData.url,
      title: formData.title,
      folderId: finalFolderId,
      memo: formData.memo,
      importance: isImportant,
      deadline: finalDeadline,
      tags: formData.tags,
    };

    try {
      const response = await axiosInstance.post('/item', payload);
      if (response.status === 200 || response.status === 201) {
        alert('성공적으로 저장되었습니다!');
        navigate(-1);
      }
    } catch (error) {
      console.error('저장 실패:', error);
      const errorMessage =
        error.response?.data?.message || '저장에 실패했습니다.';
      alert(`오류 발생: ${errorMessage}`);
    }
  };

  const getColor = (val) => (val ? 'text-text-main' : 'text-text-disabled');

  return (
    <div className="h-full flex flex-col font-family-sans relative overflow-hidden bg-bg-main">
      <header className="flex items-center justify-between px-4 py-3 z-10 shrink-0">
        <button
          className="p-3 -ml-2 hover:bg-bg-nav rounded-full transition active:scale-95"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} className="text-text-main" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="p-3 hover:bg-bg-nav rounded-full transition group active:scale-95"
          >
            <Save
              size={24}
              className="text-text-main group-hover:text-primary-500 transition-colors"
            />
          </button>
          <button
            onClick={toggleImportant}
            className="p-3 hover:bg-bg-nav rounded-full transition active:scale-95"
          >
            <Star
              size={24}
              className={`transition-colors duration-200 ${
                isImportant
                  ? 'text-primary-500 fill-primary-500'
                  : 'text-text-main hover:text-primary-500'
              }`}
            />
          </button>
          <button className="p-3 -mr-2 hover:bg-bg-nav rounded-full transition active:scale-95">
            <MoreHorizontal size={24} className="text-text-main" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 pt-2 pb-40 flex flex-col gap-8 overflow-y-auto scrollbar-hide">
        <input
          type="text"
          name="title"
          placeholder="제목 입력"
          value={formData.title}
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
              value={formData.url}
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
                  inputMode="numeric"
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
                  inputMode="numeric"
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
                  inputMode="numeric"
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
                    className="p-2 text-text-sub hover:text-text-main transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCalendarClick}
                  className="p-2 text-text-sub hover:text-primary-500 transition-colors"
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
                name="tags"
                placeholder="태그 입력 후 엔터로 추가"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-base py-2"
              />
            </div>

            <div className="flex flex-wrap gap-2 pl-20">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 text-text-main rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-neutral-400 hover:text-white transition-colors"
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
                value={formData.folderId}
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
          value={formData.memo}
          onChange={handleChange}
          className="w-full flex-1 min-h-[200px] bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none resize-none text-base leading-loose py-2"
        />
      </main>

      <BottomSheet title="연결된 링크" count="7개 연결됨">
        <div className="flex flex-col gap-3 mt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 p-3 bg-bg-nav rounded-xl hover:bg-border-hover transition-all duration-200 shrink-0 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-neutral-800/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-neutral-800/40 transition-all duration-200">
                <LinkIcon size={18} className="text-text-sub" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm text-text-main truncate">
                  React 상태 관리 완벽 가이드
                </div>
                <div className="text-xs text-text-sub truncate">
                  https://velog.io/@velopert/react-state...
                </div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default LinkEditorPage;
