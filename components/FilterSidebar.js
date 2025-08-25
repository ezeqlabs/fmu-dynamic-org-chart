import React from 'react';

const sidebarStyle = {
  width: '200px',
  flexShrink: 0,
  padding: '20px',
  borderRight: '1px solid #ddd',
  backgroundColor: '#f9f9f9',
};

const buttonStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 15px',
  marginBottom: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
};

const activeButtonStyle = {
  ...buttonStyle,
  backgroundColor: 'cornflowerblue',
  color: 'white',
  borderColor: 'cornflowerblue',
  fontWeight: 'bold',
};

const FilterSidebar = ({ directorates, activeFilter, onFilterChange }) => {
  return (
    <div style={sidebarStyle}>
      <h3 style={{ marginTop: 0 }}>Filtrar por Diretoria</h3>
      
      <button 
        style={activeFilter === 'Geral' ? activeButtonStyle : buttonStyle}
        onClick={() => onFilterChange('Geral')}
      >
        Geral
      </button>

      {directorates.map(dir => (
        <button 
          key={dir}
          style={activeFilter === dir ? activeButtonStyle : buttonStyle}
          onClick={() => onFilterChange(dir)}
        >
          {dir}
        </button>
      ))}
    </div>
  );
};

export default FilterSidebar;