/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './globals.css';

import OrganizationalChart from '../components/OrgChart';
import InfoCard from '../components/InfoCard';
import FilterSidebar from '../components/FilterSidebar';
import { columnMapping } from '../config/mappings';
import { calcularPercentualFaixa } from '../utils/calculations';

/**
 * Função auxiliar para carregar e processar um arquivo Excel.
 */
const loadExcelFile = async (filePath: string): Promise<any[]> => {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error(`Não foi possível encontrar o arquivo: ${filePath}`);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
  const worksheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

/**
 * Função auxiliar para obter a sub-árvore completa de um funcionário (toda sua equipe).
 */
const getSubtree = (allPeople: any[], rootId: any): any[] => {
    const subtree: any[] = [];
    const queue = [rootId];
    const visited = new Set([rootId]);
    const peopleMap = new Map(allPeople.map(p => [p[columnMapping.idKey], p]));
    const childrenMap = new Map();
    allPeople.forEach(p => {
        const parentId = p[columnMapping.parentKey];
        if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId).push(p);
    });

    while(queue.length > 0) {
        const currentId = queue.shift();
        const person = peopleMap.get(currentId);
        if (person) {
            subtree.push(person);
            const children = childrenMap.get(currentId) || [];
            for (const child of children) {
                const childId = child[columnMapping.idKey];
                if (!visited.has(childId)) {
                    visited.add(childId);
                    queue.push(childId);
                }
            }
        }
    }
    return subtree;
}

export default function Home() {
  const [fullData, setFullData] = useState<any[] | null>(null);
  const [displayData, setDisplayData] = useState<any[] | null>(null);
  const [directorates, setDirectorates] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('Geral');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processData = async () => {
      try {
        const urlsResponse = await fetch('/api/data-urls');
        const { orgDataUrl, gradesDataUrl } = await urlsResponse.json();

        const orgPath = orgDataUrl || '/data/organograma-dados.xlsx';
        const gradesPath = gradesDataUrl || '/data/grades-info.xlsx';

        const [organogramData, gradesData] = await Promise.all([
            loadExcelFile(orgPath),
            loadExcelFile(gradesPath)
        ]);
        
      } catch (err: any) {
        console.error("Erro ao processar dados:", err);
        setError(err.message);
      }
    };
    processData();
  }, []);

  useEffect(() => {
    if (!fullData) return;

    if (activeFilter === 'Geral') {
      setDisplayData(fullData);
      return;
    }

    const peopleInDirectorate = fullData.filter(emp => emp[columnMapping.directorateKey] === activeFilter);
    if (peopleInDirectorate.length === 0) {
        setDisplayData([]);
        return;
    }

    const peopleInDirectorateIds = new Set(peopleInDirectorate.map(p => p[columnMapping.idKey]));
    const directorateRoot = peopleInDirectorate.find(emp => !peopleInDirectorateIds.has(emp[columnMapping.parentKey]));
    
    if (directorateRoot) {
        let subtree = getSubtree(fullData, directorateRoot[columnMapping.idKey]);
        subtree = JSON.parse(JSON.stringify(subtree));
        const rootInSubtree = subtree.find(p => p[columnMapping.idKey] === directorateRoot[columnMapping.idKey]);
        if (rootInSubtree) {
            rootInSubtree[columnMapping.parentKey] = '';
        }
        setDisplayData(subtree);
    } else {
        console.warn(`Não foi possível determinar uma raiz única para a diretoria: "${activeFilter}". Exibindo vazio para evitar erro.`);
        setDisplayData([]);
    }
  }, [activeFilter, fullData]);
  
  const handleFilterChange = (filter: string) => {
    setSelectedNode(null); 
    setActiveFilter(filter);
  };
  const handleNodeClick = (nodeData: any) => setSelectedNode(nodeData);
  const handleCloseCard = () => setSelectedNode(null);

  if (error) return <div className="App-error">Erro ao carregar os dados: {error}</div>;
  if (!displayData) return <div className="App-loading">Carregando e processando dados...</div>;

  return (
    <main>
      <InfoCard nodeData={selectedNode} onClose={handleCloseCard} mapping={columnMapping} />
      
      <header className="App-header">
        <h1>POC - Organograma a partir de Excel</h1>
      </header>
      
      <div className="main-container">
        <FilterSidebar 
          directorates={directorates}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <div className="chart-area">
          <OrganizationalChart 
            data={displayData} 
            onNodeClick={handleNodeClick} 
            mapping={columnMapping} 
          />
        </div>
      </div>
    </main>
  );
}