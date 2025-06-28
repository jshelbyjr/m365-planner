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
  isDeleted?: boolean;
  lastActivityDate?: string;
  fileCount?: number;
  activeFileCount?: number;
  pageViewCount?: number;
  visitedPageCount?: number;
  storageUsedBytes?: string;
  storageAllocatedBytes?: string;
  rootWebTemplate?: string;
  ownerPrincipalName?: string;
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
    { key: 'ownerPrincipalName', label: 'Owner Principal Name' },
    { key: 'isDeleted', label: 'Is Deleted' },
    { key: 'lastActivityDate', label: 'Last Activity Date' },
    { key: 'fileCount', label: 'File Count' },
    { key: 'activeFileCount', label: 'Active File Count' },
    { key: 'pageViewCount', label: 'Page View Count' },
    { key: 'visitedPageCount', label: 'Visited Page Count' },
    {
      key: 'storageUsedBytes',
      label: 'Storage Used (GB)',
      render: (row: SharePointSiteUsageDetail) => {
        const val = row.storageUsedBytes;
        if (val === undefined || val === null || val === '') return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    {
      key: 'storageAllocatedBytes',
      label: 'Storage Allocated (GB)',
      render: (row: SharePointSiteUsageDetail) => {
        const val = row.storageAllocatedBytes;
        if (val === undefined || val === null || val === '') return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    { key: 'rootWebTemplate', label: 'Root Web Template' },
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

  // Preprocess usage data to convert storage values from bytes to GB
  const usageWithGB = (usage || []).map((row) => ({
    ...row,
    storageUsedBytes:
      row.storageUsedBytes && !isNaN(Number(row.storageUsedBytes))
        ? (Number(row.storageUsedBytes) / (1024 ** 3)).toFixed(4)
        : '',
    storageAllocatedBytes:
      row.storageAllocatedBytes && !isNaN(Number(row.storageAllocatedBytes))
        ? (Number(row.storageAllocatedBytes) / (1024 ** 3)).toFixed(4)
        : '',
  }));

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">SharePoint Site Usage
        <ExportCSVButton
          data={usageWithGB}
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
        title={`SharePoint Site Usage (${usageWithGB.length})`}
        data={usageWithGB}
        displayKey="siteName"
        columns={columns}
        loading={loading}
      />
    </main>
  );
}
