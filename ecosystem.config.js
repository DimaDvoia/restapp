module.exports = {
  apps: [
    {
      name: "telegram-bot",
      script: "bot.js",
      watch: true,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "server",
      script: "server.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
} 