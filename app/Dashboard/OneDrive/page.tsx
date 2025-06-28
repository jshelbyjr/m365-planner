"use client";

import { useEffect, useState } from 'react';
import { Typography, CircularProgress } from '@mui/material';
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
  const [drives, setDrives] = useState<OneDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    const fetchDrives = async () => {
      setLoading(true);
      const res = await fetch('/api/data/onedrive');
      if (res.ok) {
        const allDrives: OneDrive[] = await res.json();
        // Convert size from bytes to GB
        const drivesInMB = allDrives.map(d => ({
          ...d,
          size: d.size !== undefined && d.size !== null
            ? +(d.size / (1024 ** 2))
            : 0,
        }));
        setDrives(drivesInMB);
      }
      setLoading(false);
    };
    fetchDrives();
  }, []);

  // Optionally, implement scan status if you have a scan system for OneDrive
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan');
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
    // Trigger a scan for OneDrive data (correct endpoint)
    const res = await fetch('/api/data/onedrive', { method: 'PUT' });
    if (res.ok) {
      const drivesRes = await fetch('/api/data/onedrive');
      if (drivesRes.ok) {
        const allDrives: OneDrive[] = await drivesRes.json();
        // Convert size from bytes to GB
        const drivesInMB = allDrives.map(d => ({
          ...d,
          size: d.size !== undefined && d.size !== null
            ? +(d.size / (1024 ** 2))
            : 0,
        }));
        setDrives(drivesInMB);
      }
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
