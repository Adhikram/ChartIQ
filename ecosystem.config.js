module.exports = {
  apps: [
    {
      name: 'chartiq',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        PORT: 3049,
        NODE_ENV: 'production',
        NEXT_IGNORE_ESLINT: true
      },
      env_development: {
        PORT: 3049,
        NODE_ENV: 'development',
        NEXT_IGNORE_ESLINT: false
      },
      exp_backoff_restart_delay: 100,
      max_memory_restart: '3G',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
}; 