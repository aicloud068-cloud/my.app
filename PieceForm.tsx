import { useState } from 'react';
import { Plus, MoveHorizontal, MoveVertical } from 'lucide-react';
import PieceDiagram from './PieceDiagram';
import type { WoodPiece, EdgeMargins, GrainDirection } from '@/shared/types';

interface PieceFormProps {
  onAdd: (piece: Omit<WoodPiece, 'id'>) => void;
}

type Edge = 'top' | 'right' | 'bottom' | 'left';

export default function PieceForm({ onAdd }: PieceFormProps) {
  const [length, setLength] = useState<number>(100);
  const [width, setWidth] = useState<number>(50);
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState<string>('');
  const [marginValue, setMarginValue] = useState<number>(0.5);
  const [selectedEdges, setSelectedEdges] = useState<Set<Edge>>(new Set());
  const [grainDirection, setGrainDirection] = useState<GrainDirection>('longitudinal');

  const handleEdgeToggle = (edge: Edge) => {
    const newEdges = new Set(selectedEdges);
    if (newEdges.has(edge)) {
      newEdges.delete(edge);
    } else {
      newEdges.add(edge);
    }
    setSelectedEdges(newEdges);
  };

  const handleSubmit = () => {
    if (length > 0 && width > 0 && quantity > 0) {
      const edgeMargins: EdgeMargins = {
        top: selectedEdges.has('top') ? marginValue : 0,
        right: selectedEdges.has('right') ? marginValue : 0,
        bottom: selectedEdges.has('bottom') ? marginValue : 0,
        left: selectedEdges.has('left') ? marginValue : 0,
      };

      onAdd({
        length,
        width,
        quantity,
        category: category || 'بدون تصنيف',
        edgeMargins,
        grainDirection,
      });
      
      // Reset form
      setLength(100);
      setWidth(50);
      setQuantity(1);
      setCategory('');
      setSelectedEdges(new Set());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-amber-200">
      <h2 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
        <Plus className="w-6 h-6" />
        إضافة قطعة جديدة
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              الطول (سم)
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              العرض (سم)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              العدد
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              التصنيف (اختياري)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="مثال: رفوف، أدراج، إلخ"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              اتجاه العرق (اتجاه الخشب)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGrainDirection('longitudinal')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  grainDirection === 'longitudinal'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                <MoveVertical className="w-5 h-5" />
                طولي
              </button>
              <button
                type="button"
                onClick={() => setGrainDirection('transverse')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  grainDirection === 'transverse'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                <MoveHorizontal className="w-5 h-5" />
                عرضي
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              طولي: العرق يسير مع الطول | عرضي: العرق يسير مع العرض
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              قيمة هامش التحريف (سم)
            </label>
            <input
              type="number"
              value={marginValue}
              onChange={(e) => setMarginValue(Number(e.target.value))}
              step="0.1"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
              min="0"
            />
            <p className="text-xs text-amber-600 mt-1">
              انقر على الأضلاع في الرسم لتحديد أضلاع التحريف
            </p>
          </div>

          {selectedEdges.size > 0 && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-sm font-semibold text-amber-900 mb-2">الأضلاع المحددة:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedEdges).map(edge => (
                  <span key={edge} className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    {edge === 'top' ? 'أعلى' : edge === 'right' ? 'يمين' : edge === 'bottom' ? 'أسفل' : 'يسار'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة القطعة
          </button>
        </div>

        {/* Diagram */}
        <div className="flex items-center justify-center">
          <PieceDiagram
            length={length}
            width={width}
            marginValue={marginValue}
            selectedEdges={selectedEdges}
            onEdgeClick={handleEdgeToggle}
            grainDirection={grainDirection}
          />
        </div>
      </div>
    </div>
  );
}
