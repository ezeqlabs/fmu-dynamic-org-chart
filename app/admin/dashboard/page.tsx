"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const containerStyle: React.CSSProperties = {
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
  textAlign: 'center',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  marginTop: '30px'
};

const messageStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '5px',
  marginTop: '20px',
  fontWeight: 'bold'
};

export default function DashboardPage() {
  const router = useRouter();
  const [orgFile, setOrgFile] = useState<File | null>(null);
  const [gradesFile, setGradesFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleLogout = async () => {
  try {
    await fetch('/api/logout');
    window.location.href = '/admin/login'; 
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
    alert("Não foi possível fazer logout. Verifique sua conexão.");
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgFile && !gradesFile) {
      setMessage({ type: 'error', text: 'Por favor, selecione os dois arquivos.' });
      return;
    }
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    if(orgFile) {
      formData.append('organogramData', orgFile);
    }
    if(gradesFile) {
      formData.append('gradesData', gradesFile);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Planilhas enviadas com sucesso! O organograma será atualizado para todos os usuários.' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Falha ao enviar arquivos.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Ocorreu um erro de rede.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Painel Administrativo</h1>
      <p>Faça o upload das novas planilhas para atualizar o organograma.</p>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="orgFile">1. Planilha de Organograma (Principal):</label>
          <input id="orgFile" type="file" accept=".xlsx, .xls" onChange={(e) => setOrgFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label htmlFor="gradesFile">2. Planilha de Grades Salariais:</label>
          <input id="gradesFile" type="file" accept=".xlsx, .xls" onChange={(e) => setGradesFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={isUploading} style={{ padding: '12px' }}>
          {isUploading ? 'Enviando...' : 'Atualizar Organograma'}
        </button>
      </form>
      
      {message && (
        <div style={{...messageStyle, backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24'}}>
          {message.text}
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: '40px' }}>Sair (Logout)</button>
    </div>
  );
}