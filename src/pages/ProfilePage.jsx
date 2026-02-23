import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Settings,
  Network,
  Link as LinkIcon,
  Hash,
  Maximize2,
  User,
  Key,
  Palette,
  CircleHelp,
  Info,
} from 'lucide-react';
import ActionSheet from '../components/common/ActionSheet';
import ChangePasswordModal from '../components/common/ChangePasswordModal';
import EditProfileModal from '../components/common/EditProfileModal';
import HelpModal from '../components/common/HelpModal';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import IconButton from '../components/common/IconButton';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import axiosInstance from '../api/axiosInstance';
import TabHeader from '../components/common/TabHeader';
import { getProfilePath, getProfileAsset } from '../constants/assets';

const TIER_CONFIG = {
  PAWN: { label: 'PAWN', emoji: '♟' },
  KNIGHT: { label: 'KNIGHT', emoji: '♞' },
  BISHOP: { label: 'BISHOP', emoji: '♝' },
  ROOK: { label: 'ROOK', emoji: '♜' },
  QUEEN: { label: 'QUEEN', emoji: '♛' },
  KING: { label: 'KING', emoji: '♚' },
};

const TIER_MAPPING = {
  폰: 'PAWN',
  PAWN: 'PAWN',
  나이트: 'KNIGHT',
  KNIGHT: 'KNIGHT',
  비숍: 'BISHOP',
  BISHOP: 'BISHOP',
  룩: 'ROOK',
  ROOK: 'ROOK',
  퀸: 'QUEEN',
  QUEEN: 'QUEEN',
  킹: 'KING',
  KING: 'KING',
};

const getTierConfig = (code) => {
  if (!code) return { label: 'UNRANKED', emoji: '✨' };
  const baseCode = code.replace('_COLOR', '').replace('_MONO', '');
  const mappedCode = TIER_MAPPING[baseCode] || baseCode;
  return TIER_CONFIG[mappedCode] || { label: 'UNRANKED', emoji: '✨' };
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [tagStats, setTagStats] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const graphContainerRef = useRef(null);
  const [graphDimensions, setGraphDimensions] = useState({
    width: 0,
    height: 0,
  });
  const graphRef = useRef(null);
  const initialZoomRef = useRef(false);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, statsRes, graphRes] = await Promise.all([
        axiosInstance.get('/profile'),
        axiosInstance.get('/profile/my/stats'),
        axiosInstance.get('/profile/graph'),
      ]);

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
      console.error(err);
      setError('프로필 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [fetchProfileData]);

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
      graphRef.current.d3Force('charge').strength(-100);
      graphRef.current.d3Force('link').distance(100);
      graphRef.current.d3Force(
        'collide',
        forceCollide((node) => {
          const baseRadius = node.importance === 1 ? 50 : 30;
          const textLength = node.title ? node.title.length * 4 : 0;
          return baseRadius + textLength;
        }).iterations(3),
      );

      graphRef.current.d3ReheatSimulation();

      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.centerAt(0, 0, 900);

          graphRef.current.zoomToFit(1000, 100);

          setTimeout(() => {
            if (graphRef.current && graphRef.current.zoom() > 0.8) {
              graphRef.current.zoom(0.8, 500);
            }
          }, 1050);
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
  const { openConfirm, openAlert } = useModalStore();

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
    ? getTierConfig(profile.tierName || profile.tier || profile.imageCode)
    : getTierConfig('PAWN');

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    if (graphRef.current) {
      // 팝업 오프셋
      graphRef.current.centerAt(
        node.x,
        node.y + (node.importance === 1 ? 70 : 50),
        800,
      );
      graphRef.current.zoom(node.importance === 1 ? 0.5 : 0.8, 800);
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedNode(null);
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1); // 팝업 언마운트 시 발생하는 삭제 API 호출 완료를 기다린 후 갱신
    }, 300);
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

  const settingsBtnRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const handleSettingsClose = () => setIsSettingsOpen(false);

  const settingsSections = [
    {
      header: '계정 설정',
      items: [
        {
          id: 'edit-profile',
          label: '프로필 수정',
          icon: User,
          onClick: () => {
            setIsEditProfileModalOpen(true);
            setIsSettingsOpen(false);
          },
        },
        {
          id: 'change-password',
          label: '비밀번호 변경',
          icon: Key,
          onClick: () => {
            setIsPasswordModalOpen(true);
            setIsSettingsOpen(false);
          },
        },
      ],
    },
    {
      header: '앱 설정',
      items: [
        {
          id: 'theme',
          label: '테마 설정',
          badge: 'BETA',
          icon: Palette,
          onClick: () => {
            setIsSettingsOpen(false);
            openAlert({
              title: '테마 설정',
              message:
                '테마 설정 기능은 아직 준비 중이에요. 곧 만나볼 수 있어요.',
            });
          },
        },
      ],
    },
    {
      header: '도움말 및 정보',
      items: [
        {
          id: 'help',
          label: '도움말',
          icon: CircleHelp,
          onClick: () => {
            setIsHelpModalOpen(true);
            setIsSettingsOpen(false);
          },
        },
        {
          id: 'about',
          label: 'TEAM LINKING',
          icon: Info,
          onClick: () => {
            setIsSettingsOpen(false);
            openAlert({
              title: 'TEAM LINKING',
              message: 'FE: 김상엽, 한서경 BE: 이영선, 최승원',
            });
          },
        },
      ],
    },
    {
      items: [
        {
          id: 'logout',
          label: '로그아웃',
          icon: LogOut,
          onClick: handleLogoutClick,
        },
      ],
    },
  ];

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-y-auto scrollbar-hide">
      <TabHeader title="프로필">
        <div className="flex items-center gap-1" ref={settingsBtnRef}>
          <IconButton
            icon={Settings}
            aria-label="설정"
            onClick={() => setIsSettingsOpen(true)}
          />
        </div>
      </TabHeader>

      <main className="flex-1 px-5 pb-8 space-y-5">
        {error && (
          <div className="mt-2 rounded-xl border border-error-500/40 bg-error-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* 1. 상단 프로필 카드 */}
        <section className="mt-2 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/70 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10">
            {(() => {
              const asset = profile?.imageCode
                ? getProfileAsset(profile.imageCode)
                : null;
              return (
                <div 
                  className="w-18 h-18 shrink-0 rounded-full border border-neutral-800 flex items-center justify-center text-3xl shadow-inner relative overflow-hidden"
                  style={{ backgroundColor: asset ? (asset.bg || 'transparent') : '#171717' }}
                >
                  {asset ? (
                    <div
                      className="w-full h-full flex items-center justify-center relative z-10"
                      style={{ padding: asset.padding || '0px' }}
                    >
                      <img
                        src={asset.path}
                        alt="Profile"
                        className="w-full h-full object-contain object-center"
                        style={{
                          transform: `scale(${asset.scale || 1})`,
                        }}
                      />
                    </div>
                  ) : (
                    <span className="relative z-10">{tierInfo.emoji}</span>
                  )}
                </div>
              );
            })()}

            <div className="flex flex-col gap-1 flex-1 min-w-0 justify-center">
              <p className="text-[10px] text-primary-500 font-bold uppercase tracking-[0.2em]">
                {tierInfo.label} {tierInfo.emoji}
              </p>

              <div className="flex items-start justify-between gap-3 w-full">
                <h2 className="text-lg font-semibold break-keep leading-tight flex-1">
                  {profile?.nickname || '불러오는 중...'}
                </h2>
                {profile && (
                  <span className="shrink-0 whitespace-nowrap text-xs rounded-full border border-primary-500/60 px-2.5 py-[3px] text-primary-300 bg-primary-500/10 font-bold shadow-sm mt-0.5">
                    Lv. {profile.level ?? 1}
                  </span>
                )}
              </div>
              {profile?.description && (
                <p className="text-xs text-text-sub/90 line-clamp-2 leading-relaxed mt-1">
                  {profile.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 relative z-10 flex flex-col gap-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[11px] font-bold tracking-widest text-text-sub uppercase">
                경험치
              </span>
              <span className="text-[11px] font-black text-primary-400">
                {Math.round(xpProgress)}%
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-neutral-900/80 border border-neutral-700/50 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-300 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(234,190,47,0.4)] relative"
                style={{ width: `${Math.max(1, xpProgress)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ mixBlendMode: 'overlay' }}></div>
              </div>
            </div>
            
            {profile && (
              <div className="mt-1 flex justify-between text-[10px] text-text-sub/80 font-medium tracking-wide px-0.5">
                <span>{' '}</span>
                <span>
                  <strong className="text-primary-400 text-[11px]">{profile.currentXp ?? 0}</strong> / {profile.maxXp ?? 0} XP
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 2. 통계 및 개요 */}
        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/70 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl -mr-4 -mt-4 opacity-50 pointer-events-none" />
            <div className="flex items-center gap-1.5 text-text-sub text-xs font-bold uppercase mb-2 relative z-10 tracking-wider">
              <LinkIcon size={12} className="text-primary-500" /> 총 저장된 링크
            </div>
            <span className="text-xl font-bold text-text-main relative z-10 tracking-tight">
              {profile?.totalItemCount?.toLocaleString() ?? 0}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/70 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-4 -mb-4 opacity-50 pointer-events-none" />
            <div className="flex items-center gap-1.5 text-text-sub text-xs font-bold uppercase mb-2 relative z-10 tracking-wider">
              <Hash size={12} className="text-primary-500" /> 최애 태그
            </div>
            <span className="text-md font-bold text-text-main relative z-10 bg-bg-card rounded-full px-3 py-0.5  truncate max-w-full">
              {top1Tag !== '없음' ? `${top1Tag}` : '없음'}
            </span>
          </div>
        </section>

        {/* 3. 태그 차트 */}
        <section className="rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/70 p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <h3 className="text-sm font-bold tracking-wide flex items-center gap-2">
              통계 및 분석
            </h3>
            <p className="text-[10px] text-text-sub/70 tracking-wide pb-0.5">
              가장 많이 사용한 5개의 태그
            </p>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-neutral-700/80 via-neutral-800/50 to-transparent" />

          <div className="h-52 -ml-2 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
            </div>
            {hasTags ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={tagStats} outerRadius="70%">
                  <PolarGrid stroke="#2e2e2e" />
                  <PolarAngleAxis
                    dataKey="tagName"
                    tick={{ fill: '#a3a3a3', fontSize: 11, fontWeight: 500 }}
                  />
                  <Radar
                    name="태그 사용량"
                    dataKey="rate"
                    stroke="#eabe2f"
                    strokeWidth={1.5}
                    fill="url(#colorRate)"
                    fillOpacity={1}
                  />
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eabe2f" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#eabe2f"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-text-sub/50 font-medium">
                  아직 수집된 태그 데이터가 없어요.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. 지식 그래프 */}
        <section className="rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/70 p-1 shadow-lg flex flex-col mt-4">
          <div className="px-4 pt-4 pb-2 flex items-end justify-between">
            <h3 className="text-sm font-bold tracking-wide gap-2 flex items-center">
              링크 그래프
            </h3>
            <p className="text-[10px] text-text-sub/70 tracking-wide pb-0.5">
              내 지식의 연결망 탐색
            </p>
          </div>

          <div
            ref={graphContainerRef}
            className="h-[280px] rounded-[11px] bg-neutral-950 overflow-hidden relative border border-neutral-800/80 m-1"
          >
            <button
              onClick={() => navigate('/profile/graph')}
              className="absolute top-3 right-3 z-10 p-2 bg-neutral-900/80 rounded-lg text-neutral-400 border border-neutral-700 shadow-sm active:bg-neutral-800 active:text-white transition-colors"
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
                nodeRelSize={13}
                linkColor={(link) => {
                  if (!selectedNode) return 'rgba(163, 163, 163, 0.25)';
                  const isConnected =
                    link.source.id === selectedNode.id ||
                    link.target.id === selectedNode.id;
                  return isConnected
                    ? 'rgba(234, 190, 47, 0.8)'
                    : 'rgba(163, 163, 163, 0.05)';
                }}
                linkWidth={1.5}
                backgroundColor="transparent"
                enableZoom={true}
                enablePan={true}
                minZoom={0.1}
                maxZoom={8}
                nodePointerAreaPaint={(node, color, ctx) => {
                  const radius = node.importance === 1 ? 20 : 13;
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false);
                  ctx.fill();
                }}
                onNodeClick={handleNodeClick}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const isImportant = node.importance === 1;
                  const label = node.title;
                  const radius = isImportant ? 20 : 13;

                  let isConnected = true;
                  let isHighlighting = false;
                  if (selectedNode) {
                    isHighlighting = true;
                    if (node.id === selectedNode.id) {
                      isConnected = true;
                    } else {
                      isConnected = graphData.links.some(
                        (link) =>
                          (link.source.id === selectedNode.id &&
                            link.target.id === node.id) ||
                          (link.target.id === selectedNode.id &&
                            link.source.id === node.id),
                      );
                    }
                  }

                  const alpha = isConnected ? (isImportant ? 0.9 : 0.8) : 0.15;
                  const rgb = isImportant ? '234, 190, 47' : '255, 255, 255';
                  const color = `rgba(${rgb}, ${alpha})`;

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fillStyle = color;

                  // 선택된 상태일 때 연결된 노드들에 투명한 노란빛 글로우 효과
                  if (isHighlighting && isConnected) {
                    ctx.shadowColor = 'rgba(234, 190, 47, 0.6)';
                    ctx.shadowBlur = node.id === selectedNode.id ? 25 : 15;
                  } else if (isImportant && isConnected) {
                    ctx.shadowColor = `rgba(${rgb}, 0.8)`;
                    ctx.shadowBlur = 10;
                  }

                  ctx.fill();
                  ctx.shadowBlur = 0;

                  const shouldShowLabel =
                    ((isImportant && globalScale > 0.25) ||
                      globalScale > 0.5) &&
                    isConnected;

                  if (label && shouldShowLabel) {
                    const fontSize = 14 / globalScale;
                    ctx.font = `${isImportant ? 'bold' : 'normal'} ${fontSize}px sans-serif`;

                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(
                      (n) => n + fontSize * 0.5,
                    );

                    ctx.fillStyle = `rgba(0, 0, 0, ${isConnected ? 0.7 : 0.2})`;
                    ctx.fillRect(
                      node.x - bckgDimensions[0] / 2,
                      node.y + radius + 1 / globalScale,
                      bckgDimensions[0],
                      bckgDimensions[1],
                    );

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isImportant
                      ? `rgba(234, 190, 47, ${isConnected ? 1 : 0.3})`
                      : `rgba(255, 255, 255, ${isConnected ? 1 : 0.3})`;

                    ctx.fillText(
                      label,
                      node.x,
                      node.y + radius + bckgDimensions[1] / 2 + 1 / globalScale,
                    );
                  }
                }}
                onBackgroundClick={() => setSelectedNode(null)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 gap-2">
                <Network size={24} />
                <p className="text-sm text-text-sub/70">
                  {hasGraph
                    ? '그래프 불러오는 중...'
                    : '연결된 링크 데이터가 없어요.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <ActionSheet
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        anchorEl={settingsBtnRef.current}
        sections={settingsSections}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        initialData={
          profile
            ? {
                nickName: profile.nickname,
                imageCode: profile.imageCode,
                maxTier: tierInfo.label,
              }
            : null
        }
        onSuccess={fetchProfileData}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
