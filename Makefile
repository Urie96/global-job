reload:
	pnpm build
	pm2 start ecosystem.config.cjs
	pm2 save

log:
	pm2 logs MyCronJob --lines 100
