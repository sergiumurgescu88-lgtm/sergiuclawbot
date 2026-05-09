# ═══ WEEKLY REPORTS MODULE ═══
import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'config', 'agentulmeu.db')

def get_weekly_stats(user_id=None):
    """Generează statistici săptămânale din baza de date"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Asigură-te că tabela conversations există
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message TEXT,
                response TEXT,
                intent TEXT,
                confidence REAL,
                channel TEXT DEFAULT 'unknown',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        
        # Query pentru ultimele 7 zile
        where_clause = "WHERE created_at >= datetime('now', '-7 days')"
        params = []
        
        if user_id:
            where_clause += " AND user_id = ?"
            params.append(user_id)
        
        # Total conversații
        cursor.execute(f"SELECT COUNT(*) as total FROM conversations {where_clause}", params)
        total = cursor.fetchone()['total']
        
        # Grupare pe intenții
        cursor.execute(f"""
            SELECT intent, COUNT(*) as count, AVG(confidence) as avg_conf
            FROM conversations {where_clause}
            GROUP BY intent ORDER BY count DESC
        """, params)
        intents = []
        for row in cursor.fetchall():
            intents.append({
                'intent': row['intent'],
                'count': row['count'],
                'avg_confidence': round(row['avg_conf'] or 0, 2)
            })
        
        # Grupare pe canale
        cursor.execute(f"""
            SELECT channel, COUNT(*) as count
            FROM conversations {where_clause}
            GROUP BY channel ORDER BY count DESC
        """, params)
        channels = []
        for row in cursor.fetchall():
            channels.append({
                'channel': row['channel'],
                'count': row['count']
            })
        
        # Conversații pe zi (ultimele 7 zile)
        cursor.execute(f"""
            SELECT DATE(created_at) as day, COUNT(*) as count
            FROM conversations {where_clause}
            GROUP BY DATE(created_at) ORDER BY day DESC
        """, params)
        daily = []
        for row in cursor.fetchall():
            daily.append({
                'day': row['day'],
                'count': row['count']
            })
        
        # Top întrebări (mesaje frecvente)
        cursor.execute(f"""
            SELECT message, COUNT(*) as count
            FROM conversations {where_clause}
            GROUP BY message ORDER BY count DESC LIMIT 5
        """, params)
        top_questions = []
        for row in cursor.fetchall():
            top_questions.append({
                'message': row['message'][:100],
                'count': row['count']
            })
        
        conn.close()
        
        # Calculează ROI estimat
        hours_saved = round(total * 0.05, 1)  # ~3 minute per conversație economisită
        appointments = sum(i['count'] for i in intents if i['intent'] == 'rezervare')
        leads = sum(i['count'] for i in intents if i['intent'] == 'vanzare')
        support_tickets = sum(i['count'] for i in intents if i['intent'] == 'suport')
        
        return {
            'success': True,
            'period': '7 zile',
            'total_conversations': total,
            'intents': intents,
            'channels': channels,
            'daily': daily,
            'top_questions': top_questions,
            'roi': {
                'hours_saved': hours_saved,
                'appointments': appointments,
                'leads': leads,
                'support_tickets': support_tickets,
                'estimated_value_lei': round(hours_saved * 150, 0)  # 150 lei/oră estimat
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'total_conversations': 0,
            'intents': [],
            'channels': [],
            'daily': [],
            'top_questions': [],
            'roi': {
                'hours_saved': 0,
                'appointments': 0,
                'leads': 0,
                'support_tickets': 0,
                'estimated_value_lei': 0
            }
        }


def format_telegram_report(stats, business_name="Business-ul tău"):
    """Formatează raportul pentru Telegram"""
    intent_labels = {
        'rezervare': '📅 Rezervări',
        'pret': '💰 Prețuri',
        'suport': '🛠️ Suport',
        'vanzare': '🛒 Vânzări',
        'meniu': '🍽️ Meniu',
        'program': '🕐 Program',
        'contact': '📍 Contact',
        'general': '💬 General'
    }
    
    report = f"📊 *Raport Săptămânal — {business_name}*\n\n"
    report += f"📅 Perioada: Ultimele 7 zile\n"
    report += f"💬 Conversații totale: *{stats['total_conversations']}*\n\n"
    
    # ROI Section
    roi = stats['roi']
    report += "💡 *Impact estimat:*\n"
    report += f"⏱ Ore economisite: *{roi['hours_saved']}h*\n"
    report += f"📅 Programări făcute: *{roi['appointments']}*\n"
    report += f"🛒 Lead-uri captate: *{roi['leads']}*\n"
    report += f"🛠 Tickete suport: *{roi['support_tickets']}*\n"
    report += f"💰 Valoare estimată: *{int(roi['estimated_value_lei'])} lei*\n\n"
    
    # Intents breakdown
    if stats['intents']:
        report += "📈 *Top intenții:*\n"
        for item in stats['intents'][:5]:
            label = intent_labels.get(item['intent'], item['intent'])
            pct = round((item['count'] / stats['total_conversations']) * 100) if stats['total_conversations'] > 0 else 0
            report += f"{label}: *{item['count']}* ({pct}%)\n"
        report += "\n"
    
    # Channels
    if stats['channels']:
        report += "📱 *Canale:*\n"
        for ch in stats['channels']:
            report += f"• {ch['channel']}: *{ch['count']}*\n"
        report += "\n"
    
    # Top questions
    if stats['top_questions']:
        report += "❓ *Top întrebări:*\n"
        for i, q in enumerate(stats['top_questions'][:3], 1):
            report += f"{i}. {q['message']} (*{q['count']}x*)\n"
        report += "\n"
    
    report += "🤖 _AgentulMeu.online — Agentul AI care lucrează pentru tine_"
    
    return report


def format_email_report(stats, business_name="Business-ul tău"):
    """Formatează raportul pentru Email (HTML)"""
    intent_labels = {
        'rezervare': '📅 Rezervări',
        'pret': '💰 Prețuri',
        'suport': '🛠️ Suport',
        'vanzare': '🛒 Vânzări',
        'meniu': '🍽️ Meniu',
        'program': '🕐 Program',
        'contact': '📍 Contact',
        'general': '💬 General'
    }
    
    roi = stats['roi']
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f8fafc; padding: 32px; border-radius: 16px;">
        <h1 style="color: #f97316; font-size: 24px; margin-bottom: 8px;">📊 Raport Săptămânal</h1>
        <p style="color: #a1a1aa; margin-bottom: 24px;">{business_name} — Ultimele 7 zile</p>
        
        <div style="background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #f8fafc; font-size: 18px; margin-bottom: 16px;">💡 Impact estimat</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <div style="color: #a1a1aa; font-size: 12px;">Ore economisite</div>
                    <div style="color: #f97316; font-size: 24px; font-weight: 800;">{roi['hours_saved']}h</div>
                </div>
                <div>
                    <div style="color: #a1a1aa; font-size: 12px;">Valoare estimată</div>
                    <div style="color: #22c55e; font-size: 24px; font-weight: 800;">{int(roi['estimated_value_lei'])} lei</div>
                </div>
                <div>
                    <div style="color: #a1a1aa; font-size: 12px;">Programări</div>
                    <div style="color: #f8fafc; font-size: 24px; font-weight: 800;">{roi['appointments']}</div>
                </div>
                <div>
                    <div style="color: #a1a1aa; font-size: 12px;">Lead-uri</div>
                    <div style="color: #f8fafc; font-size: 24px; font-weight: 800;">{roi['leads']}</div>
                </div>
            </div>
        </div>
        
        <div style="background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #f8fafc; font-size: 18px; margin-bottom: 16px;">📈 Statistici conversații</h2>
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 16px;">Total: <strong style="color: #f97316;">{stats['total_conversations']}</strong> conversații</p>
    """
    
    if stats['intents']:
        html += "<div style='margin-bottom: 16px;'>"
        for item in stats['intents'][:5]:
            label = intent_labels.get(item['intent'], item['intent'])
            pct = round((item['count'] / stats['total_conversations']) * 100) if stats['total_conversations'] > 0 else 0
            html += f"""
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #f8fafc; font-size: 13px;">{label}</span>
                    <span style="color: #a1a1aa; font-size: 13px;">{item['count']} ({pct}%)</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: {pct}%; background: #f97316; border-radius: 3px;"></div>
                </div>
            </div>
            """
        html += "</div>"
    
    html += """
        </div>
        
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
            <p style="color: #71717a; font-size: 12px;">AgentulMeu.online — Agentul AI care lucrează pentru tine</p>
        </div>
    </div>
    """
    
    return html


def send_telegram_report(telegram_token, chat_id, business_name="Business-ul tău"):
    """Trimite raportul săptămânal pe Telegram"""
    import requests
    
    stats = get_weekly_stats()
    report_text = format_telegram_report(stats, business_name)
    
    try:
        url = f"https://api.telegram.org/bot{telegram_token}/sendMessage"
        response = requests.post(url, json={
            'chat_id': chat_id,
            'text': report_text,
            'parse_mode': 'Markdown'
        }, timeout=10)
        
        if response.status_code == 200:
            return {'success': True, 'message': 'Raport trimis pe Telegram'}
        else:
            return {'success': False, 'error': f'Telegram API error: {response.status_code}'}
            
    except Exception as e:
        return {'success': False, 'error': str(e)}


def send_email_report(email_to, business_name="Business-ul tău"):
    """Trimite raportul săptămânal pe Email"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    stats = get_weekly_stats()
    html_content = format_email_report(stats, business_name)
    
    try:
        # Configurare SMTP (de completat cu date reale)
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_user = os.getenv('SMTP_USER', '')
        smtp_password = os.getenv('SMTP_PASSWORD', '')
        
        if not smtp_user or not smtp_password:
            return {'success': False, 'error': 'SMTP not configured'}
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📊 Raport Săptămânal — {business_name}"
        msg['From'] = smtp_user
        msg['To'] = email_to
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return {'success': True, 'message': 'Raport trimis pe email'}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
