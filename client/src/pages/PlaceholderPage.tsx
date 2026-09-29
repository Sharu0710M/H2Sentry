import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{description}</p>
      </div>
      
      <EmptyState 
        icon={Construction}
        title="Under Construction"
        description="This module is planned for a future development phase."
      />
    </div>
  );
};
