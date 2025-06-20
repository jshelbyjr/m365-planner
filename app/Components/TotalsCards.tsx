import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import React from 'react';

type TotalsCardDef = {
  label: string;
  count: number;
};

export default function TotalsCards({ cards }: { cards: TotalsCardDef[] }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${cards.length > 1 ? 2 : 1} gap-6 mb-8`}>
      {cards.map((card, idx) => (
        <Card key={card.label} className="p-6 rounded-lg shadow-md bg-white flex flex-col items-center">
          <CardHeader
            title={<Typography variant="subtitle1" className="text-lg font-semibold text-gray-700">{card.label}</Typography>}
            className="p-0 mb-2"
          />
          <CardContent className="p-0">
            <span className="text-4xl font-bold text-indigo-600">{card.count}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
