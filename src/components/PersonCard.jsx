export default function PersonCard({ person, index, selected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(index)}
      style={{
        border: selected ? '2px solid #4f8ef7' : '2px solid #333',
        borderRadius: '10px',
        padding: '12px',
        cursor: 'pointer',
        textAlign: 'center',
        background: selected ? '#1a2a4a' : '#1a1a1a',
        transition: 'all 0.2s',
        minWidth: '110px',
      }}
    >
      <canvas
        ref={(canvas) => {
          if (canvas && person.faceCanvas) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(person.faceCanvas, 0, 0, 80, 80);
          }
        }}
        width={80}
        height={80}
        style={{ borderRadius: '50%', display: 'block', margin: '0 auto' }}
      />
      <p style={{ margin: '8px 0 2px', fontWeight: 600 }}>Person {index + 1}</p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>
        {person.photoIndices.size} photo{person.photoIndices.size !== 1 ? 's' : ''}
      </p>
      {selected && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#4f8ef7' }}>✓ Selected</p>}
    </div>
  );
}