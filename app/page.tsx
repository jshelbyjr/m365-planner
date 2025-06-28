
'use client';

import { useState, useEffect } from 'react';
import {
  getTotal,
  getActiveUsers,
  getDisabledUsers,
  getTotalStorage,
  getSharePointStorageForEntities,
  getStandaloneSharePointStorage,
  getTotalAssignedLicenses
} from './lib/metrics';
import { Box, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import GroupIcon from '@mui/icons-material/Groups';
import LicenseIcon from '@mui/icons-material/WorkspacePremium';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import CollaborationChartCard, { ChartDataItem } from './Components/CollaborationChartCard';

// Define types for our data

type Domain = { id: string; status?: string };
type User = { id: string; displayName: string; userPrincipalName: string; accountEnabled: boolean };
type Group = { id: string; displayName: string };
type Team = { id: string; displayName: string; description?: string; visibility?: string };
type SharePointSite = { id: string; name?: string; storageUsed?: number };
type OneDrive = { id: string; ownerId?: string; ownerName?: string; siteName?: string; siteUrl?: string; size?: number };




export default function DashboardPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [m365Groups, setM365Groups] = useState<Group[]>([]);
  const [securityGroups, setSecurityGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sharePointSites, setSharePointSites] = useState<SharePointSite[]>([]);
  const [oneDrives, setOneDrives] = useState<OneDrive[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);

  // Fetch data from API endpoints on mount
  useEffect(() => {
    // Domains
    fetch('/api/data/domains')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch domains'))
      .then(data => setDomains(Array.isArray(data) ? data : []))
      .catch(() => setDomains([]));

    // Users
    fetch('/api/data/users')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users'))
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

    // M365 Groups
    fetch('/api/data/groups')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch groups'))
      .then(data => setM365Groups(Array.isArray(data?.m365Groups) ? data.m365Groups : []))
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






  // Calculate metrics for cards using utility functions
  const totalDomains = getTotal(domains);
  const verifiedDomains = domains.filter((d: Domain) => d.status?.toLowerCase() === 'verified').length;
  const unverifiedDomains = totalDomains - verifiedDomains;

  const totalUsers = getTotal(users);
  const activeUsers = getActiveUsers(users);
  const disabledUsers = getDisabledUsers(users);

  const totalOneDrives = getTotal(oneDrives);
  const totalOneDriveStorage = getTotalStorage(oneDrives, 'size');

  const totalSharePointSites = getTotal(sharePointSites);
  const totalSharePointStorage = getTotalStorage(sharePointSites, 'storageUsed');

  const totalGroups = getTotal(m365Groups);
  // For group and team storage, assume SharePoint site is associated by index (or add logic if available)
  const groupStorage = getSharePointStorageForEntities(sharePointSites, 0, totalGroups);

  const totalTeams = getTotal(teams);
  const teamStorage = getSharePointStorageForEntities(sharePointSites, totalGroups, totalGroups + totalTeams);

  // The rest of SharePoint storage is for standalone sites
  const standaloneSharePointStorage = getStandaloneSharePointStorage(totalSharePointStorage, groupStorage, teamStorage);

  // Licenses: unique SKUs and total assigned
  const uniqueSkus = new Set(licenses.map((l: any) => l.skuPartNumber)).size;
  const totalAssignedLicenses = getTotalAssignedLicenses(licenses);

  // Chart data for collaboration distribution (ensure M365 Groups is included)
  const collabEntityChart: ChartDataItem[] = [
    { name: 'M365 Groups', value: totalGroups },
    { name: 'Microsoft Teams', value: totalTeams },
    { name: 'SharePoint Sites', value: totalSharePointSites },
  ];

  // Storage auto-scaling (TB, GB, MB)
  const groupStorageRaw = groupStorage * 1024 ** 3; // bytes
  const teamStorageRaw = teamStorage * 1024 ** 3; // bytes
  const sharePointStorageRaw = standaloneSharePointStorage * 1024 ** 3; // bytes
  const maxStorage = Math.max(groupStorageRaw, teamStorageRaw, sharePointStorageRaw);
  let storageUnit = 'GB';
  let divisor = 1024 ** 3;
  if (maxStorage >= 1024 ** 4) {
    storageUnit = 'TB';
    divisor = 1024 ** 4;
  } else if (maxStorage < 1024 ** 3 && maxStorage >= 1024 ** 2) {
    storageUnit = 'MB';
    divisor = 1024 ** 2;
  }
  const collabStorageChart: ChartDataItem[] = [
    { name: 'M365 Groups', value: Number((groupStorageRaw / divisor).toFixed(2)) },
    { name: 'Microsoft Teams', value: Number((teamStorageRaw / divisor).toFixed(2)) },
    { name: 'SharePoint Sites', value: Number((sharePointStorageRaw / divisor).toFixed(2)) },
  ];


  // Layout: Tenant (Domains, Licenses, Users), Collaboration (SharePoint, OneDrive, M365 Groups, Teams, 2 chart cards)
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4, px: { xs: 1, sm: 4 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Tenant Overview</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {/* Domains */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PublicIcon color="primary" />
              <Typography variant="h6" gutterBottom>Domains</Typography>
            </Box>
            <Typography>Total: {totalDomains}</Typography>
            <Typography color="success.main">Verified: {verifiedDomains}</Typography>
            <Typography color="warning.main">Unverified: {unverifiedDomains}</Typography>
          </Paper>
        </Box>
        {/* Licenses */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LicenseIcon color="primary" />
              <Typography variant="h6" gutterBottom>Licenses</Typography>
            </Box>
            <Typography>Unique SKUs: {uniqueSkus}</Typography>
            <Typography>Total Assigned: {totalAssignedLicenses}</Typography>
          </Paper>
        </Box>
        {/* Users */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PersonIcon color="primary" />
              <Typography variant="h6" gutterBottom>Users</Typography>
            </Box>
            <Typography>Total: {totalUsers}</Typography>
            <Typography color="success.main">Active: {activeUsers}</Typography>
            <Typography color="error.main">Disabled: {disabledUsers}</Typography>
          </Paper>
        </Box>
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Collaboration</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* SharePoint */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 220 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Image src="/icons8-microsoft-sharepoint-2019-50.png" alt="SharePoint" width={24} height={24} />
              <Typography variant="h6" gutterBottom>SharePoint</Typography>
            </Box>
            <Typography>Total Sites: {totalSharePointSites}</Typography>
            <Typography>Total Storage: {totalSharePointStorage.toFixed(2)} GB</Typography>
          </Paper>
        </Box>
        {/* OneDrive */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 220 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Image src="/icons8-microsoft-onedrive-2019-50.png" alt="OneDrive" width={24} height={24} />
              <Typography variant="h6" gutterBottom>OneDrive</Typography>
            </Box>
            <Typography>Total Accounts: {totalOneDrives}</Typography>
            <Typography>Total Storage: {totalOneDriveStorage.toFixed(2)} GB</Typography>
          </Paper>
        </Box>
        {/* M365 Groups */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 220 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <GroupIcon color="primary" />
              <Typography variant="h6" gutterBottom>M365 Groups</Typography>
            </Box>
            <Typography>Total Groups: {totalGroups}</Typography>
            <Typography>Total Storage: {groupStorage.toFixed(2)} GB</Typography>
          </Paper>
        </Box>
        {/* Teams */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 220 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Image src="/icons8-microsoft-teams-2019-50.png" alt="Teams" width={24} height={24} />
              <Typography variant="h6" gutterBottom>Microsoft Teams</Typography>
            </Box>
            <Typography>Total Teams: {totalTeams}</Typography>
            <Typography>Total Storage: {teamStorage.toFixed(2)} GB</Typography>
          </Paper>
        </Box>
        {/* Collaboration Distribution Chart */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, minWidth: 320 }}>
          <CollaborationChartCard
            title="Collaboration Entity Distribution"
            data={collabEntityChart}
          />
        </Box>
        {/* Collaboration Storage Distribution Chart */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, minWidth: 320 }}>
          <CollaborationChartCard
            title={`Collaboration Storage Distribution (${storageUnit})`}
            data={collabStorageChart}
          />
        </Box>
      </Box>
    </Box>
  );
}

