// Groups DataTable Page
'use client';
import { useEffect, useState } from 'react';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';

type Group = {
  id: string;
  displayName: string;
  mailNickname?: string;
  memberCount?: number;
  visibility?: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch('/api/data/groups');
      if (res.ok) {
        const { m365Groups } = await res.json();
        setGroups(m365Groups);
      }
    };
    fetchGroups();
  }, []);

  // Fetch latest scan status for groups

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        // If scan just completed, refresh groups
        if (status.status === 'COMPLETED') {
          const groupsRes = await fetch('/api/data/groups');
          if (groupsRes.ok) {
            const { m365Groups } = await groupsRes.json();
            setGroups(m365Groups);
          }
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
      body: JSON.stringify({ dataType: 'groups' })
    });
    if (res.ok) {
      // Optionally refetch groups after scan
      const groupsRes = await fetch('/api/data/groups');
      if (groupsRes.ok) {
        const { m365Groups } = await groupsRes.json();
        setGroups(m365Groups);
      }
      // Refetch scan status
      const statusRes = await fetch('/api/scan');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'mailNickname', label: 'Mail Nickname' },
    { key: 'memberCount', label: 'Member Count' },
    { key: 'visibility', label: 'Visibility' },
  ];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">M365 Groups</h1>
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
        title={`M365 Groups (${groups.length})`}
        data={groups}
        displayKey="displayName"
        columns={columns}
      />
    </main>
  );
}
