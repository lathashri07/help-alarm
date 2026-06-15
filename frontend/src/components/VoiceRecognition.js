import React, { useState, useEffect, useRef, useCallback } from 'react';
import Alarm from './Alarm';

const VoiceRecognition = () => {
  const [phase, setPhase]           = useState('idle');     // idle | listening | triggered
  const [confidence, setConfidence] = useState(0);
  const [lastHeard, setLastHeard]   = useState('');
  const [feedback, setFeedback]     = useState('👆 Click anywhere on the page to activate');
  const [micError, setMicError]     = useState('');

  const alarmRef        = useRef(null);
  const activeRecRef    = useRef(null);
  const restartTimer    = useRef(null);
  const isStoppedRef    = useRef(true);   // true = don't restart
  const hasTriggered    = useRef(false);
  const bootstrapped    = useRef(false);

  const log = useCallback((msg) => {
    const ts = new Date().toLocaleTimeString();
    console.log(`[Voice ${ts}] ${msg}`);
  }, []);

  // ── HELP scorer: checks if transcript contains "help" ─────────────────────
  // Also catches phonetic near-misses Chrome sometimes transcribes
  const HELP_VARIANTS = ['help', 'hell', 'held', 'heap', 'elp', 'alp'];

  const scoreForHelp = (text) => {
    const lower = text.toLowerCase().trim();
    if (lower.includes('help')) return 1.0;
    for (const v of HELP_VARIANTS) {
      if (lower.includes(v)) return 0.88;
    }
    return 0;
  };

  // ── Create & start a fresh SpeechRecognition instance ────────────────────
  const createAndStart = useCallback(() => {
    if (isStoppedRef.current) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicError('Speech Recognition not supported. Please use Chrome or Edge.');
      setPhase('idle');
      return;
    }

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = 'en-US';
    rec.maxAlternatives = 3;

    rec.onstart = () => {
      setPhase('listening');
      setFeedback('🎤 Listening… Say "HELP" clearly and loudly');
      log('🎙️ Recognition started');
    };

    rec.onresult = (event) => {
      if (hasTriggered.current) return;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result  = event.results[i];
        const isFinal = result.isFinal;

        // Check all alternatives (Chrome returns up to 3)
        let bestScore = 0;
        let bestText  = '';
        for (let a = 0; a < result.length; a++) {
          const text  = result[a].transcript;
          const score = scoreForHelp(text);
          if (score > bestScore) { bestScore = score; bestText = text; }
        }

        const upper = bestText.toUpperCase().trim();
        setLastHeard(upper || result[0][0].transcript.toUpperCase());
        setConfidence(bestScore);

        log(`${isFinal ? '📝 Final' : '💬 Interim'} "${upper}" — help-score: ${(bestScore * 100).toFixed(0)}%`);

        // ── Fire on interim OR final if score is high enough ──────────────
        if (bestScore >= 0.85) {
          hasTriggered.current = true;
          isStoppedRef.current = true;
          clearTimeout(restartTimer.current);
          try { rec.stop(); } catch (_) {}
          activeRecRef.current = null;

          setPhase('triggered');
          setFeedback('🚨 "HELP" DETECTED! Alarm triggered.');
          log(`🆘 HELP confirmed — firing alarm`);

          if (alarmRef.current) {
            Promise.resolve(alarmRef.current.playAlarm())
              .then(() => log('✅ playAlarm() resolved'))
              .catch(e  => log(`❌ playAlarm() error: ${e?.message}`));
          }
          window.dispatchEvent(new CustomEvent('triggerEmergencyAlert'));
          log('📡 triggerEmergencyAlert dispatched');
          return;
        }
      }
    };

    rec.onerror = (e) => {
      log(`⚠️ Error: ${e.error}`);
      if (e.error === 'not-allowed') {
        setMicError('Microphone access denied. Allow it in browser settings then refresh.');
        isStoppedRef.current = true;
        setPhase('idle');
      }
      // other errors (no-speech, network) → onend handles restart
    };

    rec.onend = () => {
      setPhase(p => p === 'listening' ? 'idle' : p);
      log(`Recognition ended — stopped=${isStoppedRef.current}`);
      if (isStoppedRef.current) return;
      log('↩️ Restarting in 600ms…');
      restartTimer.current = setTimeout(() => createAndStart(), 600);
    };

    activeRecRef.current = rec;
    try {
      rec.start();
      log('rec.start() called');
    } catch (e) {
      log(`❌ rec.start() threw: ${e.message}`);
    }
  }, [log]);

  // ── Bootstrap on first user interaction ───────────────────────────────────
  const bootstrap = useCallback(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    isStoppedRef.current = false;
    hasTriggered.current = false;
    log('▶️ Bootstrapped by user click');
    setFeedback('🎤 Starting microphone…');
    createAndStart();
  }, [createAndStart, log]);

  useEffect(() => {
    const handler = () => bootstrap();
    document.addEventListener('click',      handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
    return () => {
      document.removeEventListener('click',      handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [bootstrap]);

  // ── Reset after HELP triggered ────────────────────────────────────────────
  const handleReset = () => {
    log('🔄 Reset');
    hasTriggered.current = false;
    isStoppedRef.current = false;
    setLastHeard('');
    setConfidence(0);
    setMicError('');
    if (alarmRef.current) alarmRef.current.stopAlarm();
    createAndStart();
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      clearTimeout(restartTimer.current);
      if (activeRecRef.current) {
        try { activeRecRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  // ── UI ────────────────────────────────────────────────────────────────────
  const pillColor = {
    idle:      'bg-gray-400',
    listening: 'bg-green-500 animate-pulse shadow-lg shadow-green-300',
    triggered: 'bg-red-600 animate-pulse shadow-lg shadow-red-300',
  }[phase] || 'bg-gray-400';

  const pillLabel = {
    idle:      '⏸ WAITING',
    listening: '🎤 LISTENING',
    triggered: '🚨 EMERGENCY TRIGGERED',
  }[phase];

  const bannerCls = phase === 'triggered'
    ? 'bg-red-100 text-red-800 border-4 border-red-600 animate-pulse'
    : phase === 'listening'
      ? 'bg-green-50 text-green-800 border-2 border-green-400'
      : 'bg-blue-50 text-blue-800 border-2 border-blue-300';

  const pct = Math.round(confidence * 100);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-red-600">
        <div className="text-center">

          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span className="text-4xl">🎤</span> Voice Detection
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Automatic • No buttons needed • Say <strong>"HELP"</strong> at any time
          </p>

          {/* Status pill */}
          <div className="mb-5">
            <div className={`inline-block px-8 py-3 rounded-full text-white font-bold text-lg transition-all ${pillColor}`}>
              {pillLabel}
            </div>
          </div>

          {/* Feedback */}
          <div className={`mb-5 p-5 rounded-lg font-semibold text-base ${bannerCls}`}>
            {feedback}
          </div>

          {/* Mic error */}
          {micError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-left">
              <p className="text-red-700 text-sm font-bold">❌ {micError}</p>
            </div>
          )}

          {/* Live word + confidence bar */}
          {phase === 'listening' && (
            <div className="mb-5 px-4">
              {lastHeard && (
                <p className="text-sm text-gray-500 mb-2">
                  Heard: <span className={`font-bold text-base ${lastHeard.includes('HELP') ? 'text-red-600' : 'text-gray-700'}`}>
                    "{lastHeard}"
                  </span>
                </p>
              )}
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>HELP confidence</span>
                <span className={pct >= 85 ? 'text-red-600 font-bold' : ''}>{pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-150 ${
                    pct >= 85 ? 'bg-red-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Alarm fires at ≥ 85%</p>
            </div>
          )}

          {/* Reset button */}
          {phase === 'triggered' && (
            <div className="mb-6">
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95"
              >
                🔄 Reset & Listen Again
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 text-left">
            <p className="text-sm font-bold text-gray-700 mb-2">✨ How to use:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li><strong>Click anywhere</strong> on the page once to unlock microphone</li>
              <li>Allow microphone access when the browser asks</li>
              <li>Say <strong>"HELP"</strong> clearly and loudly</li>
              <li>Alarm fires automatically — no button needed</li>
              <li>Click <strong>Reset</strong> to listen again after an alert</li>
            </ol>
          </div>

        </div>
      </div>

      <Alarm ref={alarmRef} />
    </div>
  );
};

export default VoiceRecognition;