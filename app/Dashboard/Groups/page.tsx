// Groups DataTable Page
'use client';
import { useEffect, useState } from 'react';
import DataTable from '../../Components/DataTable';

type Group = {
  id: string;
  displayName: string;
  mailNickname?: string;
  memberCount?: number;
  visibility?: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);

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

  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'mailNickname', label: 'Mail Nickname' },
    { key: 'memberCount', label: 'Member Count' },
    { key: 'visibility', label: 'Visibility' },
  ];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">M365 Groups</h1>
      <DataTable
        title={`M365 Groups (${groups.length})`}
        data={groups}
        displayKey="displayName"
        columns={columns}
      />
    </main>
  );
}
