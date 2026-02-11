// frontend/components/Reports/ReportsGenerator.jsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button } from '@/components/UI/Button';

export const ReportsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Button 
          title={isGenerating ? "Generating..." : "Generate PDF Report"}
          onPress={handleGenerate}
          disabled={isGenerating}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 }
});