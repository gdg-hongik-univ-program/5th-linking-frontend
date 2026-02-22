import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import homeImage from '../assets/onboarding-1.png';
import linkImage from '../assets/onboarding-2.png';
import calendarImage from '../assets/onboarding-3.png';
import profileImage from '../assets/onboarding-4.png';
import graphImage from '../assets/onboarding-5.png';

const SWIPE_THRESHOLD = 50;

export default function OnboardingPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const loginId = location.state?.loginId || '';

  const slides = useMemo(
    () => [
      { lines: ['봐야 할 링크를', '누구보다 재빠르게'], image: homeImage },
      { lines: ['저장한 링크에', '태그와 메모까지'], image: linkImage },
      {
        lines: ['링크의 마감일까지', '일정 관리는 철두철미'],
        image: calendarImage,
      },
      {
        lines: ['나를 위한 분석은', '나보다 날 더 잘 아니까'],
        image: profileImage,
      },
      { lines: ['연결된 링크들은', '내 화면 속 우주 안에'], image: graphImage },
    ],
    [],
  );

  const [index, setIndex] = useState(0);

  const startXRef = useRef(null);
  const pointerStartXRef = useRef(null);

  const clampIndex = (next) => {
    if (next < 0) return 0;
    if (next > slides.length - 1) return slides.length - 1;
    return next;
  };

  const goTo = (next) => setIndex(clampIndex(next));

  const handleTouchStart = (e) => {
    startXRef.current = e.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    const startX = startXRef.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    startXRef.current = null;

    if (startX == null || endX == null) return;

    const dx = endX - startX;

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx < 0) goTo(index + 1);
    else goTo(index - 1);
  };

  const handlePointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    pointerStartXRef.current = e.clientX ?? null;
  };

  const handlePointerUp = (e) => {
    if (e.pointerType !== 'mouse') return;

    const startX = pointerStartXRef.current;
    const endX = e.clientX ?? null;
    pointerStartXRef.current = null;

    if (startX == null || endX == null) return;

    const dx = endX - startX;

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx < 0) goTo(index + 1);
    else goTo(index - 1);
  };

  const handleLogin = () => {
    navigate('/login', {
      replace: true,
      state: loginId ? { loginId } : undefined,
    });
  };

  const isLast = index === slides.length - 1;

  return (
    <div
      className="min-h-screen relative flex flex-col bg-bg-main text-text-main overflow-hidden"
      style={{ minHeight: '100dvh' }}
    >
      <div className="pt-20 px-6">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? 'bg-text-main' : 'bg-neutral-800'
              }`}
              aria-label={`온보딩 ${i + 1}페이지`}
            />
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden pb-[calc(env(safe-area-inset-bottom)+96px)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <section key={i} className="w-full shrink-0 flex flex-col px-6">
              <div className="pt-4">
                <h1 className="text-lg font-bold text-center leading-relaxed">
                  {slide.lines[0]}
                  <br />
                  {slide.lines[1]}
                </h1>
              </div>

              <div className="flex-1 relative flex items-end justify-center overflow-hidden">
                <img
                  src={slide.image}
                  alt=""
                  className="w-full max-w-[380px] object-contain translate-y-10 select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-0 z-20 flex justify-center w-full max-w-[390px] px-6 pb-[calc(env(safe-area-inset-bottom)+16px)] pointer-events-none">
        {isLast ? (
          <button
            type="button"
            onClick={handleLogin}
            className="pointer-events-auto font-bold w-full h-12 rounded-xl transition-all duration-300 bg-primary-500 text-bg-main shadow-lg cursor-pointer hover:bg-primary-500/90"
          >
            로그인
          </button>
        ) : (
          <div className="w-full h-12" />
        )}
      </div>
    </div>
  );
}
