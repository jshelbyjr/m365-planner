import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface CollaborationChartCardProps {
  title: string;
  data: ChartDataItem[];
}

const COLORS = ['#1976d2', '#43a047', '#fbc02d', '#e53935', '#8e24aa', '#00838f', '#f57c00'];

const CollaborationChartCard: React.FC<CollaborationChartCardProps> = ({ title, data }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="90%" height="90%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              label
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color || COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CollaborationChartCard;
