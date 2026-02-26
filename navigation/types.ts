import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type { RootStackParamList } from '../types/navigation';
import type { RootStackParamList } from '../types/navigation';

/** Typed navigation prop for use with useNavigation() */
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** Typed screen props — use as ScreenProps<'ScreenName'> */
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
