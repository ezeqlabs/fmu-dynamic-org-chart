/**
 * Calcula o posicionamento do salário de um funcionário dentro de sua faixa salarial.
 * @param {number} salario - O salário atual do funcionário.
 * @param {number} piso - O piso salarial da faixa.
 * @param {number} teto - O teto salarial da faixa.
 * @returns {number|null} - O percentual na faixa (80 a 120, ou fora desses limites) ou null se não for possível calcular.
 */
export const calcularPercentualFaixa = (salario, piso, teto) => {
  const numSalario = parseFloat(salario);
  const numPiso = parseFloat(piso);
  const numTeto = parseFloat(teto);

  if (isNaN(numSalario) || isNaN(numPiso) || isNaN(numTeto) || numPiso >= numTeto) {
    return null; 
  }

  const mediano = (numPiso + numTeto) / 2;

  if (numSalario === numPiso) return 80;
  if (numSalario === numTeto) return 120;
  if (numSalario === mediano) return 100;

  if (numSalario > numPiso && numSalario < mediano) {
    const progresso = (numSalario - numPiso) / (mediano - numPiso);
    return 80 + (progresso * 20);
  }
  if (numSalario > mediano && numSalario < numTeto) {
    const progresso = (numSalario - mediano) / (numTeto - mediano);
    return 100 + (progresso * 20);
  }

  if (numSalario < numPiso) {
    const valorPorPontoPercentual = (mediano - numPiso) / 20;
    if (valorPorPontoPercentual === 0) return null; // Evita divisão por zero
    const diferenca = numPiso - numSalario;
    return 80 - (diferenca / valorPorPontoPercentual);
  }
  
  if (numSalario > numTeto) {
    const valorPorPontoPercentual = (numTeto - mediano) / 20;
    if (valorPorPontoPercentual === 0) return null; // Evita divisão por zero
    const diferenca = numSalario - numTeto;
    return 120 + (diferenca / valorPorPontoPercentual);
  }
  
  return null; 
};