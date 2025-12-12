module.exports = {
  apps: [{
    name: 'asara',
    script: 'server.js',
    cwd: '/srv/customer/sites/asara-lyon.fr',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'mysql://3r5hv8_safwan:Lysft@2236@3r5hv8.myd.infomaniak.com:3306/3r5hv8_asara_production',
      JWT_SECRET: 'asara-production-secret-key-2024-very-secure-random-string',
      NEXTAUTH_SECRET: 'asara-production-nextauth-secret-2024-secure-random',
      NEXTAUTH_URL: 'https://asara-lyon.fr',
      NEXT_PUBLIC_SITE_URL: 'https://asara-lyon.fr',
      NEXT_PUBLIC_APP_URL: 'https://asara-lyon.fr',
      SMTP_HOST: 'mail.infomaniak.com',
      SMTP_PORT: '465',
      SMTP_USER: 'info@asara-lyon.fr',
      SMTP_PASSWORD: 'X(3t-TLpSP*;?5Y>',
      SMTP_FROM: 'info@asara-lyon.fr'
    }
  }]
}
