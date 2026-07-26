import { useState } from 'react';
import { VisitIntelligence } from '../types';
import { AIService } from '../services/aiService';

export function useAI() {
  const [visitIntelligence, setVisitIntelligence] = useState<VisitIntelligence | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extractVisitIntelligence = async (prompt: string) => {
    if (!prompt.trim()) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await AIService.extractVisitIntelligence(prompt);
      setVisitIntelligence(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to extract visit intelligence.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const askOperationsAssistant = async (question: string, contextData: any) => {
    setLoading(true);
    try {
      return await AIService.askOperationsAssistant(question, contextData);
    } catch (err: any) {
      return 'Operations assistant service unavailable. Please check guest logs below.';
    } finally {
      setLoading(false);
    }
  };

  const rewriteRejectionReason = async (reason: string, customerName?: string) => {
    try {
      return await AIService.rewriteRejectionReason(reason, customerName);
    } catch {
      return reason;
    }
  };

  return {
    visitIntelligence,
    loading,
    error,
    extractVisitIntelligence,
    askOperationsAssistant,
    rewriteRejectionReason,
  };
}
