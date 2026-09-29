import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './Sidebar';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorClass = 'text-brand-accent'
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500">vs last week</span>
            </div>
          )}
          
          {description && !trend && (
            <p className="text-xs text-slate-500 mt-2">{description}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-slate-50", colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
