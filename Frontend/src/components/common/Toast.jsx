import { useEffect } from 'react';

export default function Toast({ message, onDone, variant = 'default' }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="toast"
      style={variant === 'error' ? { background: '#e23744' } : undefined}
      role="status"
    >
      {message}
    </div>
  );
}
