import { useState } from 'react';

export default function StarRating({ value = 0, onChange, editable = false, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const display = hover || value || 0;

  return (
    <div className={`stars stars-${size} ${editable ? 'editable' : ''}`} role="img" aria-label={`${value || 0} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= display ? 'on' : ''}`}
          disabled={!editable}
          onMouseEnter={() => editable && setHover(n)}
          onMouseLeave={() => editable && setHover(0)}
          onClick={() => editable && onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
