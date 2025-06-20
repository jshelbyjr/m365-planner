// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

// Define types for our data
type ScanStatus = {
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  error?: string;
};
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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Migration Dashboard</h1>
        </div>
        <NavigationMenu.Root orientation="vertical" className="flex flex-col gap-2 p-4">
          <NavigationMenu.List className="flex flex-col gap-2">
            <NavigationMenu.Item>
              <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Tenant Info</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Users</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Microsoft Teams</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">M365 Groups</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Distribution Lists</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">SharePoint Sites</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <div className="mt-auto p-4 border-t">
          <a href="/settings" className="text-indigo-600 hover:underline text-sm">Configure Settings</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Data Collection Card */}
        <div className="mb-8">
          <Card className="p-6 rounded-lg shadow-md bg-white">
            <CardHeader
              title={<Typography variant="h6" className="mb-3">Data Collection</Typography>}
              className="p-0 mb-3"
            />
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartScan}
                  disabled={scanStatus?.status === 'IN_PROGRESS'}
                  className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {scanStatus?.status === 'IN_PROGRESS' ? 'Scanning...' : 'Start New Scan'}
                </button>
                <div className="flex-grow">{renderStatus()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center">
            <CardHeader
              title={<Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">Total Users</Typography>}
              className="p-0 mb-2"
            />
            <CardContent className="p-0">
              <span className="text-4xl font-bold text-indigo-600">{users.length}</span>
            </CardContent>
          </Card>
          <Card className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center">
            <CardHeader
              title={<Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">Total M365 Groups</Typography>}
              className="p-0 mb-2"
            />
            <CardContent className="p-0">
              <span className="text-4xl font-bold text-indigo-600">{m365Groups.length}</span>
            </CardContent>
          </Card>
        </div>

        {/* Data Display Sections (tables) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DataTable title={`Users (${users.length})`} data={users} displayKey="userPrincipalName" />
          <DataTable title={`M365 Groups (${m365Groups.length})`} data={m365Groups} displayKey="displayName" />
        </div>
      </main>
    </div>
  );
}

// A simple reusable table component
function DataTable({ title, data, displayKey }: { title: string, data: any[], displayKey: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="overflow-y-auto h-96 border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item[displayKey]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}