import React from 'react';

const cardStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '300px',
  padding: '20px',
  backgroundColor: 'white',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  borderRadius: '8px',
  border: '1px solid #ddd',
  zIndex: 1000,
  transition: 'transform 0.2s ease-out',
};

const InfoCard = ({ nodeData, onClose, mapping }) => {
  if (!nodeData) {
    return null;
  }

  /**
   * Função auxiliar para formatar os valores que serão exibidos.
   * Isso mantém a lógica de apresentação separada da estrutura do componente.
   * @param {string} field - O nome do campo (ex: 'Salário').
   * @param {*} value - O valor do campo.
   * @returns {string} - O valor formatado.
   */
  const formatValue = (field, value) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (field === mapping.calculatedKey) {
      return `${value.toFixed(1)}%`;
    }

    if (field === mapping.salaryKey || field === mapping.salaryFloorKey || field === mapping.salaryCeilingKey) {
        if (typeof value === 'number') {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }
    
    return value;
  };

  return (
    <div style={cardStyle}>
      <button 
        onClick={onClose} 
        style={{ 
          position: 'absolute', top: '10px', right: '10px',
          border: 'none', background: 'transparent', fontSize: '24px', 
          cursor: 'pointer', color: '#888' 
        }}
      >
        &times;
      </button>

      <h3 style={{ marginTop: 0, paddingRight: '20px' }}>Detalhes do Colaborador</h3>
      
      {mapping.cardFields.map(field => (
        <p key={field} style={{ margin: '8px 0', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
          <strong style={{ color: '#333' }}>{field}:</strong> 
          <span style={{ float: 'right', color: '#555' }}>{formatValue(field, nodeData[field])}</span>
        </p>
      ))}
    </div>
  );
};

export default InfoCard;