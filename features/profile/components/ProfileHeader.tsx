import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Settings, Edit3 } from 'lucide-react-native';
// @ts-ignore: No type definitions, bypass for now
import { User } from '../../auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  user: any;
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
};

export const ProfileHeader = ({ user, onEditProfile, onOpenSettings }: Props) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  
  const handle = (user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-');

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={{ 
        height: 56,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        <TouchableOpacity 
          onPress={onOpenSettings}
          activeOpacity={0.7}
          style={{
            padding: spacing.sm,
          }}
        >
          <Settings size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <View style={{ 
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
      }}>
        <View style={{ marginBottom: spacing.lg }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' }}
            style={{ 
              height: 80,
              width: 80,
              borderRadius: 40,
              backgroundColor: colors.surface,
            }}
          />
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ 
            fontSize: typography.size['2xl'],
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {user.name || 'Member'}
          </Text>
          <TouchableOpacity 
            onPress={onEditProfile}
            activeOpacity={0.7}
            style={{
              padding: spacing.xs / 2,
            }}
          >
            <Edit3 size={16} color={colors.text.secondary} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
        
        <Text style={{ 
          marginTop: spacing.xs / 2,
          color: colors.text.secondary,
          fontSize: typography.size.base,
          fontWeight: typography.weight.medium,
        }}>
          @{handle}
        </Text>

        <View style={{ 
          flexDirection: 'row',
          gap: spacing['2xl'],
          marginTop: spacing.xl,
        }}>
          <View>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.lg,
            }}>
              0
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.xs,
              marginTop: 2,
            }}>
              Followers
            </Text>
          </View>
          <View>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.lg,
            }}>
              0
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.xs,
              marginTop: 2,
            }}>
              Following
            </Text>
          </View>
          <View>
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.lg,
            }}>
              0
            </Text>
            <Text style={{ 
              color: colors.text.tertiary,
              fontSize: typography.size.xs,
              marginTop: 2,
            }}>
              Events
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
