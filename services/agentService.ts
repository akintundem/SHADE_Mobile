export type AgentMessage = { role: 'user' | 'assistant'; content: string };

export type AgentContext = {
  surface: 'create_event' | 'manage_event';
  eventId?: string;
  form?: {
    title?: string;
    description?: string;
    start?: string;
    end?: string;
    locationName?: string;
    capacity?: number;
    access?: 'free' | 'paid';
    price?: number;
  };
};

export async function askAgent(context: AgentContext, messages: AgentMessage[]) {
  // Stubbed client-only agent response for MVP
  const tips: { type: 'tip' | 'risk' | 'action'; text: string }[] = [];

  if (!context?.form?.title || (context.form.title || '').trim().length < 3) {
    tips.push({ type: 'risk', text: 'Event name looks too short. Add a clear, descriptive title.' });
  }
  if (!context?.form?.description || (context.form.description || '').trim().length < 10) {
    tips.push({ type: 'tip', text: 'Add a short description so guests know what to expect.' });
  }
  if (context?.form?.access === 'paid' && (!context.form.price || (context.form.price || 0) <= 0)) {
    tips.push({ type: 'risk', text: 'Price is missing for a paid event. Set a ticket price.' });
  }
  if (context?.form?.capacity && context.form.capacity < 5) {
    tips.push({ type: 'tip', text: 'Capacity is very low. Increase if you expect more attendees.' });
  }

  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const reply = lastUser?.content
    ? `Got it. Here are suggestions based on your note: “${lastUser.content}”. Want a checklist?`
    : 'I can help finalize your event details. Would you like a checklist?';

  return { reply, suggestions: tips };
}


