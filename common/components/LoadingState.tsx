import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = { message?: string };

export default function LoadingState({ message }: Props) {
  const { brand } = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-md bg-light-background dark:bg-dark-background">
      <ActivityIndicator size="large" color={brand.primary} />
      {message ? (
        <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
