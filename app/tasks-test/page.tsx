'use client';

import { useState } from 'react';

interface TaskData {
  text: string;
  voiceUrl: string;
  mode: string;
  tone: string;
  updatedAt: number;
}

export default function TasksTestPage() {
  const [overlayKey, setOverlayKey] = useState('test-overlay-123');
  const [mode, setMode] = useState('funny');
  const [tone, setTone] = useState('playful');
  const [voice, setVoice] = useState('alloy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaskData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTask = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/tasks/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overlayKey,
          mode,
          tone,
          voice,
          speed: 1.0
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const skipTask = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks/skip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overlayKey
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(null);
        alert('Task skipped successfully');
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getState = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overlayKey
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'No state found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b1020',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
          🎯 Tasks API Test
        </h1>

        <div style={{
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '30px',
          borderRadius: '15px',
          border: '1px solid #243058',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Configuration</h2>
          
          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Overlay Key:
              </label>
              <input
                type="text"
                value={overlayKey}
                onChange={(e) => setOverlayKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#1a1f3a',
                  color: 'white',
                  border: '1px solid #243058',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Mode:
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#1a1f3a',
                  color: 'white',
                  border: '1px solid #243058',
                  borderRadius: '5px'
                }}
              >
                <option value="funny">😄 Funny</option>
                <option value="serious">😐 Serious</option>
                <option value="chill">😌 Chill</option>
                <option value="street">😎 Street</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Tone:
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="playful, serious, energetic..."
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#1a1f3a',
                  color: 'white',
                  border: '1px solid #243058',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Voice:
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#1a1f3a',
                  color: 'white',
                  border: '1px solid #243058',
                  borderRadius: '5px'
                }}
              >
                <option value="alloy">🎭 Alloy</option>
                <option value="echo">🎪 Echo</option>
                <option value="fable">📚 Fable</option>
                <option value="onyx">💎 Onyx</option>
                <option value="nova">⭐ Nova</option>
                <option value="shimmer">✨ Shimmer</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <button
            onClick={generateTask}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#666' : '#415cff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Processing...' : '🎯 Generate Task'}
          </button>

          <button
            onClick={skipTask}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#666' : '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ⏭️ Skip Task
          </button>

          <button
            onClick={getState}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#666' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            📊 Get State
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid #ff6b6b',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>❌ Error</h3>
            <p style={{ margin: 0, color: '#ffcccc' }}>{error}</p>
          </div>
        )}

        {result && (
          <div style={{
            background: 'rgba(40, 167, 69, 0.1)',
            border: '1px solid #28a745',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#28a745', margin: '0 0 15px 0' }}>✅ Task Generated</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Text:</strong>
              <p style={{ 
                margin: '5px 0 0 0', 
                padding: '10px', 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: '5px',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                "{result.text}"
              </p>
            </div>

            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <strong>Mode:</strong> {result.mode}
              </div>
              <div>
                <strong>Tone:</strong> {result.tone}
              </div>
              <div>
                <strong>Voice URL:</strong>
                <a 
                  href={result.voiceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#415cff', marginLeft: '5px' }}
                >
                  🔊 Play Audio
                </a>
              </div>
              <div>
                <strong>Updated:</strong> {new Date(result.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
