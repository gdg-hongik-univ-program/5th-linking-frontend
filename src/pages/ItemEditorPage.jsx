import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // 애니메이션 추가
import { getItem, createItem, updateItem } from '../api/itemApi';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import CalendarPicker from '../components/common/CalendarPicker';
import {
  Star,
  MoreHorizontal,
  FolderSearch,
  Save,
  Calendar as CalendarIcon,
  XCircle,
  X,
} from 'lucide-react';

export default function ItemEditorPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const location = useLocation();

  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);
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
  const [dateParts, setDateParts] = useState({ year: '', month: '', day: '' });
  const [isImportant, setIsImportant] = useState(false);

  // 캘린더 관련 상태
  const [today, setToday] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const hasInput = dateParts.year || dateParts.month || dateParts.day;

  // 자정 날짜 동기화
  useEffect(() => {
    let timer;
    const updateToday = () => {
      const now = new Date();
      setToday((prev) =>
        prev.toDateString() !== now.toDateString() ? now : prev,
      );
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = setTimeout(updateToday, tomorrow.getTime() - now.getTime() + 100);
    };
    updateToday();
    window.addEventListener('focus', updateToday);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', updateToday);
    };
  }, []);

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (itemId) {
        try {
          let currentData = location.state?.item || (await getItem(itemId));
          setFormData({
            title: currentData.title || '',
            url: currentData.url || '',
            deadline: currentData.deadline || '',
            tags: currentData.tags || [],
            memo: currentData.memo || '',
            folderId: currentData.folderId || '',
          });
          setIsImportant(currentData.importance || false);
        } catch (error) {
          console.error('데이터 로드 실패:', error);
        }
      }
    };
    loadData();
  }, [itemId, location.state]);

  // 마감일 변경 시 dateParts 동기화
  useEffect(() => {
    if (formData.deadline) {
      const cleanDate = formData.deadline.split('T')[0];
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        setDateParts({ year: parts[0], month: parts[1], day: parts[2] });
        const parsedDate = parseISO(cleanDate);
        if (isValid(parsedDate)) setViewDate(parsedDate);
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

  const handleSave = async () => {
    if (!formData.title.trim()) return alert('제목을 입력해주세요.');
    if (!formData.folderId) return alert('폴더 ID를 입력해주세요.');

    let finalDeadline = null;
    if (dateParts.year && dateParts.month && dateParts.day) {
      finalDeadline = `${dateParts.year}-${dateParts.month.padStart(2, '0')}-${dateParts.day.padStart(2, '0')}`;
    }

    const payload = {
      ...formData,
      folderId: Number(formData.folderId),
      importance: isImportant,
      deadline: finalDeadline,
      ...(itemId && { itemId: Number(itemId) }),
    };

    try {
      itemId ? await updateItem(payload) : await createItem(payload);
      navigate(-1);
    } catch (error) {
      alert('저장에 실패했습니다.');
    }
  };

  const handleDateChange = (e, part) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const maxLength = part === 'year' ? 4 : 2;
    setDateParts((prev) => ({ ...prev, [part]: rawValue.slice(0, maxLength) }));
  };

  const handleBlur = (part) => {
    if (part !== 'year' && dateParts[part].length === 1) {
      setDateParts((prev) => ({
        ...prev,
        [part]: dateParts[part].padStart(2, '0'),
      }));
    }
  };

  const handleClearDate = () => {
    setDateParts({ year: '', month: '', day: '' });
    setFormData((prev) => ({ ...prev, deadline: '' }));
  };

  // 캘린더에서 날짜 선택 시 호출
  const handleDateSelectFromPicker = (date) => {
    const y = format(date, 'yyyy');
    const m = format(date, 'MM');
    const d = format(date, 'dd');
    setDateParts({ year: y, month: m, day: d });
    setFormData((prev) => ({ ...prev, deadline: `${y}-${m}-${d}` }));
    setIsCalendarOpen(false);
  };

  const toggleImportant = () => setIsImportant(!isImportant);

  const handleTagKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      // 태그 10개 제한 확인
      if (formData.tags.length >= 10) {
        alert('태그는 최대 10개까지 추가할 수 있어요.');
        setTagInput('');
        return;
      }
      // 태그 35자 제한 입력 확인
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

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };
  const getColor = (val) => (val ? 'text-text-main' : 'text-text-disabled');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="h-full flex flex-col font-family-sans relative overflow-hidden bg-bg-main">
      <PageHeader>
        <IconButton icon={Save} onClick={handleSave} />
        <IconButton
          icon={Star}
          onClick={toggleImportant}
          color={
            isImportant ? 'text-primary-500 fill-primary-500' : 'text-text-main'
          }
        />
        <IconButton icon={MoreHorizontal} />
      </PageHeader>

      <main className="flex-1 px-6 pt-2 pb-40 flex flex-col gap-8 overflow-y-auto scrollbar-hide">
        <input
          type="text"
          name="title"
          placeholder="제목 입력"
          value={formData.title}
          onChange={handleChange}
          maxLength={70}
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
            <label className="w-20 text-text-sub text-sm font-medium">
              마감일
            </label>
            <div className="flex items-center flex-1 relative">
              <div
                onClick={() => yearRef.current?.focus()}
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
                onClick={() => monthRef.current?.focus()}
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
                onClick={() => dayRef.current?.focus()}
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
                  onClick={() => setIsCalendarOpen(true)}
                  className="p-2 text-text-sub hover:text-primary-500"
                >
                  <CalendarIcon size={20} />
                </button>
              </div>
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
                  <X
                    size={14}
                    onClick={() => removeTag(tag)}
                    className="text-neutral-400 hover:text-white"
                  />
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
              <button className="p-2 text-text-sub hover:text-primary-500 transition-colors -mr-2">
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

      {/* 팝업 캘린더 피커  */}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            {/* 배경처리 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="absolute w-full inset-0 z-50 backdrop-blur-[3px]"
            />
            {/* 캘린더 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute inset-x-6 top-[20%] z-60 bg-bg-main rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden"
            >
              <div className="p-2">
                <CalendarPicker
                  viewDate={viewDate}
                  setViewDate={setViewDate}
                  selectedDate={
                    hasInput
                      ? new Date(
                          `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
                        )
                      : null
                  }
                  onDateClick={handleDateSelectFromPicker}
                  today={today}
                  showDots={false}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
