import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { Reservation, Order } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Brain, Sparkles, Send, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AIOperationsAssistantProps {
  reservations: Reservation[];
  orders: Order[];
}

export const AIOperationsAssistant: React.FC<AIOperationsAssistantProps> = ({
  reservations,
  orders,
}) => {
  const { askOperationsAssistant, loading } = useAI();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  const presetQuestions = [
    'What should I prepare today?',
    'Which customers need priority?',
    'Which tables require accessibility?',
    'What special requests do we have today?',
  ];

  const handleAsk = async (qText?: string) => {
    const qToAsk = qText || question;
    if (!qToAsk.trim()) return;

    const res = await askOperationsAssistant(qToAsk, { reservations, orders });
    setAnswer(res);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden border border-indigo-800/40">
      <div className="flex items-center justify-between border-b border-indigo-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">AI Operations Assistant</h3>
            <p className="text-xs text-indigo-200">
              Ask operational questions based on today&apos;s real customer visit intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Preset Action Chips */}
      <div className="space-y-2">
        <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider block">Suggested Questions:</span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(pq);
                handleAsk(pq);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-300" />
              <span>{pq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="e.g. Which kitchen stations need extra prep for dinner?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/95 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl border-0 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <Button
          type="submit"
          loading={loading}
          icon={<Send className="w-3.5 h-3.5" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-xs py-3 px-5 rounded-xl"
        >
          Ask AI
        </Button>
      </form>

      {/* Answer Output */}
      {answer && (
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/15 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>AI Operational Directive</span>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </Card>
  );
};
