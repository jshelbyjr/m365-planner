
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
import { TotalsCardDef } from './Components/TotalsCards';
import { Box, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import GroupIcon from '@mui/icons-material/Groups';
import LicenseIcon from '@mui/icons-material/WorkspacePremium';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import CollaborationChartCard, { ChartDataItem } from './Components/CollaborationChartCard';
import TotalsCards from './Components/TotalsCards';

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
  const [sharePointUsage, setSharePointUsage] = useState<any[]>([]);
  const [oneDrives, setOneDrives] = useState<OneDrive[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [exchangeMailboxes, setExchangeMailboxes] = useState<any[]>([]);

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


    // SharePoint Sites (legacy, still used for some metrics)
    fetch('/api/data/sharepoint')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch sharepoint'))
      .then(data => setSharePointSites(Array.isArray(data) ? data : []))
      .catch(() => setSharePointSites([]));

    // SharePoint Usage (for totals)
    fetch('/api/data/sharepoint-usage')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch sharepoint usage'))
      .then(data => setSharePointUsage(Array.isArray(data) ? data : []))
      .catch(() => setSharePointUsage([]));

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
    // Exchange Mailboxes
    fetch('/api/data/exchange-mailboxes')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch exchange mailboxes'))
      .then(data => setExchangeMailboxes(Array.isArray(data) ? data : []))
      .catch(() => setExchangeMailboxes([]));
  }, []);
  // Exchange Mailbox metrics
  const totalMailboxes = exchangeMailboxes.length;
  const totalMailboxStorageBytes = exchangeMailboxes.reduce((sum, mb) => {
    const val = mb.storageUsedBytes;
    if (val === undefined || val === null || val === '') return sum;
    const num = typeof val === 'bigint' ? Number(val) : Number(val);
    if (isNaN(num)) return sum;
    return sum + num;
  }, 0);
  const totalMailboxStorageGB = totalMailboxStorageBytes / (1024 ** 3);

  // Totals by Recipient Type
  const recipientTypeCounts: Record<string, number> = {};
  const recipientTypeStorage: Record<string, number> = {};
  for (const mb of exchangeMailboxes) {
    const type = mb.recipientType || 'Unknown';
    recipientTypeCounts[type] = (recipientTypeCounts[type] || 0) + 1;
    const val = mb.storageUsedBytes;
    const num = val ? (typeof val === 'bigint' ? Number(val) : Number(val)) : 0;
    if (!recipientTypeStorage[type]) recipientTypeStorage[type] = 0;
    if (!isNaN(num)) recipientTypeStorage[type] += num;
  }

  // Prepare totals card data for Mailbox
  const exchangeTotals: TotalsCardDef = {
    title: 'Mailbox',
    data: [
      { label: 'Total Mailboxes', value: totalMailboxes },
      ...Object.entries(recipientTypeCounts).map(([type, count]) => ({ label: `Total (${type})`, value: count })),
      { label: 'Total Storage', value: totalMailboxStorageGB.toFixed(4), unit: 'GB' },
    ],
  };

  // Prepare chart data for storage breakdown by Recipient Type
  const mailboxStorageChart = Object.entries(recipientTypeStorage).map(([type, bytes], idx) => ({
    name: type,
    value: Number((bytes / (1024 ** 3)).toFixed(4)),
  }));






  // Calculate metrics for cards using utility functions
  const totalDomains = getTotal(domains);
  const verifiedDomains = domains.filter((d: Domain) => d.status?.toLowerCase() === 'verified').length;
  const unverifiedDomains = totalDomains - verifiedDomains;

  const totalUsers = getTotal(users);
  const activeUsers = getActiveUsers(users);
  const disabledUsers = getDisabledUsers(users);

  const totalOneDrives = getTotal(oneDrives);
  const totalOneDriveStorage = getTotalStorage(oneDrives, 'size');


  // Use SharePoint Usage table for totals, but only standalone sites (not connected to group/team)
  const standaloneSharePointSites = sharePointUsage.filter(row => row.rootWebTemplate !== 'Group');
  const totalSharePointSites = standaloneSharePointSites.length;
  const totalSharePointStorageBytes = standaloneSharePointSites.reduce((sum, row) => {
    const val = row.storageUsedBytes;
    if (val === undefined || val === null || val === '') return sum;
    const num = typeof val === 'bigint' ? Number(val) : Number(val);
    if (isNaN(num)) return sum;
    return sum + num;
  }, 0);
  const totalSharePointStorageGB = totalSharePointStorageBytes / (1024 ** 3);


  // Only count unique groups (not also teams)
  const teamIds = new Set(teams.map(t => t.id));
  const uniqueGroups = m365Groups.filter(g => !teamIds.has(g.id));
  const totalGroups = uniqueGroups.length;

  // Calculate storage for M365 Groups and Teams from SharePoint usage data
  const groupIds = new Set(uniqueGroups.map(g => String(g.id).toLowerCase()));
  const groupStorageBytes = sharePointUsage.reduce((sum, row) => {
    if (
      row.rootWebTemplate === 'Group' &&
      row.siteId &&
      groupIds.has(String(row.siteId).toLowerCase())
    ) {
      const val = row.storageUsedBytes;
      if (val === undefined || val === null || val === '') return sum;
      const num = typeof val === 'bigint' ? Number(val) : Number(val);
      if (isNaN(num)) return sum;
      return sum + num;
    }
    return sum;
  }, 0);
  const groupStorage = groupStorageBytes / (1024 ** 3);

  const teamIdsLower = new Set(teams.map(t => String(t.id).toLowerCase()));
  const teamStorageBytes = sharePointUsage.reduce((sum, row) => {
    if (
      row.rootWebTemplate === 'Group' &&
      row.siteId &&
      teamIdsLower.has(String(row.siteId).toLowerCase())
    ) {
      const val = row.storageUsedBytes;
      if (val === undefined || val === null || val === '') return sum;
      const num = typeof val === 'bigint' ? Number(val) : Number(val);
      if (isNaN(num)) return sum;
      return sum + num;
    }
    return sum;
  }, 0);
  const teamStorage = teamStorageBytes / (1024 ** 3);
  const totalTeams = teams.length;

  // The rest of SharePoint storage is for standalone sites
  // For legacy/other metrics, keep MB for getStandaloneSharePointStorage, but use GB for display
  const standaloneSharePointStorage = getStandaloneSharePointStorage(totalSharePointStorageBytes / (1024 * 1024), groupStorage, teamStorage);

  // Licenses: unique SKUs and total assigned
  const uniqueSkus = new Set(licenses.map((l: any) => l.skuPartNumber)).size;
  const totalAssignedLicenses = getTotalAssignedLicenses(licenses);

  // Chart data for collaboration distribution (standalone SharePoint, unique Groups, Teams)
  const collabEntityChart: ChartDataItem[] = [
    { name: 'M365 Groups', value: totalGroups },
    { name: 'Microsoft Teams', value: totalTeams },
    { name: 'SharePoint Sites', value: totalSharePointSites },
  ];

  // Collaboration storage chart: split SharePoint usage by rootWebTemplate
  let groupConnectedBytes = 0;
  let standaloneBytes = 0;
  for (const row of sharePointUsage) {
    const val = row.storageUsedBytes;
    if (val === undefined || val === null || val === '') continue;
    const num = typeof val === 'bigint' ? Number(val) : Number(val);
    if (isNaN(num)) continue;
    if (row.rootWebTemplate === 'Group') {
      groupConnectedBytes += num;
    } else {
      standaloneBytes += num;
    }
  }
  const groupConnectedGB = groupConnectedBytes / (1024 ** 3);
  const standaloneGB = standaloneBytes / (1024 ** 3);
  const collabStorageChart: ChartDataItem[] = [
    { name: 'Group/Teams Connected Sites', value: Number(groupConnectedGB.toFixed(4)) },
    { name: 'SharePoint Sites', value: Number(standaloneGB.toFixed(4)) },
  ];
  const storageUnit = 'GB';


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
            <Typography>Total Storage: {totalSharePointStorageGB.toFixed(4)} GB</Typography>
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
            <Typography>Total Storage: {groupStorage.toFixed(4)} GB</Typography>
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
            <Typography>Total Storage: {teamStorage.toFixed(4)} GB</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Exchange Section */}
      <Box display="flex" alignItems="center" gap={1} sx={{ mt: 5, mb: 3 }}>
        <Image src="/icons8-microsoft-exchange-2019-50.png" alt="Exchange" width={28} height={28} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Exchange</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Mailbox Totals Card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 220 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Image src="/icons8-microsoft-exchange-2019-50.png" alt="Exchange" width={24} height={24} />
              <Typography variant="h6" gutterBottom>Mailbox</Typography>
            </Box>
            {/* TotalsCards expects a cards prop, so we render the card data manually here for custom icon */}
            {exchangeTotals.data.map((item, idx) => (
              <Typography key={idx}>
                {item.label}: {item.value}{item.unit ? ` ${item.unit}` : ''}
              </Typography>
            ))}
          </Paper>
        </Box>
        {/* Mailbox Storage by Recipient Type Chart */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, minWidth: 320 }}>
          <CollaborationChartCard
            title="Mailbox Storage by Recipient Type (GB)"
            data={mailboxStorageChart}
          />
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

