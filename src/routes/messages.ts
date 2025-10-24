import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:userId/:otherId", async (req, res) => {
    try {
        const { userId, otherId } = req.params;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: Number(userId), receiverId: Number(otherId) },
                    // { senderId: Number(otherId), receiverId: Number(userId) },
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

router.post("/", async (req, res) => {
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

export default router;

