import { motion } from 'framer-motion';
import { useMemo } from 'react';

const DURATION = 3.0;

const num = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);

const kf = (range, phase) => {
  const r = num(range, 0);
  const d = phase % 2 === 0 ? r : -r;
  return [0, d, -d, 0];
};

const addKfs = (base, offsets) => {
  const b = num(base, 0);
  const off =
    Array.isArray(offsets) && offsets.length === 4 ? offsets : [0, 0, 0, 0];
  return off.map((v) => b + num(v, 0));
};

export default function LoadingOverlay() {
  const nodes = useMemo(
    () =>
      [
        { id: 0, x: 50, y: 50, size: 10.4, isPrimary: true },
        { id: 1, x: 50, y: 22, size: 7.0, isPrimary: false },
        { id: 2, x: 74, y: 32, size: 7.6, isPrimary: true },
        { id: 3, x: 80, y: 58, size: 7.4, isPrimary: false },
        { id: 4, x: 62, y: 78, size: 7.8, isPrimary: true },
        { id: 5, x: 28, y: 64, size: 7.0, isPrimary: false },
        { id: 6, x: 22, y: 36, size: 6.2, isPrimary: false },
        { id: 7, x: 56, y: 96, size: 6.2, isPrimary: false },
      ].map((n) => ({
        ...n,
        x: num(n.x, 50),
        y: num(n.y, 50),
        size: num(n.size, 7),
      })),
    [],
  );

  const nodeById = useMemo(() => {
    const map = new Map();
    nodes.forEach((n, idx) => map.set(n.id, idx));
    return map;
  }, [nodes]);

  const connections = useMemo(() => {
    const pairsById = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [5, 6],
      [4, 7],
    ];

    return pairsById
      .map(([a, b]) => [nodeById.get(a), nodeById.get(b)])
      .filter(([ai, bi]) => Number.isInteger(ai) && Number.isInteger(bi));
  }, [nodeById]);

  const nodeJitter = useMemo(() => {
    return nodes.map((n, i) => {
      const isHub = i === 0;
      const isLeaf = n.id === 6 || n.id === 7;

      const base = isHub ? 0.85 : isLeaf ? 2.15 : 1.75;

      const sizeFactor = Math.max(0.9, Math.min(1.2, 7 / num(n.size, 7)));
      const personality = 0.9 + (i % 4) * 0.08;
      const range = base * sizeFactor * personality;

      const phaseA = i * 3 + 1;
      const phaseB = i * 3 + 2;

      return { tx: kf(range, phaseA), ty: kf(range, phaseB) };
    });
  }, [nodes]);

  const commonTransition = useMemo(
    () => ({
      duration: DURATION,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    }),
    [],
  );

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-bg-main/80 backdrop-blur-md isolate pointer-events-none">
      <div className="relative w-64 h-64">
        <svg
          className="w-full h-full"
          viewBox="-8 -8 116 116"
          preserveAspectRatio="xMidYMid meet"
        >
          {connections.map(([sIdx, eIdx], i) => {
            const s = nodes[sIdx];
            const e = nodes[eIdx];

            const sx = num(s?.x, 50);
            const sy = num(s?.y, 50);
            const ex = num(e?.x, 50);
            const ey = num(e?.y, 50);

            const sj = nodeJitter[sIdx] ?? {
              tx: [0, 0, 0, 0],
              ty: [0, 0, 0, 0],
            };
            const ej = nodeJitter[eIdx] ?? {
              tx: [0, 0, 0, 0],
              ty: [0, 0, 0, 0],
            };

            return (
              <motion.line
                key={`line-${sIdx}-${eIdx}-${i}`}
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                initial={{ x1: sx, y1: sy, x2: ex, y2: ey }}
                animate={{
                  x1: addKfs(sx, sj.tx),
                  y1: addKfs(sy, sj.ty),
                  x2: addKfs(ex, ej.tx),
                  y2: addKfs(ey, ej.ty),
                }}
                transition={commonTransition}
                stroke="currentColor"
                strokeWidth="1.05"
                strokeOpacity="0.34"
                strokeLinecap="round"
                className="text-text-main"
              />
            );
          })}

          {nodes.map((node, i) => {
            const cx = num(node.x, 50);
            const cy = num(node.y, 50);
            const r = Math.max(2.4, Math.min(6.6, num(node.size, 7) / 2));

            const jit = nodeJitter[i] ?? {
              tx: [0, 0, 0, 0],
              ty: [0, 0, 0, 0],
            };

            return (
              <motion.circle
                key={`node-${node.id}`}
                r={r}
                cx={cx}
                cy={cy}
                fill="currentColor"
                className={
                  node.isPrimary ? 'text-primary-500' : 'text-text-main'
                }
                initial={{ translateX: 0, translateY: 0, opacity: 1 }}
                animate={{
                  translateX: jit.tx,
                  translateY: jit.ty,
                  scale: node.isPrimary ? [1, 1.085, 1] : [1, 1.045, 1],
                  opacity: 1,
                }}
                transition={commonTransition}
                style={{
                  filter: node.isPrimary
                    ? 'drop-shadow(0px 0px 7px rgba(59, 130, 246, 0.18))'
                    : 'drop-shadow(0px 0px 4px rgba(255,255,255,0.06))',
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
