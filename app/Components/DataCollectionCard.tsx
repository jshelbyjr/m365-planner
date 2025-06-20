import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import React from 'react';

export type ScanStatus = {
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

export default function DataCollectionCard({
  scanStatus,
  onStartScan,
  renderStatus
}: {
  scanStatus: ScanStatus | null,
  onStartScan: () => void,
  renderStatus: () => React.ReactNode
}) {
  return (
    <Card className="p-6 rounded-lg shadow-md bg-white">
      <CardHeader
        title={<Typography variant="h6" className="mb-3">Data Collection</Typography>}
        className="p-0 mb-3"
      />
      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onStartScan}
            disabled={scanStatus?.status === 'IN_PROGRESS'}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {scanStatus?.status === 'IN_PROGRESS' ? 'Scanning...' : 'Start New Scan'}
          </button>
          <div className="flex-grow">{renderStatus()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
