import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type Props = {
  /**
   * Render size in pixels.
   */
  size?: number;
  /**
   * Override the corner radius applied to the icon.
   */
  borderRadius?: number;
  /**
   * Optional wrapper style when the icon needs positioning tweaks.
   */
  style?: StyleProp<ImageStyle>;
  /**
   * Optional test identifier for E2E tests.
   */
  testID?: string;
};

const APP_ICON = require('../../../assets/icon/shade_app_icon.png');
const CORNER_RATIO = 0.225;

export function BrandLogo({
  size = 72,
  borderRadius,
  style,
  testID,
}: Props) {
  const radius = borderRadius ?? Math.round(size * CORNER_RATIO);

  return (
    <Image
      source={APP_ICON}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
      resizeMode="cover"
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Shade app icon"
    />
  );
}

export default BrandLogo;
