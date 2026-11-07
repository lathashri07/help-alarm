import React, { forwardRef, useState, useRef, useEffect } from 'react';

// ─── GLOBAL AudioContext singleton ────────────────────────────────────────────
// Kept outside the component so it survives re-renders and is shared.
// The unlock runs once on first user click, no matter which component mounts first.
let _globalAudioCtx = null;
let _audioUnlocked  = false;

const unlockAudio = async () => {
  if (_audioUnlocked) return;

  try {
    if (!_globalAudioCtx) {
      _globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Play a 1-frame silent buffer — this is the gesture Chrome needs
    const buf    = _globalAudioCtx.createBuffer(1, 1, 22050);
    const source = _globalAudioCtx.createBufferSource();
    source.buffer = buf;
    source.connect(_globalAudioCtx.destination);
    source.start(0);

    if (_globalAudioCtx.state === 'suspended') {
      await _globalAudioCtx.resume();
    }

    _audioUnlocked = true;
    console.log('[Audio] ✅ AudioContext unlocked — state:', _globalAudioCtx.state);
  } catch (e) {
    console.error('[Audio] ❌ Unlock failed:', e.message);
  }
};

// Attach unlock to document as early as possible (module load time)
document.addEventListener('click',      unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });
// ─────────────────────────────────────────────────────────────────────────────

const Alarm = forwardRef((props, ref) => {
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked]   = useState(false);

  const oscillatorRef = useRef(null);
  const gainNodeRef   = useRef(null);

  const log = (msg) => {
    const ts = new Date().toLocaleTimeString();
    console.log(`[Alarm ${ts}] ${msg}`);
  };

  // Poll the global unlock state so the UI badge updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (_audioUnlocked && !audioUnlocked) {
        setAudioUnlocked(true);
        log('✅ Audio unlock detected — auto-trigger ready');
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [audioUnlocked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  const playAlarm = async () => {
    log('playAlarm() called');

    if (isAlarmPlaying) {
      log('Already playing — skipped');
      return;
    }

    // Ensure AudioContext exists
    if (!_globalAudioCtx) {
      _globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      log('Created AudioContext (was null)');
    }

    const ctx = _globalAudioCtx;
    log(`AudioContext state: "${ctx.state}"`);

    // Try to resume — may work even without a gesture if already interacted once
    if (ctx.state === 'suspended') {
      log('Attempting ctx.resume()...');
      try {
        await ctx.resume();
        log(`State after resume: "${ctx.state}"`);
      } catch (e) {
        log(`resume() failed: ${e.message}`);
      }
    }

    if (ctx.state !== 'running') {
      log(`❌ AudioContext still not running ("${ctx.state}") — did user click yet?`);
      setIsAlarmPlaying(false);
      return;
    }

    log('✅ AudioContext running — building audio graph');

    // Stop any leftover oscillator
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch (_) {}
      oscillatorRef.current = null;
    }

    setIsAlarmPlaying(true);

    try {
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();
      const filter     = ctx.createBiquadFilter();

      filter.type            = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value         = 0.8;

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';

      const now      = ctx.currentTime;
      const duration = 60;

      // 2000 ↔ 3000 Hz siren sweep every second
      oscillator.frequency.setValueAtTime(2000, now);
      for (let i = 0; i < duration; i++) {
        oscillator.frequency.setTargetAtTime(
          i % 2 === 0 ? 3000 : 2000,
          now + i,
          0.15
        );
      }

      // Pulsing volume: 0.7 / 0.3 every 0.5s
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.7, now + 0.05);
      for (let i = 0; i < duration * 2; i++) {
        gainNode.gain.setValueAtTime(i % 2 === 0 ? 0.7 : 0.3, now + i * 0.5);
      }
      gainNode.gain.setValueAtTime(0.7, now + duration - 0.3);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      oscillatorRef.current = oscillator;
      gainNodeRef.current   = gainNode;

      oscillator.start(now);
      oscillator.stop(now + duration);

      oscillator.onended = () => {
        oscillatorRef.current = null;
        setIsAlarmPlaying(false);
        log('Alarm ended naturally');
      };

      log('🚨 Alarm playing — 2000–3000 Hz siren for 60s');
    } catch (err) {
      log(`❌ Audio graph error: ${err.message}`);
      setIsAlarmPlaying(false);
    }
  };

  const stopAlarm = () => {
    log('stopAlarm() called');
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch (_) {}
      oscillatorRef.current = null;
    }
    gainNodeRef.current = null;
    setIsAlarmPlaying(false);
  };

  React.useImperativeHandle(ref, () => ({ playAlarm, stopAlarm }));

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-cyan-500/20 transition-all duration-300">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-100 mb-3 flex items-center justify-center gap-2">
          <span className="text-2xl md:text-3xl">🔔</span> Alarm System
        </h3>

        {/* Audio unlock badge */}
        <div className={`mb-5 px-5 py-2 rounded-full text-xs md:text-sm font-bold inline-block border ${
          audioUnlocked
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/35'
            : 'bg-amber-950/40 text-amber-300 border-amber-500/35 animate-pulse'
        }`}>
          {audioUnlocked
            ? '🔓 Audio ready — voice trigger will work'
            : '⚠️ Click anywhere on the page first to unlock audio'}
        </div>

        {isAlarmPlaying && (
          <div className="my-5 p-5 bg-rose-950/40 border border-rose-500/30 rounded-xl animate-pulse">
            <p className="text-rose-400 font-bold text-base md:text-lg">🔊 ALARM RINGING!</p>
            <p className="text-rose-300/80 text-xs md:text-sm font-medium mt-1">2000–3000 Hz siren active</p>
          </div>
        )}

        <div className="flex gap-4 justify-center my-4">
          <button
            onClick={playAlarm}
            disabled={isAlarmPlaying}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 text-sm md:text-base bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-md shadow-rose-600/20 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            🔊 Test Alarm
          </button>
          <button
            onClick={stopAlarm}
            disabled={!isAlarmPlaying}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 text-sm md:text-base bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-900/20 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>
    </div>
  );
});

Alarm.displayName = 'Alarm';
export default Alarm;
