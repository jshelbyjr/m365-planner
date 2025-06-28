
"use client";



import React, { useState, useEffect } from 'react';
import { useApiData } from '../../../lib/useApiData';
import { CircularProgress, Typography } from '@mui/material';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

interface SharePointSite {
  id: string;
  name?: string;
  storageUsed?: number;
  filesCount?: number;
  externalSharing?: string;
  teams?: string | null;
  m365Group?: string | null;
}


export default function SharePointDashboardPage() {
  const { data, loading, error, refetch } = useApiData<SharePointSite[]>('/api/data/sharepoint');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  // Only show sites not related to Teams or M365 Groups
  const sites = (data || []).filter(site => !site.teams && !site.m365Group);

  // Fetch scan status for SharePoint
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=sharepoint');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        // If scan just completed, refresh sites
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
      body: JSON.stringify({ dataType: 'sharepoint' })
    });
    if (res.ok) {
      refetch();
      const statusRes = await fetch('/api/scan?dataType=sharepoint');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'name', label: 'Site Name' },
    { key: 'storageUsed', label: 'Storage (MB)' },
    { key: 'filesCount', label: 'Files' },
    { key: 'externalSharing', label: 'External Sharing' },
  ];

  // Handler to fetch all SharePoint sites and export as CSV

  const handleExportAllSites = async () => {
    const res = await fetch('/api/data/sharepoint');
    if (res.ok) {
      const allSites: SharePointSite[] = await res.json();
      return allSites;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">SharePoint Sites
        <ExportCSVButton
          data={sites}
          columns={columns}
          fileName="sharepoint-sites.csv"
          // @ts-ignore
          fetchAllData={handleExportAllSites}
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
          title={`SharePoint Sites (${sites.length})`}
          data={sites.map(site => ({
            ...site,
            storageUsed: site.storageUsed !== undefined && site.storageUsed !== null ? site.storageUsed.toLocaleString() : '-',
          }))}
          displayKey="name"
          columns={columns}
        />
      )}
    </main>
  );
}
