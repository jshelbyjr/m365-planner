// Groups DataTable Page
'use client';

import React, { useState, useEffect } from 'react';
import { useApiData } from '../../../lib/useApiData';
import { CircularProgress } from '@mui/material';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';
import type { Group } from '../../types';


export default function GroupsPage() {
  const { data, loading, error, refetch } = useApiData<{ m365Groups: Group[] }>('/api/data/groups');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const groups = (data && data.m365Groups) ? data.m365Groups : [];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const scanRes = await fetch('/api/scan?dataType=groups');
      if (scanRes.ok) {
        const status = await scanRes.json();
        setScanStatus(status);
        if (!status || status.status === 'COMPLETED' || status.status === 'IDLE') {
          refetch();
        }
      }
    };
    fetchScanStatus();
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanStatus?.status, refetch]);

  const handleStartScan = async () => {
    setScanStatus({ status: 'IN_PROGRESS' });
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType: 'groups' })
    });
    if (!res.ok) {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
    // The polling effect will handle updating groups and scanStatus after scan completes
  };

  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'mailNickname', label: 'Mail Nickname' },
    { key: 'memberCount', label: 'Member Count' },
    { key: 'visibility', label: 'Visibility' },
  ];

  // Handler to fetch all groups and export as CSV
  const handleExportAllGroups = async () => {
    const res = await fetch('/api/data/groups');
    if (res.ok) {
      const data = await res.json();
      // API returns { m365Groups: [...] }
      return data.m365Groups || data;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">M365 Groups
        <ExportCSVButton
          data={groups}
          columns={columns}
          fileName="groups.csv"
          // Fetch all data on export
          // @ts-ignore
          fetchAllData={handleExportAllGroups}
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
          title={`M365 Groups (${groups.length})`}
          data={groups}
          displayKey="displayName"
          columns={columns}
        />
      )}
    </main>
  );
}
