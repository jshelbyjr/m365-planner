
import React from 'react';
import SummaryCard from './SummaryCard';
import Typography from '@mui/material/Typography';

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
    <SummaryCard
      title="Data Collection"
      metrics={[]}
      contentClassName="w-full"
      headerClassName="mb-3"
    >
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onStartScan}
          disabled={scanStatus?.status === 'IN_PROGRESS'}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {scanStatus?.status === 'IN_PROGRESS' ? 'Scanning...' : 'Start New Scan'}
        </button>
        <div className="flex-grow">{renderStatus()}</div>
      </div>
    </SummaryCard>
  );
}
