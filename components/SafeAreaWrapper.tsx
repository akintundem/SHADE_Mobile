import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface SafeAreaWrapperProps extends Omit<SafeAreaViewProps, 'style'> {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor,
  edges = ['top', 'bottom'],
  style,
  ...props
}) => {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: backgroundColor || colors.background,
        },
        style,
      ]}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};
