import { useState } from 'react';
import { PLANS, Plan } from './types';

interface Props {
  reason: string;
  onClose: () => void;
  onCheckout: (plan: 'pro' | 'studio', interval: 'month' | 'year') => void;
  busy: boolean;
  error: string;
  onDevUnlock?: () => void;
}

export function Paywall({ reason, onClose, onCheckout, busy, error, onDevUnlock }: Props) {
  const [interval, setInterval] = useState<'month' | 'year'>('year');
  const price = (p: Plan) => {
    if (p === 'pro') return interval === 'year' ? '$8' : '$12';
    if (p === 'studio') return interval === 'year' ? '$20' : '$29';
    return '$0';
  };
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Upgrade">
        <button className="x" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">Unlock</p>
        <h2>{reason}</h2>
        <p className="sub">Try everything free. Pay only when you want to keep your work and export it clean.</p>
        <div className="seg" role="group" aria-label="Billing">
          <button className={interval === 'year' ? 'on' : ''} onClick={() => setInterval('year')}>Yearly · save 33%</button>
          <button className={interval === 'month' ? 'on' : ''} onClick={() => setInterval('month')}>Monthly</button>
        </div>
        <div className="plans">
          <div className="plan">
            <h3>Free</h3>
            <div className="price">$0</div>
            <ul>
              <li>All 6 styles + examples</li>
              <li>Full brand kit builder</li>
              <li>Export 1 slide, watermarked</li>
            </ul>
          </div>
          <div className="plan hot">
            <span className="badge">Most popular</span>
            <h3>Pro</h3>
            <div className="price">{price('pro')}<small>/mo</small></div>
            <ul>
              <li>Save unlimited projects</li>
              <li>Clean PNG, PDF and ZIP export</li>
              <li>AI copy in your voice</li>
              <li>Up to 3 brands</li>
            </ul>
            <button className="btn primary" disabled={busy} onClick={() => onCheckout('pro', interval)}>{busy ? 'Opening…' : 'Go Pro'}</button>
          </div>
          <div className="plan">
            <h3>Studio</h3>
            <div className="price">{price('studio')}<small>/mo</small></div>
            <ul>
              <li>Everything in Pro</li>
              <li>Unlimited brands for clients</li>
              <li>Priority AI</li>
            </ul>
            <button className="btn" disabled={busy} onClick={() => onCheckout('studio', interval)}>Go Studio</button>
          </div>
        </div>
        {error ? <p className="err">{error}</p> : null}
        {onDevUnlock ? <button className="link" onClick={onDevUnlock}>Dev only: unlock Pro without paying</button> : null}
      </div>
    </div>
  );
}
