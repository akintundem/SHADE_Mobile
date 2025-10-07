import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

export type DropdownItem = { key: string; label: string; emojiLeft?: string };

type Props = {
  visible: boolean;
  onDismiss: () => void;
  anchor: { x: number; y: number; width: number; height: number } | null;
  items: DropdownItem[];
  selectedKey?: string | null;
  onSelect: (key: string) => void;
};

export const DropdownMenu = ({ visible, onDismiss, anchor, items, selectedKey, onSelect }: Props) => {
  const top = anchor ? anchor.y + anchor.height + 6 : 0;
  const left = anchor ? anchor.x : 0;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1 }} onPress={onDismiss}>
        <View style={{ position: 'absolute', top, left, width: 220, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
          {items.map(item => (
            <Pressable
              key={item.key}
              onPress={() => {
                onSelect(item.key);
                onDismiss();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}
            >
              <Text style={{ width: 22, marginRight: 8, textAlign: 'center' }}>{item.emojiLeft || ''}</Text>
              <Text style={{ flex: 1, color: '#111827' }}>{item.label}</Text>
              {selectedKey === item.key ? <Check size={16} color="#111827" /> : null}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

