// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Components/Sidebar';
import DataCollectionCard, { ScanStatus } from './Components/DataCollectionCard';
import TotalsCards from './Components/TotalsCards';
import DataTable from './Components/DataTable';

// Define types for our data

type User = { id: string; displayName: string; userPrincipalName: string; accountEnabled: boolean };
type Group = { id: string; displayName: string };

export default function DashboardPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [m365Groups, setM365Groups] = useState<Group[]>([]);
  const [securityGroups, setSecurityGroups] = useState<Group[]>([]);

  // Function to fetch all data
  const fetchData = async () => {
    // Fetch users
    const userRes = await fetch('/api/data/users');
    if (userRes.ok) setUsers(await userRes.json());
    // Fetch groups
    const groupRes = await fetch('/api/data/groups');
    if (groupRes.ok) {
        const { m365Groups, securityGroups } = await groupRes.json();
        setM365Groups(m365Groups);
        setSecurityGroups(securityGroups);
    }
  };
  
  // Function to check scan status
  const checkScanStatus = async () => {
    const response = await fetch('/api/scan');
    if (response.ok) {
        const status: ScanStatus = await response.json();
        setScanStatus(status);
        // If scan is no longer in progress, fetch the latest data
        if (status.status !== 'IN_PROGRESS') {
          fetchData();
        }
    }
  };

  useEffect(() => {
    checkScanStatus();
  }, []);

  // Poll for status if a scan is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(checkScanStatus, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanStatus]);

  const handleStartScan = async () => {
    const response = await fetch('/api/scan', { method: 'POST' });
    if (response.ok) {
      // Immediately update status to show feedback to user
      setScanStatus({ status: 'IN_PROGRESS' });
    } else {
        const result = await response.json();
        alert(`Error: ${result.message}`);
    }
  };

  const renderStatus = () => {
    if (!scanStatus) return <p>Loading status...</p>;
    switch (scanStatus.status) {
        case 'IN_PROGRESS':
            return <p className="text-blue-600">Scan in progress... (started at {new Date(scanStatus.startedAt!).toLocaleString()})</p>;
        case 'COMPLETED':
            return <p className="text-green-600">Last scan completed successfully at {new Date(scanStatus.completedAt!).toLocaleString()}</p>;
        case 'FAILED':
            return <p className="text-red-600">Last scan failed: {scanStatus.error}</p>;
        case 'IDLE':
        default:
            return <p className="text-gray-500">No scan has been run yet.</p>;
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <DataCollectionCard
            scanStatus={scanStatus}
            onStartScan={handleStartScan}
            renderStatus={renderStatus}
          />
        </div>
        <TotalsCards usersCount={users.length} m365GroupsCount={m365Groups.length} />
        {/* DataTables moved to their own pages */}
      </main>
    </div>
  );
}

// ...existing code...