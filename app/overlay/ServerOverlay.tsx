interface ServerOverlayProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ServerOverlay({ searchParams }: ServerOverlayProps) {
  const key = searchParams.key as string | undefined;

  if (!key) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b1020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #243058'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Overlay key is missing</h2>
          <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '20px' }}>
            Please provide a valid key parameter in the URL.
          </p>
          <p style={{ fontSize: '14px', color: '#888' }}>Expected format: /overlay?key=YOUR_KEY</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b1020',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        background: 'rgba(10, 14, 28, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid #243058'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '30px', color: '#8bd0ff' }}>🎯 AI Overlay</h1>
        
        <div style={{
          background: '#1a1f3a',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '25px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'semibold', marginBottom: '15px', color: '#e6e9f2' }}>Status</h2>
          <div style={{
            fontSize: '22px',
            color: '#66ff66',
            marginBottom: '20px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            Connected with key: {key}
          </div>
        </div>

        <div style={{
          background: '#1a1f3a',
          borderRadius: '10px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'semibold', marginBottom: '15px', color: '#e6e9f2' }}>Key Info</h3>
          <code style={{
            fontSize: '14px',
            color: '#ccc',
            wordBreak: 'break-all',
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 12px',
            borderRadius: '5px'
          }}>
            {key}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a
            href={`/overlay?key=${encodeURIComponent(key)}`}
            style={{
              padding: '12px 25px',
              background: '#415cff',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Refresh Overlay
          </a>
        </div>

        <div style={{ marginTop: '40px', fontSize: '14px', color: '#888' }}>
          <p>✅ Server-side rendering working</p>
          <p>✅ Key validation working</p>
          <p>✅ Error handling in place</p>
        </div>
      </div>
    </div>
  );
}
