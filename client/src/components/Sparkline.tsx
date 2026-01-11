import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showArea?: boolean;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#ff10f0',
  fillColor,
  showArea = true,
  showDots = false,
  className,
}: SparklineProps) {
  const { path, areaPath, points } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', points: [] };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    
    const xStep = (width - padding * 2) / (data.length - 1);
    
    const pts = data.map((value, index) => ({
      x: padding + index * xStep,
      y: height - padding - ((value - min) / range) * (height - padding * 2),
    }));

    // Create smooth curve using quadratic bezier
    let linePath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = (prev.x + curr.x) / 2;
      linePath += ` Q ${cpX} ${prev.y} ${cpX} ${(prev.y + curr.y) / 2}`;
      if (i === pts.length - 1) {
        linePath += ` T ${curr.x} ${curr.y}`;
      }
    }

    // Simpler path for area
    let simplePath = `M ${pts[0].x} ${pts[0].y}`;
    pts.slice(1).forEach(p => {
      simplePath += ` L ${p.x} ${p.y}`;
    });

    // Area path (closed)
    const area = `${simplePath} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    return { path: simplePath, areaPath: area, points: pts };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div 
        className={cn('flex items-center justify-center text-xs text-muted-foreground', className)}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  const trend = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'flat';
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : color;

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor || trendColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fillColor || trendColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
        />
      )}

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={trendColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots && points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={i === points.length - 1 ? 3 : 2}
          fill={i === points.length - 1 ? trendColor : 'transparent'}
          stroke={trendColor}
          strokeWidth="1"
        />
      ))}

      {/* End dot (always show) */}
      <circle
        cx={points[points.length - 1]?.x}
        cy={points[points.length - 1]?.y}
        r="3"
        fill={trendColor}
      />
    </svg>
  );
}

// Mini bar chart
interface MiniBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function MiniBarChart({
  data,
  width = 100,
  height = 30,
  color = '#ff10f0',
  className,
}: MiniBarChartProps) {
  const bars = useMemo(() => {
    if (data.length === 0) return [];

    const max = Math.max(...data);
    const barWidth = (width - (data.length - 1) * 2) / data.length;
    const padding = 2;

    return data.map((value, index) => ({
      x: index * (barWidth + 2),
      height: ((value / max) * (height - padding * 2)) || 2,
      value,
    }));
  }, [data, width, height]);

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={height - bar.height - 2}
          width={(width - (data.length - 1) * 2) / data.length}
          height={bar.height}
          rx="2"
          fill={color}
          opacity={0.3 + (bar.value / Math.max(...data)) * 0.7}
        />
      ))}
    </svg>
  );
}

// Donut/Ring chart
interface DonutChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  className?: string;
}

export function DonutChart({
  value,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = '#ff10f0',
  backgroundColor = 'rgba(255,255,255,0.1)',
  showValue = true,
  className,
}: DonutChartProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-bold">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Metric card with sparkline
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  data?: number[];
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  data,
  icon,
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn(
      'p-4 rounded-xl bg-card/60 border border-white/10',
      'hover:border-white/20 transition-colors',
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {change !== undefined && (
            <div className={cn(
              'text-xs flex items-center gap-1',
              isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
        </div>
        
        {data && data.length > 1 && (
          <Sparkline data={data} width={60} height={24} />
        )}
      </div>
    </div>
  );
}
