reset:
	npx prisma migrate reset
	make migrate
migrate:
	npx prisma db push
	npx prisma generate
seed:
	npx ts-node ./src/seed.ts