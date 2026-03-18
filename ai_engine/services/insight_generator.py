# ai_engine/services/insight_generator.py
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta

class AIInsightGenerator:
    def __init__(self, db_connection):
        self.db = db_connection
    
    def generate_insights(self, user_id: str, date_range_start: str, date_range_end: str) -> List[Dict]:
        insights = []
        
        # Fetch user transactions
        query = """
            SELECT t.*, c.name as category_name, c.emoji
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = %s 
            AND t.transaction_date BETWEEN %s AND %s
        """
        df = pd.read_sql(query, self.db, params=[user_id, date_range_start, date_range_end])
        
        if df.empty:
            return insights
        
        # Insight 1: Spending pattern analysis
        insights.append(self._analyze_spending_patterns(df))
        
        # Insight 2: Budget adherence
        insights.append(self._analyze_budget_adherence(user_id, df, date_range_start, date_range_end))
        
        # Insight 3: Investment opportunities
        insights.append(self._analyze_savings_opportunities(df))
        
        return [i for i in insights if i is not None]
    
    def _analyze_spending_patterns(self, df: pd.DataFrame) -> Dict:
        expense_df = df[df['type'] == 'expense']
        if expense_df.empty:
            return None
        
        category_spending = expense_df.groupby('category_name')['amount'].sum().sort_values(ascending=False)
        top_category = category_spending.index[0]
        top_amount = category_spending.iloc[0]
        total_spent = expense_df['amount'].sum()
        
        return {
            "type": "spending_pattern",
            "title": "Top Spending Category",
            "description": f"You spent ${top_amount:.2f} on {top_category}, representing { (top_amount / total_spent * 100):.1f }% of total expenses.",
            "actionable": True,
            "suggestion": f"Consider reducing {top_category} spending by 10-15% to save ${top_amount * 0.15:.2f} monthly."
        }
    
    def _analyze_budget_adherence(self, user_id: str, df: pd.DataFrame, start_date: str, end_date: str) -> Dict:
        # Implementation for budget vs actual analysis
        # This would query budget table and compare with actual spending
        pass