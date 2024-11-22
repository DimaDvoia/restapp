module.exports = {
  apps: [{
    name: "telegram-bot",
    script: "bot.js",
    watch: true,
    env: {
      NODE_ENV: "production",
    }
  }]
} 