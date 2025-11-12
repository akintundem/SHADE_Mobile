import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Search,
  Filter,
  Calendar,
  Tag,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { EventCard, EventItem } from '../Home/components/EventCard';
import { EmptyState } from '../components/LoadingStates';
import { eventService } from '../services/eventService';
import { EventResponse, EventType, EventStatus } from '../types';
import { ErrorHandler } from '../utils/errorHandler';

type Props = {
  onClose: () => void;
  onEventSelect?: (event: EventResponse) => void;
};

type FilterState = {
  type: EventType | '';
  status: EventStatus | '';
  dateFrom: string;
  dateTo: string;
};

const EVENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: EventType.CONFERENCE, label: 'Conference' },
  { value: EventType.WORKSHOP, label: 'Workshop' },
  { value: EventType.SEMINAR, label: 'Seminar' },
  { value: EventType.MEETING, label: 'Meeting' },
  { value: EventType.PARTY, label: 'Party' },
  { value: EventType.WEDDING, label: 'Wedding' },
  { value: EventType.BIRTHDAY, label: 'Birthday' },
  { value: EventType.CORPORATE_EVENT, label: 'Corporate Event' },
  { value: EventType.TRADE_SHOW, label: 'Trade Show' },
  { value: EventType.CONCERT, label: 'Concert' },
  { value: EventType.FESTIVAL, label: 'Festival' },
  { value: EventType.SPORTS_EVENT, label: 'Sports Event' },
  { value: EventType.CHARITY_EVENT, label: 'Charity Event' },
  { value: EventType.NETWORKING, label: 'Networking' },
  { value: EventType.TRAINING, label: 'Training' },
  { value: EventType.RETREAT, label: 'Retreat' },
  { value: EventType.OTHER, label: 'Other' },
];

const EVENT_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: EventStatus.PUBLISHED, label: 'Published' },
  { value: EventStatus.REGISTRATION_OPEN, label: 'Registration Open' },
  { value: EventStatus.REGISTRATION_CLOSED, label: 'Registration Closed' },
  { value: EventStatus.IN_PROGRESS, label: 'In Progress' },
  { value: EventStatus.COMPLETED, label: 'Completed' },
];

export default function EventSearchScreen({ onClose, onEventSelect }: Props) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchEvents = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params: any = {};
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      
      if (filters.type) {
        params.type = filters.type;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }

      const response = await eventService.searchEvents(params);
      setEvents(response.events);
    } catch (error) {
      ErrorHandler.handle(error, 'searchEvents');
      Alert.alert('Error', 'Failed to search events');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchQuery('');
    setEvents([]);
    setHasSearched(false);
  };

  const hasActiveFilters = !!(
    searchQuery.trim() ||
    filters.type ||
    filters.status ||
    filters.dateFrom ||
    filters.dateTo
  );

  const convertToEventItem = (event: EventResponse): EventItem => {
    return {
      id: event.id,
      title: event.name,
      description: event.description || '',
      startAt: event.startDateTime || '',
      endAt: event.endDateTime || '',
      venue: '', // Would need venue info
      city: '',
      state: '',
      imageUrl: event.coverImageUrl || '',
      stats: {
        posts: 0,
        comments: 0,
        likes: 0
      },
      status: event.status, // Use the actual EventStatus from the response
      isPublic: event.isPublic || false,
    };
  };

  const FilterDropdown = ({ 
    label, 
    value, 
    options, 
    onSelect 
  }: { 
    label: string; 
    value: string; 
    options: { value: string; label: string }[]; 
    onSelect: (value: string) => void; 
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[
          { 
            fontSize: typography.size.sm,
            color: colors.text.primary.primary,
            marginBottom: spacing.xs,
            fontWeight: typography.weight.medium
          }
        ]}>
          {label}
        </Text>
        <TouchableOpacity
          onPress={() => setIsOpen(!isOpen)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={[
            { 
              fontSize: typography.size.base,
              color: value ? colors.text.primary.primary : colors.text.primary.secondary
            }
          ]}>
            {options.find(opt => opt.value === value)?.label || options[0].label}
          </Text>
          <ChevronDown 
            size={16} 
            color={colors.text.primary.secondary} 
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
        
        {isOpen && (
          <View style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
            zIndex: 1000,
            maxHeight: 200,
          }}>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: value === option.value ? colors.primary + '20' : 'transparent',
                  }}
                >
                  <Text style={[
                    { 
                      fontSize: typography.size.base,
                      color: value === option.value ? colors.primary : colors.text.primary
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderEventItem = ({ item }: { item: EventResponse }) => (
    <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
      <EventCard
        item={convertToEventItem(item)}
      />
    </View>
  );

  return (
    <SafeAreaWrapper>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: spacing.xs,
              marginRight: spacing.sm,
            }}
          >
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={[
            { 
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
              color: colors.text.primary.primary,
              flex: 1
            }
          ]}>
            Search Events
          </Text>

          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              padding: spacing.xs,
              backgroundColor: showFilters ? colors.primary + '20' : 'transparent',
              borderRadius: borderRadius.sm,
            }}
          >
            <SlidersHorizontal 
              size={20} 
              color={showFilters ? colors.primary : colors.text.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: spacing.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Search size={20} color={colors.text.primary.secondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: spacing.sm,
              fontSize: typography.size.base,
              color: colors.text.primary.primary,
            }}
            placeholder="Search events..."
            placeholderTextColor={colors.text.primary.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchEvents}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={{ padding: spacing.xs }}
            >
              <X size={16} color={colors.text.primary.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={{
            marginHorizontal: spacing.md,
            marginBottom: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}>
              <Text style={[
                { 
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  color: colors.text.primary.primary
                }
              ]}>
                Filters
              </Text>
              
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    backgroundColor: colors.semantic.error + '20',
                    borderRadius: borderRadius.sm,
                  }}
                >
                  <Text style={[
                    { 
                      fontSize: typography.size.sm,
                      color: colors.semantic.error,
                      fontWeight: typography.weight.medium
                    }
                  ]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <FilterDropdown
              label="Event Type"
              value={filters.type}
              options={EVENT_TYPES}
              onSelect={(value) => setFilters(prev => ({ ...prev, type: value as EventType | '' }))}
            />

            <FilterDropdown
              label="Status"
              value={filters.status}
              options={EVENT_STATUSES}
              onSelect={(value) => setFilters(prev => ({ ...prev, status: value as EventStatus | '' }))}
            />

            {/* Date Range would need a proper date picker component */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={[
                  { 
                    fontSize: typography.size.sm,
                    color: colors.text.primary.primary,
                    marginBottom: spacing.xs,
                    fontWeight: typography.weight.medium
                  }
                ]}>
                  From Date
                </Text>
                <TextInput
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    fontSize: typography.size.base,
                    color: colors.text.primary.primary,
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.primary.secondary}
                  value={filters.dateFrom}
                  onChangeText={(value) => setFilters(prev => ({ ...prev, dateFrom: value }))}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[
                  { 
                    fontSize: typography.size.sm,
                    color: colors.text.primary.primary,
                    marginBottom: spacing.xs,
                    fontWeight: typography.weight.medium
                  }
                ]}>
                  To Date
                </Text>
                <TextInput
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    fontSize: typography.size.base,
                    color: colors.text.primary.primary,
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.primary.secondary}
                  value={filters.dateTo}
                  onChangeText={(value) => setFilters(prev => ({ ...prev, dateTo: value }))}
                />
              </View>
            </View>
          </View>
        )}

        {/* Search Button */}
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
          <TouchableOpacity
            onPress={searchEvents}
            disabled={loading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.md,
              backgroundColor: colors.primary,
              borderRadius: borderRadius.md,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Search size={20} color={colors.text.inverse} />
            )}
            <Text style={[
              { 
                fontSize: typography.size.base,
                color: colors.text.inverse,
                marginLeft: spacing.sm,
                fontWeight: typography.weight.semibold
              }
            ]}>
              {loading ? 'Searching...' : 'Search Events'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={{ flex: 1 }}>
          {loading ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[
                { 
                  fontSize: typography.size.base,
                  color: colors.text.primary.secondary,
                  marginTop: spacing.md
                }
              ]}>
                Searching events...
              </Text>
            </View>
          ) : hasSearched ? (
            events.length > 0 ? (
              <FlatList
                data={events}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <EmptyState
                icon={<Search size={48} color={colors.text.primary.secondary} />}
                title="No events found"
                subtitle="Try adjusting your search criteria or filters"
                action={{
                  label: "Clear Search",
                  onPress: clearFilters
                }}
              />
            )
          ) : (
            <EmptyState
              icon={<Search size={48} color={colors.text.primary.secondary} />}
              title="Search for Events"
              subtitle="Enter keywords or use filters to find events"
            />
          )}
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
