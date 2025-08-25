import React, { useRef, useEffect } from 'react';
import { OrgChart } from 'd3-org-chart';

const OrganizationalChart = ({ data, onNodeClick, mapping }) => { 
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0 && chartContainerRef.current) {
      if (!chartRef.current) {
        chartRef.current = new OrgChart();
      }

      chartRef.current
        .container(chartContainerRef.current)
        .data(data)
        .nodeId(d => d[mapping.idKey])
        .parentNodeId(d => d[mapping.parentKey])
        .onNodeClick((d) => onNodeClick(d.data))
        .nodeWidth(d => 220)
        .nodeHeight(d => 100)
        .compact(false)
        .nodeContent(function (d) {
          const displayName = d.data[mapping.displayNameKey];
          const displayTitle = d.data[mapping.displayTitleKey];
          return `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 0 10px; background-color: #fff; border-radius: 5px; border: 1px solid #ccc;">
              <div style="background-color: cornflowerblue; border-radius: 50%; width: 60px; height: 60px; margin-right: 10px; flex-shrink: 0;"></div>
              <div style="text-align: left;">
                <div style="font-weight: bold; font-size: 16px;">${displayName}</div>
                <div style="font-size: 14px; color: #555;">${displayTitle}</div>
              </div>
            </div>
          `;
        })
        .render();
    }
  }, [data, onNodeClick, mapping]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ width: '100%', height: '600px', backgroundColor: '#f6f6f6' }}
    />
  );
};

export default OrganizationalChart;