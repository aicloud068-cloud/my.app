import { useState, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';

interface PasswordProtectionProps {
  onAuthenticated: () => void;
}

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default function PasswordProtection({ onAuthenticated }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Check if device is blocked
    const blockTimestamp = localStorage.getItem('passwordBlockTimestamp');
    const failedAttempts = parseInt(localStorage.getItem('passwordAttempts') || '0');
    
    setAttempts(failedAttempts);

    if (blockTimestamp) {
      const blockTime = parseInt(blockTimestamp);
      const now = Date.now();
      const timePassed = now - blockTime;

      if (timePassed < BLOCK_DURATION) {
        setIsBlocked(true);
        setRemainingTime(BLOCK_DURATION - timePassed);
      } else {
        // Block expired, clear it
        localStorage.removeItem('passwordBlockTimestamp');
        localStorage.removeItem('passwordAttempts');
        setAttempts(0);
      }
    }
  }, []);

  useEffect(() => {
    if (isBlocked && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            setIsBlocked(false);
            localStorage.removeItem('passwordBlockTimestamp');
            localStorage.removeItem('passwordAttempts');
            setAttempts(0);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isBlocked, remainingTime]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      return;
    }

    if (password === '6363') {
      // Correct password
      localStorage.removeItem('passwordAttempts');
      localStorage.removeItem('passwordBlockTimestamp');
      sessionStorage.setItem('authenticated', 'true');
      onAuthenticated();
    } else {
      // Wrong password
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('passwordAttempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        // Block the device
        const blockTimestamp = Date.now();
        localStorage.setItem('passwordBlockTimestamp', blockTimestamp.toString());
        setIsBlocked(true);
        setRemainingTime(BLOCK_DURATION);
      }

      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const remainingAttempts = MAX_ATTEMPTS - attempts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${
              isBlocked 
                ? 'bg-gradient-to-br from-red-500 to-red-700' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {isBlocked ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              اهلا بك في different
            </h1>
            <p className="text-gray-600 text-center">
              {isBlocked 
                ? 'تم حظر الجهاز مؤقتاً' 
                : 'الرجاء إدخال كلمة المرور للمتابعة'}
            </p>
          </div>

          {isBlocked ? (
            <div className="text-center space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-semibold mb-2">
                  لقد تجاوزت عدد المحاولات المسموحة
                </p>
                <p className="text-red-600 text-sm mb-4">
                  الجهاز محظور لمدة ساعة واحدة
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-300">
                  <p className="text-gray-600 text-sm mb-1">الوقت المتبقي</p>
                  <p className="text-3xl font-bold text-red-600 font-mono">
                    {formatTime(remainingTime)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-center text-lg tracking-widest transition-all duration-200 ${
                    error
                      ? 'border-red-500 bg-red-50 shake'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } outline-none`}
                  autoFocus
                />
                {error && (
                  <div className="mt-3 space-y-2">
                    <p className="text-red-500 text-sm text-center animate-pulse">
                      كلمة المرور غير صحيحة
                    </p>
                    {remainingAttempts > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-orange-700 text-sm text-center font-semibold">
                          باقي {remainingAttempts} {remainingAttempts === 1 ? 'محاولة' : 'محاولات'}
                        </p>
                        <p className="text-orange-600 text-xs text-center mt-1">
                          سيتم حظر الجهاز لمدة ساعة بعد استنفاذ المحاولات
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                دخول
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
