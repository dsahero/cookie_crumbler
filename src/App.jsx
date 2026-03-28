import { useState } from 'react';
import SummaryCard from './components/SummaryCard.jsx';
import Toggle from './components/Toggle.jsx';
import CookieCard from './components/CookieCard.jsx';
import cookieCrumbledUrl from '../extension/CookieCrumbled.png?url';
import cookieUncrumbledUrl from '../extension/CookieUncrumbled.png?url';
import './App.css';

const COOKIE_ROWS = [
  {
    name: '_ga',
    category: 'Analytics',
    categoryKind: 'analytics',
    primaryAction: 'allow',
  },
  {
    name: '_fbp',
    category: 'Marketing',
    categoryKind: 'marketing',
    primaryAction: 'allow',
  },
  {
    name: 'session_id',
    category: 'Functional',
    categoryKind: 'functional',
    primaryAction: 'block',
  },
  {
    name: '_gid',
    category: 'Analytics',
    categoryKind: 'analytics',
    primaryAction: 'allow',
  },
];

export default function App() {
  const [screen, setScreen] = useState('main');
  const [protectionOn, setProtectionOn] = useState(true);
  const [blockHarmful, setBlockHarmful] = useState(true);
  const [clipboardProtection, setClipboardProtection] = useState(false);

  return (
    <div className="popup-root">
      <div className="popup-card">
        <div
          className={`popup-views ${screen === 'details' ? 'popup-views--details' : ''}`}
        >
          <main
            className="popup-screen popup-screen--main"
            aria-hidden={screen !== 'main'}
          >
            <h1 className="popup-title">CookieCrumbler</h1>

            <button
              type="button"
              className="protection-control"
              onClick={() => setProtectionOn((v) => !v)}
              aria-pressed={protectionOn}
              aria-label={
                protectionOn
                  ? 'Protection on. Click to turn off.'
                  : 'Protection off. Click to turn on.'
              }
            >
              <span className="protection-control__outer">
                <span className="protection-control__inner">
                  <img
                    className="protection-control__img"
                    src={protectionOn ? cookieCrumbledUrl : cookieUncrumbledUrl}
                    alt=""
                    width={132}
                    height={132}
                    draggable={false}
                  />
                </span>
              </span>
            </button>

            <div className="protection-status-wrap">
              <p className="protection-status">
                Protection {protectionOn ? 'ON' : 'OFF'}
              </p>
            </div>

            <div className="popup-stack">
              <SummaryCard total={24} harmful={18} safe={6} />

              <div className="settings-stack">
                <Toggle
                  label="Block harmful cookies"
                  checked={blockHarmful}
                  onChange={setBlockHarmful}
                  id="toggle-block"
                />
                <Toggle
                  label="Clipboard protection"
                  checked={clipboardProtection}
                  onChange={setClipboardProtection}
                  id="toggle-clipboard"
                />
              </div>

              <button
                type="button"
                className="btn-advanced"
                onClick={() => setScreen('details')}
              >
                Advanced controls
              </button>
            </div>
          </main>

          <section
            className="popup-screen popup-screen--details"
            aria-hidden={screen !== 'details'}
          >
            <header className="details-header">
              <button
                type="button"
                className="btn-back"
                onClick={() => setScreen('main')}
              >
                <span className="btn-back__arrow" aria-hidden="true">
                  ←
                </span>
                Back
              </button>
              <h1 className="details-header__title">Cookie Details</h1>
              <span className="details-header__spacer" aria-hidden="true" />
            </header>

            <ul className="cookie-list">
              {COOKIE_ROWS.map((row) => (
                <li key={row.name} className="cookie-list__item">
                  <CookieCard
                    name={row.name}
                    category={row.category}
                    categoryKind={row.categoryKind}
                    primaryAction={row.primaryAction}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
