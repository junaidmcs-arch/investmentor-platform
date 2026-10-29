// Run from the checkout after `pnpm build` and production configuration.
module.exports = {
  apps: [
    {
      name: "investmentor-web",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start --hostname 127.0.0.1 --port 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "750M",
      kill_timeout: 15000,
      env: { NODE_ENV: "production" }
    },
    {
      name: "investmentor-mail",
      cwd: __dirname,
      script: "scripts/email-worker.ts",
      interpreter: "node",
      node_args: "--import tsx",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 5000,
      max_memory_restart: "250M",
      kill_timeout: 45000,
      env: { NODE_ENV: "production" }
    }
  ]
};
