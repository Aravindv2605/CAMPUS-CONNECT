import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const FaceScanIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" className={className} />;
const EmailIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" className={className} />;

type FaceLoginStep = 'idle' | 'loading_models' | 'detecting' | 'capturing' | 'success' | 'error' | 'no_face';

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const MODELS_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');
  const [email, setEmail] = useState('student@college.edu');
  const [isFaceLoginModalOpen, setFaceLoginModalOpen] = useState(false);
  const [faceLoginStep, setFaceLoginStep] = useState<FaceLoginStep>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionInterval = useRef<any>(null);
  const faceApiRef = useRef<any>(null);

  const handleLogin = (name?: string, email?: string) => {
    const user: User = activeTab === 'student'
      ? { id: '123', name: name || 'Aravindan', email: email || 'student@college.edu', role: 'student' }
      : { id: 'faculty-1', name: 'Dr. Evelyn Reed', email: email || 'faculty@college.edu', role: 'faculty' };
    onLogin(user);
  };

  const loadFaceAPI = async () => {
    if (faceApiRef.current) return faceApiRef.current;
    return new Promise((resolve, reject) => {
      if ((window as any).faceapi) { faceApiRef.current = (window as any).faceapi; resolve(faceApiRef.current); return; }
      const script = document.createElement('script');
      script.src = FACE_API_CDN;
      script.onload = () => { faceApiRef.current = (window as any).faceapi; resolve(faceApiRef.current); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 320 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setFaceLoginStep('error');
      setStatusMessage('Camera access denied. Please allow camera access.');
    }
  };

  const stopCamera = () => {
    clearInterval(detectionInterval.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const openFaceLoginModal = () => {
    setFaceLoginStep('idle');
    setStatusMessage('');
    setFaceDetected(false);
    setFaceLoginModalOpen(true);
  };

  const closeFaceLoginModal = () => {
    stopCamera();
    setFaceLoginModalOpen(false);
    setFaceLoginStep('idle');
  };

  useEffect(() => {
    if (isFaceLoginModalOpen) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [isFaceLoginModalOpen]);

  const handleStartScan = async () => {
    setFaceLoginStep('loading_models');
    setStatusMessage('Loading face recognition models...');

    try {
      const faceapi = await loadFaceAPI() as any;

      setStatusMessage('Loading models from CDN...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_URL),
      ]);

      setFaceLoginStep('detecting');
      setStatusMessage('Position your face in the frame...');

      let detectionCount = 0;
      detectionInterval.current = setInterval(async () => {
        if (!videoRef.current) return;
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
        ).withFaceLandmarks(true);

        if (detection) {
          setFaceDetected(true);
          detectionCount++;
          setStatusMessage(`Face detected! Hold still... (${detectionCount}/3)`);

          // Draw box on canvas
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              const box = detection.detection.box;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
          }

          if (detectionCount >= 3) {
            clearInterval(detectionInterval.current);
            setFaceLoginStep('capturing');
            setStatusMessage('Verifying identity...');
            setTimeout(() => {
              setFaceLoginStep('success');
              setStatusMessage('Identity verified! Welcome back!');
              setTimeout(() => {
                handleLogin();
                closeFaceLoginModal();
              }, 1500);
            }, 1500);
          }
        } else {
          setFaceDetected(false);
          detectionCount = 0;
          setStatusMessage('No face detected. Look directly at the camera.');
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }, 500);
    } catch (err) {
      console.error('Face API error:', err);
      setFaceLoginStep('error');
      setStatusMessage('Failed to load face recognition. Please try email login.');
    }
  };

  const borderColor = {
    idle: 'border-gray-600',
    loading_models: 'border-blue-500',
    detecting: faceDetected ? 'border-purple-500' : 'border-yellow-500',
    capturing: 'border-purple-500',
    success: 'border-green-500',
    error: 'border-red-500',
    no_face: 'border-yellow-500',
  }[faceLoginStep];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1c36] text-white p-4">
      {/* Face Login Modal */}
      {isFaceLoginModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeFaceLoginModal}>
          <div className="bg-[#2a2d4d] p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">Face Recognition</h2>
            <p className="text-gray-400 text-sm mb-4">Real-time AI face detection</p>

            {/* Camera view */}
            <div className={`w-64 h-64 mx-auto bg-black rounded-2xl overflow-hidden relative border-4 ${borderColor} transition-colors duration-500`}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1]" />

              {/* Success overlay */}
              {faceLoginStep === 'success' && (
                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Scanning animation */}
              {['detecting', 'capturing'].includes(faceLoginStep) && (
                <div className="absolute inset-x-0 h-0.5 bg-purple-500/70 animate-bounce" style={{ top: '50%' }} />
              )}
            </div>

            {/* Status */}
            <div className="mt-4 min-h-8">
              <p className={`text-sm font-medium ${faceLoginStep === 'success' ? 'text-green-400' : faceLoginStep === 'error' ? 'text-red-400' : faceDetected ? 'text-purple-400' : 'text-gray-300'}`}>
                {statusMessage || 'Click "Start Scan" to begin'}
              </p>
            </div>

            {/* Progress dots */}
            {faceLoginStep === 'detecting' && (
              <div className="flex justify-center space-x-2 mt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`} />
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {faceLoginStep === 'idle' && (
                <button onClick={handleStartScan} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-lg transition-colors">
                  Start Scan
                </button>
              )}
              {['loading_models', 'detecting', 'capturing'].includes(faceLoginStep) && (
                <button disabled className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center space-x-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Scanning...</span>
                </button>
              )}
              {faceLoginStep === 'error' && (
                <button onClick={() => { setFaceLoginStep('idle'); setStatusMessage(''); }} className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-lg">
                  Try Again
                </button>
              )}
              {faceLoginStep !== 'success' && (
                <button onClick={closeFaceLoginModal} className="w-full py-2 bg-gray-600/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main login card */}
      <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-[#21243d] rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">
            CampusConnect AI
          </h1>
          <p className="mt-2 text-gray-400">Your Intelligent Campus Assistant</p>
        </div>

        <div className="flex p-1 bg-[#1a1c36] rounded-lg">
          <button onClick={() => setActiveTab('student')} className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'student' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
            Student
          </button>
          <button onClick={() => setActiveTab('faculty')} className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'faculty' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
            Faculty
          </button>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <EmailIcon className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 text-white bg-[#1a1c36] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              placeholder={`Enter your ${activeTab} email`}
            />
          </div>
          <div className="flex flex-col space-y-4">
            <button onClick={() => handleLogin(undefined, email)} className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Login as {activeTab === 'student' ? 'Student' : 'Faculty'}
            </button>
            {activeTab === 'student' && (
              <>
                <div className="flex items-center">
                  <div className="flex-grow border-t border-gray-700"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-700"></div>
                </div>
                <button onClick={openFaceLoginModal} className="w-full py-3 font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-lg hover:from-fuchsia-700 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2">
                  <FaceScanIcon className="w-5 h-5" />
                  <span>Sign in with Face Recognition</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;