// Domains DataTable Page
'use client';

import React, { useState, useEffect } from 'react';
import { useApiData } from '../../../lib/useApiData';
import { CircularProgress } from '@mui/material';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';
import type { Domain } from '../../types';


export default function DomainsPage() {
  const { data: domains, loading, error, refetch } = useApiData<Domain[]>('/api/data/domains');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=domains');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        // If scan just completed, refresh domains
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
      body: JSON.stringify({ dataType: 'domains' })
    });
    if (res.ok) {
      refetch();
      const statusRes = await fetch('/api/scan?dataType=domains');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'id', label: 'Domain Name' },
    { key: 'status', label: 'Status' },
  ];

  // Handler to fetch all domains and export as CSV
  const handleExportAllDomains = async () => {
    const res = await fetch('/api/data/domains');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">Domains
        <ExportCSVButton
          data={domains || []}
          columns={columns}
          fileName="domains.csv"
          // @ts-ignore
          fetchAllData={handleExportAllDomains}
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
          title={`Domains (${domains ? domains.length : 0})`}
          data={domains || []}
          displayKey="id"
          columns={columns}
        />
      )}
    </main>
  );
}
