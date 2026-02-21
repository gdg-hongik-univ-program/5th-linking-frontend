import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Network } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import axiosInstance from '../api/axiosInstance';
import IconButton from '../components/common/IconButton';

export default function GraphFullScreenPage() {
  const navigate = useNavigate();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setGraphData({
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
      graphData.nodes.length > 0 &&
      dimensions.width > 0 &&
      !initialZoomRef.current
    ) {
      graphRef.current.d3Force('charge').strength(-400);
      graphRef.current.d3Force('link').distance(250);
      graphRef.current.d3ReheatSimulation();

      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.centerAt(0, 0, 900);

          graphRef.current.zoomToFit(1000, 10);

          setTimeout(() => {
            if (graphRef.current && graphRef.current.zoom() > 1.0) {
              graphRef.current.zoom(0.9, 500);
            }
          }, 1050);
        }
      }, 1500);

      initialZoomRef.current = true;
    }
  }, [graphData, dimensions.width]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const isImportant = node.importance === 1;
    const label = node.title;
    const radius = isImportant ? 8 : 5;
    const color = isImportant ? '#EABE2F' : 'rgba(255, 255, 255, 0.8)';

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;

    if (isImportant) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
    }

    ctx.fill();
    ctx.shadowBlur = 0;

    const shouldShowLabel =
      (isImportant && globalScale > 0.4) || globalScale > 0.9;

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
  }, []);

  const handleNodeClick = useCallback(
    (node) => {
      if (graphRef.current) {
        // 1. 클릭 시 강하게 줌인
        graphRef.current.centerAt(node.x, node.y, 800);
        graphRef.current.zoom(5, 800);

        // 2. 잠시 대기 후 해당 항목 페이지로 이동
        setTimeout(() => {
          navigate(`/view/${node.id}`);
        }, 1200);
      }
    },
    [navigate],
  );

  return (
    <div className="w-screen h-screen bg-neutral-950 flex flex-col relative overflow-hidden font-sans">
      <header className="absolute top-0 left-0 w-full p-4 flex items-center gap-3 z-50 bg-gradient-to-b from-neutral-950/80 to-transparent pointer-events-none">
        <IconButton
          icon={X}
          onClick={() => navigate('/profile')}
          className="pointer-events-auto"
        />
        <h1 className="text-white font-bold tracking-wide pointer-events-auto text-lg drop-shadow-md">
          나의 지식 그래프
        </h1>
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
        ) : graphData.nodes.length > 0 && dimensions.width > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeRelSize={6}
            linkColor={() => 'rgba(163, 163, 163, 0.6)'}
            linkWidth={1.5}
            backgroundColor="transparent"
            enableZoom={true}
            enablePan={true}
            minZoom={0.1}
            maxZoom={8}
            nodeCanvasObject={paintNode}
            onNodeClick={handleNodeClick}
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
      </main>
    </div>
  );
}
