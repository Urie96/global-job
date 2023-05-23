reload:
	pnpm build
	pm2 start ecosystem.config.cjs

log:
	pm2 logs MyCronJob