import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Sparkles, ArrowRight, Compass, Brain, ShieldCheck } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-50 text-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Next-Generation AI Dining Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
          AI Dining Companion & <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            AI Business Assistant
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Connecting diners and restaurant owners through Artificial Intelligence. Discover hand-picked culinary spots or streamline restaurant operations with intelligent AI insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to={ROUTES.SIGNUP}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-center shadow-2xs"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 text-left">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">For Diners</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your cravings in plain English. Get instant tailored recommendations matching your exact mood, budget, and location, then reserve table seating seamlessly.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">For Restaurant Owners</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access Restaurant Brain — an AI operational command center analyzing today’s reservations and orders to deliver actionable capacity and staffing suggestions.
            </p>
          </div>
        </div>

        <div className="mt-12 inline-flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure, role-isolated architecture powered by Supabase & Google Gemini API</span>
        </div>
      </section>
    </div>
  );
};
