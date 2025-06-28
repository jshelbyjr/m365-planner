// Exchange Mailboxes DataTable Page
'use client';
import { useEffect, useState } from 'react';
import { useApiData } from '../../../lib/useApiData';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

export type ExchangeMailbox = {
  id: string;
  displayName?: string;
  isDeleted?: boolean;
  deletedDate?: string;
  createdDate?: string;
  lastActivityDate?: string;
  itemCount?: number;
  storageUsedBytes?: string;
  issueWarningQuotaBytes?: string;
  prohibitSendQuotaBytes?: string;
  prohibitSendReceiveQuotaBytes?: string;
  deletedItemCount?: number;
  deletedItemSizeBytes?: string;
  deletedItemQuotaBytes?: string;
  hasArchive?: boolean;
  recipientType?: string;
  reportPeriod?: string;
  reportRefreshDate?: string;
};

export default function ExchangeMailboxesPage() {
  const { data: mailboxes, loading, error, refetch } = useApiData<ExchangeMailbox[]>('/api/data/exchange-mailboxes');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=exchangeMailboxes');
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
      body: JSON.stringify({ dataType: 'exchangeMailboxes' })
    });
    if (res.ok) {
      setScanStatus({ status: 'IN_PROGRESS' });
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'isDeleted', label: 'Is Deleted' },
    { key: 'deletedDate', label: 'Deleted Date' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'lastActivityDate', label: 'Last Activity Date' },
    { key: 'itemCount', label: 'Item Count' },
    {
      key: 'storageUsedBytes',
      label: 'Storage Used (GB)',
      render: (row: ExchangeMailbox) => {
        const val = row.storageUsedBytes;
        if (!val) return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    {
      key: 'issueWarningQuotaBytes',
      label: 'Issue Warning Quota (GB)',
      render: (row: ExchangeMailbox) => {
        const val = row.issueWarningQuotaBytes;
        if (!val) return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    {
      key: 'prohibitSendQuotaBytes',
      label: 'Prohibit Send Quota (GB)',
      render: (row: ExchangeMailbox) => {
        const val = row.prohibitSendQuotaBytes;
        if (!val) return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    {
      key: 'prohibitSendReceiveQuotaBytes',
      label: 'Prohibit Send/Receive Quota (GB)',
      render: (row: ExchangeMailbox) => {
        const val = row.prohibitSendReceiveQuotaBytes;
        if (!val) return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    { key: 'deletedItemCount', label: 'Deleted Item Count' },
    {
      key: 'deletedItemSizeBytes',
      label: 'Deleted Item Size (GB)',
      render: (row: ExchangeMailbox) => {
        const val = row.deletedItemSizeBytes;
        if (!val) return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    {
      key: 'deletedItemQuotaBytes',
      label: 'Deleted Item Quota (GB)',
      render: (row: ExchangeMailbox) => {
        const val = row.deletedItemQuotaBytes;
        if (!val) return '';
        const num = typeof val === 'bigint' ? Number(val) : Number(val);
        if (isNaN(num)) return '';
        return (num / (1024 ** 3)).toFixed(4);
      },
    },
    { key: 'hasArchive', label: 'Has Archive' },
    { key: 'recipientType', label: 'Recipient Type' },
    { key: 'reportPeriod', label: 'Report Period' },
    { key: 'reportRefreshDate', label: 'Report Refresh Date' },
  ];

  const handleExportAll = async () => {
    const res = await fetch('/api/data/exchange-mailboxes');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">Exchange Mailboxes
        <ExportCSVButton
          data={mailboxes || []}
          columns={columns}
          fileName="exchange-mailboxes.csv"
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
        title={`Exchange Mailboxes (${mailboxes?.length || 0})`}
        data={mailboxes || []}
        displayKey="displayName"
        columns={columns}
        loading={loading}
      />
    </main>
  );
}
