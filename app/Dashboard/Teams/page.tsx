// file: app/Dashboard/Teams/page.tsx
'use client';


import React, { useState, useEffect } from 'react';
import { useApiData } from '../../../lib/useApiData';
import { CircularProgress } from '@mui/material';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';
import type { Team } from '../../types';


export default function TeamsDetailPage() {
  const { data, loading, error, refetch } = useApiData<Team[]>('/api/data/teams');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const teams = Array.isArray(data) ? data : (data as any)?.teams || [];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=teams');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        if (status.status === 'COMPLETED') {
          refetch();
        }
      }
    };
    fetchScanStatus();
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [scanStatus?.status, refetch]);

  const handleStartScan = async () => {
    setScanStatus({ status: 'IN_PROGRESS' });
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType: 'teams' })
    });
    if (res.ok) {
      refetch();
      const statusRes = await fetch('/api/scan?dataType=teams');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  // Define columns to display in the DataTable
  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'description', label: 'Description' },
    { key: 'visibility', label: 'Visibility' },
    { key: 'memberCount', label: 'Member Count' },
    { key: 'totalChannelCount', label: 'Total Channels' },
  ];

  // Handler to fetch all teams and export as CSV
  const handleExportAllTeams = async () => {
    const res = await fetch('/api/data/teams');
    if (res.ok) {
      const data = await res.json();
      // Some APIs return { teams: [...] }, others may return differently
      return Array.isArray(data) ? data : data.teams || data;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">Microsoft Teams
        <ExportCSVButton
          data={teams}
          columns={columns}
          fileName="teams.csv"
          // Fetch all data on export
          // @ts-ignore
          fetchAllData={handleExportAllTeams}
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
          title={`Teams (${teams.length})`}
          data={teams}
          displayKey="displayName"
          columns={columns}
        />
      )}
    </main>
  );
}
