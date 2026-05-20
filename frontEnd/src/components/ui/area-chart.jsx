import { localPoint } from "@visx/event";
import { curveMonotoneX } from "@visx/curve";
import { GridColumns, GridRows } from "@visx/grid";
import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import { bisector } from "d3-array";
import {
  motion,
  useMotionTemplate,
  useSpring,
} from "motion/react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Utils ───────────────────────────────────────────────────────────────────

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Chart Context ───────────────────────────────────────────────────────────

const chartCssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  foregroundMuted: "var(--chart-foreground-muted)",
  label: "var(--chart-label)",
  linePrimary: "var(--chart-line-primary)",
  lineSecondary: "var(--chart-line-secondary)",
  crosshair: "var(--chart-crosshair)",
  grid: "var(--chart-grid)",
  indicatorColor: "var(--chart-indicator-color)",
  indicatorSecondaryColor: "var(--chart-indicator-secondary-color)",
  markerBackground: "var(--chart-marker-background)",
  markerBorder: "var(--chart-marker-border)",
  markerForeground: "var(--chart-marker-foreground)",
  badgeBackground: "var(--chart-marker-badge-background)",
  badgeForeground: "var(--chart-marker-badge-foreground)",
  segmentBackground: "var(--chart-segment-background)",
  segmentLine: "var(--chart-segment-line)",
};

const ChartContext = createContext(null);

function ChartProvider({
  children,
  value,
}) {
  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
}

function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(
      "useChart must be used within a ChartProvider. " +
        "Make sure your component is wrapped in <AreaChart>."
    );
  }
  return context;
}

// ─── useChartInteraction ─────────────────────────────────────────────────────

function useChartInteraction({
  xScale,
  yScale,
  data,
  lines,
  margin,
  xAccessor,
  bisectDate,
  canInteract,
}) {
  const [tooltipData, setTooltipData] = useState(null);
  const [selection, setSelection] = useState(null);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  const resolveTooltipFromX = useCallback(
    (pixelX) => {
      const x0 = xScale.invert(pixelX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];

      if (!d0) {
        return null;
      }

      let d = d0;
      let finalIndex = index - 1;
      if (d1) {
        const d0Time = xAccessor(d0).getTime();
        const d1Time = xAccessor(d1).getTime();
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          d = d1;
          finalIndex = index;
        }
      }

      const yPositions = {};
      for (const line of lines) {
        const value = d[line.dataKey];
        if (typeof value === "number") {
          yPositions[line.dataKey] = yScale(value) ?? 0;
        }
      }

      return {
        point: d,
        index: finalIndex,
        x: xScale(xAccessor(d)) ?? 0,
        yPositions,
      };
    },
    [xScale, yScale, data, lines, xAccessor, bisectDate]
  );

  const resolveIndexFromX = useCallback(
    (pixelX) => {
      const x0 = xScale.invert(pixelX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      if (!d0) {
        return 0;
      }
      if (d1) {
        const d0Time = xAccessor(d0).getTime();
        const d1Time = xAccessor(d1).getTime();
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          return index;
        }
      }
      return index - 1;
    },
    [xScale, data, xAccessor, bisectDate]
  );

  const getChartX = useCallback(
    (
      event,
      touchIndex = 0
    ) => {
      let point;

      if ("touches" in event) {
        const touch = event.touches[touchIndex];
        if (!touch) {
          return null;
        }
        const svg = event.currentTarget.ownerSVGElement;
        if (!svg) {
          return null;
        }
        point = localPoint(svg, touch);
      } else {
        point = localPoint(event);
      }

      if (!point) {
        return null;
      }
      return point.x - margin.left;
    },
    [margin.left]
  );

  const handleMouseMove = useCallback(
    (event) => {
      const chartX = getChartX(event);
      if (chartX === null) {
        return;
      }

      if (isDraggingRef.current) {
        const startX = Math.min(dragStartXRef.current, chartX);
        const endX = Math.max(dragStartXRef.current, chartX);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
        return;
      }

      const tooltip = resolveTooltipFromX(chartX);
      if (tooltip) {
        setTooltipData(tooltip);
      }
    },
    [getChartX, resolveTooltipFromX, resolveIndexFromX]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null);
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
    setSelection(null);
  }, []);

  const handleMouseDown = useCallback(
    (event) => {
      const chartX = getChartX(event);
      if (chartX === null) {
        return;
      }
      isDraggingRef.current = true;
      dragStartXRef.current = chartX;
      setTooltipData(null);
      setSelection(null);
    },
    [getChartX]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
    setSelection(null);
  }, []);

  const handleTouchStart = useCallback(
    (event) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const chartX = getChartX(event, 0);
        if (chartX === null) {
          return;
        }
        const tooltip = resolveTooltipFromX(chartX);
        if (tooltip) {
          setTooltipData(tooltip);
        }
      } else if (event.touches.length === 2) {
        event.preventDefault();
        setTooltipData(null);
        const x0 = getChartX(event, 0);
        const x1 = getChartX(event, 1);
        if (x0 === null || x1 === null) {
          return;
        }
        const startX = Math.min(x0, x1);
        const endX = Math.max(x0, x1);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
      }
    },
    [getChartX, resolveTooltipFromX, resolveIndexFromX]
  );

  const handleTouchMove = useCallback(
    (event) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const chartX = getChartX(event, 0);
        if (chartX === null) {
          return;
        }
        const tooltip = resolveTooltipFromX(chartX);
        if (tooltip) {
          setTooltipData(tooltip);
        }
      } else if (event.touches.length === 2) {
        event.preventDefault();
        const x0 = getChartX(event, 0);
        const x1 = getChartX(event, 1);
        if (x0 === null || x1 === null) {
          return;
        }
        const startX = Math.min(x0, x1);
        const endX = Math.max(x0, x1);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
      }
    },
    [getChartX, resolveTooltipFromX, resolveIndexFromX]
  );

  const handleTouchEnd = useCallback(() => {
    setTooltipData(null);
    setSelection(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const interactionHandlers = canInteract
    ? {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
      }
    : {};

  const interactionStyle = {
    cursor: canInteract ? "crosshair" : "default",
    touchAction: "none",
  };

  return {
    tooltipData,
    setTooltipData,
    selection,
    clearSelection,
    interactionHandlers,
    interactionStyle,
  };
}

// ─── Tooltip Components ──────────────────────────────────────────────────────

const TICKER_ITEM_HEIGHT = 24;

function DateTicker({ currentIndex, labels, visible }) {
  const parsedLabels = useMemo(() => {
    return labels.map((label) => {
      const parts = label.split(" ");
      const month = parts[0] || "";
      const day = parts[1] || "";
      return { month, day, full: label };
    });
  }, [labels]);

  const monthIndices = useMemo(() => {
    const uniqueMonths = [];
    const indices = [];

    parsedLabels.forEach((label, index) => {
      if (uniqueMonths.length === 0 || uniqueMonths.at(-1) !== label.month) {
        uniqueMonths.push(label.month);
        indices.push(index);
      }
    });

    return { uniqueMonths, indices };
  }, [parsedLabels]);

  const currentMonthIndex = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= parsedLabels.length) {
      return 0;
    }
    const currentMonth = parsedLabels[currentIndex]?.month;
    return monthIndices.uniqueMonths.indexOf(currentMonth || "");
  }, [currentIndex, parsedLabels, monthIndices]);

  const prevMonthIndexRef = useRef(-1);

  const dayY = useSpring(0, { stiffness: 400, damping: 35 });
  const monthY = useSpring(0, { stiffness: 400, damping: 35 });

  useEffect(() => {
    dayY.set(-currentIndex * TICKER_ITEM_HEIGHT);
  }, [currentIndex, dayY]);

  useEffect(() => {
    if (currentMonthIndex >= 0) {
      const isFirstRender = prevMonthIndexRef.current === -1;
      const monthChanged = prevMonthIndexRef.current !== currentMonthIndex;

      if (isFirstRender || monthChanged) {
        monthY.set(-currentMonthIndex * TICKER_ITEM_HEIGHT);
        prevMonthIndexRef.current = currentMonthIndex;
      }
    }
  }, [currentMonthIndex, monthY]);

  if (!visible || labels.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="overflow-hidden rounded-full bg-zinc-900 px-4 py-1 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      layout
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 35 },
      }}
    >
      <div className="relative h-6 overflow-hidden">
        <div className="flex items-center justify-center gap-1">
          <div className="relative h-6 overflow-hidden">
            <motion.div className="flex flex-col" style={{ y: monthY }}>
              {monthIndices.uniqueMonths.map((month) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  key={month}
                >
                  <span className="whitespace-nowrap font-medium text-sm">
                    {month}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="relative h-6 overflow-hidden">
            <motion.div className="flex flex-col" style={{ y: dayY }}>
              {parsedLabels.map((label, index) => (
                <div
                  className="flex h-6 shrink-0 items-center justify-center"
                  key={`${label.day}-${index}`}
                >
                  <span className="whitespace-nowrap font-medium text-sm">
                    {label.day}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

DateTicker.displayName = "DateTicker";

function TooltipDot({
  x,
  y,
  visible,
  color,
  size = 5,
  strokeColor = chartCssVars.background,
  strokeWidth = 2,
}) {
  const crosshairSpringConfig = { stiffness: 300, damping: 30 };
  const animatedX = useSpring(x, crosshairSpringConfig);
  const animatedY = useSpring(y, crosshairSpringConfig);

  useEffect(() => {
    animatedX.set(x);
    animatedY.set(y);
  }, [x, y, animatedX, animatedY]);

  if (!visible) {
    return null;
  }

  return (
    <motion.circle
      cx={animatedX}
      cy={animatedY}
      fill={color}
      r={size}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

TooltipDot.displayName = "TooltipDot";

function resolveWidth(width) {
  if (typeof width === "number") {
    return width;
  }
  switch (width) {
    case "line":
      return 1;
    case "thin":
      return 2;
    case "medium":
      return 4;
    case "thick":
      return 8;
    default:
      return 1;
  }
}

function TooltipIndicator({
  x,
  height,
  visible,
  width = "line",
  span,
  columnWidth,
  colorEdge = chartCssVars.crosshair,
  colorMid = chartCssVars.crosshair,
  fadeEdges = true,
  gradientId = "tooltip-indicator-gradient",
}) {
  const pixelWidth =
    span !== undefined && columnWidth !== undefined
      ? span * columnWidth
      : resolveWidth(width);

  const crosshairSpringConfig = { stiffness: 300, damping: 30 };
  const animatedX = useSpring(x - pixelWidth / 2, crosshairSpringConfig);

  useEffect(() => {
    animatedX.set(x - pixelWidth / 2);
  }, [x, animatedX, pixelWidth]);

  if (!visible) {
    return null;
  }

  const edgeOpacity = fadeEdges ? 0 : 1;

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: colorEdge, stopOpacity: edgeOpacity }}
          />
          <stop offset="10%" style={{ stopColor: colorEdge, stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: colorMid, stopOpacity: 1 }} />
          <stop offset="90%" style={{ stopColor: colorEdge, stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: colorEdge, stopOpacity: edgeOpacity }}
          />
        </linearGradient>
      </defs>
      <motion.rect
        fill={`url(#${gradientId})`}
        height={height}
        width={pixelWidth}
        x={animatedX}
        y={0}
      />
    </g>
  );
}

// ─── Tooltip Content & Box ───────────────────────────────────────────────────

function TooltipContent({ title, rows, children }) {
  return (
    <div className="px-3 py-2.5">
      {title && (
        <div className="mb-2 font-medium text-chart-tooltip-foreground text-xs">
          {title}
        </div>
      )}
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            className="flex items-center justify-between gap-4"
            key={`${row.label}-${row.color}`}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="text-chart-tooltip-muted text-sm">
                {row.label}
              </span>
            </div>
            <span className="font-medium text-chart-tooltip-foreground text-sm tabular-nums">
              {typeof row.value === "number"
                ? row.value.toLocaleString()
                : row.value}
            </span>
          </div>
        ))}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

TooltipContent.displayName = "TooltipContent";

function TooltipBox({
  x,
  y,
  visible,
  containerElement,
  containerWidth,
  containerHeight,
  offset = 16,
  className = "",
  children,
  left: leftOverride,
  top: topOverride,
  flipped: flippedOverride,
}) {
  const tooltipRef = useRef(null);
  const [tooltipWidth, setTooltipWidth] = useState(180);
  const [tooltipHeight, setTooltipHeight] = useState(80);

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const w = tooltipRef.current.offsetWidth;
      const h = tooltipRef.current.offsetHeight;
      if (w > 0 && w !== tooltipWidth) {
        setTooltipWidth(w);
      }
      if (h > 0 && h !== tooltipHeight) {
        setTooltipHeight(h);
      }
    }
  }, [tooltipWidth, tooltipHeight]);

  const shouldFlipX = x + tooltipWidth + offset > containerWidth;
  const targetX = shouldFlipX ? x - offset - tooltipWidth : x + offset;

  const targetY = Math.max(
    offset,
    Math.min(y - tooltipHeight / 2, containerHeight - tooltipHeight - offset)
  );

  const prevFlipRef = useRef(shouldFlipX);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (prevFlipRef.current !== shouldFlipX) {
      setFlipKey((k) => k + 1);
      prevFlipRef.current = shouldFlipX;
    }
  }, [shouldFlipX]);

  const springConfig = { stiffness: 100, damping: 20 };
  const animatedLeft = useSpring(targetX, springConfig);
  const animatedTop = useSpring(targetY, springConfig);

  useEffect(() => {
    animatedLeft.set(targetX);
  }, [targetX, animatedLeft]);

  useEffect(() => {
    animatedTop.set(targetY);
  }, [targetY, animatedTop]);

  const finalLeft = leftOverride ?? animatedLeft;
  const finalTop = topOverride ?? animatedTop;
  const isFlipped = flippedOverride ?? shouldFlipX;
  const transformOrigin = isFlipped ? "right top" : "left top";

  if (!containerElement || !visible) {
    return null;
  }

  return createPortal(
    <motion.div
      animate={{ opacity: 1 }}
      className={cn("pointer-events-none absolute z-50", className)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      ref={tooltipRef}
      style={{ left: finalLeft, top: finalTop }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className="min-w-[140px] overflow-hidden rounded-lg bg-zinc-950/90 border border-saas-border text-white shadow-lg backdrop-blur-md"
        initial={{ scale: 0.85, opacity: 0, x: isFlipped ? 20 : -20 }}
        key={flipKey}
        style={{ transformOrigin }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>,
    containerElement
  );
}

TooltipBox.displayName = "TooltipBox";

export function ChartTooltip({
  showDatePill = true,
  showCrosshair = true,
  showDots = true,
  content,
  rows: rowsRenderer,
  children,
  className = "",
}) {
  const {
    tooltipData,
    width,
    height,
    innerHeight,
    margin,
    columnWidth,
    lines,
    xAccessor,
    dateLabels,
    containerElement,
    orientation,
    barXAccessor,
  } = useChart();

  const isHorizontal = orientation === "horizontal";

  const visible = tooltipData !== null;
  const x = tooltipData?.x ?? 0;
  const xWithMargin = x + margin.left;

  const firstLineDataKey = lines[0]?.dataKey;
  const firstLineY = firstLineDataKey
    ? (tooltipData?.yPositions[firstLineDataKey] ?? 0)
    : 0;
  const yWithMargin = firstLineY + margin.top;

  const crosshairSpringConfig = { stiffness: 300, damping: 30 };
  const animatedX = useSpring(xWithMargin, crosshairSpringConfig);

  useEffect(() => {
    animatedX.set(xWithMargin);
  }, [xWithMargin, animatedX]);

  const tooltipRows = useMemo(() => {
    if (!tooltipData) {
      return [];
    }

    if (rowsRenderer) {
      return rowsRenderer(tooltipData.point);
    }

    return lines.map((line) => ({
      color: line.stroke,
      label: line.dataKey,
      value: tooltipData.point[line.dataKey] ?? 0,
    }));
  }, [tooltipData, lines, rowsRenderer]);

  const title = useMemo(() => {
    if (!tooltipData) {
      return undefined;
    }
    if (barXAccessor) {
      return barXAccessor(tooltipData.point);
    }
    return xAccessor(tooltipData.point).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [tooltipData, barXAccessor, xAccessor]);

  if (!containerElement) {
    return null;
  }

  const tooltipContent = (
    <>
      {showCrosshair && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          height="100%"
          width="100%"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            <TooltipIndicator
              colorEdge={chartCssVars.crosshair}
              colorMid={chartCssVars.crosshair}
              columnWidth={columnWidth}
              fadeEdges
              height={innerHeight}
              visible={visible}
              width="line"
              x={x}
            />
          </g>
        </svg>
      )}

      {showDots && visible && !isHorizontal && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          height="100%"
          width="100%"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {lines.map((line) => (
              <TooltipDot
                color={line.stroke}
                key={line.dataKey}
                strokeColor={chartCssVars.background}
                visible={visible}
                x={tooltipData?.xPositions?.[line.dataKey] ?? x}
                y={tooltipData?.yPositions[line.dataKey] ?? 0}
              />
            ))}
          </g>
        </svg>
      )}

      <TooltipBox
        className={className}
        containerHeight={height}
        containerElement={containerElement}
        containerWidth={width}
        top={isHorizontal ? undefined : margin.top}
        visible={visible}
        x={xWithMargin}
        y={isHorizontal ? yWithMargin : margin.top}
      >
        {content ? (
          content({
            point: tooltipData?.point ?? {},
            index: tooltipData?.index ?? 0,
          })
        ) : (
          <TooltipContent rows={tooltipRows} title={title}>
            {children}
          </TooltipContent>
        )}
      </TooltipBox>

      {showDatePill && dateLabels.length > 0 && visible && !isHorizontal && (
        <motion.div
          className="pointer-events-none absolute z-50"
          style={{
            left: animatedX,
            transform: "translateX(-50%)",
            bottom: 4,
          }}
        >
          <DateTicker
            currentIndex={tooltipData?.index ?? 0}
            labels={dateLabels}
            visible={visible}
          />
        </motion.div>
      )}
    </>
  );

  return createPortal(tooltipContent, containerElement);
}

ChartTooltip.displayName = "ChartTooltip";

// ─── Grid ────────────────────────────────────────────────────────────────────

export function Grid({
  horizontal = true,
  vertical = false,
  numTicksRows = 5,
  numTicksColumns = 10,
  rowTickValues,
  stroke = chartCssVars.grid,
  strokeOpacity = 1,
  strokeWidth = 1,
  strokeDasharray = "4,4",
  fadeHorizontal = true,
  fadeVertical = false,
}) {
  const { xScale, yScale, innerWidth, innerHeight, orientation, barScale } =
    useChart();

  const isHorizontalBarChart = orientation === "horizontal" && barScale;
  const columnScale = isHorizontalBarChart ? yScale : xScale;
  const uniqueId = useId();

  const hMaskId = `grid-rows-fade-${uniqueId}`;
  const hGradientId = `${hMaskId}-gradient`;
  const vMaskId = `grid-cols-fade-${uniqueId}`;
  const vGradientId = `${vMaskId}-gradient`;

  return (
    <g className="chart-grid">
      {horizontal && fadeHorizontal && (
        <defs>
          <linearGradient id={hGradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0 }} />
            <stop offset="10%" style={{ stopColor: "white", stopOpacity: 1 }} />
            <stop offset="90%" style={{ stopColor: "white", stopOpacity: 1 }} />
            <stop
              offset="100%"
              style={{ stopColor: "white", stopOpacity: 0 }}
            />
          </linearGradient>
          <mask id={hMaskId}>
            <rect
              fill={`url(#${hGradientId})`}
              height={innerHeight}
              width={innerWidth}
              x="0"
              y="0"
            />
          </mask>
        </defs>
      )}

      {vertical && fadeVertical && (
        <defs>
          <linearGradient id={vGradientId} x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0 }} />
            <stop offset="10%" style={{ stopColor: "white", stopOpacity: 1 }} />
            <stop offset="90%" style={{ stopColor: "white", stopOpacity: 1 }} />
            <stop
              offset="100%"
              style={{ stopColor: "white", stopOpacity: 0 }}
            />
          </linearGradient>
          <mask id={vMaskId}>
            <rect
              fill={`url(#${vGradientId})`}
              height={innerHeight}
              width={innerWidth}
              x="0"
              y="0"
            />
          </mask>
        </defs>
      )}

      {horizontal && (
        <g mask={fadeHorizontal ? `url(#${hMaskId})` : undefined}>
          <GridRows
            numTicks={rowTickValues ? undefined : numTicksRows}
            scale={yScale}
            stroke={stroke}
            strokeDasharray={strokeDasharray}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            tickValues={rowTickValues}
            width={innerWidth}
          />
        </g>
      )}
      {vertical && columnScale && typeof columnScale === "function" && (
        <g mask={fadeVertical ? `url(#${vMaskId})` : undefined}>
          <GridColumns
            height={innerHeight}
            numTicks={numTicksColumns}
            scale={columnScale}
            stroke={stroke}
            strokeDasharray={strokeDasharray}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
          />
        </g>
      )}
    </g>
  );
}

Grid.displayName = "Grid";

// ─── XAxis ───────────────────────────────────────────────────────────────────

function XAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth,
}) {
  const fadeBuffer = 20;
  const fadeRadius = tickerHalfWidth + fadeBuffer;

  let opacity = 1;
  if (isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX);
    if (distance < tickerHalfWidth) {
      opacity = 0;
    } else if (distance < fadeRadius) {
      opacity = (distance - tickerHalfWidth) / fadeBuffer;
    }
  }

  return (
    <div
      className="absolute"
      style={{
        left: x,
        bottom: 12,
        width: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.span
        animate={{ opacity }}
        className={cn("whitespace-nowrap text-zinc-500 text-xs")}
        initial={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export function XAxis({ numTicks = 5, tickerHalfWidth = 50 }) {
  const { xScale, margin, tooltipData, containerElement } = useChart();

  const labelsToShow = useMemo(() => {
    const domain = xScale.domain();
    const startDate = domain[0];
    const endDate = domain[1];

    if (!(startDate && endDate)) {
      return [];
    }

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const timeRange = endTime - startTime;

    const tickCount = Math.max(2, numTicks);
    const dates = [];

    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const time = startTime + t * timeRange;
      dates.push(new Date(time));
    }

    return dates.map((date) => ({
      date,
      x: (xScale(date) ?? 0) + margin.left,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [xScale, margin.left, numTicks]);

  const isHovering = tooltipData !== null;
  const crosshairX = tooltipData ? tooltipData.x + margin.left : null;

  if (!containerElement) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {labelsToShow.map((item) => (
        <XAxisLabel
          crosshairX={crosshairX}
          isHovering={isHovering}
          key={`${item.label}-${item.x}`}
          label={item.label}
          tickerHalfWidth={tickerHalfWidth}
          x={item.x}
        />
      ))}
    </div>,
    containerElement
  );
}

XAxis.displayName = "XAxis";

// ─── YAxis ───────────────────────────────────────────────────────────────────

export function YAxis({
  numTicks = 5,
  formatValue,
}) {
  const { yScale, margin, containerElement } = useChart();

  const ticks = useMemo(() => {
    const domain = yScale.domain();
    const min = domain[0];
    const max = domain[1];
    const step = (max - min) / (numTicks - 1);

    return Array.from({ length: numTicks }, (_, i) => {
      const value = min + step * i;
      return {
        value,
        y: (yScale(value) ?? 0) + margin.top,
        label: formatValue
          ? formatValue(value)
          : value >= 1000
            ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
            : value.toLocaleString(),
      };
    });
  }, [yScale, margin.top, numTicks, formatValue]);

  if (!containerElement) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {ticks.map((tick) => (
        <div
          key={tick.value}
          className="absolute"
          style={{
            left: 0,
            top: tick.y,
            width: margin.left - 8,
            display: "flex",
            justifyContent: "flex-end",
            transform: "translateY(-50%)",
          }}
        >
          <span className="whitespace-nowrap text-zinc-500 text-xs tabular-nums">
            {tick.label}
          </span>
        </div>
      ))}
    </div>,
    containerElement
  );
}

YAxis.displayName = "YAxis";

// ─── Area ────────────────────────────────────────────────────────────────────

export function Area({
  dataKey,
  fill = chartCssVars.linePrimary,
  fillOpacity = 0.4,
  stroke,
  strokeWidth = 2,
  curve = curveMonotoneX,
  animate = true,
  showLine = true,
  showHighlight = true,
  gradientToOpacity = 0,
  fadeEdges = false,
}) {
  const {
    data,
    xScale,
    yScale,
    innerHeight,
    innerWidth,
    tooltipData,
    selection,
    isLoaded,
    animationDuration,
    xAccessor,
  } = useChart();

  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [clipWidth, setClipWidth] = useState(0);
  const [pathD, setPathD] = useState("");

  const uniqueId = useId();
  const cleanId = uniqueId.replace(/:/g, "-");
  
  const gradientId = `area-gradient-${dataKey}-${cleanId}`;
  const strokeGradientId = `area-stroke-gradient-${dataKey}-${cleanId}`;
  const edgeMaskId = `area-edge-mask-${dataKey}-${cleanId}`;
  const edgeGradientId = `${edgeMaskId}-gradient`;

  const resolvedStroke = stroke || fill;

  // Use callback ref to safely measure path DOM properties without reading ref during render
  const pathCallbackRef = useCallback((node) => {
    if (node) {
      pathRef.current = node;
      const len = node.getTotalLength();
      setPathLength(len);
      const dAttr = node.getAttribute("d") || "";
      setPathD(dAttr);
    }
  }, []);

  useEffect(() => {
    if (pathLength > 0 && !isLoaded) {
      requestAnimationFrame(() => {
        setClipWidth(innerWidth);
      });
    }
  }, [innerWidth, isLoaded, pathLength]);

  const [segmentBounds, setSegmentBounds] = useState({ startLength: 0, segmentLength: 0, isActive: false });

  // Handle segment path-length calculations safely inside useEffect after component has updated
  useEffect(() => {
    const path = pathRef.current;
    if (!path || pathLength === 0) {
      setSegmentBounds({ startLength: 0, segmentLength: 0, isActive: false });
      return;
    }

    const localFindLengthAtX = (targetX) => {
      let low = 0;
      let high = pathLength;
      const tolerance = 0.5;

      while (high - low > tolerance) {
        const mid = (low + high) / 2;
        const point = path.getPointAtLength(mid);
        if (point.x < targetX) {
          low = mid;
        } else {
          high = mid;
        }
      }
      return (low + high) / 2;
    };

    if (selection?.active) {
      const startLength = localFindLengthAtX(selection.startX);
      const endLength = localFindLengthAtX(selection.endX);
      setSegmentBounds({
        startLength,
        segmentLength: endLength - startLength,
        isActive: true,
      });
      return;
    }

    if (!tooltipData) {
      setSegmentBounds({ startLength: 0, segmentLength: 0, isActive: false });
      return;
    }

    const idx = tooltipData.index;
    const startIdx = Math.max(0, idx - 1);
    const endIdx = Math.min(data.length - 1, idx + 1);

    const startPoint = data[startIdx];
    const endPoint = data[endIdx];
    if (!(startPoint && endPoint)) {
      setSegmentBounds({ startLength: 0, segmentLength: 0, isActive: false });
      return;
    }

    const startX = xScale(xAccessor(startPoint)) ?? 0;
    const endX = xScale(xAccessor(endPoint)) ?? 0;

    const startLength = localFindLengthAtX(startX);
    const endLength = localFindLengthAtX(endX);

    setSegmentBounds({
      startLength,
      segmentLength: endLength - startLength,
      isActive: true,
    });
  }, [tooltipData, selection, data, xScale, pathLength, xAccessor]);

  const springConfig = { stiffness: 180, damping: 28 };
  const offsetSpring = useSpring(0, springConfig);
  const segmentLengthSpring = useSpring(0, springConfig);

  const animatedDasharray = useMotionTemplate`${segmentLengthSpring} ${pathLength}`;

  useEffect(() => {
    offsetSpring.set(-segmentBounds.startLength);
    segmentLengthSpring.set(segmentBounds.segmentLength);
  }, [
    segmentBounds.startLength,
    segmentBounds.segmentLength,
    offsetSpring,
    segmentLengthSpring,
  ]);

  const getY = useCallback(
    (d) => {
      const value = d[dataKey];
      return typeof value === "number" ? (yScale(value) ?? 0) : 0;
    },
    [dataKey, yScale]
  );

  const isHovering = tooltipData !== null || selection?.active === true;
  const easing = "cubic-bezier(0.85, 0, 0.15, 1)";

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: fill, stopOpacity: fillOpacity }}
          />
          <stop
            offset="100%"
            style={{ stopColor: fill, stopOpacity: gradientToOpacity }}
          />
        </linearGradient>

        <linearGradient id={strokeGradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop
            offset="0%"
            style={{ stopColor: resolvedStroke, stopOpacity: 0 }}
          />
          <stop
            offset="15%"
            style={{ stopColor: resolvedStroke, stopOpacity: 1 }}
          />
          <stop
            offset="85%"
            style={{ stopColor: resolvedStroke, stopOpacity: 1 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: resolvedStroke, stopOpacity: 0 }}
          />
        </linearGradient>

        {fadeEdges && (
          <>
            <linearGradient
              id={edgeGradientId}
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "white", stopOpacity: 0 }}
              />
              <stop
                offset="20%"
                style={{ stopColor: "white", stopOpacity: 1 }}
              />
              <stop
                offset="80%"
                style={{ stopColor: "white", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "white", stopOpacity: 0 }}
              />
            </linearGradient>
            <mask id={edgeMaskId}>
              <rect
                fill={`url(#${edgeGradientId})`}
                height={innerHeight}
                width={innerWidth}
                x="0"
                y="0"
              />
            </mask>
          </>
        )}
      </defs>

      {animate && (
        <defs>
          <clipPath id={`grow-clip-area-${dataKey}`}>
            <rect
              height={innerHeight + 20}
              style={{
                transition:
                  !isLoaded && clipWidth > 0
                    ? `width ${animationDuration}ms ${easing}`
                    : "none",
              }}
              width={isLoaded ? innerWidth : clipWidth}
              x={0}
              y={0}
            />
          </clipPath>
        </defs>
      )}

      <g clipPath={animate ? `url(#grow-clip-area-${dataKey})` : undefined}>
        <motion.g
          animate={{ opacity: isHovering && showHighlight ? 0.6 : 1 }}
          initial={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <g mask={fadeEdges ? `url(#${edgeMaskId})` : undefined}>
            <AreaClosed
              curve={curve}
              data={data}
              fill={`url(#${gradientId})`}
              x={(d) => xScale(xAccessor(d)) ?? 0}
              y={getY}
              yScale={yScale}
            />
          </g>

          {showLine && (
            <LinePath
              curve={curve}
              data={data}
              innerRef={pathCallbackRef}
              stroke={`url(#${strokeGradientId})`}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              x={(d) => xScale(xAccessor(d)) ?? 0}
              y={getY}
            />
          )}
        </motion.g>
      </g>

      {showHighlight &&
        showLine &&
        isHovering &&
        isLoaded &&
        pathD && (
          <motion.path
            animate={{ opacity: 1 }}
            d={pathD}
            exit={{ opacity: 0 }}
            fill="none"
            initial={{ opacity: 0 }}
            stroke={resolvedStroke}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{
              strokeDasharray: animatedDasharray,
              strokeDashoffset: offsetSpring,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        )}
    </>
  );
}

Area.displayName = "Area";

// ─── Segment Components ──────────────────────────────────────────────────────

export function SegmentBackground() {
  const { selection, innerHeight } = useChart();

  if (!selection?.active) {
    return null;
  }

  const x = Math.min(selection.startX, selection.endX);
  const width = Math.abs(selection.endX - selection.startX);

  return (
    <motion.rect
      animate={{ opacity: 0.15 }}
      fill={chartCssVars.linePrimary}
      height={innerHeight}
      initial={{ opacity: 0 }}
      rx={4}
      transition={{ duration: 0.2 }}
      width={width}
      x={x}
      y={0}
    />
  );
}

SegmentBackground.displayName = "SegmentBackground";

export function SegmentLineFrom() {
  const { selection, innerHeight } = useChart();

  if (!selection?.active) {
    return null;
  }

  const x = Math.min(selection.startX, selection.endX);

  return (
    <motion.line
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      stroke={chartCssVars.linePrimary}
      strokeDasharray="4,3"
      strokeWidth={1.5}
      transition={{ duration: 0.2 }}
      x1={x}
      x2={x}
      y1={0}
      y2={innerHeight}
    />
  );
}

SegmentLineFrom.displayName = "SegmentLineFrom";

export function SegmentLineTo() {
  const { selection, innerHeight } = useChart();

  if (!selection?.active) {
    return null;
  }

  const x = Math.max(selection.startX, selection.endX);

  return (
    <motion.line
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      stroke={chartCssVars.linePrimary}
      strokeDasharray="4,3"
      strokeWidth={1.5}
      transition={{ duration: 0.2 }}
      x1={x}
      x2={x}
      y1={0}
      y2={innerHeight}
    />
  );
}

SegmentLineTo.displayName = "SegmentLineTo";

// ─── Pattern Components ──────────────────────────────────────────────────────

export function PatternLines({
  id,
  width = 6,
  height = 6,
  stroke = "var(--chart-line-primary)",
  strokeWidth = 1,
  orientation = ["diagonal"],
}) {
  const paths = [];

  for (const o of orientation) {
    if (o === "diagonal") {
      paths.push(`M0,${height}l${width},${-height}`);
      paths.push(`M${-width / 4},${height / 4}l${width / 2},${-height / 2}`);
      paths.push(`M${(3 * width) / 4},${height + height / 4}l${width / 2},${-height / 2}`);
    } else if (o === "horizontal") {
      paths.push(`M0,${height / 2}l${width},0`);
    } else if (o === "vertical") {
      paths.push(`M${width / 2},0l0,${height}`);
    }
  }

  return (
    <defs>
      <pattern
        id={id}
        width={width}
        height={height}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={paths.join(" ")}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="square"
        />
      </pattern>
    </defs>
  );
}

PatternLines.displayName = "PatternLines";

export function PatternArea({
  dataKey,
  fill = "url(#area-pattern)",
  curve = curveMonotoneX,
}) {
  const { data, xScale, yScale, xAccessor } = useChart();

  const getY = useCallback(
    (d) => {
      const value = d[dataKey];
      return typeof value === "number" ? (yScale(value) ?? 0) : 0;
    },
    [dataKey, yScale]
  );

  return (
    <AreaClosed
      curve={curve}
      data={data}
      fill={fill}
      x={(d) => xScale(xAccessor(d)) ?? 0}
      y={getY}
      yScale={yScale}
    />
  );
}

PatternArea.displayName = "PatternArea";

// ─── AreaChart ───────────────────────────────────────────────────────────────

function isPostOverlayComponent(child) {
  const childType = child.type;

  if (childType?.__isChartMarkers) {
    return true;
  }

  const componentName =
    typeof child.type === "function"
      ? childType?.displayName || childType?.name || ""
      : "";

  return componentName === "ChartMarkers" || componentName === "MarkerGroup";
}

function extractAreaConfigs(children) {
  const configs = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    const childType = child.type;
    const componentName =
      typeof child.type === "function"
        ? childType?.displayName || childType?.name || ""
        : "";

    const props = child.props;
    const isAreaComponent =
      componentName === "Area" ||
      child.type === Area ||
      (props && typeof props.dataKey === "string" && props.dataKey.length > 0);

    if (isAreaComponent && props?.dataKey) {
      configs.push({
        dataKey: props.dataKey,
        stroke: props.stroke || props.fill || "var(--chart-line-primary)",
        strokeWidth: props.strokeWidth || 2,
      });
    }
  });

  return configs;
}

const DEFAULT_MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };

function ChartInner({
  width,
  height,
  data,
  xDataKey,
  margin,
  animationDuration,
  children,
  containerElement,
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const lines = useMemo(() => extractAreaConfigs(children), [children]);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xAccessor = useCallback(
    (d) => {
      const value = d[xDataKey];
      return value instanceof Date ? value : new Date(value);
    },
    [xDataKey]
  );

  const bisectDate = useMemo(
    () => bisector((d) => xAccessor(d)).left,
    [xAccessor]
  );

  const xScale = useMemo(() => {
    const dates = data.map((d) => xAccessor(d));
    const minTime = Math.min(...dates.map((d) => d.getTime()));
    const maxTime = Math.max(...dates.map((d) => d.getTime()));

    return scaleTime({
      range: [0, innerWidth],
      domain: [minTime, maxTime],
    });
  }, [innerWidth, data, xAccessor]);

  const columnWidth = useMemo(() => {
    if (data.length < 2) {
      return 0;
    }
    return innerWidth / (data.length - 1);
  }, [innerWidth, data.length]);

  const yScale = useMemo(() => {
    let maxValue = 0;
    for (const line of lines) {
      for (const d of data) {
        const value = d[line.dataKey];
        if (typeof value === "number" && value > maxValue) {
          maxValue = value;
        }
      }
    }

    if (maxValue === 0) {
      maxValue = 100;
    }

    return scaleLinear({
      range: [innerHeight, 0],
      domain: [0, maxValue * 1.1],
      nice: true,
    });
  }, [innerHeight, data, lines]);

  const dateLabels = useMemo(
    () =>
      data.map((d) =>
        xAccessor(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
    [data, xAccessor]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, animationDuration);
    return () => clearTimeout(timer);
  }, [animationDuration]);

  const canInteract = isLoaded;

  const {
    tooltipData,
    selection,
    interactionHandlers,
    interactionStyle,
  } = useChartInteraction({
    xScale,
    yScale,
    data,
    lines,
    margin,
    xAccessor,
    bisectDate,
    canInteract,
  });

  if (width < 10 || height < 10) {
    return null;
  }

  const preOverlayChildren = [];
  const postOverlayChildren = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }

    if (isPostOverlayComponent(child)) {
      postOverlayChildren.push(child);
    } else {
      preOverlayChildren.push(child);
    }
  });

  const contextValue = {
    data,
    xScale,
    yScale,
    width,
    height,
    innerWidth,
    innerHeight,
    margin,
    columnWidth,
    tooltipData,
    containerElement,
    lines,
    isLoaded,
    animationDuration,
    xAccessor,
    dateLabels,
    selection,
  };

  return (
    <ChartProvider value={contextValue}>
      <svg aria-hidden="true" height={height} width={width}>
        <defs>
          <clipPath id="chart-area-grow-clip">
            <rect
              height={innerHeight + 20}
              style={{
                transition: isLoaded
                  ? "none"
                  : `width ${animationDuration}ms cubic-bezier(0.85, 0, 0.15, 1)`,
              }}
              width={isLoaded ? innerWidth : 0}
              x={0}
              y={0}
            />
          </clipPath>
        </defs>

        <rect fill="transparent" height={height} width={width} x={0} y={0} />

        <g
          {...interactionHandlers}
          style={interactionStyle}
          transform={`translate(${margin.left},${margin.top})`}
        >
          <rect
            fill="transparent"
            height={innerHeight}
            width={innerWidth}
            x={0}
            y={0}
          />

          {preOverlayChildren}
          {postOverlayChildren}
        </g>
      </svg>
    </ChartProvider>
  );
}

export function AreaChart({
  data,
  xDataKey = "date",
  margin: marginProp,
  animationDuration = 1100,
  aspectRatio = "2.6 / 1",
  className = "",
  children,
}) {
  const [containerElement, setContainerElement] = useState(null);
  
  const containerRef = useCallback((node) => {
    if (node) {
      setContainerElement(node);
    }
  }, []);
  
  const margin = { ...DEFAULT_MARGIN, ...marginProp };

  return (
    <div
      className={cn("relative w-full", className)}
      ref={containerRef}
      style={{ aspectRatio, touchAction: "none" }}
    >
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <ChartInner
            animationDuration={animationDuration}
            containerElement={containerElement}
            data={data}
            height={height}
            margin={margin}
            width={width}
            xDataKey={xDataKey}
          >
            {children}
          </ChartInner>
        )}
      </ParentSize>
    </div>
  );
}

export default AreaChart;
