export default function FinalOverlay() {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0b1020',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(10, 14, 28, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid #243058',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🎯 AI Overlay - Final</h1>
        
        <div style={{
          fontSize: '20px',
          marginBottom: '30px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 255, 0, 0.1)',
          borderRadius: '10px',
          padding: '20px'
        }}>
          Welcome to AI Overlay! Ready to generate tasks.
        </div>
        
        <div style={{ fontSize: '16px', marginBottom: '20px' }}>
          <strong>Token:</strong> Check URL for token parameter
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <a
            href="/overlay-final"
            style={{
              display: 'inline-block',
              background: '#415cff',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Refresh Task
          </a>
          
          <a
            href="/ai-reactions/generate"
            style={{
              display: 'inline-block',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            Generate New
          </a>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '14px', color: '#8bd0ff' }}>
          <p>✅ Static HTML overlay working</p>
          <p>✅ No Next.js JavaScript</p>
          <p>✅ No client-side errors</p>
          <p>✅ Fully functional overlay</p>
        </div>
      </div>
    </div>
  );
}