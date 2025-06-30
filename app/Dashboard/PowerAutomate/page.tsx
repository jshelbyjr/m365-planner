"use client";
import { Card, Typography, Box } from '@mui/material';
import DataTable from '../../Components/DataTable';
import ExportCSVButton from '../../Components/ExportCSVButton';

type FlowRow = {
  id: string;
  name?: string;
  environmentName?: string;
  ownerName?: string;
  lastRunTime?: string;
  connection?: string;
};

export default async function PowerAutomateDashboard() {
  // TODO: Fetch Power Automate Flows data from API
  const data: FlowRow[] = [];

  const columns = [
    { key: 'name', label: 'Flow Name' },
    { key: 'environmentName', label: 'Environment' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'lastRunTime', label: 'Last Run Time' },
    { key: 'connection', label: 'Connection' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Power Automate Flows Inventory</Typography>
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6">Number of Flows: {data.length}</Typography>
      </Card>
      <ExportCSVButton data={data} columns={columns} fileName="power-automate-flows.csv" />
      <DataTable data={data} columns={columns} title="Power Automate Flows" displayKey="name" />
    </Box>
  );
}
