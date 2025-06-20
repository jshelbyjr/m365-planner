// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Components/Sidebar';
import DataCollectionCard, { ScanStatus } from './Components/DataCollectionCard';
import TotalsCards from './Components/TotalsCards';

// Define types for our data

type User = { id: string; displayName: string; userPrincipalName: string; accountEnabled: boolean };
type Group = { id: string; displayName: string };

export default function DashboardPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [m365Groups, setM365Groups] = useState<Group[]>([]);
  const [securityGroups, setSecurityGroups] = useState<Group[]>([]);

  // Fetch users and groups on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups');
        if (res.ok) {
          setM365Groups(await res.json());
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchUsers();
    fetchGroups();
    // Add more fetches here for future cards/routes
  }, []);


  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <TotalsCards
          cards={[
            { label: 'Total Users', count: users.length },
            { label: 'Total M365 Groups', count: m365Groups.length },
            // Add more cards here as needed, e.g.:
            // { label: 'Total Security Groups', count: securityGroups.length },
          ]}
        />
        {/* DataTables moved to their own pages */}
      </main>
    </div>
  );
}

// ...existing code...