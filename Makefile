migrate:
	npx prisma db push --schema=./prisma/schema.prisma
	npx prisma generate --schema=./prisma/schema.prisma
seed:
	npx ts-node ./prisma/seed.ts