export default function VegIcon({ isVeg }) {
  const color = isVeg ? '#3d9b6e' : '#e23744';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
        border: `1.5px solid ${color}`,
        borderRadius: 3,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          display: 'block',
        }}
      />
    </span>
  );
}
