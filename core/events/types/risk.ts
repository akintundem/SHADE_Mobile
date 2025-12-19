/**
 * Risk management related types
 */

export type Risk = {
  riskId: string;
  eventId: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'assessed' | 'mitigated' | 'resolved';
  mitigationPlan?: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type RiskDTO = {
  id: string;
  eventId: string;
  title: string;
  description: string;
  category: 'ENVIRONMENTAL' | 'OPERATIONAL' | 'TECHNICAL' | 'FINANCIAL' | 'SECURITY' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'IDENTIFIED' | 'ASSESSED' | 'MITIGATED' | 'RESOLVED';
  mitigationPlan: string;
  contingencyPlan: string;
  responsiblePerson: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type EmergencyPlanDTO = {
  id: string;
  eventId: string;
  title: string;
  description: string;
  emergencyContacts: EmergencyContact[];
  evacuationProcedures: string;
  medicalProcedures: string;
  communicationPlan: string;
  createdAt: string;
  updatedAt: string;
};

export type EmergencyContact = {
  name: string;
  phone: string;
  role: string;
};
