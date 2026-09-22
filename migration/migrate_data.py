# migration/migrate_data.py
import json
import psycopg2
from datetime import datetime

def migrate_json_to_postgres():
    # Load existing JSON data
    with open('../data/expenses.json', 'r') as f:
        expenses = json.load(f)
    
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host="localhost",
        database="expensetracker",
        user="your_user",
        password="your_password"
    )
    cur = conn.cursor()
    
    for expense in expenses:
        cur.execute("""
            INSERT INTO transactions (id, user_id, category_id, type, amount, description, transaction_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            expense.get('id'),
            expense.get('user_id', 'default_user_id'),
            expense.get('category_id'),
            expense.get('type'),
            expense.get('amount'),
            expense.get('description'),
            expense.get('date')
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"Migrated {len(expenses)} transactions")