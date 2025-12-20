import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Globe, DollarSign, Users } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import Input from '../../../../common/components/ui/Input';
import { Section } from '../Section';
import { Row } from '../Row';
import { RadioRow } from '../RadioRow';
import { FieldLabel } from '../FieldLabel';

type Props = {
  isPublic: boolean;
  free: boolean;
  price: string;
  capacity: string;
  onPublicChange: (value: boolean) => void;
  onFreeChange: (value: boolean) => void;
  onPriceChange: (text: string) => void;
  onPriceBlur: () => void;
  priceError?: string;
  onCapacityChange: (text: string) => void;
  onCapacityBlur: () => void;
  capacityError?: string;
};

export function AccessStep({
  isPublic,
  free,
  price,
  capacity,
  onPublicChange,
  onFreeChange,
  onPriceChange,
  onPriceBlur,
  priceError,
  onCapacityChange,
  onCapacityBlur,
  capacityError,
}: Props) {
  const { colors, typography, spacing, borderRadius, isDark } = useTheme();

  const cardBackgroundColor = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#1F1F1F' : '#E5E7EB';

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <Section title="Visibility">
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
            label="Public Event"
            icon={<Globe size={16} color={colors.text.secondary} />}
          >
            <Switch value={isPublic} onValueChange={onPublicChange} />
          </Row>
          <Text
            style={{ color: colors.text.tertiary, fontSize: typography.size.sm }}
          >
            {isPublic ? 'Visible to everyone' : 'Visible to invited only'}
          </Text>
        </View>
      </Section>

      <Section title="Access">
        <View
          style={{
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: cardBackgroundColor,
          }}
        >
          <RadioRow
            label="Free"
            active={free}
            onPress={() => onFreeChange(true)}
          />
          <RadioRow
            label="Paid"
            active={!free}
            onPress={() => onFreeChange(false)}
          />
          {!free && (
            <View style={{ marginTop: spacing.md }}>
              <FieldLabel
                icon={<DollarSign size={16} color={colors.text.secondary} />}
                label="Price (USD)"
              />
              <Input
                placeholder="e.g. 25"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={onPriceChange}
                onBlur={onPriceBlur}
                error={priceError}
              />
            </View>
          )}
        </View>
      </Section>

      <Section title="Capacity">
        <View
          style={{
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            backgroundColor: cardBackgroundColor,
            gap: spacing.md,
          }}
        >
          <FieldLabel
            icon={<Users size={16} color={colors.text.secondary} />}
            label="Maximum attendees"
          />
          <Input
            placeholder="e.g. 150"
            keyboardType="number-pad"
            value={capacity}
            onChangeText={onCapacityChange}
            onBlur={onCapacityBlur}
            error={capacityError}
          />
          <Text style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>
            Leave blank if you do not want to enforce a capacity limit.
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
}
