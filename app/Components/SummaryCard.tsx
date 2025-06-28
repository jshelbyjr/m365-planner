import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


export interface SummaryCardProps {
  icon?: React.ReactNode;
  title: string;
  metrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}


const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  metrics = [],
  className = '',
  headerClassName = '',
  contentClassName = '',
  children,
}) => (
  <Card className={`min-w-56 p-6 rounded-lg shadow-md bg-white flex flex-col items-center ${className}`}>
    <CardHeader
      avatar={icon ? <Box className="mr-2">{icon}</Box> : undefined}
      title={
        <Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">
          {title}
        </Typography>
      }
      className={`p-0 mb-2 ${headerClassName}`}
    />
    <CardContent className={`p-0 flex flex-col items-center gap-2 ${contentClassName}`}>
      {metrics.length > 0 && metrics.map((dp, i) => (
        <div key={dp.label} className="flex flex-col items-center">
          <span className="text-2xl font-bold text-indigo-600">
            {dp.value}
            {dp.unit && <span className="text-base font-normal text-gray-500 ml-1">{dp.unit}</span>}
          </span>
          <span className="text-xs text-gray-500">{dp.label}</span>
        </div>
      ))}
      {children}
    </CardContent>
  </Card>
);

export default SummaryCard;
