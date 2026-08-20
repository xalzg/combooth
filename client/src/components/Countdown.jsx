import React, { useEffect, useState } from 'react';
import { playBeep } from '../services/sound';
import './Countdown.css';

const STEPS = [
  { value: 3,         label: 'GET READY...',  color: '#00D9FF' },
  { value: 2,         label: 'ALMOST...',     color: '#00A8FF' },
  { value: 1,         label: 'LOOK HERE!',    color: '#7C5CFF' },
  { value: '📸',      label: 'CAPTURE!',      color: '#00FFB3' },
];

/**
 * Countdown — Animated 3→2→1→CAPTURE! overlay.
 *
 * Props:
 *  - onComplete:  Called when countdown finishes
 *  - duration:    Seconds per step (default 1)
 */
function Countdown({ onComplete, duration = 1 }) {
  const [step, setStep]         = useState(0);
  const [visible, setVisible]   = useState(true);
  const [exiting, setExiting]   = useState(false);

  useEffect(() => {
    if (step >= STEPS.length) {
      // All steps done — trigger capture
      const t = setTimeout(() => onComplete?.(), 200);
      return () => clearTimeout(t);
    }

    // Play beep for numeric steps
    if (step < STEPS.length - 1) {
      playBeep();
    }

    // Show current step, then transition out
    const showTimer = setTimeout(() => {
      setExiting(true);
      const exitTimer = setTimeout(() => {
        setExiting(false);
        setStep(s => s + 1);
      }, 300);
      return () => clearTimeout(exitTimer);
    }, duration * 1000 - 300);

    return () => clearTimeout(showTimer);
  }, [step, duration, onComplete]);

  if (step >= STEPS.length) return null;

  const current = STEPS[step];

  return (
    <div className="countdown-overlay" aria-live="assertive" aria-label={`Countdown: ${current.value}`}>
      {/* Background pulse rings (3 layers) */}
      <div
        className="countdown-ring"
        style={{ borderColor: current.color + '80', boxShadow: `0 0 30px ${current.color}40` }}
      />
      <div
        className="countdown-ring countdown-ring--2"
        style={{ borderColor: current.color + '40' }}
      />
      <div
        className="countdown-ring countdown-ring--3"
        style={{ borderColor: current.color + '20' }}
      />

      {/* Main number */}
      <div
        className={`countdown-number ${exiting ? 'countdown-number--exit' : 'countdown-number--enter'}`}
        style={{ color: current.color, textShadow: `0 0 40px ${current.color}, 0 0 80px ${current.color}60` }}
      >
        {current.value}
      </div>

      {/* Sub-label */}
      <div
        className={`countdown-label ${exiting ? 'countdown-label--exit' : 'countdown-label--enter'}`}
        style={{ color: current.color + 'CC' }}
      >
        {current.label}
      </div>

      {/* Progress dots */}
      <div className="countdown-dots">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`countdown-dot ${i === step ? 'countdown-dot--active' : ''} ${i < step ? 'countdown-dot--done' : ''}`}
            style={i === step || i < step ? { background: current.color, boxShadow: `0 0 6px ${current.color}` } : {}}
          />
        ))}
      </div>
    </div>
  );
}

export default Countdown;
