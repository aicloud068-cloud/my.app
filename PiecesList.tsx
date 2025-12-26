import { Trash2, Package, MoveVertical, MoveHorizontal } from 'lucide-react';
import type { WoodPiece } from '@/shared/types';

interface PiecesListProps {
  pieces: WoodPiece[];
  onRemove: (id: string) => void;
}

export default function PiecesList({ pieces, onRemove }: PiecesListProps) {
  const getMarginsSummary = (piece: WoodPiece) => {
    const margins = [];
    if (piece.edgeMargins.top > 0) margins.push(`أعلى: ${piece.edgeMargins.top}`);
    if (piece.edgeMargins.right > 0) margins.push(`يمين: ${piece.edgeMargins.right}`);
    if (piece.edgeMargins.bottom > 0) margins.push(`أسفل: ${piece.edgeMargins.bottom}`);
    if (piece.edgeMargins.left > 0) margins.push(`يسار: ${piece.edgeMargins.left}`);
    return margins.length > 0 ? margins.join(', ') : 'بدون';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <Package className="w-6 h-6" />
        القطع المضافة ({pieces.length})
      </h2>

      <div className="space-y-3">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-700">الطول</span>
                <p className="text-lg font-bold text-amber-900">{piece.length} سم</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-700">العرض</span>
                <p className="text-lg font-bold text-amber-900">{piece.width} سم</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-700">العدد</span>
                <p className="text-lg font-bold text-amber-900">{piece.quantity}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-700">التصنيف</span>
                <p className="text-sm font-bold text-amber-900 truncate">{piece.category}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-700">اتجاه العرق</span>
                <div className="flex items-center gap-1">
                  {piece.grainDirection === 'longitudinal' ? (
                    <>
                      <MoveVertical className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-amber-900">طولي</span>
                    </>
                  ) : (
                    <>
                      <MoveHorizontal className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-amber-900">عرضي</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-700">هامش التحريف (سم)</span>
                <p className="text-xs font-bold text-amber-900">{getMarginsSummary(piece)}</p>
              </div>
            </div>
            
            <button
              onClick={() => onRemove(piece.id)}
              className="mr-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              aria-label="حذف القطعة"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
