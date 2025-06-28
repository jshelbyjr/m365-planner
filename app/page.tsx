

'use client';

// Define types for our data
type User = { id: string; displayName: string; userPrincipalName: string; accountEnabled: boolean };
type Group = { id: string; displayName: string };
type Team = { id: string; displayName: string; description?: string; visibility?: string };
type SharePointSite = { id: string; name?: string; storageUsed?: number };
type OneDrive = { id: string; ownerId?: string; ownerName?: string; siteName?: string; siteUrl?: string; size?: number };

import { useState, useEffect } from 'react';
import DataCollectionCard, { ScanStatus } from './Components/DataCollectionCard';
import TotalsCards, { TotalsCardDef } from './Components/TotalsCards';



export default function DashboardPage() {
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [m365Groups, setM365Groups] = useState<Group[]>([]);
  const [securityGroups, setSecurityGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sharePointSites, setSharePointSites] = useState<SharePointSite[]>([]);
  const [oneDrives, setOneDrives] = useState<OneDrive[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);

  // Fetch data from API endpoints on mount
  useEffect(() => {
    // Users
    fetch('/api/data/users')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users'))
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

    // M365 Groups
    fetch('/api/data/groups')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch groups'))
      .then(data => setM365Groups(Array.isArray(data) ? data : []))
      .catch(() => setM365Groups([]));

    // Teams
    fetch('/api/data/teams')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch teams'))
      .then(data => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setTeams([]));

    // SharePoint Sites
    fetch('/api/data/sharepoint')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch sharepoint'))
      .then(data => setSharePointSites(Array.isArray(data) ? data : []))
      .catch(() => setSharePointSites([]));

    // OneDrive
    fetch('/api/data/onedrive')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch onedrive'))
      .then(data => setOneDrives(Array.isArray(data) ? data : []))
      .catch(() => setOneDrives([]));

    // Licenses
    fetch('/api/data/licenses')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch licenses'))
      .then(data => setLicenses(Array.isArray(data) ? data : []))
      .catch(() => setLicenses([]));
  }, []);




  // Calculate card data
  const totalUsers = users.length;

  const activeUsers = users.filter((u: User) => u.accountEnabled).length;
  const disabledUsers = users.filter((u: User) => u.accountEnabled === false).length;

  const totalOneDrives = oneDrives.length;
  const totalOneDriveStorage = oneDrives.reduce((sum: number, od: OneDrive) => sum + (typeof od.size === 'number' ? od.size : 0), 0) / (1024 ** 3); // bytes to GB

  const totalSharePointSites = sharePointSites.length;
  const totalSharePointStorage = sharePointSites.reduce((sum: number, s: SharePointSite) => sum + (typeof s.storageUsed === 'number' ? s.storageUsed : 0), 0) / (1024 ** 3); // bytes to GB

  const totalGroups = m365Groups.length;
  const totalTeams = teams.length;

  // Licenses: unique SKUs and total assigned
  const uniqueSkus = new Set(licenses.map((l: any) => l.skuPartNumber)).size;
  const totalAssignedLicenses = licenses.reduce((sum: number, l: any) => sum + (typeof l.assignedUnits === 'number' ? l.assignedUnits : 0), 0);

  const cards: TotalsCardDef[] = [
    {
      title: 'Users',
      data: [
        { label: 'Total', value: totalUsers },
        { label: 'Active', value: activeUsers },
        { label: 'Disabled', value: disabledUsers },
      ],
    },
    {
      title: 'OneDrive',
      data: [
        { label: 'Total Accounts', value: totalOneDrives },
        { label: 'Total Storage', value: totalOneDriveStorage.toFixed(2), unit: 'GB' },
      ],
    },
    {
      title: 'SharePoint',
      data: [
        { label: 'Total Sites', value: totalSharePointSites },
        { label: 'Total Storage', value: totalSharePointStorage.toFixed(2), unit: 'GB' },
      ],
    },
    {
      title: 'M365 Groups',
      data: [
        { label: 'Total Groups', value: totalGroups },
      ],
    },
    {
      title: 'Teams',
      data: [
        { label: 'Total Teams', value: totalTeams },
      ],
    },
    {
      title: 'Licenses',
      data: [
        { label: 'Unique SKUs', value: uniqueSkus },
        { label: 'Total Assigned', value: totalAssignedLicenses },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 p-8">
        <TotalsCards cards={cards} />
        {/* DataTables moved to their own pages */}
      </main>
    </div>
  );
}

