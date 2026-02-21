import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Settings,
  Network,
  Link as LinkIcon,
  Hash,
  Maximize2,
} from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import IconButton from '../components/common/IconButton';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import axiosInstance from '../api/axiosInstance';
import TabHeader from '../components/common/TabHeader';

const TIER_CONFIG = {
  PAWN: { label: 'PAWN', emoji: '♟️', color: '#9ca3af' },
  KNIGHT: { label: 'KNIGHT', emoji: '♞', color: '#22c55e' },
  BISHOP: { label: 'BISHOP', emoji: '♝', color: '#3b82f6' },
  ROOK: { label: 'ROOK', emoji: '♜', color: '#a855f7' },
  QUEEN: { label: 'QUEEN', emoji: '♛', color: '#eab308' },
  KING: { label: 'KING', emoji: '♚', color: '#f97316' },
};

const getTierConfig = (code) =>
  TIER_CONFIG[code] || { label: 'UNRANKED', emoji: '✨', color: '#6b7280' };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [tagStats, setTagStats] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const graphContainerRef = useRef(null);
  const [graphDimensions, setGraphDimensions] = useState({
    width: 0,
    height: 0,
  });
  const graphRef = useRef(null);
  const initialZoomRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileRes, statsRes, graphRes] = await Promise.all([
          axiosInstance.get('/profile'),
          axiosInstance.get('/profile/my/stats'),
          axiosInstance.get('/profile/graph'),
        ]);

        if (!isMounted) return;

        setProfile(profileRes.data || null);

        if (Array.isArray(statsRes.data)) {
          setTagStats(
            statsRes.data.map((item) => ({
              tagName: item.tagName,
              rate: item.rate,
              fullMark: 100,
            })),
          );
        }

        if (graphRes.data) {
          setGraphData({
            nodes: Array.isArray(graphRes.data.nodes)
              ? graphRes.data.nodes.map((n) => ({ ...n }))
              : [],
            links: Array.isArray(graphRes.data.links)
              ? graphRes.data.links.map((l) => ({ ...l }))
              : [],
          });
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('프로필 정보를 불러오지 못했어요.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!graphContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setGraphDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(graphContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [loading]);

  useEffect(() => {
    if (
      graphRef.current &&
      graphData.nodes.length > 0 &&
      graphDimensions.width > 0 &&
      !initialZoomRef.current
    ) {
      graphRef.current.d3Force('charge').strength(-150);
      graphRef.current.d3Force('link').distance(200);
      graphRef.current.d3ReheatSimulation();

      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.centerAt(0, 0, 900);
          graphRef.current.zoomToFit(900, 0);
        }
      }, 1500);

      initialZoomRef.current = true;
    }
  }, [graphData, graphDimensions.width]);

  const xpProgress = useMemo(() => {
    if (!profile) return 0;
    const { currentXp, minXp, maxXp } = profile;
    const min = Number(minXp ?? 0);
    const max = Number(maxXp ?? 0);
    const cur = Number(currentXp ?? 0);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max - min <= 0) {
      return 0;
    }
    const raw = ((cur - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, raw));
  }, [profile]);
  const { openConfirm } = useModalStore();

  // 실제 로그아웃
  const executeLogout = async () => {
    try {
      await axiosInstance.post('/user/sign-out');
    } catch (err) {
      console.warn('Logout failed', err);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const hasTags = tagStats && tagStats.length > 0;
  const hasGraph = graphData.nodes.length > 0;

  const top1Tag = hasTags ? tagStats[0].tagName : '없음';

  const tierInfo = profile
    ? getTierConfig(profile.imageCode)
    : getTierConfig('PAWN');

  const handleNodeClick = useCallback((node) => {
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 800);
      graphRef.current.zoom(5, 800);

      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.centerAt(0, 0, 2000);
          graphRef.current.zoomToFit(1000, 100);
        }
      }, 1200);
    }
  }, []);

  // 로그아웃
  const handleLogoutClick = () => {
    openConfirm({
      title: '로그아웃',
      message: '정말 로그아웃하시겠어요?',
      confirmText: '로그아웃',
      cancelText: '취소',
      isDanger: true,
      onConfirm: executeLogout,
    });
  };

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-y-auto scrollbar-hide">
      <TabHeader title="프로필">
        <div className="flex items-center gap-1">
          <IconButton icon={Settings} aria-label="설정" />
        </div>
      </TabHeader>

      <main className="flex-1 px-6 pb-8 space-y-6">
        {error && (
          <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* 1. 상단 프로필 카드 */}
        <section className="mt-2 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 px-5 py-6 shadow-lg shadow-black/40 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-4xl shadow-[0_0_24px_rgba(234,190,47,0.35)]">
              {tierInfo.emoji}
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: tierInfo.color }}
              >
                {tierInfo.label} {tierInfo.emoji}
              </p>

              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-semibold truncate">
                  {profile?.nickname || '로딩 중...'}
                </h2>
                {profile && (
                  <span className="text-xs rounded-full border border-primary-500/60 px-2 py-[2px] text-primary-300 bg-primary-500/5">
                    Lv. {profile.level ?? 1}
                  </span>
                )}
              </div>
              {profile?.description && (
                <p className="text-xs text-text-sub/80 line-clamp-2">
                  {profile.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 relative z-10">
            <div className="flex justify-between text-[11px] text-text-sub/70 mb-1">
              <span>경험치 진행도</span>
              <span>{Math.round(xpProgress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-300 to-amber-300 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            {profile && (
              <div className="mt-1 flex justify-between text-[10px] text-text-sub/60">
                <span>{profile.minXp ?? 0} XP</span>
                <span>{profile.maxXp ?? 0} XP</span>
              </div>
            )}
          </div>
        </section>

        {/* 2. 통계 및 태그 레이더 차트 결합 */}
        <section className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 px-4 pt-4 shadow-lg shadow-black/40">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col items-center justify-center bg-neutral-900 border border-neutral-700/50 rounded-xl p-3 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl" />
              <div className="flex items-center gap-1 text-text-sub text-[11px] font-bold uppercase mb-1 relative z-10">
                <LinkIcon size={12} className="text-primary-400" /> 총 저장된
                링크
              </div>
              <span className="text-xl font-bold text-text-main/80 relative z-10">
                {profile?.totalItemCount?.toLocaleString() ?? 0}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-neutral-900 border border-neutral-700/50 rounded-xl p-3 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16  rounded-full blur-xl" />
              <div className="flex items-center gap-1 text-text-sub text-[11px] font-bold uppercase mb-2 relative z-10">
                <Hash size={12} className="text-primary-400" /> 최애 태그
              </div>
              <span className="px-2 py-1 bg-neutral-700 rounded-full text-xs text-text-main/80 font-medium relative z-10 truncate max-w-full text-center">
                {top1Tag !== '없음' ? `${top1Tag}` : '태그 없음'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 border-t border-neutral-800/80 pt-4">
            <h3 className="text-sm font-semibold">사용 태그 분포</h3>
            <span className="text-[11px] text-text-sub/70">
              사용량 기준 상위 5개
            </span>
          </div>

          <div className="h-56">
            {hasTags ? (
              <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                <RadarChart data={tagStats}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis
                    dataKey="tagName"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  />
                  <Radar
                    name="태그 사용량"
                    dataKey="rate"
                    stroke="#facc15"
                    fill="#eab308"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-text-sub/70">
                  태그 통계가 부족해요. 더 많은 링크에 태그를 달아보세요.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 3. 지식 그래프 */}
        <section className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 px-4 py-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">링크 그래프</h3>
            <span className="text-[11px] text-text-sub/70 mt-0.5">
              확대해 연결 링크들을 탐색해보세요
            </span>
          </div>

          <div
            ref={graphContainerRef}
            className="h-64 rounded-xl bg-neutral-950/80 overflow-hidden relative border border-neutral-800/50 cursor-grab active:cursor-grabbing"
          >
            <button
              onClick={() => navigate('/profile/graph')}
              className="absolute top-2 right-2 z-10 p-2 bg-neutral-800/80 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors border border-neutral-700 backdrop-blur-sm"
              aria-label="전체화면으로 보기"
            >
              <Maximize2 size={16} />
            </button>

            {hasGraph && graphDimensions.width > 0 ? (
              <ForceGraph2D
                ref={graphRef}
                width={graphDimensions.width}
                height={graphDimensions.height}
                graphData={graphData}
                nodeRelSize={8}
                linkColor={() => 'rgba(163, 163, 163, 0.6)'}
                linkWidth={1.5}
                backgroundColor="transparent"
                enableZoom={true}
                enablePan={true}
                minZoom={0.1}
                maxZoom={8}
                onNodeClick={handleNodeClick}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const isImportant = node.importance === 1;
                  const label = node.title;
                  const radius = isImportant ? 8 : 5;

                  const color = isImportant
                    ? '#EABE2F'
                    : 'rgba(255, 255, 255, 0.8)';

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fillStyle = color;

                  if (isImportant) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 10;
                  }

                  ctx.fill();
                  ctx.shadowBlur = 0;

                  const shouldShowLabel =
                    (isImportant && globalScale > 0.4) || globalScale > 1.2;

                  if (label && shouldShowLabel) {
                    const fontSize = 12 / globalScale;
                    ctx.font = `${isImportant ? 'bold' : 'normal'} ${fontSize}px sans-serif`;

                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(
                      (n) => n + fontSize * 0.5,
                    );

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(
                      node.x - bckgDimensions[0] / 2,
                      node.y + radius + 1 / globalScale,
                      bckgDimensions[0],
                      bckgDimensions[1],
                    );

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isImportant ? '#EABE2F' : '#ffffff';

                    ctx.fillText(
                      label,
                      node.x,
                      node.y + radius + bckgDimensions[1] / 2 + 1 / globalScale,
                    );
                  }
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 gap-2">
                <Network size={24} />
                <p className="text-sm text-text-sub/70">
                  {hasGraph
                    ? '그래프 로딩 중...'
                    : '연결된 링크 데이터가 없습니다.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
