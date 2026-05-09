# 🚀 Instalare Hermes Agent — AgentulMeu.online
> **Calea B: Done-For-You ($299 one-time)**

## Cerințe
- VPS Ubuntu 20.04/22.04/24.04 cu root access
- Domain cu A record către IP VPS
- Node.js 18+ (`node -v`)
- ZIP `AgentulMeu_Files.zip` din Wizard

## Pași (executați de echipa AgentulMeu)
1. `apt update && apt install -y nodejs npm nginx certbot unzip`
2. `npm install -g pm2`
3. `mkdir -p /root/.hermes && cd /root/.hermes && unzip -o AgentulMeu_Files.zip`
4. `curl -sSL https://raw.githubusercontent.com/nousresearch/hermes/main/install.sh | bash`
5. Rulează `/root/install-hermes-dfy.sh --domain client.ro --zip AgentulMeu_Files.zip`
6. Verifică: `systemctl status hermes-*` + `curl https://hermes.client.ro/api/health`

## Suport
- Dashboard: `https://hermes.client.ro`
- Email: `suport@agentulmeu.online`
