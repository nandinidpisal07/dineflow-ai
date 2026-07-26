import React from 'react';
import { VisitIntelligence } from '../../types';
import { Sparkles, Calendar, Utensils, AlertTriangle, ShieldAlert, Clock, Flame, Heart, AlertCircle, Info } from 'lucide-react';
import { Badge } from './Badge';

interface VisitIntelligenceCardProps {
  intelligence: VisitIntelligence;
  compact?: boolean;
  className?: string;
}

export const VisitIntelligenceCard: React.FC<VisitIntelligenceCardProps> = ({
  intelligence,
  compact = false,
  className = '',
}) => {
  if (!intelligence) return null;

  const isHighPriority = intelligence.priority === 'High';

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isHighPriority
          ? 'bg-amber-50/60 border-amber-200 text-amber-950'
          : 'bg-indigo-50/40 border-indigo-100 text-slate-900'
      } ${compact ? 'p-3 text-xs' : 'p-4 sm:p-5'} ${className}`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5 gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isHighPriority ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm tracking-tight">Visit Intelligence</h4>
            <p className="text-[10px] text-slate-500 font-medium">Pre-visit AI structured analysis</p>
          </div>
        </div>

        <Badge
          variant={isHighPriority ? 'danger' : intelligence.priority === 'Medium' ? 'warning' : 'secondary'}
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shrink-0"
        >
          {intelligence.priority || 'Normal'} Priority
        </Badge>
      </div>

      {intelligence.raw_input && (
        <p className="text-xs text-slate-700 italic bg-white/70 p-2.5 rounded-xl border border-slate-200/60 mb-3 leading-relaxed">
          &ldquo;{intelligence.raw_input}&rdquo;
        </p>
      )}

      {/* Grid of structured attributes */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
        {intelligence.occasion && (
          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Occasion</span>
              <span className="font-bold text-xs text-slate-800 truncate block">{intelligence.occasion}</span>
            </div>
          </div>
        )}

        {intelligence.dietary_preference && intelligence.dietary_preference !== 'Standard' && (
          <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2 shadow-2xs">
            <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Dietary</span>
              <span className="font-bold text-xs text-emerald-800 truncate block">{intelligence.dietary_preference}</span>
            </div>
          </div>
        )}

        {intelligence.allergies && intelligence.allergies !== 'None' && (
          <div className="bg-rose-50/90 p-2.5 rounded-xl border border-rose-200 flex items-start gap-2 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-rose-500 block tracking-wider">Allergies</span>
              <span className="font-extrabold text-xs text-rose-900 truncate block">{intelligence.allergies}</span>
            </div>
          </div>
        )}

        {intelligence.accessibility && intelligence.accessibility !== 'None' && (
          <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2 shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-amber-600 block tracking-wider">Accessibility</span>
              <span className="font-bold text-xs text-amber-900 truncate block">{intelligence.accessibility}</span>
            </div>
          </div>
        )}

        {intelligence.seating_preference && intelligence.seating_preference !== 'Standard' && (
          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2 shadow-2xs">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Seating</span>
              <span className="font-bold text-xs text-slate-800 truncate block">{intelligence.seating_preference}</span>
            </div>
          </div>
        )}

        {intelligence.time_constraints && intelligence.time_constraints !== 'None' && (
          <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100 flex items-start gap-2 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Time Constraint</span>
              <span className="font-bold text-xs text-slate-800 truncate block">{intelligence.time_constraints}</span>
            </div>
          </div>
        )}

        {intelligence.spice_preference && intelligence.spice_preference !== 'Standard' && intelligence.spice_preference !== 'None' && (
          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Spice Level</span>
              <span className="font-bold text-xs text-slate-800 truncate block">{intelligence.spice_preference}</span>
            </div>
          </div>
        )}
      </div>

      {intelligence.special_requests && intelligence.special_requests !== intelligence.raw_input && (
        <div className="mt-3 text-xs bg-white/90 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Special Request Notes</span>
          <p className="text-slate-800 font-medium">{intelligence.special_requests}</p>
        </div>
      )}
    </div>
  );
};
