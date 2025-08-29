import type { Employee } from '../types';
import type { columnMapping } from '../config/mappings';

type Mapping = typeof columnMapping;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida os dados da planilha do organograma.
 * @param data - O array de objetos lido da planilha.
 * @param mapping - O objeto de configuração das colunas.
 * @returns Um objeto contendo o status da validação e uma lista de erros.
 */
export function validateOrganogramData(data: Employee[], mapping: Mapping): ValidationResult {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    return { isValid: false, errors: ['A planilha parece estar vazia.'] };
  }

  const requiredKeys = [mapping.idKey, mapping.parentKey, mapping.displayNameKey];
  const firstRow = data[0];
  for (const key of requiredKeys) {
    if (!(key in firstRow)) {
      errors.push(`Coluna obrigatória não encontrada: "${key}".`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const allIds = new Set(data.map(p => p[mapping.idKey]));
  let rootCount = 0;

  data.forEach((employee, index) => {
    const parentId = employee[mapping.parentKey];
    
    if (parentId === null || parentId === undefined || parentId === '') {
      rootCount++;
    } 
    else if (!allIds.has(parentId)) {
      errors.push(`Erro na Linha ${index + 2}: O gestor com ID "${parentId}" não foi encontrado na planilha.`);
    }
  });

  if (rootCount === 0) {
    errors.push('Erro de Hierarquia: Nenhum funcionário raiz (CEO) foi encontrado. Verifique se o campo de gestor do CEO está em branco.');
  }
  if (rootCount > 1) {
    errors.push(`Erro de Hierarquia: ${rootCount} funcionários raiz (CEO) foram encontrados, mas apenas um é permitido.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}