"use client";
import { Card, Typography, Box } from '@mui/material';
import DataTable from '../../Components/DataTable';
import ExportCSVButton from '../../Components/ExportCSVButton';

type PowerAppRow = {
  id: string;
  name?: string;
  type?: string;
  environmentName?: string;
  ownerName?: string;
  lastAccessed?: string;
  connection?: string;
};

export default async function PowerAppsDashboard() {
  // TODO: Fetch Power Apps data from API
  const data: PowerAppRow[] = [];

  const columns = [
    { key: 'name', label: 'App Name' },
    { key: 'type', label: 'Type' },
    { key: 'environmentName', label: 'Environment' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'lastAccessed', label: 'Last Accessed' },
    { key: 'connection', label: 'Connection' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Power Apps Inventory</Typography>
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6">Number of Power Apps: {data.length}</Typography>
      </Card>
      <ExportCSVButton data={data} columns={columns} fileName="power-apps.csv" />
      <DataTable data={data} columns={columns} title="Power Apps" displayKey="name" />
    </Box>
  );
}
