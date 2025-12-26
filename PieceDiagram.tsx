import type { GrainDirection } from '@/shared/types';

type Edge = 'top' | 'right' | 'bottom' | 'left';

interface PieceDiagramProps {
  length: number;
  width: number;
  marginValue: number;
  selectedEdges: Set<Edge>;
  onEdgeClick: (edge: Edge) => void;
  grainDirection: GrainDirection;
}

export default function PieceDiagram({
  length,
  width,
  marginValue,
  selectedEdges,
  onEdgeClick,
  grainDirection,
}: PieceDiagramProps) {
  const maxDimension = Math.max(length, width);
  const scale = 200 / maxDimension;
  const scaledLength = length * scale;
  const scaledWidth = width * scale;
  const scaledMargin = marginValue * scale;

  const svgWidth = 300;
  const svgHeight = 300;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  const rectX = centerX - scaledLength / 2;
  const rectY = centerY - scaledWidth / 2;

  const edges = [
    { 
      name: 'top' as const, 
      x1: rectX, 
      y1: rectY, 
      x2: rectX + scaledLength, 
      y2: rectY,
      labelX: centerX,
      labelY: rectY - 15,
      label: `${length} سم`
    },
    { 
      name: 'right' as const, 
      x1: rectX + scaledLength, 
      y1: rectY, 
      x2: rectX + scaledLength, 
      y2: rectY + scaledWidth,
      labelX: rectX + scaledLength + 15,
      labelY: centerY,
      label: `${width} سم`
    },
    { 
      name: 'bottom' as const, 
      x1: rectX, 
      y1: rectY + scaledWidth, 
      x2: rectX + scaledLength, 
      y2: rectY + scaledWidth,
      labelX: centerX,
      labelY: rectY + scaledWidth + 25,
      label: `${length} سم`
    },
    { 
      name: 'left' as const, 
      x1: rectX, 
      y1: rectY, 
      x2: rectX, 
      y2: rectY + scaledWidth,
      labelX: rectX - 15,
      labelY: centerY,
      label: `${width} سم`
    },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-amber-900">الرسم التوضيحي</h3>
        <p className="text-sm text-amber-700">انقر على الأضلاع لإضافة التحريف</p>
      </div>
      
      <svg width={svgWidth} height={svgHeight} className="mx-auto">
        {/* Main rectangle */}
        <rect
          x={rectX}
          y={rectY}
          width={scaledLength}
          height={scaledWidth}
          fill="url(#woodGradient)"
          stroke="#92400e"
          strokeWidth="2"
        />

        {/* Grain direction lines */}
        {grainDirection === 'longitudinal' ? (
          // Vertical lines for longitudinal grain
          Array.from({ length: Math.floor(scaledLength / 20) }).map((_, i) => (
            <line
              key={i}
              x1={rectX + (i + 1) * 20}
              y1={rectY}
              x2={rectX + (i + 1) * 20}
              y2={rectY + scaledWidth}
              stroke="#d97706"
              strokeWidth="1"
              opacity="0.3"
            />
          ))
        ) : (
          // Horizontal lines for transverse grain
          Array.from({ length: Math.floor(scaledWidth / 20) }).map((_, i) => (
            <line
              key={i}
              x1={rectX}
              y1={rectY + (i + 1) * 20}
              x2={rectX + scaledLength}
              y2={rectY + (i + 1) * 20}
              stroke="#d97706"
              strokeWidth="1"
              opacity="0.3"
            />
          ))
        )}

        {/* Edges */}
        {edges.map((edge) => {
          const isSelected = selectedEdges.has(edge.name);
          
          return (
            <g key={edge.name}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={isSelected ? '#ea580c' : '#92400e'}
                strokeWidth={isSelected ? 4 : 2}
                className="cursor-pointer transition-all hover:stroke-orange-600"
                onClick={() => onEdgeClick(edge.name)}
              />
              
              {/* Edge label */}
              <text
                x={edge.labelX}
                y={edge.labelY}
                fill="#78350f"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                className="pointer-events-none select-none"
              >
                {edge.label}
              </text>

              {/* Waste margin indicator */}
              {isSelected && scaledMargin > 0 && (
                <>
                  <line
                    x1={edge.name === 'left' ? edge.x1 - scaledMargin : edge.name === 'right' ? edge.x1 + scaledMargin : edge.x1}
                    y1={edge.name === 'top' ? edge.y1 - scaledMargin : edge.name === 'bottom' ? edge.y1 + scaledMargin : edge.y1}
                    x2={edge.name === 'left' ? edge.x2 - scaledMargin : edge.name === 'right' ? edge.x2 + scaledMargin : edge.x2}
                    y2={edge.name === 'top' ? edge.y2 - scaledMargin : edge.name === 'bottom' ? edge.y2 + scaledMargin : edge.y2}
                    stroke="#ea580c"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <text
                    x={edge.labelX}
                    y={edge.name === 'top' ? edge.labelY - 15 : edge.name === 'bottom' ? edge.labelY + 15 : edge.labelY}
                    fill="#ea580c"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {marginValue} سم
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
