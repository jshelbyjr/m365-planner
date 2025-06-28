// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DataCollectionCard, { ScanStatus } from './Components/DataCollectionCard';
import TotalsCards from './Components/TotalsCards';

// Define types for our data

type User = { id: string; displayName: string; userPrincipalName: string; accountEnabled: boolean };
type Group = { id: string; displayName: string };

type Team = { id: string; displayName: string; description?: string; visibility?: string };
type SharePointSite = { id: string; name?: string; };

export default function DashboardPage() {

  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [m365Groups, setM365Groups] = useState<Group[]>([]);
  const [securityGroups, setSecurityGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sharePointSites, setSharePointSites] = useState<SharePointSite[]>([]);

  // Fetch users, groups, and teams on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/data/users');
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (e) {}
    };
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/data/groups');
        if (res.ok) {
          const data = await res.json();
          setM365Groups(data.m365Groups || []);
        }
      } catch (e) {}
    };
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/data/teams');
        if (res.ok) {
          const data = await res.json();
          // Handle both array and object response shapes
          setTeams(Array.isArray(data) ? data : data.teams || []);
        }
      } catch (e) {}
    };
    fetchUsers();
    fetchGroups();
    fetchTeams();
    const fetchSharePointSites = async () => {
      try {
        const res = await fetch('/api/data/sharepoint');
        if (res.ok) {
          setSharePointSites(await res.json());
        }
      } catch (e) {}
    };
    fetchSharePointSites();
  }, []);


  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 p-8">
        <TotalsCards
          cards={[
            { label: 'Total Users', count: users.length },
            { label: 'Total M365 Groups', count: m365Groups.length },
            { label: 'Total Teams', count: teams.length },
            { label: 'Total SharePoint Sites', count: sharePointSites.length },
          ]}
        />
        {/* DataTables moved to their own pages */}
      </main>
    </div>
  );
}

// ...existing code...