// Users DataTable Page
'use client';
import { useEffect, useState } from 'react';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';

type User = {
  id: string;
  displayName: string;
  userPrincipalName: string;
  accountEnabled: boolean;
  department?: string;
  jobTitle?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/data/users');
      if (res.ok) setUsers(await res.json());
    };
    fetchUsers();
  }, []);

  // Fetch latest scan status for users

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        // If scan just completed, refresh users
        if (status.status === 'COMPLETED') {
          const usersRes = await fetch('/api/data/users');
          if (usersRes.ok) setUsers(await usersRes.json());
        }
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
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType: 'users' })
    });
    if (res.ok) {
      // Optionally refetch users after scan
      const usersRes = await fetch('/api/data/users');
      if (usersRes.ok) setUsers(await usersRes.json());
      // Refetch scan status
      const statusRes = await fetch('/api/scan');
      if (statusRes.ok) setScanStatus(await statusRes.json());
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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
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
      <DataTable
        title={`Users (${users.length})`}
        data={users}
        displayKey="userPrincipalName"
        columns={columns}
      />
    </main>
  );
}
