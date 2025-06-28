import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import React from 'react';

export type TotalsCardDataPoint = {
  label: string;
  value: string | number;
  /** Optional: for units, e.g. GB */
  unit?: string;
};

export type TotalsCardDef = {
  title: string;
  data: TotalsCardDataPoint[];
};

export default function TotalsCards({ cards }: { cards: TotalsCardDef[] }) {
  return (
    <div className="flex flex-wrap gap-6 mb-8">
      {cards.map((card, idx) => (
        <Card
          key={card.title}
          className="min-w-56 p-6 rounded-lg shadow-md bg-white flex flex-col items-center"
        >
          <CardHeader
            title={
              <Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">
                {card.title}
              </Typography>
            }
            className="p-0 mb-2"
          />
          <CardContent className="p-0 flex flex-col items-center gap-2">
            {card.data.map((dp, i) => (
              <div key={dp.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {dp.value}
                  {dp.unit && <span className="text-base font-normal text-gray-500 ml-1">{dp.unit}</span>}
                </span>
                <span className="text-xs text-gray-500">{dp.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
