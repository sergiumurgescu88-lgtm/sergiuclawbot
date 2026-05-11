module.exports = {
  apps: [{
    name: "agentulmeu-flask",
    script: "server.py",
    interpreter: "/var/www/agentulmeu.online/venv/bin/python",
    cwd: "/var/www/agentulmeu.online",
    env: {
      KIMI_API_KEY: "sk-hQUa0R9iX78ctjJmDDqXFrQ475rgPDFGXNupbqtqEcyrJ3cA",
      FLASK_SECRET_KEY: "034e054015f2c00b470f"
    }
  },
  {
    name: "genapi",
    script: "/var/www/agentulmeu.online/genapi/server.js",
    cwd: "/var/www/agentulmeu.online/genapi",
    env: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      GENAPI_PORT: "8002"
    }
  }]
}
