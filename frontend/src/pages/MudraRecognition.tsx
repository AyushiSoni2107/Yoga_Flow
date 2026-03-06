import { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle, CheckCircle, Hand, Bot, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface MudraInfo {
  name: string;
  description: string;
  benefits: string[];
  instructions: string[];
}

const mudrasDatabase: Record<string, MudraInfo> = {
  'Anjali Mudra': {
    name: 'Anjali Mudra (Prayer Position)',
    description: 'Also known as Namaste or Prayer mudra, this is one of the most common hand gestures in yoga.',
    benefits: [
      'Promotes feelings of peace and gratitude',
      'Balances left and right hemispheres of the brain',
      'Reduces stress and anxiety',
      'Enhances focus and concentration',
    ],
    instructions: [
      'Bring both palms together at heart center',
      'Press palms firmly together',
      'Keep fingers pointing upward',
      'Relax shoulders away from ears',
      'Hold for 5-10 breaths',
    ],
  },
  'Gyan Mudra': {
    name: 'Gyan Mudra (Knowledge Seal)',
    description: 'The most commonly used mudra in meditation, promoting wisdom and concentration.',
    benefits: [
      'Enhances concentration and memory',
      'Stimulates the root chakra',
      'Improves mental clarity',
      'Helps with insomnia and depression',
    ],
    instructions: [
      'Touch the tip of thumb to tip of index finger',
      'Keep other three fingers straight',
      'Rest hands on knees or thighs',
      'Palms can face up or down',
      'Maintain gentle pressure at fingertips',
    ],
  },
  'Prana Mudra': {
    name: 'Prana Mudra (Life Force Seal)',
    description: 'Activates dormant energy in the body and strengthens all organs.',
    benefits: [
      'Increases vitality and reduces fatigue',
      'Improves eyesight',
      'Boosts immune system',
      'Awakens dormant energy',
    ],
    instructions: [
      'Touch tips of thumb, ring finger, and pinky together',
      'Keep index and middle fingers extended',
      'Practice for 30-45 minutes daily',
      'Can be done in any position',
    ],
  },
  'Dhyana Mudra': {
    name: 'Dhyana Mudra (Meditation Seal)',
    description: 'A traditional meditation mudra that promotes deep concentration and inner peace.',
    benefits: [
      'Deepens meditation practice',
      'Promotes tranquility and inner peace',
      'Enhances spiritual awareness',
      'Balances energy flow',
    ],
    instructions: [
      'Place right hand on top of left hand',
      'Both palms face upward',
      'Tips of thumbs lightly touching',
      'Rest hands in lap',
      'Form an oval shape with hands',
    ],
  },
  'Lotus Mudra': {
    name: 'Lotus Mudra (Padma Mudra)',
    description: 'Symbolizes purity and spiritual awakening, like a lotus rising from muddy water.',
    benefits: [
      'Opens the heart chakra',
      'Promotes compassion and love',
      'Relieves emotional stress',
      'Enhances feelings of peace',
    ],
    instructions: [
      'Bring palms together at heart center',
      'Keep thumbs and pinky fingers touching',
      'Spread other fingers like lotus petals',
      'Create a flower-like shape',
      'Hold at chest level',
    ],
  },
};

export function MudraRecognition() {
  const mudraKeys = Object.keys(mudrasDatabase);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentMudra, setCurrentMudra] = useState<string | null>(null);
  const [selectedMudra, setSelectedMudra] = useState<string>(mudraKeys[0]);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [coachStepIndex, setCoachStepIndex] = useState(0);
  const [coachAutoPlay, setCoachAutoPlay] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const coachIntervalRef = useRef<number | null>(null);

  const clearDetectionLoop = () => {
    if (detectionIntervalRef.current !== null) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const clearCoachLoop = () => {
    if (coachIntervalRef.current !== null) {
      window.clearInterval(coachIntervalRef.current);
      coachIntervalRef.current = null;
    }
  };

  const runDetectionStep = () => {
    const mudras = Object.keys(mudrasDatabase);
    const randomMudra = mudras[Math.floor(Math.random() * mudras.length)];
    const randomConfidence = Math.floor(Math.random() * 30) + 70;

    setCurrentMudra(randomMudra);
    setConfidence(randomConfidence);
  };

  const startDetectionLoop = () => {
    clearDetectionLoop();
    runDetectionStep();
    detectionIntervalRef.current = window.setInterval(() => {
      runDetectionStep();
    }, 2500);
  };

  const stopCamera = () => {
    clearDetectionLoop();
    clearCoachLoop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    streamRef.current = null;
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setCurrentMudra(null);
    setConfidence(0);
    setCoachAutoPlay(false);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera is not supported in this browser/device.');
        return;
      }

      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      setError('');
      startDetectionLoop();
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera access error:', err);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      clearDetectionLoop();
      clearCoachLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getMudraInfo = () => {
    if (!currentMudra) return null;
    return mudrasDatabase[currentMudra];
  };

  const getGuideMudraInfo = () => {
    const key = currentMudra || selectedMudra;
    return mudrasDatabase[key];
  };

  useEffect(() => {
    setCoachStepIndex(0);
    setCoachAutoPlay(false);
    clearCoachLoop();
  }, [currentMudra, selectedMudra]);

  useEffect(() => {
    const guide = getGuideMudraInfo();
    if (!coachAutoPlay || !guide) {
      clearCoachLoop();
      return;
    }

    clearCoachLoop();
    coachIntervalRef.current = window.setInterval(() => {
      setCoachStepIndex((prev) => {
        const next = prev + 1;
        if (next >= guide.instructions.length) {
          setCoachAutoPlay(false);
          clearCoachLoop();
          return prev;
        }
        return next;
      });
    }, 2500);

    return () => clearCoachLoop();
  }, [coachAutoPlay, currentMudra, selectedMudra]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-violet-100 rounded-full mb-4">
            <Hand className="w-12 h-12 text-violet-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Mudra Recognition</h1>
          <p className="text-xl text-gray-600">
            Get real-time guidance on proper hand positions and their benefits
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Camera Feed</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {isActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {currentMudra && (
                      <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black bg-opacity-75 text-white p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Detected: {currentMudra}</span>
                            <span className="text-sm">
                              Confidence: {confidence}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                {!isActive ? (
                  <button
                    onClick={startCamera}
                    className="bg-violet-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a demo version using simulated AI recognition.
                  In production, this would integrate with a real hand pose detection model
                  like MediaPipe or TensorFlow.js for accurate mudra recognition.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentMudra ? 'Current Mudra Details' : 'Mudra Information'}
            </h2>

            <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <label htmlFor="mudra-select" className="block text-sm font-semibold text-violet-900 mb-2">
                How To Do A Mudra (Practice Guide)
              </label>
              <select
                id="mudra-select"
                value={selectedMudra}
                onChange={(e) => setSelectedMudra(e.target.value)}
                className="w-full border border-violet-300 rounded-lg px-3 py-2 bg-white text-gray-800"
              >
                {mudraKeys.map((mudra) => (
                  <option key={mudra} value={mudra}>
                    {mudra}
                  </option>
                ))}
              </select>
              <p className="text-xs text-violet-800 mt-2">
                Select a mudra and follow the steps below. If camera detects a mudra, that one will be shown automatically.
              </p>
            </div>

            {getMudraInfo() ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getMudraInfo()?.name}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-600">{getMudraInfo()?.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                  <ul className="space-y-2">
                    {getMudraInfo()?.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-violet-600 mt-1">*</span>
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How to Perform:</h4>
                  <ol className="space-y-2">
                    {getMudraInfo()?.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-violet-600 font-semibold">{index + 1}.</span>
                        <span className="text-gray-600">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Start the camera to begin mudra recognition. The AI will analyze your hand
                  position and provide guidance on proper technique.
                </p>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Available Mudras:</h4>
                  <div className="space-y-3">
                    {Object.values(mudrasDatabase).map((mudra) => (
                      <div
                        key={mudra.name}
                        className="p-3 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors"
                      >
                        <h5 className="font-semibold text-violet-600">{mudra.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{mudra.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-4 p-4 bg-white border border-violet-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-violet-800">AI Mudra Coach</p>
                      <p className="text-xs text-gray-500">Guided step teaching avatar</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoachAutoPlay((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {coachAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {coachAutoPlay ? 'Pause' : 'Auto Guide'}
                  </button>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <p className="text-sm text-violet-900">
                    Step {coachStepIndex + 1}: {getGuideMudraInfo()?.instructions[coachStepIndex]}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCoachStepIndex((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCoachStepIndex((prev) =>
                        Math.min((getGuideMudraInfo()?.instructions.length || 1) - 1, prev + 1)
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Step-by-Step: {getGuideMudraInfo()?.name}
              </h4>
              <ol className="space-y-2">
                {getGuideMudraInfo()?.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-violet-600 font-semibold">{index + 1}.</span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                Tip: Keep your spine straight, breathe slowly, and hold the mudra for at least 5 calm breaths.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-violet-50 border-l-4 border-violet-600 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-violet-900 mb-2">About Mudras</h3>
          <p className="text-gray-700">
            Mudras are ancient hand gestures used in yoga and meditation practices. Each mudra
            has specific benefits and helps direct energy flow in the body. Regular practice of
            mudras can enhance your meditation, improve health, and deepen your spiritual connection.
          </p>
        </div>
      </div>
    </div>
  );
}


