// Toda la aplicación se muestra en IMPRENTA MAYÚSCULA.
// Estos componentes reemplazan a Text y TextInput de react-native en toda la interfaz.
// La transformación es solo visual: los textos que lee la voz no cambian.
import React from 'react';
import { Text as RNText, TextInput as RNTextInput, TextInputProps, TextProps } from 'react-native';

export const UPPER = { textTransform: 'uppercase' as const };

export const Text = React.forwardRef<React.ComponentRef<typeof RNText>, TextProps>(function Text(props, ref) {
  return <RNText ref={ref} {...props} style={[props.style, UPPER]} />;
});

export const TextInput = React.forwardRef<React.ComponentRef<typeof RNTextInput>, TextInputProps>(function TextInput(props, ref) {
  return <RNTextInput ref={ref} autoCapitalize="characters" {...props} style={[props.style, UPPER]} />;
});
