import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

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
  return (
    <SafeAreaView
      className={!backgroundColor ? 'flex-1 bg-light-background dark:bg-dark-background' : undefined}
      style={[
        { flex: 1 },
        backgroundColor ? { backgroundColor } : undefined,
        style,
      ]}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};
