// frontend/components/WhiteLabel/ThemeCustomizer.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/UI';

export const ThemeCustomizer = () => {
  const [primary, setPrimary] = useState('#6366f1');
  return (
    <View style={styles.container}>
      <Text>Primary Color: {primary}</Text>
      <Button title="Save Theme" onPress={() => {}} />
    </View>
  );
};
const styles = StyleSheet.create({ container: { padding: 20 } });