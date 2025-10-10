import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, UIManager, findNodeHandle } from 'react-native';
import { Globe, Smile, Search } from 'lucide-react-native';
import { DropdownMenu, DropdownItem } from './DropdownMenu';
import { useTheme } from '../../theme/ThemeProvider';

export const FilterBar = () => {
  const { colors } = useTheme();
  const [country, setCountry] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [countryVisible, setCountryVisible] = useState(false);
  const [typeVisible, setTypeVisible] = useState(false);
  const [countryAnchor, setCountryAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [typeAnchor, setTypeAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const countryRef = useRef<View | null>(null);
  const typeRef = useRef<View | null>(null);

  const countryOptions: DropdownItem[] = [
    { key: 'us', label: 'United States', emojiLeft: '🇺🇸' },
    { key: 'gb', label: 'United Kingdom', emojiLeft: '🇬🇧' },
    { key: 'ng', label: 'Nigeria', emojiLeft: '🇳🇬' },
    { key: 'br', label: 'Brazil', emojiLeft: '🇧🇷' },
    { key: 'jp', label: 'Japan', emojiLeft: '🇯🇵' },
    { key: 'au', label: 'Australia', emojiLeft: '🇦🇺' },
  ];

  const typeOptions: DropdownItem[] = [
    { key: 'all', label: 'All types' },
    { key: 'concert', label: 'Concert' },
    { key: 'festival', label: 'Music Festival' },
    { key: 'party', label: 'Party' },
    { key: 'meetup', label: 'Meetup' },
    { key: 'workshop', label: 'Workshop' },
  ];

  function openFrom(ref: React.RefObject<View | null>, setAnchor: (a: any) => void, setVisible: (v: boolean) => void) {
    const handle = findNodeHandle(ref.current);
    if (!handle) return;
    UIManager.measureInWindow(handle, (x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setVisible(true);
    });
  }

  const countryLabel = country ? countryOptions.find(o => o.key === country)?.label : 'Country';
  const typeLabel = type ? typeOptions.find(o => o.key === type)?.label : 'All types';

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <TouchableOpacity
          ref={countryRef}
          onPress={() => openFrom(countryRef, setCountryAnchor, setCountryVisible)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Globe size={16} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary }}>{countryLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          ref={typeRef}
          onPress={() => openFrom(typeRef, setTypeAnchor, setTypeVisible)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Smile size={16} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary }}>{typeLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <View style={{ flex: 1, height: 36, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
          <Search size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <DropdownMenu
        visible={countryVisible}
        onDismiss={() => setCountryVisible(false)}
        anchor={countryAnchor}
        items={countryOptions}
        selectedKey={country}
        onSelect={setCountry}
      />

      <DropdownMenu
        visible={typeVisible}
        onDismiss={() => setTypeVisible(false)}
        anchor={typeAnchor}
        items={typeOptions}
        selectedKey={type || 'all'}
        onSelect={setType}
      />
    </View>
  );
};
