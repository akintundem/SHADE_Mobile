import { validationUtils } from '../../../common/utils/helpers';

export type AgentMessage = { 
  role: 'user' | 'assistant'; 
  content: string;
  timestamp?: string;
};

export type AgentContext = {
  surface: 'create_event' | 'manage_event';
  eventId?: string;
  currentStep?: number;
  stepName?: string;
  metadata?: Record<string, unknown>;
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

export type SuggestionType = 'tip' | 'risk' | 'action' | 'warning' | 'success';

export type Suggestion = {
  type: SuggestionType;
  text: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
};

export type AgentResponse = {
  reply: string;
  suggestions: Suggestion[];
  confidence?: number;
  nextSteps?: string[];
};

export class AgentService {
  private static instance: AgentService;
  
  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  async askAgent(context: AgentContext, messages: AgentMessage[]): Promise<AgentResponse> {
    try {
      // Validate context
      if (!context) {
        throw new Error('Context is required');
      }

      // Generate suggestions based on form data
      const suggestions = this.generateSuggestions(context);
      
      // Generate response based on messages and context
      const reply = this.generateReply(context, messages);
      
      // Calculate confidence based on form completeness
      const confidence = this.calculateConfidence(context);
      
      // Generate next steps
      const nextSteps = this.generateNextSteps(context, suggestions);

      return {
        reply,
        suggestions,
        confidence,
        nextSteps,
      };
    } catch (error) {
      throw new Error('Failed to process agent request');
    }
  }

  private generateSuggestions(context: AgentContext): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const { form } = context;

    if (!form) {
      return suggestions;
    }

    // Title validation
    if (!form.title || !validationUtils.isValidEventTitle(form.title)) {
      suggestions.push({
        type: 'risk',
        text: 'Event name looks too short. Add a clear, descriptive title.',
        priority: 'high',
        category: 'title',
      });
    }

    // Description validation
    if (!form.description || !validationUtils.isValidEventDescription(form.description)) {
      suggestions.push({
        type: 'tip',
        text: 'Add a short description so guests know what to expect.',
        priority: 'medium',
        category: 'description',
      });
    }

    // Price validation for paid events
    if (form.access === 'paid' && (!form.price || form.price <= 0)) {
      suggestions.push({
        type: 'risk',
        text: 'Price is missing for a paid event. Set a ticket price.',
        priority: 'high',
        category: 'pricing',
      });
    }

    // Capacity validation
    if (form.capacity && form.capacity < 5) {
      suggestions.push({
        type: 'tip',
        text: 'Capacity is very low. Increase if you expect more attendees.',
        priority: 'low',
        category: 'capacity',
      });
    }

    // Location validation
    if (!form.locationName || form.locationName.trim().length < 3) {
      suggestions.push({
        type: 'warning',
        text: 'Please specify a clear location for your event.',
        priority: 'medium',
        category: 'location',
      });
    }

    // Date validation
    if (!form.start) {
      suggestions.push({
        type: 'risk',
        text: 'Event start date is required.',
        priority: 'high',
        category: 'scheduling',
      });
    }

    return suggestions;
  }

  private generateReply(context: AgentContext, messages: AgentMessage[]): string {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (lastUserMessage?.content) {
      return `Got it. Here are suggestions based on your note: "${lastUserMessage.content}". Want a checklist?`;
    }

    // Generate contextual reply based on form state
    const { form } = context;
    const completedFields = this.getCompletedFields(form);
    const totalFields = this.getTotalFields(form);
    const completionPercentage = (completedFields / totalFields) * 100;

    if (completionPercentage < 30) {
      return 'I can help you create an amazing event! Let\'s start with the basics - what\'s your event about?';
    } else if (completionPercentage < 70) {
      return 'Great progress! I can help you finalize the remaining details. What would you like to work on next?';
    } else {
      return 'Almost there! Your event looks great. Would you like me to review everything before you publish?';
    }
  }

  private calculateConfidence(context: AgentContext): number {
    const { form } = context;
    if (!form) return 0;

    const completedFields = this.getCompletedFields(form);
    const totalFields = this.getTotalFields(form);
    
    return Math.round((completedFields / totalFields) * 100);
  }

  private generateNextSteps(context: AgentContext, suggestions: Suggestion[]): string[] {
    const nextSteps: string[] = [];
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
    
    if (highPrioritySuggestions.length > 0) {
      nextSteps.push('Address the high-priority items above');
    }
    
    nextSteps.push('Review your event details');
    nextSteps.push('Set up event notifications');
    nextSteps.push('Share your event with friends');
    
    return nextSteps;
  }

  private getCompletedFields(form: AgentContext['form']): number {
    if (!form) return 0;
    
    let completed = 0;
    if (form.title && form.title.trim().length > 0) completed++;
    if (form.description && form.description.trim().length > 0) completed++;
    if (form.start) completed++;
    if (form.locationName && form.locationName.trim().length > 0) completed++;
    if (form.capacity && form.capacity > 0) completed++;
    if (form.access === 'free' || (form.access === 'paid' && form.price && form.price > 0)) completed++;
    
    return completed;
  }

  private getTotalFields(form: AgentContext['form']): number {
    return 6; // title, description, start, location, capacity, access/price
  }
}

// Export singleton instance
export const agentService = AgentService.getInstance();

// Legacy function for backward compatibility
export async function askAgent(context: AgentContext, messages: AgentMessage[]): Promise<AgentResponse> {
  return agentService.askAgent(context, messages);
}

