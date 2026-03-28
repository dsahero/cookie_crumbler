import './Toggle.css';

export default function Toggle({ checked, onChange, label, id }) {
  const toggleId = id ?? label.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="toggle-row">
      <span className="toggle-row__label" id={`${toggleId}-label`}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${toggleId}-label`}
        id={toggleId}
        className={`toggle ${checked ? 'toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
    </div>
  );
}
