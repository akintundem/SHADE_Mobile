import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { DollarSign, Plus } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import Input from '../../../../../common/components/ui/Input';
import { Section } from '../Section';
import { Row } from '../Row';

type Props = {
  enableContrib: boolean;
  onEnableContribChange: (value: boolean) => void;
  contributionAmount: string;
  onContributionAmountChange: (value: string) => void;
};

export function TeamContributionsStep({
  enableContrib,
  onEnableContribChange,
  contributionAmount,
  onContributionAmountChange,
}: Props) {
  const { colors, typography, spacing, borderRadius, isDark } = useTheme();

  const cardBackgroundColor = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#1F1F1F' : '#E5E7EB';

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <Section title="Contributions (optional)">
        <View
          style={{
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: cardBackgroundColor,
          }}
        >
          <Row
            label="Enable contributions"
            icon={<DollarSign size={16} color={colors.text.secondary} />}
          >
            <Switch
              value={enableContrib}
              onValueChange={onEnableContribChange}
            />
          </Row>
          {enableContrib && (
            <View style={{ marginTop: spacing.md }}>
              <Input
                placeholder="Suggested contribution (USD)"
                keyboardType="decimal-pad"
                value={contributionAmount}
                onChangeText={onContributionAmountChange}
              />
            </View>
          )}
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.size.sm,
              marginTop: spacing.sm,
            }}
          >
            Allow guests to contribute financially to your event
          </Text>
        </View>
      </Section>

      <Section title="Collaborators (optional)">
        <View
          style={{
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: cardBackgroundColor,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.sm,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Plus size={20} color={colors.text.secondary} />
            </View>
            <Text style={{ color: colors.text.secondary }}>
              Add collaborators
            </Text>
          </TouchableOpacity>
        </View>
      </Section>
    </ScrollView>
  );
}
