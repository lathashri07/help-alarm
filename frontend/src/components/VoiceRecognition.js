import React, { useState, useEffect, useRef, useCallback } from 'react';

const VoiceRecognition = ({ alarmRef, onTriggerAlert }) => {
  const [phase, setPhase]           = useState('idle');     // idle | listening | triggered
  const [confidence, setConfidence] = useState(0);
  const [lastHeard, setLastHeard]   = useState('');
  const [feedback, setFeedback]     = useState('👆 Click anywhere on the page to activate');
  const [micError, setMicError]     = useState('');
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
          if (onTriggerAlert) {
            onTriggerAlert();
          }
          log('📡 onTriggerAlert callback fired');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    idle:      'bg-slate-800/80 text-slate-400 border border-slate-700/60',
    listening: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white animate-pulse shadow-lg shadow-cyan-500/25',
    triggered: 'bg-gradient-to-r from-rose-600 to-red-600 text-white animate-pulse shadow-lg shadow-rose-600/40 border border-rose-500/30',
  }[phase] || 'bg-slate-800/80 text-slate-400';

  const pillLabel = {
    idle:      '⏸ WAITING',
    listening: '🎤 LISTENING',
    triggered: '🚨 EMERGENCY TRIGGERED',
  }[phase];

  const bannerCls = phase === 'triggered'
    ? 'bg-rose-950/40 text-rose-200 border border-rose-500/30 animate-pulse'
    : phase === 'listening'
      ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-500/35 shadow-inner'
      : 'bg-slate-900/50 text-slate-300 border border-white/5';

  const pct = Math.round(confidence * 100);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-cyan-500/20 transition-all duration-300">
        <div className="text-center">

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-2 flex items-center justify-center gap-2">
            <span className="text-3xl md:text-4xl">🎤</span> Voice Detection
          </h2>
          <p className="text-slate-400 mb-6 text-xs md:text-sm font-medium">
            Automatic &bull; No buttons needed &bull; Say <strong className="text-cyan-400">"HELP"</strong> at any time
          </p>

          {/* Status pill */}
          <div className="mb-6">
            <div className={`inline-block px-8 py-3 rounded-full font-bold text-base md:text-lg transition-all duration-300 ${pillColor}`}>
              {pillLabel}
            </div>
          </div>

          {/* Feedback */}
          <div className={`mb-6 p-5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${bannerCls}`}>
            {feedback}
          </div>

          {/* Mic error */}
          {micError && (
            <div className="mb-4 p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-left">
              <p className="text-rose-300 text-sm font-bold">❌ {micError}</p>
            </div>
          )}

          {/* Live word + confidence bar */}
          {phase === 'listening' && (
            <div className="mb-6 px-2">
              {lastHeard && (
                <p className="text-sm text-slate-400 mb-3 font-medium">
                  Heard:{' '}
                  <span className={`font-bold text-base px-2.5 py-1 rounded bg-slate-950/60 border border-white/5 ${lastHeard.includes('HELP') ? 'text-rose-400' : 'text-cyan-300'}`}>
                    "{lastHeard}"
                  </span>
                </p>
              )}
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold">HELP confidence</span>
                <span className={pct >= 85 ? 'text-rose-400 font-bold' : 'text-cyan-400 font-semibold'}>{pct}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-[1px] border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    pct >= 85 ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-md shadow-rose-500/40' : pct >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gradient-to-r from-cyan-400 to-teal-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 mt-1.5 font-medium">Alarm fires at &ge; 85%</p>
            </div>
          )}

          {/* Reset button */}
          {phase === 'triggered' && (
            <div className="mb-6">
              <button
                onClick={handleReset}
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-300 hover:scale-[1.02]"
              >
                🔄 Reset & Listen Again
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="p-5 bg-slate-950/40 rounded-xl border border-white/5 text-left">
            <p className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <span className="text-cyan-400">🪶</span> Setup & Usage:
            </p>
            <ul className="text-xs md:text-sm text-slate-400 space-y-2 list-disc list-inside font-medium">
              <li><strong className="text-slate-300">Activate</strong>: Click anywhere on the page to enable microphone monitoring.</li>
              <li><strong className="text-slate-300">Trigger</strong>: Say <strong className="text-rose-400">"HELP"</strong> clearly to activate the emergency protocol automatically.</li>
              <li><strong className="text-slate-300">Reset</strong>: Use the <strong className="text-cyan-400">Reset</strong> button to resume monitoring after an alert has fired.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VoiceRecognition;