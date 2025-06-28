"use client";


import React, { useState, useEffect } from 'react';
import { useApiData } from '../../../lib/useApiData';
import { CircularProgress } from '@mui/material';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

interface OneDrive {
  id: string;
  ownerId?: string;
  ownerName?: string;
  siteName?: string;
  siteUrl?: string;
  size?: number;
}


export default function OneDriveDashboardPage() {
  const { data, loading, error, refetch } = useApiData<OneDrive[]>('/api/data/onedrive');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  // Convert size from bytes to MB for display
  const drives = (data || []).map(d => ({
    ...d,
    size: d.size !== undefined && d.size !== null ? +(d.size / (1024 ** 2)) : 0,
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=onedrive');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
      }
    };
    fetchScanStatus();
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [scanStatus?.status]);

  const handleStartScan = async () => {
    setScanStatus({ status: 'IN_PROGRESS' });
    const res = await fetch('/api/data/onedrive', { method: 'PUT' });
    if (res.ok) {
      refetch();
      const statusRes = await fetch('/api/scan');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'ownerName', label: 'User/Owner' },
    { key: 'siteName', label: 'Site Name' },
    { key: 'siteUrl', label: 'Site URL' },
    { key: 'size', label: 'Size (MB)' },
  ];

  const handleExportAllDrives = async () => {
    const res = await fetch('/api/data/onedrive');
    if (res.ok) {
      const allDrives: OneDrive[] = await res.json();
      // Convert size from bytes to GB for export
      return allDrives.map(d => ({
        ...d,
        size: d.size !== undefined && d.size !== null
          ? (d.size / (1024 ** 2)).toFixed(2)
          : '0.00',
      }));
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">OneDrive Accounts
        <ExportCSVButton
          data={drives}
          columns={columns}
          fileName="onedrive-accounts.csv"
          // @ts-ignore
          fetchAllData={handleExportAllDrives}
        />
      </h1>
      <div className="mb-6">
        <DataCollectionCard
          scanStatus={scanStatus}
          onStartScan={handleStartScan}
          renderStatus={() => (
            <>
              {scanStatus?.status === 'COMPLETED' && scanStatus.completedAt && (
                <span className="text-green-600">Last scan: {new Date(scanStatus.completedAt).toLocaleString()}</span>
              )}
              {scanStatus?.status === 'FAILED' && (
                <span className="text-red-600">Error: {scanStatus.error}</span>
              )}
              {error && (
                <span className="text-red-600">Error: {error}</span>
              )}
            </>
          )}
        />
      </div>
      {loading ? (
        <CircularProgress />
      ) : (
        <DataTable
          title={`OneDrive Accounts (${drives.length})`}
          data={drives.map(d => ({ ...d, size: d.size !== undefined && d.size !== null ? d.size.toFixed(2) : '0.00' }))}
          displayKey="ownerName"
          columns={columns}
        />
      )}
    </main>
  );
}
