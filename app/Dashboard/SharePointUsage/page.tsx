// SharePoint Site Usage DataTable Page
'use client';
import { useEffect, useState } from 'react';
import { useApiData } from '../../../lib/useApiData';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

type SharePointSiteUsageDetail = {
  id: string;
  siteId?: string;
  siteUrl?: string;
  siteName?: string;
  ownerDisplayName?: string;
  lastActivityDate?: string;
  fileCount?: number;
  activeFileCount?: number;
  pageViewCount?: number;
  storageUsedMB?: number;
  storageAllocatedMB?: number;
  reportPeriod?: string;
  reportRefreshDate?: string;
};

export default function SharePointUsagePage() {
  const { data: usage, loading, error, refetch } = useApiData<SharePointSiteUsageDetail[]>('/api/data/sharepoint-usage');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=sharepointUsage');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        if (status.status === 'COMPLETED') {
          refetch();
        }
      }
    };
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
      body: JSON.stringify({ dataType: 'sharepointUsage' })
    });
    if (res.ok) {
      setScanStatus({ status: 'IN_PROGRESS' });
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'siteName', label: 'Site Name' },
    { key: 'siteUrl', label: 'Site URL' },
    { key: 'ownerDisplayName', label: 'Owner' },
    { key: 'lastActivityDate', label: 'Last Activity' },
    { key: 'fileCount', label: 'File Count' },
    { key: 'activeFileCount', label: 'Active File Count' },
    { key: 'pageViewCount', label: 'Page Views' },
    { key: 'storageUsedMB', label: 'Storage Used (MB)' },
    { key: 'storageAllocatedMB', label: 'Storage Allocated (MB)' },
    { key: 'reportPeriod', label: 'Report Period' },
    { key: 'reportRefreshDate', label: 'Report Refresh Date' },
  ];

  const handleExportAll = async () => {
    const res = await fetch('/api/data/sharepoint-usage');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">SharePoint Site Usage
        <ExportCSVButton
          data={usage || []}
          columns={columns}
          fileName="sharepoint-site-usage.csv"
          // @ts-ignore
          fetchAllData={handleExportAll}
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
      <DataTable
        title={`SharePoint Site Usage (${usage ? usage.length : 0})`}
        data={usage || []}
        displayKey="siteName"
        columns={columns}
        loading={loading}
      />
    </main>
  );
}
