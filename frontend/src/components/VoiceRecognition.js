import React, { useState, useEffect, useRef } from 'react';
import Alarm from './Alarm';

const VoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognized, setRecognized] = useState(false);
  const [feedback, setFeedback] = useState('🎤 Auto-listening... Say "HELP" for emergency');
  const recognitionRef = useRef(null);
  const alarmRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  useEffect(() => {
    // Check browser support for Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setFeedback('❌ Speech Recognition not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback('🎤 Auto-listening... Say "HELP" for emergency');
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toUpperCase().trim();
        
        if (event.results[i].isFinal) {
          setTranscript(transcript);
          
          // Check if "HELP" is detected
          if (transcript.includes('HELP')) {
            setRecognized(true);
            setFeedback('✅ "HELP" DETECTED! Emergency Protocol Activated!');
            recognition.stop();
            
            // Trigger alarm
            if (alarmRef.current) {
              alarmRef.current.playAlarm();
            }

            // Trigger emergency alert
            window.dispatchEvent(new CustomEvent('triggerEmergencyAlert'));

            // Auto-restart listening after 5 seconds
            if (restartTimeoutRef.current) {
              clearTimeout(restartTimeoutRef.current);
            }
            restartTimeoutRef.current = setTimeout(() => {
              setRecognized(false);
              setTranscript('');
              setFeedback('🎤 Auto-listening... Say "HELP" for emergency');
              try {
                recognition.start();
              } catch (e) {
                console.log('Cannot restart recognition');
              }
            }, 5000);
          }
        }
      }
    };

    recognition.onerror = (event) => {
      setFeedback(`⚠️ ${event.error}. Retrying...`);
      // Automatically restart on error
      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.log('Cannot restart recognition');
        }
      }, 2000);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart when recognition ends (unless "HELP" was just detected)
      if (!recognized) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('Cannot auto-restart recognition');
          }
        }, 1000);
      }
    };

    recognitionRef.current = recognition;

    // Auto-start listening when component mounts
    try {
      recognition.start();
    } catch (e) {
      console.log('Could not start recognition:', e);
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [recognized]);

  return (
    <div className="space-y-6">
      {/* Voice Recognition Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-red-600">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span className="text-4xl">🎤</span>
            Auto Voice Recognition
          </h2>
          <p className="text-gray-600 mb-6">Automatically listening... Just say "HELP" for emergency</p>

          {/* Status Indicator - Pulsing Animation */}
          <div className="mb-6">
            <div className={`inline-block px-8 py-4 rounded-full text-white font-bold text-xl ${
              isListening ? 'bg-green-500 animate-pulse shadow-lg' : 'bg-gray-400'
            }`}>
              {isListening ? '🎙️ LISTENING' : '⏳ Starting...'}
            </div>
          </div>

          {/* Feedback Message - Large and Clear */}
          <div className={`mb-6 p-6 rounded-lg text-lg font-bold ${
            recognized
              ? 'bg-red-100 text-red-800 border-4 border-red-600 animate-pulse'
              : 'bg-blue-100 text-blue-800 border-2 border-blue-400'
          }`}>
            {feedback}
          </div>

          {/* Transcript Display - Only show when there's content */}
          {transcript && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg border-3 border-gray-400">
              <p className="text-gray-700 text-xl font-semibold">
                You said: "<span className="text-red-700 font-bold">{transcript}</span>"
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
            <p className="text-sm text-gray-700">
              <strong>✨ How it works:</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              🎤 Microphone is always listening automatically
              <br/>
              📢 Just say "<strong>HELP</strong>" clearly and loudly
              <br/>
              🔊 Alarm will trigger immediately
              <br/>
              📍 Location will be captured automatically
              <br/>
              📤 Emergency alert sent to all contacts
            </p>
          </div>

          {!isListening && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Microphone not active.</strong> Please check browser microphone settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alarm Component */}
      <Alarm ref={alarmRef} />
    </div>
  );
};

export default VoiceRecognition;
