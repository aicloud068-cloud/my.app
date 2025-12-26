import { ArrowRight, Ruler, Scissors, RotateCcw, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import type { WoodPiece, BoardSize } from '@/shared/types';
import { calculateCutLayout } from '@/react-app/utils/cutOptimizer';

interface ResultsViewProps {
  projectName: string;
  customerName: string;
  phoneNumber: string;
  boardSize: BoardSize;
  pieces: WoodPiece[];
  onBack: () => void;
  onReset: () => void;
}

export default function ResultsView({ projectName, customerName, phoneNumber, boardSize, pieces, onBack, onReset }: ResultsViewProps) {
  const layout = useMemo(() => calculateCutLayout(boardSize, pieces), [boardSize, pieces]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWasteMeters = (layout.totalWaste / 100).toFixed(2);

  const getEdgeDirectionText = (piece: WoodPiece): string => {
    const edges: string[] = [];
    if (piece.edgeMargins.top > 0) edges.push('أعلى');
    if (piece.edgeMargins.right > 0) edges.push('يمين');
    if (piece.edgeMargins.bottom > 0) edges.push('أسفل');
    if (piece.edgeMargins.left > 0) edges.push('يسار');
    return edges.length > 0 ? edges.join(' + ') : 'بدون تحريف';
  };

  const generateExcelFile = (): string => {
    const workbook = XLSX.utils.book_new();

    const kdtData: (string | number)[][] = [
      ['قائمة القطع - KDT'],
      projectName ? ['اسم المشروع:', projectName] : [],
      customerName ? ['اسم الزبون:', customerName] : [],
      phoneNumber ? ['رقم الهاتف:', phoneNumber] : [],
      [''],
      ['التصنيف', 'الطول (سم)', 'العرض (سم)', 'العدد', 'اتجاه العرق', 'اتجاه التحريف', 'هامش التحريف (سم)'],
    ].filter(row => row.length > 0);
    
    pieces.forEach(piece => {
      const edgeDirection = getEdgeDirectionText(piece);
      const totalMargin = piece.edgeMargins.top + piece.edgeMargins.right + 
                          piece.edgeMargins.bottom + piece.edgeMargins.left;
      const grainText = piece.grainDirection === 'longitudinal' ? 'طولي' : 'عرضي';
      
      kdtData.push([
        piece.category,
        piece.length,
        piece.width,
        piece.quantity,
        grainText,
        edgeDirection,
        totalMargin,
      ]);
    });

    kdtData.push([]);
    kdtData.push(['ملخص المشروع']);
    kdtData.push(['قياس اللوح الأساسي - الطول', boardSize.length]);
    kdtData.push(['قياس اللوح الأساسي - العرض', boardSize.width]);
    kdtData.push(['عدد الألواح المطلوبة', layout.boardsNeeded]);
    kdtData.push(['إجمالي القطع', pieces.reduce((sum, p) => sum + p.quantity, 0)]);
    kdtData.push(['هدر التحريف (متر)', totalWasteMeters]);

    const kdtSheet = XLSX.utils.aoa_to_sheet(kdtData);
    kdtSheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, kdtSheet, 'KDT');

    // Generate base64 string
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
    return excelBuffer;
  };

  const submitOrderToSupabase = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const excelFile = generateExcelFile();
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          phoneNumber,
          excelFile,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit order');
      }

      alert('✅ تم إرسال الطلب بنجاح إلى قاعدة البيانات');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('❌ حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-amber-900 hover:text-amber-700 font-semibold transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                العودة للتعديل
              </button>
              
              <button
                onClick={onReset}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                بدء من جديد
              </button>
            </div>
            
            <button
              onClick={submitOrderToSupabase}
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال للأونر'}
            </button>
          </div>
          
          {(projectName || customerName || phoneNumber) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              {projectName && <p className="text-blue-900 font-bold text-lg">📋 المشروع: {projectName}</p>}
              {customerName && <p className="text-blue-900 font-semibold">👤 الزبون: {customerName}</p>}
              {phoneNumber && <p className="text-blue-900 font-semibold">📱 الهاتف: {phoneNumber}</p>}
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-amber-900 mb-2">نتائج التقسيم</h1>
          <p className="text-amber-700">خطة القص الأمثل للألواح الخشبية</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Ruler className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">عدد الألواح</h3>
            </div>
            <p className="text-4xl font-bold text-amber-600">{layout.boardsNeeded}</p>
            <p className="text-sm text-amber-700 mt-1">لوح مطلوب</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Scissors className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">إجمالي القطع</h3>
            </div>
            <p className="text-4xl font-bold text-orange-600">
              {pieces.reduce((sum, p) => sum + p.quantity, 0)}
            </p>
            <p className="text-sm text-amber-700 mt-1">قطعة</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">هدر التحريف</h3>
            </div>
            <p className="text-4xl font-bold text-red-600">{totalWasteMeters}</p>
            <p className="text-sm text-amber-700 mt-1">متر تقريباً</p>
          </div>
        </div>

        {/* Board Layouts */}
        <div className="space-y-6">
          {Array.from({ length: layout.boardsNeeded }).map((_, boardIndex) => {
            const boardPlacements = layout.placements.filter(p => p.boardIndex === boardIndex);
            
            return (
              <div key={boardIndex} className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4">
                  اللوح رقم {boardIndex + 1}
                </h3>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                  <svg
                    width="100%"
                    viewBox={`0 0 ${boardSize.length} ${boardSize.width}`}
                    className="max-w-full"
                    style={{ maxHeight: '500px' }}
                  >
                    {/* Board outline */}
                    <rect
                      x="0"
                      y="0"
                      width={boardSize.length}
                      height={boardSize.width}
                      fill="url(#boardGradient)"
                      stroke="#92400e"
                      strokeWidth="2"
                    />

                    {/* Placed pieces */}
                    {boardPlacements.map((placement, idx) => {
                      const piece = pieces.find(p => p.id === placement.pieceId);
                      if (!piece) return null;

                      const pieceWidth = placement.rotated ? piece.length : piece.width;
                      const pieceLength = placement.rotated ? piece.width : piece.length;
                      
                      const colors = [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <g key={`${placement.pieceId}-${idx}`}>
                          <rect
                            x={placement.x}
                            y={placement.y}
                            width={pieceLength}
                            height={pieceWidth}
                            fill={color}
                            fillOpacity="0.7"
                            stroke={color}
                            strokeWidth="1.5"
                          />
                          <text
                            x={placement.x + pieceLength / 2}
                            y={placement.y + pieceWidth / 2}
                            fill="white"
                            fontSize="10"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none select-none"
                          >
                            {pieceLength}×{pieceWidth}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="boardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="100%" stopColor="#fde68a" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Piece details */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {boardPlacements.map((placement, idx) => {
                    const piece = pieces.find(p => p.id === placement.pieceId);
                    if (!piece) return null;

                    const colors = [
                      'bg-blue-100 text-blue-900', 'bg-green-100 text-green-900', 
                      'bg-amber-100 text-amber-900', 'bg-red-100 text-red-900',
                      'bg-purple-100 text-purple-900', 'bg-pink-100 text-pink-900',
                      'bg-teal-100 text-teal-900', 'bg-orange-100 text-orange-900'
                    ];
                    const colorClass = colors[idx % colors.length];

                    return (
                      <div key={`${placement.pieceId}-${idx}`} className={`${colorClass} rounded-lg p-2 text-sm`}>
                        <div className="font-bold">{piece.category}</div>
                        <div className="text-xs">
                          {placement.rotated ? piece.width : piece.length} × {placement.rotated ? piece.length : piece.width} سم
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
