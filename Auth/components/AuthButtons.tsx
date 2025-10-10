import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Music, Sparkles } from 'lucide-react-native';
import { useAuthStyles } from '../styles';

type Props = { onSpotifyPress?: () => void };

export const AuthButtons = ({ onSpotifyPress }: Props) => {
  const styles = useAuthStyles();
  return (
    <View style={styles.actionsWrap}>
      <TouchableOpacity activeOpacity={0.9} style={styles.spotifyBtn} onPress={onSpotifyPress}>
        <View style={styles.spotifyBtnInner}>
          <Music size={18} color="#0a3d1e" style={styles.leftIcon} />
          <Text style={styles.spotifyTextCentered}>Continue with Spotify</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.recommendedRow}>
        <Sparkles size={16} color={styles.recommendedText.color as any} />
        <Text style={styles.recommendedText}>Recommended for the best experience</Text>
      </View>
    </View>
  );
};
