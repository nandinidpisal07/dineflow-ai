import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { CUSTOMER_NAV_ITEMS } from '../constants/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MapPin, Sparkles, Navigation, ChevronDown } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const CustomerLayout: React.FC = () => {
  const { user } = useAuth();
  const { location, setLocation, requestGPSLocation, isPromptOpen, setIsPromptOpen } = useLocation();
  const [manualCity, setManualCity] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const popularCities = ['Bengaluru, KA', 'Mumbai, MH', 'Delhi NCR', 'Hyderabad, TS', 'Chennai, TN', 'Pune, MH'];

  const handleGPSClick = async () => {
    setGpsLoading(true);
    await requestGPSLocation();
    setGpsLoading(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCity.trim()) {
      setLocation(manualCity.trim());
      setIsPromptOpen(false);
      setManualCity('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20 md:pb-0">
      {/* Top App Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.CUSTOMER_PROFILE}>
              <Avatar name={user?.full_name || 'Customer'} src={user?.profile_image} size="md" />
            </Link>
            <div>
              <p className="text-xs text-slate-500 font-medium">Hello, {user?.full_name?.split(' ')[0] || 'Diner'}</p>
              <button
                onClick={() => setIsPromptOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate max-w-[160px]">{location}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DineFlow AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Location Modal */}
      <Modal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        title="Select Your Dining Location"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            DineFlow uses your location to show available restaurants, calculate distances, and customize recommendations.
          </p>

          <Button
            variant="outline"
            className="w-full justify-center"
            loading={gpsLoading}
            onClick={handleGPSClick}
            icon={<Navigation className="w-4 h-4 text-indigo-600" />}
          >
            Use Current GPS Location
          </Button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">or enter city</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g. Indiranagar, Bengaluru or Mumbai"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
              />
            </div>
            <Button type="submit" size="md">
              Save
            </Button>
          </form>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Popular Cities</span>
            <div className="flex flex-wrap gap-1.5">
              {popularCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    setIsPromptOpen(false);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-xs font-medium text-slate-700 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
          {CUSTOMER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.CUSTOMER_HOME}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-16 h-12 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
