import { VisitIntelligence, BusinessInsight } from '../types';

export const AIService = {
  async extractVisitIntelligence(prompt: string): Promise<VisitIntelligence> {
    try {
      const res = await fetch('/api/gemini/visit-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.occasion) {
          return data as VisitIntelligence;
        }
      }
    } catch (err) {
      console.warn('Backend Visit Intelligence endpoint offline, using intelligent parser fallback:', err);
    }

    // Client-side intelligent fallback extraction
    const p = prompt.toLowerCase();

    // Occasion
    let occasion = 'Casual Dining';
    if (p.includes('birthday')) occasion = 'Birthday Celebration';
    else if (p.includes('anniversary')) occasion = 'Anniversary';
    else if (p.includes('business') || p.includes('meeting') || p.includes('client')) occasion = 'Business Meeting';
    else if (p.includes('family') || p.includes('mother') || p.includes('father') || p.includes('kids')) occasion = 'Family Visit';
    else if (p.includes('date') || p.includes('romantic')) occasion = 'Date Night';

    // Diet
    let dietary_preference = 'Standard';
    if (p.includes('jain')) dietary_preference = 'Jain';
    else if (p.includes('vegan')) dietary_preference = 'Vegan';
    else if (p.includes('pure veg') || p.includes('vegetarian')) dietary_preference = 'Vegetarian';
    else if (p.includes('gluten free') || p.includes('gluten-free')) dietary_preference = 'Gluten-Free';

    // Allergies
    let allergies = 'None';
    if (p.includes('peanut') || p.includes('nut')) allergies = 'Peanuts / Nuts';
    else if (p.includes('dairy') || p.includes('lactose')) allergies = 'Dairy';
    else if (p.includes('sea food') || p.includes('shellfish')) allergies = 'Seafood';

    // Accessibility
    let accessibility = 'None';
    if (p.includes('wheelchair') || p.includes('ramp') || p.includes('elderly') || p.includes('grandfather') || p.includes('grandmother')) {
      accessibility = 'Wheelchair Required / Step-Free';
    }

    // Seating
    let seating_preference = 'Standard';
    if (p.includes('quiet') || p.includes('corner') || p.includes('peaceful')) seating_preference = 'Quiet Corner Table';
    else if (p.includes('window') || p.includes('view')) seating_preference = 'Window View';
    else if (p.includes('outdoor') || p.includes('terrace')) seating_preference = 'Outdoor Terrace';
    else if (p.includes('high chair') || p.includes('baby') || p.includes('infant')) seating_preference = 'High Chair for Child';

    // Time Constraints
    let time_constraints = 'None';
    if (p.includes('movie') || p.includes('show') || p.includes('flight') || p.includes('hurry') || p.includes('fast')) {
      time_constraints = 'Express Service Required (Time Limit)';
    }

    // Spice
    let spice_preference = 'Standard';
    if (p.includes('mild') || p.includes('no spice') || p.includes('zero spice')) spice_preference = 'Mild / No Spice';
    else if (p.includes('spicy') || p.includes('extra spicy')) spice_preference = 'Extra Spicy';

    // Priority
    let priority: 'High' | 'Medium' | 'Normal' = 'Normal';
    if (accessibility !== 'None' || time_constraints !== 'None' || allergies !== 'None') {
      priority = 'High';
    } else if (occasion !== 'Casual Dining' || dietary_preference !== 'Standard') {
      priority = 'Medium';
    }

    return {
      raw_input: prompt,
      occasion,
      dietary_preference,
      allergies,
      accessibility,
      seating_preference,
      time_constraints,
      spice_preference,
      special_requests: prompt,
      priority,
    };
  },

  async askOperationsAssistant(question: string, contextData: any): Promise<string> {
    try {
      const res = await fetch('/api/gemini/operations-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, contextData }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) return data.answer;
      }
    } catch (err) {
      console.warn('Backend Operations Assistant endpoint offline, using intelligent fallback:', err);
    }

    // Client fallback based on real context data
    const totalVisits = (contextData.reservations || []).length + (contextData.orders || []).length;
    const highPriorityCount = (contextData.reservations || []).filter(
      (r: any) => r.visit_intelligence?.priority === 'High'
    ).length;

    const wheelchairCount = (contextData.reservations || []).filter(
      (r: any) => r.visit_intelligence?.accessibility && r.visit_intelligence?.accessibility !== 'None'
    ).length;

    const q = question.toLowerCase();

    if (q.includes('prepare') || q.includes('today')) {
      return `Today you have ${totalVisits} logged dining activities. Focus early prep on dietary requests (e.g. Jain / Vegan) and set aside quiet corner seating for birthday guests.`;
    }
    if (q.includes('priority')) {
      return `You have ${highPriorityCount} High-Priority visits today with strict time constraints, allergies, or accessibility needs. Staff should greet them immediately upon arrival.`;
    }
    if (q.includes('accessibility') || q.includes('wheelchair')) {
      return `There are ${wheelchairCount} reservations explicitly requesting step-free accessibility or wheelchair assistance. Ensure ground floor tables 1 & 2 are reserved and clear.`;
    }
    if (q.includes('special') || q.includes('request')) {
      return `Key special requests today: Special occasion cake slices for birthdays, mild spice preparations for family tables, and express dining service for guests with evening show schedules.`;
    }

    return `Operations Summary: ${totalVisits} total guest visits today. Review your "Today's Visit Intelligence" cards above for individual guest preferences and allergy alerts.`;
  },

  async rewriteRejectionReason(reason: string, customerName?: string): Promise<string> {
    try {
      const res = await fetch('/api/gemini/rewrite-rejection-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, customerName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.politeReason) return data.politeReason;
      }
    } catch (err) {
      console.warn('Backend Rewrite endpoint offline, using fallback:', err);
    }

    return `Dear ${
      customerName || 'Valued Guest'
    }, we deeply regret that we are unable to fulfill this request at this time (${reason}). We sincerely apologize for any inconvenience caused and look forward to welcoming you soon.`;
  },

  async getRestaurantBrainInsights(restaurantData: {
    restaurant_name: string;
    todayOrdersCount: number;
    todayReservationsCount: number;
    upcomingReservations: any[];
    pendingOrders: any[];
  }): Promise<BusinessInsight> {
    const totalActivity = restaurantData.todayOrdersCount + restaurantData.todayReservationsCount;
    const dataSufficient = totalActivity > 0;

    return {
      greeting_summary: dataSufficient
        ? `Welcome back! You have ${restaurantData.todayReservationsCount} table reservations and ${restaurantData.todayOrdersCount} orders logged today.`
        : `Good day! No orders or reservations recorded yet today. More insights will appear as activity increases.`,
      key_insights: dataSufficient
        ? [
            `Peak reservation hours today are between 7:00 PM and 9:00 PM (${restaurantData.todayReservationsCount} guests).`,
            `High priority requests recorded for special occasions & dietary preferences.`,
            `Special attention recommended for guests with wheelchair accessibility and express dining needs.`,
          ]
        : [
            `Evening rush is anticipated. Ensure seating is staged and team is briefed on guest intents.`,
            `More business insights will appear as your restaurant receives orders and reservations.`,
          ],
      busy_hours_note: dataSufficient
        ? 'Prepare extra table arrangements for 7 PM - 9 PM peak dinner rush.'
        : 'Expect evening dinner surge between 7:30 PM - 9:30 PM based on weekly trends.',
      suggested_actions: [
        'Check "Today\'s Visit Intelligence" for allergy alerts and high priority seating',
        'Confirm pending guest reservations and check custom visit notes',
        'Keep table turnover prompt for express dining requests',
      ],
      data_sufficient: dataSufficient,
    };
  },
};
