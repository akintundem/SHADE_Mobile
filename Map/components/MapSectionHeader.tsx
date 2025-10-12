import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPinned, Filter, Umbrella } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';

type Props = { onPressFilters?: () => void };

export const MapSectionHeader = ({ onPressFilters }: Props) => {
  const { colors, brand, typography, spacing } = useTheme();
  const { t } = useI18n();
  
  return (
    <View style={{ 
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    }}>
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Umbrella size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={{ 
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
            }}>
              {t('EventMap')}
            </Text>
            <Text style={{ 
              color: colors.text.secondary,
              fontSize: typography.size.sm,
              marginTop: 2,
            }}>
              {t('LiveInteractive')}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={onPressFilters}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Filter size={16} color={colors.text.secondary} strokeWidth={2} />
          <Text style={{ 
            color: colors.text.secondary,
            fontWeight: typography.weight.medium,
            fontSize: typography.size.sm,
          }}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={{ 
        color: colors.text.secondary,
        marginTop: spacing.sm,
        fontSize: typography.size.base,
        lineHeight: 20,
      }}>
        Discover exclusive events and private moments happening around you
      </Text>
    </View>
  );
};

