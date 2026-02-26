import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Globe, DollarSign, Users } from 'lucide-react-native';
import Input from '../../../../common/components/ui/Input';
import { Section } from '../Section';
import { Row } from '../Row';
import { RadioRow } from '../RadioRow';
import { FieldLabel } from '../FieldLabel';
import { useCreateEvent } from '../../context';
import { useTheme } from '../../../../common/theme/ThemeProvider';

export function AccessStep() {
  const { form, actions, validation } = useCreateEvent();
  const { colors } = useTheme();
  const iconColor = colors.text.secondary;

  const priceError = validation.getFieldError('price');
  const capacityError = validation.getFieldError('capacity');

  return (
    <ScrollView>
      <View className="pb-[120px]">
        <Section title="Visibility">
          <View className="border border-light-border dark:border-dark-border rounded-lg p-md bg-light-surface dark:bg-dark-surface">
            <Row
              label="Public Event"
              icon={<Globe size={16} color={iconColor} />}
            >
              <Switch value={form.isPublic} onValueChange={actions.setIsPublic} />
            </Row>
            <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
              {form.isPublic ? 'Visible to everyone' : 'Visible to invited only'}
            </Text>
          </View>
        </Section>

        <Section title="Access">
          <View className="border border-light-border dark:border-dark-border rounded-lg p-md bg-light-surface dark:bg-dark-surface">
            <RadioRow
              label="Free"
              active={form.free}
              onPress={() => actions.setFree(true)}
            />
            <RadioRow
              label="Paid"
              active={!form.free}
              onPress={() => actions.setFree(false)}
            />
            {!form.free && (
              <View className="mt-md">
                <FieldLabel
                  icon={<DollarSign size={16} color={iconColor} />}
                  label="Price (USD)"
                />
                <Input
                  placeholder="e.g. 25"
                  keyboardType="decimal-pad"
                  value={form.price}
                  onChangeText={(text) => {
                    actions.setPrice(text);
                    validation.validateField('price', text);
                  }}
                  onBlur={() => validation.setFieldTouched('price')}
                  error={priceError || undefined}
                />
              </View>
            )}
          </View>
        </Section>

        <Section title="Capacity">
          <View className="border border-light-border dark:border-dark-border rounded-lg p-md bg-light-surface dark:bg-dark-surface gap-md">
            <FieldLabel
              icon={<Users size={16} color={iconColor} />}
              label="Maximum attendees"
            />
            <Input
              placeholder="e.g. 150"
              keyboardType="number-pad"
              value={form.capacity}
              onChangeText={(text) => {
                actions.setCapacity(text);
                validation.validateField('capacity', text);
              }}
              onBlur={() => validation.setFieldTouched('capacity')}
              error={capacityError || undefined}
            />
            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
              Leave blank if you do not want to enforce a capacity limit.
            </Text>
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}
