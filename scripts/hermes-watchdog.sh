#!/bin/bash
# Hermes Gateway Watchdog — Auto-restart + Alert
LOG="/var/log/hermes-watchdog.log"
MAX_RESTARTS=5
RESTART_COUNT=0

echo "[$(date)] Watchdog started" >> $LOG

while true; do
  # Check if hermes gateway or telegram gateway is running
  if ! pgrep -f "hermes.*gateway\|hermes.*telegram\|telegram-gateway" > /dev/null 2>&1; then
    RESTART_COUNT=$((RESTART_COUNT + 1))
    echo "[$(date)] Gateway DOWN (restart #$RESTART_COUNT). Attempting restart..." >> $LOG
    
    if [ $RESTART_COUNT -le $MAX_RESTARTS ]; then
      systemctl restart hermes-telegram 2>/dev/null || systemctl restart hermes-agent 2>/dev/null || true
      sleep 5
      
      if pgrep -f "hermes.*gateway\|hermes.*telegram\|telegram-gateway" > /dev/null 2>&1; then
        echo "[$(date)] Gateway RESTARTED successfully" >> $LOG
        RESTART_COUNT=0
      else
        echo "[$(date)] Restart FAILED" >> $LOG
      fi
    else
      echo "[$(date)] MAX restarts reached. Alerting owner..." >> $LOG
      # Alert via Telegram if token exists
      TOKEN=$(grep "TELEGRAM_BOT_TOKEN" ~/.hermes/.env 2>/dev/null | cut -d'=' -f2-)
      CHAT_ID=$(grep "TELEGRAM_CHAT_ID" ~/.hermes/.env 2>/dev/null | cut -d'=' -f2-)
      if [ -n "$TOKEN" ] && [ -n "$CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
          -d "chat_id=$CHAT_ID&text=⚠️%20AgentulMeu%20Gateway%20s-a%20oprit%20și%20nu%20a%20putut%20fi%20repornit%20automat.%20Te%20rugăm%20verifică%20VPS-ul." > /dev/null
      fi
      RESTART_COUNT=0
      sleep 300
    fi
  else
    RESTART_COUNT=0
  fi
  sleep 60
done
