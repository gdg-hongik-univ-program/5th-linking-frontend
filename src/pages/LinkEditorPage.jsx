import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomSheet from '../components/common/BottomSheet';
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  Folder,
  Link as LinkIcon,
} from 'lucide-react';

const LinkEditorPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    deadline: '',
    tags: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="h-full flex flex-col font-family-sans relative overflow-hidden">
      {/* 1. Header */}
      <header className="flex items-center justify-between px-4 py-4 z-10 shrink-0">
        <button
          className="p-2 hover:bg-bg-nav rounded-full transition"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} className="text-text-main" />
        </button>
        <div className="flex gap-4">
          <button
            className="p-2 hover:bg-bg-nav rounded-full transition"
            type="button"
          >
            <Star size={24} className="text-text-main" />
          </button>
          <button
            className="p-2 hover:bg-bg-nav rounded-full transition"
            type="button"
          >
            <MoreHorizontal size={24} className="text-text-main" />
          </button>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 px-6 pt-4 pb-40 flex flex-col gap-8 overflow-y-auto scrollbar-hide">
        {/* 제목 입력 */}
        <input
          type="text"
          name="title"
          placeholder="제목 입력"
          value={formData.title}
          onChange={handleChange}
          // ✅ text-3xl font-bold 뒤에 text-text-main 추가 (기본값이지만 명시)
          className="w-full bg-transparent text-3xl font-bold text-text-main placeholder:text-text-sub focus:outline-none shrink-0"
        />

        <div className="flex flex-col gap-6 shrink-0">
          {/* URL 입력 */}
          <div className="flex items-center">
            <label className="w-16 text-text-sub text-sm shrink-0">URL</label>
            <input
              type="text"
              name="url"
              placeholder="URL 입력"
              value={formData.url}
              onChange={handleChange}
              // ✅ text-text-sub -> text-text-main 으로 변경
              className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-sm"
            />
          </div>

          {/* 마감일 입력 */}
          <div className="flex items-center">
            <label className="w-16 text-text-sub text-sm shrink-0">
              마감일
            </label>
            <input
              type="text"
              name="deadline"
              placeholder="마감일 입력"
              value={formData.deadline}
              onChange={handleChange}
              // ✅ text-text-sub -> text-text-main 으로 변경
              className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-sm"
            />
          </div>

          {/* 태그 입력 */}
          <div className="flex items-center">
            <label className="w-16 text-text-sub text-sm shrink-0">태그</label>
            <input
              type="text"
              name="tags"
              placeholder="#으로 태그 입력"
              value={formData.tags}
              onChange={handleChange}
              // ✅ text-text-sub -> text-text-main 으로 변경
              className="flex-1 bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="w-16 text-text-sub text-sm shrink-0">위치</label>
            <button className="bg-primary-500 p-2.5 rounded-full hover:opacity-90 transition shadow-lg">
              <Folder size={20} className="text-primary-900" />
            </button>
          </div>
        </div>

        {/* 본문 입력 */}
        <textarea
          name="content"
          placeholder="본문 입력"
          value={formData.content}
          onChange={handleChange}
          // ✅ text-text-sub -> text-text-main 으로 변경
          className="w-full h-full min-h-[200px] bg-transparent text-text-main placeholder:text-text-disabled focus:outline-none resize-none text-sm leading-relaxed"
        />
      </main>

      {/* 3. Reusable Bottom Sheet */}
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
