import React, { useState } from 'react';
import { Reservation, Order, VisitIntelligence } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { VisitIntelligenceCard } from '../../components/common/VisitIntelligenceCard';
import { Sparkles, Cake, Briefcase, Users, Accessibility, Clock, Utensils, AlertTriangle, ShieldAlert, Heart } from 'lucide-react';

interface TodayVisitIntelligenceProps {
  reservations: Reservation[];
  orders: Order[];
}

export const TodayVisitIntelligence: React.FC<TodayVisitIntelligenceProps> = ({
  reservations,
  orders,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Collect all items with visit intelligence
  const itemsWithIntelligence = [
    ...reservations.map((r) => ({
      type: 'reservation' as const,
      id: r.id,
      guest_name: r.customer_name || 'Diner',
      time: r.reservation_time,
      date: r.reservation_date,
      guests: r.guest_count,
      status: r.status,
      intelligence: r.visit_intelligence,
    })),
    ...orders.map((o) => ({
      type: 'order' as const,
      id: o.id,
      guest_name: o.customer_name || 'Diner',
      time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(o.created_at).toISOString().split('T')[0],
      guests: 1,
      status: o.order_status,
      intelligence: o.visit_intelligence,
    })),
  ].filter((item) => item.intelligence !== undefined && item.intelligence !== null);

  // Group items by Intent Categories
  const categoryGroups = {
    birthdays: itemsWithIntelligence.filter(
      (i) => i.intelligence?.occasion?.toLowerCase().includes('birthday') || i.intelligence?.occasion?.toLowerCase().includes('anniversary')
    ),
    business: itemsWithIntelligence.filter(
      (i) => i.intelligence?.occasion?.toLowerCase().includes('business') || i.intelligence?.occasion?.toLowerCase().includes('meeting')
    ),
    family: itemsWithIntelligence.filter(
      (i) => i.intelligence?.occasion?.toLowerCase().includes('family') || i.intelligence?.seating_preference?.toLowerCase().includes('high chair')
    ),
    accessibility: itemsWithIntelligence.filter(
      (i) => i.intelligence?.accessibility && i.intelligence?.accessibility !== 'None'
    ),
    express: itemsWithIntelligence.filter(
      (i) => i.intelligence?.time_constraints && i.intelligence?.time_constraints !== 'None'
    ),
    specialDiets: itemsWithIntelligence.filter(
      (i) =>
        (i.intelligence?.dietary_preference && i.intelligence?.dietary_preference !== 'Standard') ||
        (i.intelligence?.allergies && i.intelligence?.allergies !== 'None')
    ),
  };

  const tabs = [
    { id: 'all', label: 'All Visits', count: itemsWithIntelligence.length, icon: Sparkles },
    { id: 'birthdays', label: 'Birthdays & Celebrations', count: categoryGroups.birthdays.length, icon: Cake },
    { id: 'business', label: 'Business Meetings', count: categoryGroups.business.length, icon: Briefcase },
    { id: 'family', label: 'Family Visits', count: categoryGroups.family.length, icon: Users },
    { id: 'accessibility', label: 'Wheelchair / Step-Free', count: categoryGroups.accessibility.length, icon: Accessibility },
    { id: 'express', label: 'Express Dining', count: categoryGroups.express.length, icon: Clock },
    { id: 'specialDiets', label: 'Diets & Allergies', count: categoryGroups.specialDiets.length, icon: AlertTriangle },
  ];

  const displayedItems =
    activeTab === 'all'
      ? itemsWithIntelligence
      : categoryGroups[activeTab as keyof typeof categoryGroups] || [];

  return (
    <Card className="p-6 space-y-6 bg-white border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Today's Visit Intelligence</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-visit customer profiles & operational prep grouped by intent
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" className="text-xs px-3 py-1 font-bold">
            {itemsWithIntelligence.length} Live Profile Intent Card(s)
          </Badge>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards List */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No visits logged under this category yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Customer visit intelligence submitted during table reservations or food pre-orders will populate here automatically in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedItems.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {item.guest_name} ({item.guests} Guest{item.guests > 1 ? 's' : ''})
                </span>
                <span className="text-slate-400 font-mono">
                  {item.type.toUpperCase()} • {item.time}
                </span>
              </div>

              {item.intelligence && <VisitIntelligenceCard intelligence={item.intelligence} />}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
