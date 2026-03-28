import { useCallback, useEffect, useState } from 'react';
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
    crumbled: false,
  },
  {
    name: '_fbp',
    category: 'Marketing',
    categoryKind: 'marketing',
    crumbled: true,
  },
  {
    name: 'session_id',
    category: 'Functional',
    categoryKind: 'functional',
    crumbled: true,
  },
  {
    name: '_gid',
    category: 'Analytics',
    categoryKind: 'analytics',
    crumbled: false,
  },
];

/** Names that are crumbled while protection is on (re-applied when protection turns on). */
const PROTECTION_DEFAULT_CRUMBLED = Object.fromEntries(
  COOKIE_ROWS.map((row) => [row.name, row.crumbled]),
);

const LOCK_HINT_SUMMARY =
  'Turn on protection to use the cookie summary.';
const LOCK_HINT_SETTINGS =
  'Turn on protection to change these settings.';
const LOCK_HINT_ADVANCED =
  'Turn on protection to open advanced controls.';

const initialCookieCrumbledByName = () =>
  Object.fromEntries(COOKIE_ROWS.map((row) => [row.name, row.crumbled]));

export default function App() {
  const [screen, setScreen] = useState('main');
  const [protectionOn, setProtectionOn] = useState(true);
  const [blockHarmful, setBlockHarmful] = useState(true);
  const [clipboardProtection, setClipboardProtection] = useState(false);
  const [cookieRows, setCookieRows] = useState(() => [...COOKIE_ROWS]);
  const [cookieCrumbledByName, setCookieCrumbledByName] = useState(
    initialCookieCrumbledByName,
  );
  const [exitingNames, setExitingNames] = useState(() => new Set());
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (screen !== 'details') setHelpOpen(false);
  }, [screen]);

  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setHelpOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen]);

  const crumbleCookie = (name) => {
    setCookieCrumbledByName((prev) => {
      if (prev[name]) return prev;
      return { ...prev, [name]: true };
    });
  };

  const requestDeleteCookie = (name) => {
    setExitingNames((prev) => new Set(prev).add(name));
  };

  const finishRemoveCookie = useCallback((name) => {
    setCookieRows((rows) => rows.filter((row) => row.name !== name));
    setCookieCrumbledByName((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setExitingNames((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }, []);

  const handleCookieRowTransitionEnd = (e, name) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== 'opacity') return;
    if (exitingNames.has(name)) finishRemoveCookie(name);
  };

  const handleRestart = useCallback(() => {
    setScreen('main');
    setProtectionOn(true);
    setBlockHarmful(true);
    setClipboardProtection(false);
    setCookieRows([...COOKIE_ROWS]);
    setCookieCrumbledByName(initialCookieCrumbledByName());
    setExitingNames(new Set());
  }, []);

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
            <h1 className="popup-title">CookieCrumblr</h1>

            <button
              type="button"
              className="protection-control"
              onClick={() => {
                setProtectionOn((wasOn) => {
                  const nextOn = !wasOn;
                  if (nextOn) {
                    setCookieCrumbledByName((prev) => {
                      const next = { ...prev };
                      for (const name of Object.keys(next)) {
                        if (PROTECTION_DEFAULT_CRUMBLED[name]) {
                          next[name] = true;
                        }
                      }
                      return next;
                    });
                  }
                  return nextOn;
                });
              }}
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
              <div
                className={`feature-zone ${!protectionOn ? 'feature-zone--locked' : ''}`}
              >
                {!protectionOn && (
                  <div
                    role="presentation"
                    className="feature-zone__blocker"
                    title={LOCK_HINT_SUMMARY}
                  />
                )}
                <SummaryCard
                  total={24}
                  harmful={18}
                  safe={6}
                  inactive={!protectionOn}
                />
              </div>

              <div
                className={`feature-zone settings-stack ${!protectionOn ? 'feature-zone--locked' : ''}`}
              >
                {!protectionOn && (
                  <div
                    role="presentation"
                    className="feature-zone__blocker"
                    title={LOCK_HINT_SETTINGS}
                  />
                )}
                <Toggle
                  label="Block harmful cookies"
                  checked={blockHarmful}
                  onChange={setBlockHarmful}
                  id="toggle-block"
                  disabled={!protectionOn}
                />
                <Toggle
                  label="Clipboard protection"
                  checked={clipboardProtection}
                  onChange={setClipboardProtection}
                  id="toggle-clipboard"
                  disabled={!protectionOn}
                />
              </div>

              <div
                className={`feature-zone feature-zone--footer ${!protectionOn ? 'feature-zone--locked' : ''}`}
              >
                {!protectionOn && (
                  <div
                    role="presentation"
                    className="feature-zone__blocker"
                    title={LOCK_HINT_ADVANCED}
                  />
                )}
                <button
                  type="button"
                  className="btn-advanced"
                  disabled={!protectionOn}
                  onClick={() => protectionOn && setScreen('details')}
                >
                  Advanced controls
                </button>
              </div>
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
              {cookieRows.length === 0 ? (
                <li className="cookie-list__empty">
                  No cookies in this list.
                </li>
              ) : (
                cookieRows.map((row) => (
                  <li
                    key={row.name}
                    className={`cookie-list__item ${
                      exitingNames.has(row.name)
                        ? 'cookie-list__item--removing'
                        : ''
                    }`}
                    onTransitionEnd={(e) =>
                      handleCookieRowTransitionEnd(e, row.name)
                    }
                  >
                    <CookieCard
                      name={row.name}
                      category={row.category}
                      categoryKind={row.categoryKind}
                      crumbled={cookieCrumbledByName[row.name]}
                      onCrumble={() => crumbleCookie(row.name)}
                      onDelete={() => requestDeleteCookie(row.name)}
                    />
                  </li>
                ))
              )}
            </ul>

            <div className="details-footer">
              <button
                type="button"
                className="btn-restart"
                onClick={handleRestart}
                aria-label="Recrumble cookies: reset the cookie list and main settings to defaults"
              >
                Recrumble cookies
              </button>
            </div>
          </section>
        </div>

        {screen === 'details' && (
          <button
            type="button"
            className="btn-help"
            onClick={() => setHelpOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={helpOpen}
            aria-controls="help-dialog"
          >
            Help
          </button>
        )}

        {helpOpen && screen === 'details' && (
          <div
            className="help-backdrop"
            role="presentation"
            onClick={() => setHelpOpen(false)}
          >
            <div
              id="help-dialog"
              className="help-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-dialog-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="help-dialog__header">
                <h2 id="help-dialog-title" className="help-dialog__title">
                  How CookieCrumblr works
                </h2>
                <button
                  type="button"
                  className="help-dialog__close"
                  onClick={() => setHelpOpen(false)}
                  aria-label="Close help"
                >
                  ×
                </button>
              </div>
              <div className="help-dialog__body">
                <section className="help-section">
                  <h3 className="help-section__title">Protection</h3>
                  <p className="help-section__text">
                    Tap the cookie image to turn protection on or off. When it is
                    off, the summary and settings below are locked.
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Cookie summary</h3>
                  <p className="help-section__text">
                    Shows totals for cookies we’ve scanned (example numbers in this
                    preview). Available when protection is on.
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Block harmful cookies</h3>
                  <p className="help-section__text">
                    When enabled, harmful cookies are handled according to your rules
                    (preview UI).
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Clipboard protection</h3>
                  <p className="help-section__text">
                    Optional extra protection for clipboard actions while browsing
                    (preview UI).
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Advanced controls</h3>
                  <p className="help-section__text">
                    Opens the cookie list where you can manage individual cookies.
                    Requires protection to be on.
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Crumble</h3>
                  <p className="help-section__text">
                    Stops that cookie for good. You can’t undo it on this screen.
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Crumbled</h3>
                  <p className="help-section__text">
                    This cookie is already stopped. The button is only a status
                    label.
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Delete</h3>
                  <p className="help-section__text">
                    Removes that row from the list below. It does not turn
                    protection off.
                  </p>
                </section>
                <section className="help-section">
                  <h3 className="help-section__title">Recrumble cookies</h3>
                  <p className="help-section__text">
                    Resets the cookie list and your main screen settings to their
                    defaults, like starting over.
                  </p>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
