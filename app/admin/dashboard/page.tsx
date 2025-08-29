"use client";

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';

const containerStyle: React.CSSProperties = {
  padding: '40px',
  maxWidth: '700px',
  margin: '40px auto',
  textAlign: 'center',
  border: '1px solid #eee',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  marginTop: '30px',
  backgroundColor: '#f9f9f9'
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px'
};

const messageStyle: React.CSSProperties = {
  padding: '15px',
  borderRadius: '5px',
  marginTop: '20px',
  fontWeight: 'bold',
  border: '1px solid'
};

export default function DashboardPage(): ReactElement {
  const router = useRouter();
  
  const [orgFile, setOrgFile] = useState<File | null>(null);
  const [gradesFile, setGradesFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string, errors?: string[]} | null>(null);

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/logout');
      window.location.href = '/admin/login';
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      alert("Não foi possível fazer logout. Verifique sua conexão.");
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!orgFile && !gradesFile) {
      setMessage({ type: 'error', text: 'Por favor, selecione pelo menos um arquivo para enviar.' });
      return;
    }
    
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    if (orgFile) formData.append('organogramData', orgFile);
    if (gradesFile) formData.append('gradesData', gradesFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Arquivos enviados com sucesso! O organograma será atualizado para todos os usuários.' });
        setOrgFile(null);
        setGradesFile(null);
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ type: 'error', text: data.message || 'Falha ao enviar arquivos.', errors: data.errors });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ocorreu um erro de rede. Verifique sua conexão.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Painel Administrativo</h1>
      <p>Faça o upload das novas planilhas para atualizar o organograma globalmente.</p>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label htmlFor="orgFile">1. Planilha de Organograma (Principal):</label>
          <input id="orgFile" type="file" accept=".xlsx, .xls" onChange={(e) => setOrgFile(e.target.files?.[0] || null)} />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="gradesFile">2. Planilha de Grades Salariais:</label>
          <input id="gradesFile" type="file" accept=".xlsx, .xls" onChange={(e) => setGradesFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={isUploading} style={{ padding: '12px', fontSize: '16px', cursor: isUploading ? 'wait' : 'pointer' }}>
          {isUploading ? 'Enviando...' : 'Atualizar Organograma'}
        </button>
      </form>
      
      {message && (
        <div style={{...messageStyle, backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb', color: message.type === 'success' ? '#155724' : '#721c24', textAlign: 'left'}}>
          <p style={{fontWeight: 'bold', margin: 0}}>{message.text}</p>
          {message.errors && message.errors.length > 0 && (
            <ul style={{marginTop: '10px', paddingLeft: '20px', marginBottom: 0}}>
              {message.errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: '40px', backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
        Sair (Logout)
      </button>
    </div>
  );
}