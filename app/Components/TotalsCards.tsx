
import React from 'react';
import SummaryCard from './SummaryCard';

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
      {cards.map((card) => (
        <SummaryCard
          key={card.title}
          title={card.title}
          metrics={card.data}
        />
      ))}
    </div>
  );
}
