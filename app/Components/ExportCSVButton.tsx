import React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

/**
 * Props for ExportCSVButton
 * @param data - Array of objects to export
 * @param columns - Array of column definitions ({ key, label })
 * @param fileName - Optional file name for the CSV
 */
interface ExportCSVButtonProps {
  data: Record<string, any>[];
  columns: { key: string; label: string }[];
  fileName?: string;
}

/**
 * ExportCSVButton - Exports provided data to a CSV file.
 * Uses MUI Button and Download icon.
 */
const ExportCSVButton: React.FC<ExportCSVButtonProps> = ({ data, columns, fileName = 'export.csv' }) => {
  // Converts data and columns to CSV string
  const generateCSV = () => {
    const header = columns.map(col => `"${col.label}"`).join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        // Escape quotes and commas
        if (value === null || value === undefined) return '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [header, ...rows].join('\r\n');
  };

  // Triggers download of the CSV file
  const handleExport = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      sx={{ ml: 2 }}
      aria-label="Export to CSV"
    >
      Export CSV
    </Button>
  );
};

export default ExportCSVButton;
