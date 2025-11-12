import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Settings, Edit3 } from 'lucide-react-native';
import { User } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onCreate?: () => void;
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
};

export const ProfileHeader = ({ user, onOpenMenu, onCreate, onEditProfile, onOpenSettings }: Props) => {
  const { colors, brand, typography, spacing, shadows, borderRadius } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{
          color: colors.text.primary,
          fontWeight: typography.weight.bold,
          fontSize: typography.size.xl,
          letterSpacing: -0.5,
        }}>
          Profile
        </Text>
        
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity 
            onPress={onEditProfile}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Edit profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Edit3 size={18} color={colors.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onOpenSettings}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Open settings"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Settings size={18} color={colors.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ 
        alignItems: 'center',
        paddingTop: spacing.xl,
        paddingBottom: spacing['2xl'],
      }}>
        <View style={{
          position: 'relative',
          marginBottom: spacing.lg,
        }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' }}
            style={{ 
              height: 100,
              width: 100,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: brand.primary,
            }}
          />
          {/* Removed umbrella badge for cleaner avatar */}
        </View>
        
        <Text style={{ 
          fontSize: typography.size['2xl'],
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
        }}>
          {user.name || 'Member'}
        </Text>
        
        <Text style={{ 
          marginTop: spacing.xs,
          color: colors.text.secondary,
          fontSize: typography.size.base,
        }}>
          @{(user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-')}
        </Text>

        <View style={{ 
          flexDirection: 'row',
          gap: spacing['3xl'],
          marginTop: spacing.xl,
          paddingHorizontal: spacing['2xl'],
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.xl,
            }}>
              0
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.sm,
              marginTop: spacing.xs,
            }}>
              Followers
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.xl,
            }}>
              0
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.sm,
              marginTop: spacing.xs,
            }}>
              Following
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.xl,
            }}>
              0
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.sm,
              marginTop: spacing.xs,
            }}>
              Events
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
