import React, { forwardRef, useState, useRef, useEffect } from 'react';

const Alarm = forwardRef((props, ref) => {
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    return () => {
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  const playAlarm = () => {
    const audioContext = audioContextRef.current;
    
    if (!audioContext || isAlarmPlaying) return;

    setIsAlarmPlaying(true);

    // Create oscillator for alarm sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set frequency to create loud alarm sound (high frequency)
    oscillator.frequency.value = 1000; // Hz

    // Create pulsing effect
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);

    // Pulse pattern: 0.5s on, 0.3s off for 5 seconds
    for (let i = 0; i < 5; i++) {
      gainNode.gain.setValueAtTime(0.3, now + i * 0.8);
      gainNode.gain.setValueAtTime(0, now + i * 0.8 + 0.5);
    }

    gainNode.gain.setValueAtTime(0, now + 4);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    oscillator.start(now);
    oscillator.stop(now + 4);

    oscillator.onended = () => {
      setIsAlarmPlaying(false);
    };
  };

  const stopAlarm = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        console.log('Oscillator already stopped');
      }
      oscillatorRef.current = null;
    }
    setIsAlarmPlaying(false);
  };

  // Expose playAlarm to parent
  React.useImperativeHandle(ref, () => ({
    playAlarm,
    stopAlarm
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-yellow-500">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <span className="text-3xl">🔔</span>
          Alarm System
        </h3>

        {isAlarmPlaying && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg animate-pulse">
            <p className="text-red-700 font-bold text-lg">🔊 ALARM RINGING!</p>
            <p className="text-red-600">Loud alarm sound is active</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={playAlarm}
            disabled={isAlarmPlaying}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 ${
              isAlarmPlaying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            🔊 Play Alarm
          </button>

          <button
            onClick={stopAlarm}
            disabled={!isAlarmPlaying}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 ${
              !isAlarmPlaying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            ⏹️ Stop Alarm
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4 italic">
          The alarm plays automatically when "HELP" is detected via voice
        </p>
      </div>
    </div>
  );
});

Alarm.displayName = 'Alarm';

export default Alarm;
