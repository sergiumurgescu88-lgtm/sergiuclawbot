# Runbook Operațional

## Pornire Agent
1. Verifică chei API valide
2. Încarcă configurația din fișierele .md
3. Rulează teste smoke (06_testing.md)
4. Activează monitorizarea (08_monitor.md)
5. Confirmă status ONLINE

## Oprire Agent
1. Setează status PAUSED
2. Notifică clienți activi despre indisponibilitate
3. Backup conversații active
4. Oprește procesele

## Troubleshooting
| Problemă | Soluție |
|----------|---------|
| Agent nu răspunde | Verifică API key + health check |
| Răspunsuri eronate | Revezi memory.md + red lines |
| Conversie scăzută | Ajustează closer + objectives |
| Eroare webhook | Verifică URL + retry logic |

## Contact Escalare
- Tehnic: {{monitor_alert_email}}
- Business: {{identity_agent_name}}
