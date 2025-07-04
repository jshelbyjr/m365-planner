// Users DataTable Page
'use client';
import { useEffect, useState } from 'react';
import { useApiData } from '../../../lib/useApiData';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

type User = {
  id: string;
  displayName: string;
  userPrincipalName: string;
  accountEnabled: boolean;
  department?: string;
  jobTitle?: string;
};


export default function UsersPage() {
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApiData<User[]>('/api/data/users');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  // Fetch latest scan status for users

  // Poll scan status if in progress, and refresh users when scan completes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=users');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        if (status.status === 'COMPLETED') {
          refetchUsers();
        }
      }
    };
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanStatus?.status, refetchUsers]);

  const handleStartScan = async () => {
    setScanStatus({ status: 'IN_PROGRESS' });
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType: 'users' })
    });
    if (res.ok) {
      setScanStatus({ status: 'IN_PROGRESS' });
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  // Define columns to display in the DataTable
  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'userPrincipalName', label: 'User Principal Name' },
    { key: 'accountEnabled', label: 'Account Enabled' },
    { key: 'department', label: 'Department' },
    { key: 'jobTitle', label: 'Job Title' },
  ];

  // Handler to fetch all users and export as CSV
  const handleExportAllUsers = async () => {
    const res = await fetch('/api/data/users');
    if (res.ok) {
      const data = await res.json();
      return data.users || data;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">Users
        <ExportCSVButton
          data={users || []}
          columns={columns}
          fileName="users.csv"
          // Fetch all data on export
          // @ts-ignore
          fetchAllData={handleExportAllUsers}
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
              {usersError && (
                <span className="text-red-600">Error: {usersError}</span>
              )}
            </>
          )}
        />
      </div>
      <DataTable
        title={`Users (${users ? users.length : 0})`}
        data={users || []}
        displayKey="userPrincipalName"
        columns={columns}
        loading={usersLoading}
      />
    </main>
  );
}
