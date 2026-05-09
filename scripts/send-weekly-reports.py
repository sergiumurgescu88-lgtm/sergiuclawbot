#!/usr/bin/env python3
"""Script cron pentru trimiterea rapoartelor săptămânale automate"""
import sys
import os
import sqlite3
import requests

# Adaugă calea proiectului
sys.path.insert(0, '/var/www/agentulmeu.online')

from reports_module import get_weekly_stats, send_telegram_report, send_email_report

DB_PATH = '/var/www/agentulmeu.online/config/agentulmeu.db'

def main():
    print("📊 Starting weekly reports...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Verifică dacă tabela există
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_report_config'")
        if not cursor.fetchone():
            print("⏭ No report configs found. Skipping.")
            conn.close()
            return
        
        # Obține toți utilizatorii cu rapoarte activate
        cursor.execute("""
            SELECT urc.*, u.username, u.email as user_email
            FROM user_report_config urc
            JOIN users u ON urc.user_id = u.id
            WHERE urc.enabled = 1
        """)
        
        configs = cursor.fetchall()
        conn.close()
        
        if not configs:
            print("⏭ No active report configs found.")
            return
        
        print(f"📋 Found {len(configs)} active report configs")
        
        for config in configs:
            user_id = config['user_id']
            business_name = config['business_name'] or 'Business-ul tău'
            
            print(f"\n📤 Sending report for user {config['username']} ({business_name})...")
            
            # Trimite pe Telegram dacă e configurat
            if config['telegram_token'] and config['telegram_chat_id']:
                result = send_telegram_report(
                    config['telegram_token'],
                    config['telegram_chat_id'],
                    business_name
                )
                if result.get('success'):
                    print(f"  ✅ Telegram: {result.get('message')}")
                else:
                    print(f"  ❌ Telegram: {result.get('error')}")
            
            # Trimite pe Email dacă e configurat
            if config['email']:
                result = send_email_report(config['email'], business_name)
                if result.get('success'):
                    print(f"  ✅ Email: {result.get('message')}")
                else:
                    print(f"  ❌ Email: {result.get('error')}")
        
        print("\n✅ Weekly reports completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
