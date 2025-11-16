import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, AlertTriangle, Shield, Plus, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { RiskDTO, EmergencyPlanDTO } from '../../../../shared/types';
import { useErrorHandler } from '../../../../shared/hooks/useErrorHandler';
import ErrorModal from '../../../../shared/components/common/ErrorModal'';
import { StatCar } from '../../../../shared/components/common/FormComponents';

type Props = { 
  eventId: string;
  onBack: () => void; 
  onAddRisk?: () => void;
};

export default function RiskManagementScreen({ eventId, onBack, onAddRisk }: Props) {
  const [activeTab, setActiveTab] = useState<'risks' | 'emergency' | 'mitigation'>('risks');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'identified' | 'mitigated' | 'resolved'>('all');
  
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const { error, handleError, hideError } = useErrorHandler();

  // Sample risks data
  const risks: RiskDTO[] = [
    {
      id: '1',
      eventId,
      title: 'Weather Conditions',
      description: 'Adverse weather could affect outdoor activities',
      category: 'ENVIRONMENTAL',
      severity: 'MEDIUM',
      probability: 'MEDIUM',
      impact: 'MEDIUM',
      status: 'IDENTIFIED',
      mitigationPlan: 'Have indoor backup venue ready',
      contingencyPlan: 'Move event indoors if weather is bad',
      responsiblePerson: 'John Doe',
      dueDate: '2024-01-20T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      eventId,
      title: 'Venue Availability',
      description: 'Primary venue may become unavailable',
      category: 'OPERATIONAL',
      severity: 'HIGH',
      probability: 'LOW',
      impact: 'HIGH',
      status: 'MITIGATED',
      mitigationPlan: 'Book backup venue and maintain contact with primary venue',
      contingencyPlan: 'Activate backup venue immediately',
      responsiblePerson: 'Jane Smith',
      dueDate: '2024-01-15T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: '3',
      eventId,
      title: 'Technical Equipment Failure',
      description: 'AV equipment may malfunction during presentation',
      category: 'TECHNICAL',
      severity: 'MEDIUM',
      probability: 'MEDIUM',
      impact: 'MEDIUM',
      status: 'RESOLVED',
      mitigationPlan: 'Test all equipment beforehand and have backup equipment',
      contingencyPlan: 'Use backup equipment or reschedule presentation',
      responsiblePerson: 'Mike Johnson',
      dueDate: '2024-01-10T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ];

  // Sample emergency plan data
  const emergencyPlan: EmergencyPlanDTO = {
    id: '1',
    eventId,
    title: 'Event Emergency Plan',
    description: 'Comprehensive emergency response plan for the event',
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', role: 'Primary Emergency' },
      { name: 'Event Manager', phone: '+1-555-0123', role: 'Event Coordinator' },
      { name: 'Venue Manager', phone: '+1-555-0456', role: 'Venue Contact' }
    ],
    evacuationProcedures: 'Follow venue evacuation routes to designated assembly points',
    medicalProcedures: 'Contact on-site medical staff or call 911 for medical emergencies',
    communicationPlan: 'Use event communication system to notify all attendees',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  };

  const filteredRisks = useMemo(() => {
    let filtered = risks;
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(risk => risk.severity === filterSeverity.toUpperCase());
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(risk => risk.status === filterStatus.toUpperCase());
    }

    return filtered;
  }, [filterSeverity, filterStatus]);

  const riskStats = useMemo(() => {
    const total = risks.length;
    const identified = risks.filter(r => r.status === 'IDENTIFIED').length;
    const mitigated = risks.filter(r => r.status === 'MITIGATED').length;
    const resolved = risks.filter(r => r.status === 'RESOLVED').length;
    const highSeverity = risks.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL').length;
    
    return { total, identified, mitigated, resolved, highSeverity };
  }, [risks]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return colors.semantic.error;
      case 'HIGH':
        return colors.semantic.error;
      case 'MEDIUM':
        return colors.semantic.warning;
      case 'LOW':
        return colors.semantic.success;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return colors.semantic.success;
      case 'MITIGATED':
        return colors.semantic.info;
      case 'IDENTIFIED':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'MITIGATED':
        return <Shield size={16} color={colors.semantic.info} />;
      case 'IDENTIFIED':
        return <AlertTriangle size={16} color={colors.semantic.warning} />;
      default:
        return <Clock size={16} color={colors.text.secondary} />;
    }
  };

  const tabs = [
    { key: 'risks', label: 'Risks', icon: <AlertTriangle size={16} color={colors.text.tertiary} /> },
    { key: 'emergency', label: 'Emergency', icon: <Shield size={16} color={colors.text.tertiary} /> },
    { key: 'mitigation', label: 'Mitigation', icon: <CheckCircle size={16} color={colors.text.tertiary} /> },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorModal
        visible={!!error}
        error={error}
        onClose={hideError}
      />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface
      }}>
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ 
          color: colors.text.primary, 
          fontWeight: '700',
          fontSize: typography.size.lg
        }}>
          Risk Management
        </Text>
        <TouchableOpacity 
          onPress={onAddRisk}
          style={{ 
            padding: spacing.sm,
            backgroundColor: brand.primary,
            borderRadius: borderRadius.md
          }}
        >
          <Plus size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ 
        flexDirection: 'row', 
        gap: spacing.sm, 
        padding: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border
      }}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              backgroundColor: activeTab === tab.key ? brand.primary : colors.surface
            }}
          >
            {React.cloneElement(tab.icon, { 
              color: activeTab === tab.key ? colors.text.inverse : colors.text.tertiary 
            })}
            <Text style={{ 
              color: activeTab === tab.key ? colors.text.inverse : colors.text.primary,
              fontWeight: '600',
              fontSize: typography.size.sm
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Risk Overview */}
      {activeTab === 'risks' && (
        <View style={{ 
          padding: spacing.lg,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <StatCard label="Total Risks" value={riskStats.total} color={colors.text.primary} />
            <StatCard label="High Severity" value={riskStats.highSeverity} color={colors.semantic.error} />
            <StatCard label="Mitigated" value={riskStats.mitigated} color={colors.semantic.info} />
            <StatCard label="Resolved" value={riskStats.resolved} color={colors.semantic.success} />
          </View>
        </View>
      )}

      {/* Filters */}
      {activeTab === 'risks' && (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[
              { key: 'all', label: 'All Severity' },
              { key: 'low', label: 'Low' },
              { key: 'medium', label: 'Medium' },
              { key: 'high', label: 'High' },
              { key: 'critical', label: 'Critical' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setFilterSeverity(option.key as any)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  backgroundColor: filterSeverity === option.key ? brand.primary : colors.surface,
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  borderColor: filterSeverity === option.key ? brand.primary : colors.border
                }}
              >
                <Text style={{
                  color: filterSeverity === option.key ? colors.text.inverse : colors.text.primary,
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Risks Tab */}
        {activeTab === 'risks' && (
          <>
            {filteredRisks.map(risk => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </>
        )}

        {/* Emergency Plan Tab */}
        {activeTab === 'emergency' && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            gap: spacing.md
          }}>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.lg,
              fontWeight: '700'
            }}>
              {emergencyPlan.title}
            </Text>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: 14
            }}>
              {emergencyPlan.description}
            </Text>

            <View style={{ gap: spacing.md }}>
              <Text style={{ 
                color: colors.text.primary,
                fontWeight: '600',
                fontSize: 16
              }}>
                Emergency Contacts
              </Text>
              {emergencyPlan.emergencyContacts.map((contact, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: spacing.sm,
                  backgroundColor: colors.background,
                  borderRadius: borderRadius.lg
                }}>
                  <View>
                    <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                      {contact.name}
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                      {contact.role}
                    </Text>
                  </View>
                  <Text style={{ color: colors.brand.primary, fontWeight: '600' }}>
                    {contact.phone}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ gap: spacing.md }}>
              <Text style={{ 
                color: colors.text.primary,
                fontWeight: '600',
                fontSize: 16
              }}>
                Procedures
              </Text>
              <View style={{ gap: spacing.sm }}>
                <View>
                  <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                    Evacuation
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {emergencyPlan.evacuationProcedures}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                    Medical
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {emergencyPlan.medicalProcedures}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                    Communication
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {emergencyPlan.communicationPlan}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Mitigation Tab */}
        {activeTab === 'mitigation' && (
          <View style={{
            padding: spacing.xl,
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <CheckCircle size={40} color={colors.text.tertiary} />
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: '600',
              marginTop: spacing.md
            }}>
              Mitigation Strategies
            </Text>
            <Text style={{ 
              color: colors.text.secondary,
              textAlign: 'center',
              marginTop: spacing.sm
            }}>
              View and manage risk mitigation strategies and contingency plans
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


function RiskCard({ risk }: { risk: RiskDTO }) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return colors.semantic.error;
      case 'HIGH':
        return colors.semantic.error;
      case 'MEDIUM':
        return colors.semantic.warning;
      case 'LOW':
        return colors.semantic.success;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return colors.semantic.success;
      case 'MITIGATED':
        return colors.semantic.info;
      case 'IDENTIFIED':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle size={16} color={colors.semantic.success} />;
      case 'MITIGATED':
        return <Shield size={16} color={colors.semantic.info} />;
      case 'IDENTIFIED':
        return <AlertTriangle size={16} color={colors.semantic.warning} />;
      default:
        return <Clock size={16} color={colors.text.secondary} />;
    }
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.sm
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.text.primary,
            fontSize: typography.size.lg,
            fontWeight: '700'
          }}>
            {risk.title}
          </Text>
          <Text style={{ 
            color: colors.text.secondary,
            fontSize: 14,
            marginTop: spacing.xs
          }}>
            {risk.description}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {getStatusIcon(risk.status)}
          <View style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            backgroundColor: getStatusColor(risk.status) + '20',
            borderRadius: borderRadius.sm
          }}>
            <Text style={{ 
              color: getStatusColor(risk.status),
              fontSize: 12,
              fontWeight: '600'
            }}>
              {risk.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View style={{
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          backgroundColor: getSeverityColor(risk.severity) + '20',
          borderRadius: borderRadius.sm
        }}>
          <Text style={{ 
            color: getSeverityColor(risk.severity),
            fontSize: 12,
            fontWeight: '600'
          }}>
            {risk.severity}
          </Text>
        </View>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          {risk.category}
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          •
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          Due: {new Date(risk.dueDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <View>
          <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>
            Mitigation Plan:
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            {risk.mitigationPlan}
          </Text>
        </View>
        
        <View>
          <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>
            Contingency Plan:
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            {risk.contingencyPlan}
          </Text>
        </View>
        
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
          Responsible: {risk.responsiblePerson}
        </Text>
      </View>
    </View>
  );
}
