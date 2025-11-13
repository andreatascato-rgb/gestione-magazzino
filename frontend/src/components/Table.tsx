import React from 'react';
import Card from './Card';
import './Table.css';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

function Table<T = any>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Nessun dato disponibile',
  className = '',
  onRowClick,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <Card className={`table-empty ${className}`} padding="lg">
        <div className="table-empty-content">
          <p>{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`table-container ${className}`} padding="none">
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.align ? `text-${column.align}` : ''}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'table-row-clickable' : ''}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align ? `text-${column.align}` : ''}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default Table;

