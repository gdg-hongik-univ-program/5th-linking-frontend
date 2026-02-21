import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Network, CircleQuestionMark } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';
import axiosInstance from '../api/axiosInstance';
import IconButton from '../components/common/IconButton';
import ItemDetailPopup from '../components/common/ItemDetailPopup';

export default function GraphFullScreenPage() {
  const navigate = useNavigate();

  const [initialGraphData, setInitialGraphData] = useState({
    nodes: [],
    links: [],
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const graphRef = useRef(null);
  const initialZoomRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchGraph = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/profile/graph');

        if (!isMounted) return;

        if (res.data) {
          setInitialGraphData({
            nodes: Array.isArray(res.data.nodes)
              ? res.data.nodes.map((n) => ({ ...n }))
              : [],
            links: Array.isArray(res.data.links)
              ? res.data.links.map((l) => ({ ...l }))
              : [],
          });
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('그래프 데이터를 불러오는데 실패했습니다.', err);
        setError('데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGraph();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [loading]);

  useEffect(() => {
    if (
      graphRef.current &&
      initialGraphData.nodes.length > 0 &&
      dimensions.width > 0 &&
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
  }, [initialGraphData, dimensions.width]);

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const isImportant = node.importance === 1;
      const label = node.title;
      const radius = isImportant ? 20 : 13;

      // 선택된 노드가 있을 때, 본인 및 연결된 노드인지 확인
      let isConnected = true;
      let isHighlighting = false;
      if (selectedNode) {
        isHighlighting = true;
        if (node.id === selectedNode.id) {
          isConnected = true;
        } else {
          // 양방향 링크 확인
          isConnected = initialGraphData.links.some(
            (link) =>
              (link.source.id === selectedNode.id && link.target.id === node.id) ||
              (link.target.id === selectedNode.id && link.source.id === node.id)
          );
        }
      }

      // 색상 및 투명도 설정
      const alpha = isConnected ? (isImportant ? 0.9 : 0.8) : 0.15;
      const rgb = isImportant ? '234, 190, 47' : '255, 255, 255';
      const color = `rgba(${rgb}, ${alpha})`;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;

      // 선택된 상태일 때 연결된 노드들에 투명한 노란빛 글로우 효과
      if (isHighlighting && isConnected) {
        ctx.shadowColor = 'rgba(234, 190, 47, 0.9)';
        ctx.shadowBlur = node.id === selectedNode.id ? 30 : 20;
      } else if (isImportant && isConnected) {
        ctx.shadowColor = `rgba(${rgb}, 0.8)`;
        ctx.shadowBlur = 20;
      }

      ctx.fill();
      ctx.shadowBlur = 0;

      const shouldShowLabel =
        ((isImportant && globalScale > 0.25) || globalScale > 0.5) && isConnected;

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
    },
    [selectedNode, initialGraphData.links],
  );

  const handleNodeClick = useCallback(
    (node) => {
      setSelectedNode(node);
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y + (node.importance === 1 ? 70 : 50), 800);
        graphRef.current.zoom(node.importance === 1 ? 0.5 : 0.8, 800);
      }
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setSelectedNode(null);
    // setRefreshTrigger((prev) => prev + 1); // This was commented out in the original, keeping it commented.
  }, []);

  return (
    <div className="w-full h-full bg-neutral-950 flex flex-col relative overflow-hidden font-sans">
      <header className="absolute py-10 left-0 w-full p-4 flex items-center justify-center gap-3 z-50 bg-gradient-to-b from-neutral-950/80 to-transparent pointer-events-none">
        <IconButton
          icon={X}
          onClick={() => navigate('/profile')}
          className="absolute left-4 pointer-events-auto"
        />
        <IconButton
          icon={CircleQuestionMark}
          onClick={() => setIsHelpOpen(true)}
          className="absolute right-4 pointer-events-auto text-neutral-400 hover:text-white transition-colors"
        />
      </header>

      <main
        ref={containerRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing"
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-neutral-700 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-neutral-400 font-medium tracking-widest text-sm">
              LOADING GRAPH...
            </p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 font-medium">
            {error}
          </div>
        ) : initialGraphData.nodes.length > 0 && dimensions.width > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={initialGraphData}
            nodeRelSize={12}
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
            minZoom={0.15}
            maxZoom={8}
            nodePointerAreaPaint={(node, color, ctx) => {
              const radius = node.importance === 1 ? 20 : 13;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            nodeCanvasObject={paintNode}
            onNodeClick={handleNodeClick}
            onBackgroundClick={() => setSelectedNode(null)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-40">
            <Network size={40} className="text-neutral-500" />
            <p className="text-neutral-400 font-medium">
              연결된 링크 데이터가 없습니다.
            </p>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(234,190,47,0.03)_0%,transparent_70%)]" />
        {/* 팝업 오버레이 */}
        {selectedNode && (
          <>
              <ItemDetailPopup
              itemId={selectedNode.id}
              onClose={handleModalClose}
              className="pb-10"
            />
          </>
        )}

        {/* 도움말 팝업 */}
        {isHelpOpen && (
          <div 
            className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsHelpOpen(false)}
          >
            <div 
              className="bg-bg-main w-full max-w-sm rounded-2xl shadow-xl border border-neutral-800 p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Network size={22} className="text-primary-500" />
                  도움말
                </h2>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="text-neutral-400 p-1 hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex flex-col gap-4 text-base text-neutral-300 z-60 pointer-events-auto">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold shrink-0 mt-0.5">1</div>
                  <p className="text-text-sub "> 화면을 드래그하거나 확대/축소하며 자유롭게 이동해 보세요.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold shrink-0 mt-0.5">2</div>
                  <p className="text-text-sub "> 중요 표시한 링크는 노란색이에요. </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold shrink-0 mt-0.5">3</div>
                  <p className='text-text-sub' ><span className="text-text-main "> 링크를 터치/클릭해 보세요!</span> <br/> 연결된 링크를 한 눈에, 상세 페이지는 팝업으로 볼 수 있어요. </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
