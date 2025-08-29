export interface Employee {
  'Id Contratado': number;
  'Nome do Colaborador': string;
  'Cargo Atual': string;
  'Id Gestor'?: number | null;
  'Diretoria'?: string;
  'Salário'?: number;
  'Departamento'?: string;
  'Grade'?: string;
  'Piso Salarial'?: number;
  'Teto Salarial'?: number;
  'Descrição da Grade'?: string;
  'Percentual na Faixa'?: number | null;
  [key: string]: any;
}