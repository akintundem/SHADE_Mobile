import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  const { colors, brand } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={brand.primary} />
    </View>
  );
}
