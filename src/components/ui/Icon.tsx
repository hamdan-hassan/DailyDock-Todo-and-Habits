/**
 * DailyDock — Icon Component Wrapper
 *
 * Wraps @react-native-vector-icons/material-icons with loose string typing
 * so dynamic icon names don't cause TS errors.
 */

import React from 'react';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color, style }: IconProps) {
  return (
    <MaterialIcon
      name={name as any}
      size={size}
      color={color}
      style={style}
    />
  );
}

export default Icon;
