module.exports = {
  apps: [
    {
      name: 'querymind-backend',
      script: 'node',
      args: 'server.js',
      cwd: '/home/user/querymind/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      error_file: '/home/user/querymind/logs/backend-err.log',
      out_file: '/home/user/querymind/logs/backend-out.log',
    },
    {
      name: 'querymind-frontend',
      script: 'npx',
      args: 'vite --port 3000 --host 0.0.0.0',
      cwd: '/home/user/querymind/frontend',
      env: {
        NODE_ENV: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      error_file: '/home/user/querymind/logs/frontend-err.log',
      out_file: '/home/user/querymind/logs/frontend-out.log',
    }
  ]
}
