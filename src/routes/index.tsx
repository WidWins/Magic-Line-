import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Neon — How it works" },
      {
        name: "description",
        content:
          "A futuristic, scroll-driven timeline with a glowing purple animated SVG line.",
      },
    ],
  }),
});

type CardSide = "left" | "right";
type StepDef = {
  id: string;
  label: string;
  title: string;
  body: string;
  side: CardSide;
  extra: "tasks" | "code" | "chart" | "stats";
};

const STEPS: StepDef[] = [
  {
    id: "s1",
    label: "Step 01",
    title: "Research Services",
    body: "No coding, no configs. Just tell the agent what outcome you want.",
    side: "right",
    extra: "tasks",
  },
  {
    id: "s2",
    label: "Step 02",
    title: "Agents plan and execute.",
    body: "Our AI breaks the goal into steps and runs them in a secure sandbox — clicking, typing, calling APIs.",
    side: "left",
    extra: "code",
  },
  {
    id: "s3",
    label: "Step 03",
    title: "Watch progress in real time.",
    body: "Every action streams to your dashboard with replay, logs, and live metrics.",
    side: "right",
    extra: "chart",
  },
  {
    id: "s4",
    label: "Step 04",
    title: "Ship results, scale on demand.",
    body: "Export, automate, or hand off — your agents keep running 24/7 at fleet scale.",
    side: "left",
    extra: "stats",
  },
];

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ambient orbs */}
      <div
        aria-hidden
        className="orb pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.28 300 / 0.35) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden
        className="orb pointer-events-none absolute top-[40%] -right-32 h-[28rem] w-[28rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.5 0.3 285 / 0.3) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "2s",
        }}
      />
      <div
        aria-hidden
        className="orb pointer-events-none absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.6 0.28 310 / 0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "4s",
        }}
      />

      <Hero />
      <Timeline />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative z-10 mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wider text-foreground/80 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.25_305)] shadow-[0_0_10px_oklch(0.78_0.25_305)]" />
        HOW IT WORKS · v1.0
      </span>

      <h1
        className="fade-up bg-gradient-to-b from-white via-white to-[oklch(0.78_0.25_305)] bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl md:text-7xl"
        style={{ animationDelay: "0.15s" }}
      >
        From idea to outcome,
        <br />
        in four steps.
      </h1>

      <p
        className="fade-up mt-6 max-w-xl text-base text-foreground/60 sm:text-lg"
        style={{ animationDelay: "0.3s" }}
      >
        Scroll to follow the glow. Each beat lights up a node, draws the line,
        and reveals the next phase of the agent loop.
      </p>

      <div
        className="fade-up mt-10 flex flex-col items-center gap-2 text-xs tracking-[0.2em] text-foreground/50"
        style={{ animationDelay: "0.5s" }}
      >
        <span>SCROLL</span>
        <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-[oklch(0.78_0.25_305)] to-transparent" />
      </div>
    </section>
  );
}

function Timeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const cometRef = useRef<SVGCircleElement>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [pathD, setPathD] = useState("");
  const [pathLen, setPathLen] = useState(0);
  const [rungs, setRungs] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);
  const [caps, setCaps] = useState<{ top: string; bot: string } | null>(null);
  // store node y positions so draw() can light up nodes
  const layoutRef = useRef<{ ny: number[]; topY: number; botY: number }>({
    ny: [],
    topY: 0,
    botY: 0,
  });

  const build = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wrapR = wrap.getBoundingClientRect();

    const nodes = STEPS.map((_s, i) => {
      const nEl = nodeRefs.current[i];
      if (!nEl) return null;
      const nR = nEl.getBoundingClientRect();
      const nx = nR.left + nR.width / 2 - wrapR.left;
      const ny = nR.top + nR.height / 2 - wrapR.top;
      return { nx, ny };
    }).filter(Boolean) as { nx: number; ny: number }[];

    if (nodes.length === 0) return;
    const topY = nodes[0].ny;
    const botY = nodes[nodes.length - 1].ny;

    // DNA double-helix: two sine strands woven around the spine,
    // passing through every node. Amplitude derives from node x-offsets.
    const cx =
      nodes.reduce((acc, n) => acc + n.nx, 0) / nodes.length;
    const amp = Math.max(
      40,
      ...nodes.map((n) => Math.abs(n.nx - cx)),
    );
    // Path spans exactly from first to last node — no end caps, no return strand.
    const startY = topY;
    const endY = botY;
    const total = endY - startY;
    // tune frequency so a full wave spans ~2 nodes
    const waves = Math.max(1.5, (nodes.length - 1) / 2);
    const segs = 96;

    const strand = (phase: number) => {
      let s = "";
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const y = startY + t * total;
        const x = cx + amp * Math.sin(2 * Math.PI * waves * t + phase);
        s += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      return s;
    };

    // Single strand, top node to bottom node — comet stops at node 04.
    const d = strand(0);

    setPathD(d);
    layoutRef.current = { ny: nodes.map((n) => n.ny), topY, botY };

    // Horizontal rungs: sample both strands at evenly spaced t values.
    const rungCount = Math.max(10, nodes.length * 4);
    const newRungs = [];
    for (let i = 1; i < rungCount; i++) {
      const t = i / rungCount;
      const y = startY + t * total;
      const x1 = cx + amp * Math.sin(2 * Math.PI * waves * t);
      const x2 = cx + amp * Math.sin(2 * Math.PI * waves * t + Math.PI);
      newRungs.push({ x1, y1: y, x2, y2: y });
    }
    setRungs(newRungs);

    // Top & bottom caps: rounded U-shapes wrapping helix endpoints.
    // Endpoints come from strand(0) and strand(PI) at t=0 and t=1.
    const topX1 = cx + amp * Math.sin(0);
    const topX2 = cx + amp * Math.sin(Math.PI);
    const botX1 = cx + amp * Math.sin(2 * Math.PI * waves);
    const botX2 = cx + amp * Math.sin(2 * Math.PI * waves + Math.PI);
    const capH = amp * 0.95;
    // Top cap: smooth U bulging UPWARD above topY.
    const topCap = `M ${topX1.toFixed(2)} ${topY.toFixed(2)} C ${topX1.toFixed(2)} ${(topY - capH).toFixed(2)}, ${topX2.toFixed(2)} ${(topY - capH).toFixed(2)}, ${topX2.toFixed(2)} ${topY.toFixed(2)}`;
    // Bottom cap: mirrored U bulging DOWNWARD below botY.
    const botCap = `M ${botX1.toFixed(2)} ${botY.toFixed(2)} C ${botX1.toFixed(2)} ${(botY + capH).toFixed(2)}, ${botX2.toFixed(2)} ${(botY + capH).toFixed(2)}, ${botX2.toFixed(2)} ${botY.toFixed(2)}`;
    setCaps({ top: topCap, bot: botCap });
    requestAnimationFrame(() => {
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        setPathLen(len);
        pathRef.current.style.strokeDasharray = `${len}`;
        pathRef.current.style.strokeDashoffset = `${len}`;
        draw();
      }
    });
  };

  const draw = () => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap || !pathLen) return;

    const { ny, topY, botY } = layoutRef.current;
    const vh = window.innerHeight;
    const rect = wrap.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = rect.height;
    const scrollY = window.scrollY;

    const start = sectionTop - vh * 0.65;
    const end = sectionTop + sectionHeight - vh * 0.45;
    const raw = Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
    const t =
      raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

    const drawn = t * pathLen;
    path.style.strokeDashoffset = `${Math.max(0, pathLen - drawn)}`;

    // comet head along the path
    if (cometRef.current && t > 0 && t < 1) {
      const pt = path.getPointAtLength(drawn);
      cometRef.current.setAttribute("cx", `${pt.x}`);
      cometRef.current.setAttribute("cy", `${pt.y}`);
      cometRef.current.setAttribute("opacity", "1");
    } else if (cometRef.current) {
      cometRef.current.setAttribute("opacity", "0");
    }

    // light nodes by vertical progress
    const vertRange = botY - topY || 1;
    const vertDrawn = t * vertRange;
    ny.forEach((y, i) => {
      const reached = vertDrawn >= y - topY - 10;
      nodeRefs.current[i]?.classList.toggle("lit", reached);
      stepRefs.current[i]?.classList.toggle("on", reached);
    });
  };

  useLayoutEffect(() => {
    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => requestAnimationFrame(draw);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathLen]);

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-40">
      <header className="mx-auto mb-24 max-w-2xl text-center">
        <p className="mb-3 text-[11px] font-medium tracking-[0.25em] text-[oklch(0.78_0.25_305)]">
          THE LOOP
        </p>
        <h2 className="bg-gradient-to-b from-white to-foreground/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl md:text-5xl">
          Here's how it works.
        </h2>
        <p className="mt-4 text-foreground/60">
          Describe what you want — the agent plans, executes, and reports back.
        </p>
      </header>

      <div ref={wrapRef} className="tl relative">
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="tlLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.78 0.25 305)" />
              <stop offset="50%" stopColor="oklch(0.55 0.28 300)" />
              <stop offset="100%" stopColor="oklch(0.45 0.3 295)" />
            </linearGradient>
            <filter
              id="tlGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="tlComet">
              <stop
                offset="0%"
                stopColor="oklch(0.95 0.15 305)"
                stopOpacity="1"
              />
              <stop
                offset="60%"
                stopColor="oklch(0.78 0.25 305)"
                stopOpacity="0.6"
              />
              <stop
                offset="100%"
                stopColor="oklch(0.55 0.28 300)"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          {/* helix rungs / base pairs (behind strands) */}
          <g>
            {rungs.map((r, i) => {
              // alternate between purple & soft blue base-pair shades
              const isAlt = i % 2 === 0;
              const stroke = isAlt
                ? "oklch(0.78 0.25 305)"
                : "oklch(0.82 0.14 240)";
              const mx = (r.x1 + r.x2) / 2;
              // small molecular-style nucleotide cluster on every 4th rung
              const showCluster = i % 4 === 2;
              // tiny notch/tick marks near each strand end (base pair caps)
              return (
                <g key={i}>
                  <line
                    x1={r.x1}
                    y1={r.y1}
                    x2={r.x2}
                    y2={r.y2}
                    stroke={stroke}
                    strokeWidth={1}
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                  />
                  <circle cx={r.x1} cy={r.y1} r={1.4} fill={stroke} fillOpacity={0.55} />
                  <circle cx={r.x2} cy={r.y2} r={1.4} fill={stroke} fillOpacity={0.55} />
                  {showCluster && (
                    <g opacity={0.45}>
                      <circle cx={mx} cy={r.y1} r={2.6} fill="oklch(0.78 0.25 305)" fillOpacity={0.35} />
                      <circle cx={mx} cy={r.y1} r={1.2} fill="oklch(0.95 0.15 305)" />
                      <line x1={mx} y1={r.y1} x2={mx + 6} y2={r.y1 - 5} stroke="oklch(0.82 0.14 240)" strokeWidth={0.8} strokeOpacity={0.7} />
                      <circle cx={mx + 6} cy={r.y1 - 5} r={1.4} fill="oklch(0.82 0.14 240)" fillOpacity={0.7} />
                      <line x1={mx} y1={r.y1} x2={mx - 6} y2={r.y1 + 5} stroke="oklch(0.82 0.14 240)" strokeWidth={0.8} strokeOpacity={0.7} />
                      <circle cx={mx - 6} cy={r.y1 + 5} r={1.4} fill="oklch(0.82 0.14 240)" fillOpacity={0.7} />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* tiny labeled nucleotide micro-diagram (bottom-left) */}
          {rungs.length > 0 && (() => {
            const last = rungs[rungs.length - 1];
            const dx = Math.min(last.x1, last.x2) - 90;
            const dy = last.y2 + 30;
            return (
              <g opacity={0.55} transform={`translate(${dx}, ${dy})`}>
                {/* base pair backbone */}
                <line x1={0} y1={0} x2={40} y2={0} stroke="oklch(0.82 0.14 240)" strokeWidth={0.8} strokeOpacity={0.8} />
                <circle cx={0} cy={0} r={4} fill="none" stroke="oklch(0.78 0.25 305)" strokeWidth={1} />
                <circle cx={0} cy={0} r={1.6} fill="oklch(0.95 0.15 305)" />
                {/* phosphate / sugar bumps */}
                <line x1={0} y1={0} x2={-7} y2={-7} stroke="oklch(0.82 0.14 240)" strokeWidth={0.8} />
                <circle cx={-7} cy={-7} r={1.8} fill="oklch(0.82 0.14 240)" fillOpacity={0.8} />
                <line x1={0} y1={0} x2={-7} y2={7} stroke="oklch(0.82 0.14 240)" strokeWidth={0.8} />
                <circle cx={-7} cy={7} r={1.8} fill="oklch(0.82 0.14 240)" fillOpacity={0.8} />
                {/* paired base */}
                <circle cx={40} cy={0} r={3} fill="oklch(0.78 0.25 305)" fillOpacity={0.4} />
                {/* label */}
                <text
                  x={20}
                  y={16}
                  textAnchor="middle"
                  fontSize={7}
                  letterSpacing={1.5}
                  fill="oklch(0.78 0.25 305)"
                  fillOpacity={0.85}
                  style={{ fontFamily: "ui-monospace, monospace" }}
                >
                  NUCLEOTIDE
                </text>
              </g>
            );
          })()}

          {/* helix end caps (top & bottom) */}
          {caps && (
            <g>
              <path
                d={caps.top}
                fill="none"
                stroke="oklch(0.78 0.25 305)"
                strokeWidth={2}
                strokeOpacity={0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tlGlow)"
              />
              <path
                d={caps.bot}
                fill="none"
                stroke="oklch(0.78 0.25 305)"
                strokeWidth={2}
                strokeOpacity={0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#tlGlow)"
              />
            </g>
          )}

          {/* ghost dim path */}
          <path
            ref={ghostRef}
            d={pathD}
            fill="none"
            stroke="oklch(0.78 0.25 305)"
            strokeWidth={1}
            strokeOpacity={0.12}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* active animated path */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="url(#tlLine)"
            strokeWidth={2}
            strokeOpacity={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#tlGlow)"
          />
          {/* comet head */}
          <circle
            ref={cometRef}
            r={14}
            fill="url(#tlComet)"
            opacity={0}
            style={{ transition: "opacity 0.3s ease" }}
          />
        </svg>

        {STEPS.map((step, i) => (
          <StepRow
            key={step.id}
            step={step}
            index={i}
            stepRef={(el) => (stepRefs.current[i] = el)}
            nodeRef={(el) => (nodeRefs.current[i] = el)}
          />
        ))}
      </div>
    </section>
  );
}

function StepRow({
  step,
  index,
  stepRef,
  nodeRef,
}: {
  step: StepDef;
  index: number;
  stepRef: (el: HTMLDivElement | null) => void;
  nodeRef: (el: HTMLDivElement | null) => void;
}) {
  // Card and node share the same side. Node hugs the inner edge of the card.
  return (
    <div ref={stepRef} className="tl-step relative min-h-[260px] py-10">
      {step.side === "right" ? (
        <div className="ml-auto flex w-full max-w-[46%] items-center gap-5">
          <NodeBubble nodeRef={nodeRef} index={index} />
          <Card step={step} />
        </div>
      ) : (
        <div className="mr-auto flex w-full max-w-[46%] flex-row-reverse items-center gap-5">
          <NodeBubble nodeRef={nodeRef} index={index} />
          <Card step={step} />
        </div>
      )}
    </div>
  );
}

function NodeBubble({
  nodeRef,
  index,
}: {
  nodeRef: (el: HTMLDivElement | null) => void;
  index: number;
}) {
  return (
    <div
      ref={nodeRef}
      className="tl-node relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-background font-semibold text-foreground/30 backdrop-blur transition-all duration-500"
    >
      <span className="text-sm">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

function Card({ step }: { step: StepDef }) {
  const isTasks = step.extra === "tasks";
  const isCode = step.extra === "code";
  const hideHeader = isTasks || isCode;
  return (
    <div className="tl-card relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.25_305)]/60 to-transparent"
      />
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.78_0.25_305)]">
        {step.label}
      </p>
      {!hideHeader && (
        <>
          <h3 className="mb-2 text-lg font-semibold tracking-tight text-white">
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed text-foreground/60">{step.body}</p>
        </>
      )}

      {step.extra === "tasks" && <TaskList />}
      {step.extra === "code" && <CodeBlock />}
      {step.extra === "chart" && <MiniChart />}
      {step.extra === "stats" && <StatsGrid />}
    </div>
  );
}

function TaskList() {
  const items = [
    { t: "Gather Information" },
    { t: "Simplify the information" },
    { t: "Improve" },
  ];
  const [completedCount, setCompletedCount] = useState(0);
  const PURPLE = "oklch(0.78 0.25 305)";
  const PURPLE_BRIGHT = "oklch(0.95 0.15 305)";

  useEffect(() => {
    let count = 0;
    setCompletedCount(count);
    const interval = window.setInterval(() => {
      count += 1;
      if (count > items.length) {
        count = 0;
      }
      setCompletedCount(count);
    }, 700);
    return () => window.clearInterval(interval);
  }, [items.length]);

  const DocIcon = ({ variant = "dim" }: { variant?: "dim" | "active" | "done" }) => {
    const stroke =
      variant === "dim"
        ? "oklch(0.55 0.04 280)"
        : variant === "active"
          ? PURPLE_BRIGHT
          : PURPLE;
    const op = variant === "dim" ? 0.55 : 1;
    if (variant === "done") {
      // checked-document
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M6 3h8l4 4v14H6z" stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M14 3v4h4" stroke={stroke} strokeWidth={1.4} />
          <path d="M8 13l3 3 5-6" stroke={PURPLE_BRIGHT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path d="M6 3h8l4 4v14H6z" stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" opacity={op} />
        <path d="M14 3v4h4" stroke={stroke} strokeWidth={1.4} opacity={op} />
        <path d="M9 12h6M9 15h6M9 18h4" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" opacity={op} />
      </svg>
    );
  };

  const TOTAL = 7;
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      {/* hero illustration: magnifier sweeps across docs */}
      <div className="space-y-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: PURPLE_BRIGHT, boxShadow: `0 0 10px ${PURPLE}` }}
          />
          <span className="text-[11px] font-semibold tracking-wide text-white/90">
            Research Services
          </span>
        </div>
      </div>
      <div className="search-anim relative px-4 py-6">
        <div className="search-anim-row relative mx-auto flex items-center justify-between gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className="search-doc relative" style={{ ["--i" as never]: i }}>
              {/* dim (untouched) */}
              <span className="search-doc-dim absolute inset-0 flex items-center justify-center">
                <DocIcon variant="dim" />
              </span>
              {/* active (under magnifier) */}
              <span className="search-doc-active absolute inset-0 flex items-center justify-center">
                <DocIcon variant="active" />
              </span>
              {/* done (after magnifier passed) */}
              <span className="search-doc-done absolute inset-0 flex items-center justify-center">
                <DocIcon variant="done" />
              </span>
              {/* size placeholder */}
              <span className="block h-7 w-7" />
            </div>
          ))}

          {/* magnifier sweeps left -> right */}
          <span
            aria-hidden
            className="search-magnifier pointer-events-none absolute top-1/2 -translate-y-1/2"
            style={{ filter: `drop-shadow(0 0 8px ${PURPLE})` }}
          >
            <svg viewBox="0 0 36 36" className="h-9 w-9" fill="none">
              <circle cx="15" cy="15" r="11" stroke={PURPLE_BRIGHT} strokeWidth={2} fill="oklch(0.08 0.02 280 / 0.6)" />
              <line x1="23" y1="23" x2="32" y2="32" stroke={PURPLE_BRIGHT} strokeWidth={2.6} strokeLinecap="round" />
            </svg>
          </span>
        </div>
        {/* faint shadow */}
        <span
          aria-hidden
          className="search-shadow absolute bottom-3 h-1 w-10 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${PURPLE} / 0.4, transparent 70%)` }}
        />
      </div>

      {/* rows */}
      <ul className="divide-y divide-white/5 border-t border-white/5">
        {items.map((it, i) => {
          const done = i < completedCount;
          return (
            <li
              key={i}
              className="tasklist-row relative flex items-center gap-3 px-4 py-3"
            >
              {/* pending: dashed ring */}
              <span
                className={`tasklist-pending flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  done ? "opacity-0 scale-90" : "opacity-100 scale-100"
                }`}
                style={{
                  animation: "none",
                  border: "1.5px dashed color-mix(in oklab, oklch(0.78 0.25 305) 55%, transparent)",
                }}
                aria-hidden
              />
              {/* completed: filled check */}
              <span
                className={`tasklist-done absolute flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  done ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
                style={{
                  animation: "none",
                  background: "color-mix(in oklab, oklch(0.78 0.25 305) 22%, transparent)",
                  boxShadow: "0 0 12px oklch(0.78 0.25 305 / 0.5)",
                  border: "1px solid color-mix(in oklab, oklch(0.78 0.25 305) 55%, transparent)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M5 12l4 4 10-10"
                    stroke={PURPLE_BRIGHT}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold text-white/90">{it.t}</span>
              {done && (
                <span
                  className="tasklist-completed absolute right-4 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
                  style={{
                    background: "color-mix(in oklab, oklch(0.78 0.25 305) 14%, transparent)",
                    color: "oklch(0.88 0.18 305)",
                    border: "1px solid color-mix(in oklab, oklch(0.78 0.25 305) 35%, transparent)",
                  }}
                >
                  Completed
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CodeBlock() {
  const PURPLE = "oklch(0.78 0.25 305)";
  const PURPLE_BRIGHT = "oklch(0.95 0.15 305)";
  const tasks = [
    { t: "Define analyzing things" },
    { t: "List all costs" },
    { t: "Separate cost timings" },
    { t: "Calculate total cost" },
  ];
  const [completedCount, setCompletedCount] = useState(0);
  const [dollarsAmount, setDollarsAmount] = useState(0);
  const dollarsReady = completedCount >= tasks.length;

  useEffect(() => {
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      let step = 1;
      setCompletedCount(step);
      interval = window.setInterval(() => {
        step += 1;
        if (step > tasks.length) {
          step = 0;
          setCompletedCount(0);
          setDollarsAmount(0); // Reset dollars when loop restarts
          return;
        }
        setCompletedCount(step);
      }, 800); // Faster: 800ms instead of 1200ms
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [tasks.length]);

  useEffect(() => {
    if (dollarsReady && dollarsAmount === 0) {
      const target = 128402;
      const duration = 3000; // 3 seconds
      const steps = 60; // 60 fps
      const increment = target / steps;
      let current = 0;
      const dollarsInterval = window.setInterval(() => {
        current += increment;
        if (current >= target) {
          setDollarsAmount(target);
          window.clearInterval(dollarsInterval);
        } else {
          setDollarsAmount(Math.floor(current));
        }
      }, duration / steps);
      return () => window.clearInterval(dollarsInterval);
    }
  }, [dollarsReady, dollarsAmount]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      {/* top: agent plan ticking through steps */}
      <div className="space-y-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: PURPLE_BRIGHT, boxShadow: `0 0 10px ${PURPLE}` }}
          />
          <span className="text-[11px] font-semibold tracking-wide text-white/90">
            Cost Analysis
          </span>
        </div>
        <div className="space-y-1.5">
          {tasks.map((r, i) => {
            const done = i < completedCount;
            return (
              <div
                key={i}
                className="tasklist-row relative flex items-center gap-3 rounded-md border border-white/5 bg-black/30 px-2.5 py-1.5"
              >
                <span className="tasklist-icon relative flex h-7 w-7 flex-shrink-0 items-center justify-center">
                  <span
                    className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                      done ? "opacity-0 scale-90" : "opacity-100 scale-100"
                    }`}
                    style={{
                      border: "1.5px dashed color-mix(in oklab, oklch(0.78 0.25 305) 55%, transparent)",
                    }}
                    aria-hidden
                  />
                  <span
                    className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                      done ? "opacity-100 scale-100" : "opacity-0 scale-90"
                    }`}
                    style={{
                      background: "color-mix(in oklab, oklch(0.78 0.25 305) 22%, transparent)",
                      boxShadow: "0 0 12px oklch(0.78 0.25 305 / 0.5)",
                      border: "1px solid color-mix(in oklab, oklch(0.78 0.25 305) 55%, transparent)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                      <path
                        d="M5 12l4 4 10-10"
                        stroke={PURPLE_BRIGHT}
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
                <span className="text-sm font-medium text-white/90">{r.t}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom: looping dollars video, tinted purple to match the page */}
      <div className="relative border-t border-white/10">
        <video
          src="/dollars.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="block h-32 w-full object-cover"
          style={{
            filter:
              "hue-rotate(220deg) saturate(1.4) brightness(0.85) contrast(1.05)",
          }}
        />
        {/* purple gradient overlay so it blends with the dark UI */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(180deg, oklch(0.08 0.02 280 / 0.55) 0%, oklch(0.08 0.02 280 / 0.15) 35%, transparent 60%, oklch(0.45 0.3 295 / 0.35) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${PURPLE} 0%, transparent 55%)`,
            opacity: 0.35,
            mixBlendMode: "screen",
          }}
        />
        {/* corner badge */}
        <div className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/85 backdrop-blur">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{
              background: PURPLE_BRIGHT,
              boxShadow: `0 0 6px ${PURPLE}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const PURPLE = "oklch(0.78 0.25 305)";
  const PURPLE_BRIGHT = "oklch(0.95 0.15 305)";
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: PURPLE_BRIGHT, boxShadow: `0 0 10px ${PURPLE}` }}
            />
            <span className="text-[11px] font-semibold tracking-wide text-white/90">
              Live preview
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-semibold text-white/80">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: "#ff6b6b", boxShadow: "0 0 8px rgba(255,107,107,0.7)" }}
            />
            Live
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/60">
          Watch the agent stream its progress in real time from the dashboard.
        </p>
      </div>
      <div className="relative border-t border-white/10">
        <video
          src="/dollars.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="block h-48 w-full object-cover"
          style={{
            filter: "hue-rotate(220deg) saturate(1.4) brightness(0.85) contrast(1.05)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(180deg, oklch(0.08 0.02 280 / 0.55) 0%, oklch(0.08 0.02 280 / 0.15) 35%, transparent 60%, oklch(0.45 0.3 295 / 0.35) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${PURPLE} 0%, transparent 55%)`,
            opacity: 0.35,
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute left-3 top-3 flex h-6 items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 text-[11px] text-white/85 backdrop-blur">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{
              background: PURPLE_BRIGHT,
              boxShadow: `0 0 6px ${PURPLE}`,
            }}
          />
          Live feed
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  const stats = [
    { v: "98%", l: "Success rate" },
    { v: "1.2k", l: "Runs / week" },
    { v: "−50%", l: "Cost saved" },
    { v: "24/7", l: "Always on" },
  ];
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {stats.map((s, i) => (
        <div
          key={i}
          className="rounded-md border border-white/5 bg-white/[0.02] p-3"
        >
          <div className="text-lg font-semibold text-white">
            <span className="text-[oklch(0.85_0.18_305)]">{s.v}</span>
          </div>
          <div className="text-[11px] text-foreground/55">{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 text-center">
      <h3 className="bg-gradient-to-b from-white to-[oklch(0.78_0.25_305)] bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
        Ready to launch your first agent?
      </h3>
      <p className="mx-auto mt-4 max-w-md text-foreground/60">
        Spin up a workflow in minutes. No infra, no glue code.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[oklch(0.55_0.28_300)] to-[oklch(0.78_0.25_305)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_30px_oklch(0.55_0.28_300_/_0.5)] transition-all hover:shadow-[0_0_50px_oklch(0.78_0.25_305_/_0.7)]">
          Start free
        </button>
        <button className="rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-medium text-foreground/90 backdrop-blur transition-colors hover:bg-white/10">
          Read docs
        </button>
      </div>
    </section>
  );
}
