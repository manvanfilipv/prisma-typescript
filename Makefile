reset:
	npx prisma db push --force-reset
migrate:
	npx prisma db push
	npx prisma generate
seed:
	npx ts-node ./src/seed.ts
server:
	npx ts-node-dev src/server.ts