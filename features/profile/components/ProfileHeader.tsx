import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Settings, Edit3 } from 'lucide-react-native';
import { User } from '../../auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  user: User;
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
};

export const ProfileHeader = ({ user, onEditProfile, onOpenSettings }: Props) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  
  const handle = (user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-');

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={{ 
        height: 64,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing.sm,
      }}>
        <TouchableOpacity 
          onPress={onEditProfile}
          activeOpacity={0.7}
          style={{
            padding: spacing.sm,
          }}
        >
          <Edit3 size={22} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onOpenSettings}
          activeOpacity={0.7}
          style={{
            padding: spacing.sm,
          }}
        >
          <Settings size={22} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <View style={{ 
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
      }}>
        <View style={{ marginBottom: spacing.xl }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' }}
            style={{ 
              height: 100,
              width: 100,
              borderRadius: 50,
              backgroundColor: colors.surface,
            }}
          />
        </View>
        
        <Text style={{ 
          fontSize: typography.size['5xl'],
          fontWeight: typography.weight.bold,
          color: colors.text.primary,
          letterSpacing: -1,
        }}>
          {user.name || 'Member'}
        </Text>
        
        <Text style={{ 
          marginTop: spacing.xs,
          color: colors.text.secondary,
          fontSize: typography.size.lg,
          fontWeight: typography.weight.medium,
        }}>
          @{handle}
        </Text>

        <View style={{ 
          flexDirection: 'row',
          gap: spacing['3xl'],
          marginTop: spacing['3xl'],
        }}>
          <View>
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
              marginTop: 2,
            }}>
              Followers
            </Text>
          </View>
          <View>
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
              marginTop: 2,
            }}>
              Following
            </Text>
          </View>
          <View>
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
