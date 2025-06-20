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


  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <TotalsCards usersCount={users.length} m365GroupsCount={m365Groups.length} />
        {/* DataTables moved to their own pages */}
      </main>
    </div>
  );
}

// ...existing code...