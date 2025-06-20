import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function TotalsCards({ usersCount, m365GroupsCount }: { usersCount: number, m365GroupsCount: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      <Card className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center">
        <CardHeader
          title={<Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">Total Users</Typography>}
          className="p-0 mb-2"
        />
        <CardContent className="p-0">
          <span className="text-4xl font-bold text-indigo-600">{usersCount}</span>
        </CardContent>
      </Card>
      <Card className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center">
        <CardHeader
          title={<Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">Total M365 Groups</Typography>}
          className="p-0 mb-2"
        />
        <CardContent className="p-0">
          <span className="text-4xl font-bold text-indigo-600">{m365GroupsCount}</span>
        </CardContent>
      </Card>
    </div>
  );
}
