import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import PieceForm from '@/react-app/components/PieceForm';
import PiecesList from '@/react-app/components/PiecesList';
import ResultsView from '@/react-app/components/ResultsView';
import type { WoodPiece, BoardSize } from '@/shared/types';

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [boardSize, setBoardSize] = useState<BoardSize>({ length: 244, width: 122 });
  const [pieces, setPieces] = useState<WoodPiece[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Load saved customer info on mount
  useEffect(() => {
    const savedName = localStorage.getItem('saved_customer_name');
    const savedPhone = localStorage.getItem('saved_phone_number');
    if (savedName) setCustomerName(savedName);
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);

  // Save customer info to localStorage when changed
  useEffect(() => {
    if (customerName.trim()) {
      localStorage.setItem('saved_customer_name', customerName);
    }
  }, [customerName]);

  useEffect(() => {
    if (phoneNumber.trim()) {
      localStorage.setItem('saved_phone_number', phoneNumber);
    }
  }, [phoneNumber]);

  const addPiece = (piece: Omit<WoodPiece, 'id'>) => {
    const newPiece = {
      ...piece,
      id: Date.now().toString(),
    };
    setPieces([...pieces, newPiece]);
  };

  const removePiece = (id: string) => {
    setPieces(pieces.filter(p => p.id !== id));
  };

  const handleFinish = () => {
    if (!customerName.trim()) {
      alert('يرجى إدخال اسم الزبون');
      return;
    }
    if (!phoneNumber.trim()) {
      alert('يرجى إدخال رقم الهاتف');
      return;
    }
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      alert('رقم الهاتف يجب أن يكون 10 أرقام على الأقل');
      return;
    }
    if (pieces.length > 0) {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    setShowResults(false);
  };

  const handleReset = () => {
    setProjectName('');
    setCustomerName('');
    setPhoneNumber('');
    setBoardSize({ length: 244, width: 122 });
    setPieces([]);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <ResultsView
        projectName={projectName}
        customerName={customerName}
        phoneNumber={phoneNumber}
        boardSize={boardSize}
        pieces={pieces}
        onBack={handleBack}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">قاطع الخشب</h1>
          <p className="text-amber-700">تطبيق احترافي لحساب وتحسين قص الألواح الخشبية</p>
        </div>

        {/* Project Name Input */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">✏️</span>
            </div>
            معلومات المشروع
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                اسم المشروع
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="أدخل اسم المشروع (اختياري)"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-amber-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                اسم الزبون <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم الزبون"
                required
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-amber-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                رقم الهاتف <span className="text-red-600">*</span>
                <span className="text-sm font-normal text-amber-600 mr-2">(10 أرقام على الأقل)</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="أدخل رقم الهاتف"
                required
                minLength={10}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-amber-900"
              />
            </div>
          </div>
        </div>

        {/* Board Size Input */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-amber-600 rounded" />
            </div>
            قياس اللوح الأساسي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                الطول (سم)
              </label>
              <input
                type="number"
                value={boardSize.length}
                onChange={(e) => setBoardSize({ ...boardSize, length: Number(e.target.value) })}
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
                value={boardSize.width}
                onChange={(e) => setBoardSize({ ...boardSize, width: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Piece Form */}
        <PieceForm onAdd={addPiece} />

        {/* Pieces List */}
        {pieces.length > 0 && (
          <PiecesList pieces={pieces} onRemove={removePiece} />
        )}

        {/* Finish Button */}
        {pieces.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleFinish}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-3"
            >
              <Calculator className="w-6 h-6" />
              إنهاء وحساب التقسيم
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
