import React from 'react';

interface TableRendererProps {
  data: Record<string, any>[] | null | undefined;
  emptyMessage?: string;
}

const TableRenderer: React.FC<TableRendererProps> = ({ 
  data, 
  emptyMessage = "No rows returned" 
}) => {
  if (!data || data.length === 0) {
    return <div className="solver-page__output--empty">{emptyMessage}</div>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="solver-page__table-container">
      <table className="solver-page__table">
        <thead>
          <tr>
            {headers.map((head, idx) => (
              <th key={idx}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((head, colIndex) => (
                <td key={colIndex} title={row[head]?.toString()}>
                  {row[head] === null ? (
                    <span className="null-badge">NULL</span>
                  ) : (
                    String(row[head])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableRenderer;