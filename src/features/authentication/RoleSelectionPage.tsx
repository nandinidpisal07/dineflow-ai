import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { UserRole } from '../../types';
import { Sparkles, Utensils, Store, Check, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);
    try {
      await setUserRole(selectedRole);
      if (selectedRole === 'customer') {
        navigate(ROUTES.CUSTOMER_HOME);
      } else {
        navigate(ROUTES.BUSINESS_SETUP);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save role selection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-10 text-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4 pt-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Account Setup</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Application Role
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 mb-8">
          Choose your account type. This selection determines your application layout and tools.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
          {/* Customer Card */}
          <div
            onClick={() => setSelectedRole('customer')}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedRole === 'customer'
                ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-500/10 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            {selectedRole === 'customer' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Customer</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              I want to discover top restaurants, receive AI recommendations, reserve tables, and order food.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>AI Concierge discovery</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Table reservations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Food ordering & profile</span>
              </li>
            </ul>
          </div>

          {/* Restaurant Business Card */}
          <div
            onClick={() => setSelectedRole('business')}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedRole === 'business'
                ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-500/10 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            {selectedRole === 'business' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Restaurant Business</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              I am a restaurant owner or manager wanting to manage orders, table reservations, and AI business insights.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Restaurant Brain AI Assistant</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Order management dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Reservation control & setup</span>
              </li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedRole || loading}
          loading={loading}
          size="lg"
          className="w-full sm:w-auto px-10 flex items-center justify-center gap-2 mx-auto"
        >
          <span>Continue to Application</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
