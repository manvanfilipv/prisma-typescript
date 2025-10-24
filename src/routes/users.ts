import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.create({
            data: { name, email },
        });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
});

router.get("/", async (req, res) => {
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

export default router;

