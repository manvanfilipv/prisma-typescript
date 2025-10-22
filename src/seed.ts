import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const alice = await prisma.user.create({
        data: { name: "Alice", email: "alice@example.com" },
    });

    const bob = await prisma.user.create({
        data: { name: "Bob", email: "bob@example.com" },
    });

    await prisma.message.create({
        data: {
            content: "Hello Bob!",
            senderId: alice.id,
            receiverId: bob.id,
        },
    });

    await prisma.message.create({
        data: {
            content: "Hi Alice!",
            senderId: bob.id,
            receiverId: alice.id,
        },
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
