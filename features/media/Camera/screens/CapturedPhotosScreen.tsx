import React from 'react';
import { View, ScrollView, Image, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { SafeAreaWrapper } from '../../../../shared/components/SafeAreaWrapper';

type CapturedPhoto = {
  path: string;
  type: 'photo' | 'video';
  timestamp: number;
};

type Props = {
  photos: CapturedPhoto[];
  onClose: () => void;
};

const { width } = Dimensions.get('window');
const GRID_GAP = 4;
const COLUMNS = 3;
const IMAGE_SIZE = (width - (GRID_GAP * (COLUMNS + 1))) / COLUMNS;

export default function CapturedPhotosScreen({ photos, onClose }: Props) {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const photosOnly = photos.filter(p => p.type === 'photo');

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text.primary, fontSize: typography.size.xl, fontWeight: typography.weight.bold }]}>
            Captured Photos
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.border : 'transparent', borderRadius: borderRadius.full }
            ]}
          >
            <X size={24} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Photo Count */}
        <View style={{ padding: spacing.md }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
            {photosOnly.length} photo{photosOnly.length !== 1 ? 's' : ''} captured
          </Text>
        </View>

        {/* Gallery Grid */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.grid, { padding: GRID_GAP }]}
          showsVerticalScrollIndicator={false}
        >
          {photosOnly.length === 0 ? (
            <View style={[styles.emptyState, { padding: spacing.xl }]}>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.base, textAlign: 'center' }}>
                No photos captured yet.{'\n'}Take some photos to see them here!
              </Text>
            </View>
          ) : (
            photosOnly.map((photo, index) => (
              <View
                key={`${photo.path}-${index}`}
                style={[
                  styles.photoContainer,
                  {
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    marginBottom: GRID_GAP,
                    marginRight: (index + 1) % COLUMNS === 0 ? 0 : GRID_GAP,
                    borderRadius: borderRadius.sm,
                    overflow: 'hidden',
                    backgroundColor: colors.border,
                  }
                ]}
              >
                <Image
                  source={{ uri: photo.path }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={[styles.timestamp, { backgroundColor: 'rgba(0,0,0,0.6)', padding: spacing.xs, borderRadius: borderRadius.xs }]}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>
                    {new Date(photo.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  timestamp: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
