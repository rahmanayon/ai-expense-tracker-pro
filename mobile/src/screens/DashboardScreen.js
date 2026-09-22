// mobile/src/screens/DashboardScreen.js
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { SummaryCards, AIInsightsPanel, ExpenseChart, BudgetOverview, RecentTransactions } from '../components';
import { colors, spacing } from '../theme';

export const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await dispatch(fetchDashboardData()).unwrap();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <SummaryCards data={data?.summary} />
        <AIInsightsPanel insights={data?.aiInsights} />
        <ExpenseChart data={data?.expenseBreakdown} />
        <BudgetOverview budgets={data?.budgetStatus} />
        <RecentTransactions transactions={data?.recentTransactions} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md }
});