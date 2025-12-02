import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaWrapper } from '../../../common/components/SafeAreaWrapper';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { MapPin, Users, Heart, Mail, Star, X } from 'lucide-react-native';
import { VenueCardDTO } from '../../../agent/types/assistant';

const { width: screenWidth } = Dimensions.get('window');

interface VenueDetailModalProps {
  visible: boolean;
  venue: VenueCardDTO;
  onClose: () => void;
  onSelectVenue: () => void;
  onSendInquiry: () => void;
}

export default function VenueDetailModal({
  visible,
  venue,
  onClose,
  onSelectVenue,
  onSendInquiry,
}: VenueDetailModalProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const defaultDescription = "Five-star luxury and world-class service. From the grand entrance to the opulent ballroom, every detail is designed to impress. Perfect for those seeking the ultimate in elegance and sophistication for their special event.";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
      }}>
        <View style={{
          width: '100%',
          maxWidth: screenWidth - (spacing.lg * 2),
          maxHeight: '90%',
          backgroundColor: colors.surfaceElevated,
          borderRadius: borderRadius.xl,
          ...shadows.xl,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
          }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
              flex: 1,
            }}>
              {venue.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Main Image */}
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: venue.imageUrl }}
                style={{
                  width: '100%',
                  height: 250,
                  borderTopLeftRadius: borderRadius.xl,
                  borderTopRightRadius: borderRadius.xl,
                }}
                resizeMode="cover"
              />
              {/* Rating Badge */}
              <View style={{
                position: 'absolute',
                top: spacing.md,
                right: spacing.md,
                backgroundColor: colors.text.primary,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.md,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Star size={12} color={colors.brand.secondary} fill={colors.brand.secondary} />
                <Text style={{
                  color: colors.surfaceElevated,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                  marginLeft: spacing.xs,
                }}>
                  {venue.rating} ({venue.reviewCount})
                </Text>
              </View>
            </View>

            {/* Content */}
            <View style={{ padding: spacing.lg }}>
              {/* Quick Facts */}
              <View style={{ marginBottom: spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <MapPin size={16} color={colors.text.secondary} />
                  <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.base,
                    marginLeft: spacing.sm,
                  }}>
                    {venue.location}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={16} color={colors.text.secondary} />
                  <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.size.base,
                    marginLeft: spacing.sm,
                  }}>
                    {venue.guestCapacity}
                  </Text>
                </View>
              </View>

              {/* Pricing */}
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                  marginBottom: spacing.xs,
                }}>
                  Starting from
                </Text>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size['2xl'],
                  fontWeight: typography.weight.bold,
                }}>
                  {venue.priceRange}
                </Text>
              </View>

              {/* About Section */}
              <View style={{ marginBottom: spacing.xl }}>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  marginBottom: spacing.md,
                }}>
                  About this venue
                </Text>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.base,
                  lineHeight: typography.lineHeight.relaxed * typography.size.base,
                }}>
                  {venue.description || defaultDescription}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            padding: spacing.lg,
            gap: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <TouchableOpacity
              onPress={onSelectVenue}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surfaceElevated,
                gap: spacing.sm,
              }}
            >
              <Heart size={20} color={colors.text.primary} />
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.size.base,
                fontWeight: typography.weight.semibold,
              }}>
                Select Venue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSendInquiry}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.lg,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.text.primary,
                gap: spacing.sm,
                ...shadows.md,
              }}
            >
              <Mail size={20} color={colors.surfaceElevated} />
              <Text style={{
                color: colors.surfaceElevated,
                fontSize: typography.size.base,
                fontWeight: typography.weight.semibold,
              }}>
                Send Inquiry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
