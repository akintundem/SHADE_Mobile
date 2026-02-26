import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Sparkles, Upload, Calendar, MapPin, DollarSign, Tag, Clock, Edit3 } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { formatDisplayDateTime } from '../../../../common/datetime';
import { appConfig } from '../../../../config/appConfig';
import { EVENT_CATEGORIES } from '../../../../core/events/constants';
import { useCreateEvent } from '../../context';
import { formatVenueLocation } from '../../utils';
import { useTheme } from '../../../../common/theme/ThemeProvider';

export function ReviewStep() {
  const { form, actions } = useCreateEvent();
  const { colors } = useTheme();
  const accentColor = colors.semantic.warning;
  const mapApiKey = appConfig.geoapifyApiKey || 'demo';

  const handleUploadImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
      });

      if (result.didCancel || result.errorMessage) {
        return;
      }

      const asset = result.assets?.[0];
      if (asset) {
        actions.setCoverImage(asset);
      }
    } catch (error) {
      // Error selecting image
    }
  };

  const staticMapUrl = useMemo(() => {
    if (form.venue?.latitude && form.venue?.longitude && mapApiKey) {
      const zoom = 13;
      const encodedAccent = encodeURIComponent(accentColor);
      return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${form.venue.longitude},${form.venue.latitude}&zoom=${zoom}&marker=lonlat:${form.venue.longitude},${form.venue.latitude};type:material;color:${encodedAccent};size:medium&apiKey=${mapApiKey}`;
    }
    return null;
  }, [form.venue?.latitude, form.venue?.longitude, mapApiKey, accentColor]);

  const categoryLabel = useMemo(() => {
    if (!form.selectedEventType) return 'Not set';
    return EVENT_CATEGORIES.find((category) => category.value === form.selectedEventType)?.label
      || form.selectedEventType;
  }, [form.selectedEventType]);

  const formattedStart = useMemo(
    () => formatDisplayDateTime(form.startDate, form.startTime),
    [form.startDate, form.startTime],
  );

  const formattedEnd = useMemo(
    () => formatDisplayDateTime(form.endDate, form.endTime),
    [form.endDate, form.endTime],
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-lg pt-xl pb-[120px]">
        <View className="mb-xl">
          <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary mb-xs">
            Event Poster
          </Text>
          <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
            AI-generated based on your details
          </Text>
        </View>

        <View className="bg-light-background dark:bg-dark-background rounded-xl border border-light-border dark:border-dark-border overflow-hidden mb-lg">
          <View className="h-[420px] relative justify-end px-xl pb-2xl bg-brand-primary">
            <View className="absolute top-lg right-lg bg-neutral-white/95 rounded-full px-md py-xs">
              <Text className="text-xs font-semibold text-neutral-black">Event</Text>
            </View>
            <Text
              className="text-txt-inverse text-[48px] font-bold leading-[52px] tracking-[-0.5px]"
              numberOfLines={3}
            >
              {form.title || 'Event Name'}
            </Text>
          </View>

          <View className="flex-row gap-sm p-md bg-light-background dark:bg-dark-background">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-xs py-md rounded-lg border border-light-border dark:border-dark-border"
              activeOpacity={0.7}
            >
              <Sparkles size={18} color={colors.text.primary} />
              <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                Regenerate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUploadImage}
              className="flex-1 flex-row items-center justify-center gap-xs py-md rounded-lg border border-light-border dark:border-dark-border"
              activeOpacity={0.7}
            >
              <Upload size={18} color={colors.text.primary} />
              <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                Upload Own
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-lg mt-md">
          <Text className="text-sm font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary">
            Event Summary
          </Text>
        </View>

        <View className="gap-md">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => actions.goToStep(0)}
            className="bg-light-background dark:bg-dark-background rounded-xl border border-light-border dark:border-dark-border p-lg"
          >
            <View className="flex-row items-start justify-between mb-md">
                <View className="flex-row items-center gap-sm">
                  <View className="w-8 h-8 rounded-lg items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                    <Tag size={16} color={colors.text.primary} />
                  </View>
                  <Text className="text-base font-bold text-txt-primary dark:text-txt-dark-primary">
                    Basic Info
                  </Text>
                </View>
                <View className="w-7 h-7 rounded-full items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                  <Edit3 size={14} color={colors.text.tertiary} />
                </View>
              </View>

            <View className="gap-sm">
              <View>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                  Event Name
                </Text>
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                  {form.title || 'Not set'}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                  Description
                </Text>
                <Text
                  className="text-sm text-txt-primary dark:text-txt-dark-primary leading-[18px]"
                  numberOfLines={2}
                >
                  {form.description || 'Not set'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {form.selectedEventType ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => actions.goToStep(1)}
              className="bg-light-background dark:bg-dark-background rounded-xl border border-light-border dark:border-dark-border p-lg"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-sm">
                  <View className="w-8 h-8 rounded-lg items-center justify-center bg-brand-secondary/10">
                    <Tag size={16} color={accentColor} />
                  </View>
                  <View>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      Category
                    </Text>
                    <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                      {categoryLabel}
                    </Text>
                  </View>
                </View>
                <View className="w-7 h-7 rounded-full items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                  <Edit3 size={14} color={colors.text.tertiary} />
                </View>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => actions.goToStep(2)}
            className="bg-light-background dark:bg-dark-background rounded-xl border border-light-border dark:border-dark-border p-lg"
          >
            <View className="flex-row items-start justify-between mb-md">
                <View className="flex-row items-center gap-sm">
                  <View className="w-8 h-8 rounded-lg items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                    <Calendar size={16} color={colors.text.primary} />
                  </View>
                  <Text className="text-base font-bold text-txt-primary dark:text-txt-dark-primary">
                    Date & Time
                  </Text>
                </View>
                <View className="w-7 h-7 rounded-full items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                  <Edit3 size={14} color={colors.text.tertiary} />
                </View>
              </View>

            <View className="gap-sm">
              <View className="flex-row items-center gap-xs">
                <Clock size={14} color={colors.text.tertiary} />
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                  Start
                </Text>
              </View>
              <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                {formattedStart || 'Not set'}
              </Text>

              {formattedEnd ? (
                <>
                  <View className="flex-row items-center gap-xs mt-xs">
                    <Clock size={14} color={colors.text.tertiary} />
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      End
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {formattedEnd}
                  </Text>
                </>
              ) : null}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => actions.goToStep(3)}
            className="bg-light-background dark:bg-dark-background rounded-xl border border-light-border dark:border-dark-border overflow-hidden"
          >
            {staticMapUrl ? (
              <View className="h-40 overflow-hidden">
                <Image
                  source={{ uri: staticMapUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ) : null}

            <View className="p-lg">
                <View className="flex-row items-start justify-between mb-sm">
                  <View className="flex-row items-center gap-sm">
                    <View className="w-8 h-8 rounded-lg items-center justify-center bg-brand-secondary/10">
                      <MapPin size={16} color={accentColor} />
                    </View>
                    <Text className="text-base font-bold text-txt-primary dark:text-txt-dark-primary">
                      Location
                    </Text>
                  </View>
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                    <Edit3 size={14} color={colors.text.tertiary} />
                  </View>
                </View>

              <Text
                className="text-sm text-txt-primary dark:text-txt-dark-primary leading-[18px]"
                numberOfLines={2}
              >
                {formatVenueLocation(form.venue)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => actions.goToStep(4)}
            className="bg-light-background dark:bg-dark-background rounded-xl border border-light-border dark:border-dark-border p-lg"
          >
                <View className="flex-row items-start justify-between mb-md">
                  <View className="flex-row items-center gap-sm">
                    <View className="w-8 h-8 rounded-lg items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                      <DollarSign size={16} color={colors.text.primary} />
                    </View>
                    <Text className="text-base font-bold text-txt-primary dark:text-txt-dark-primary">
                      Access & Pricing
                    </Text>
                  </View>
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-light-surface-strong dark:bg-dark-surface-strong">
                    <Edit3 size={14} color={colors.text.tertiary} />
                  </View>
                </View>

            <View className="flex-row gap-md">
              <View className="flex-1">
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                  Visibility
                </Text>
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                  {form.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                  Price
                </Text>
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                  {form.free ? 'Free' : form.price ? `$${form.price}` : 'Paid'}
                </Text>
              </View>
              {form.capacity ? (
                <View className="flex-1">
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                    Capacity
                  </Text>
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {form.capacity}
                  </Text>
                </View>
              ) : null}
            </View>
            {form.enableContrib ? (
              <View className="mt-md">
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                  Team Contributions
                </Text>
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                  {form.contributionAmount ? `Suggested: $${form.contributionAmount}` : 'Enabled'}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
