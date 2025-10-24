import express from "express";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { sentMessages: true, receivedMessages: true },
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.get("/messages/:userId/:otherId", async (req, res) => {
    try {
        const { userId, otherId } = req.params;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: Number(userId), receiverId: Number(otherId) },
                    { senderId: Number(otherId), receiverId: Number(userId) },
                ],
            },
            orderBy: { createdAt: Prisma.SortOrder.asc },
        });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

app.post("/messages", async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        const message = await prisma.message.create({
            data: { senderId, receiverId, content },
        });
        res.json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send message" });
    }
});

const PORT = 4000;

async function startServer() {
    try {
        await prisma.$connect();
        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("Failed to connect to database", err);
        process.exit(1);
    }
}

startServer();
