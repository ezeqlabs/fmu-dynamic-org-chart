"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80vh',
};

const formStyle: React.CSSProperties = {
  width: '300px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Senha incorreta.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2>Login Administrativo</h2>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'cornflowerblue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  );
}