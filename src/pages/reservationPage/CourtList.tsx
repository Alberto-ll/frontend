import React from 'react';
import CourtCard from '../../components/CourtCard';
import type { Pitch } from '../../types/pitchType';

interface CourtListProps {
  courts: Pitch[];
}

const CourtList: React.FC<CourtListProps> = ({ courts }) => {
  return (
    <div className="courts-grid">
      {courts.map((court) => (
        // solo pasar la court; CourtCard hará la navegación SPA
        <CourtCard key={court.id} court={court} />
      ))}
    </div>
  );
};

export default CourtList;