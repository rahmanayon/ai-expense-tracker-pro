// frontend/components/Accessibility/AccessibleButton.jsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export const AccessibleButton = ({ onPress, title, accessibilityLabel }) => (
  <Pressable 
    onPress={onPress} 
    accessibilityRole="button" 
    accessibilityLabel={accessibilityLabel || title}
    style={styles.button}
  >
    <Text style={styles.text}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { padding: 12, backgroundColor: '#007AFF', borderRadius: 8 },
  text: { color: '#fff', textAlign: 'center' }
});