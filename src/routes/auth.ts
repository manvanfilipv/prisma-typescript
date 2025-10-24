import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/auth";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(403).json({ error: "Invalid login credentials." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(403).json({ error: "Invalid login credentials." });
        }

        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);

        await prisma.refreshToken.create({
            data: {
                id: jti,
                hashedToken: refreshToken,
                userId: user.id,
            },
        });

        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to login" });
    }
});

router.post("/refreshToken", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Missing refresh token." });
        }

        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number; jti: string };
        const savedRefreshToken = await prisma.refreshToken.findUnique({
            where: { id: payload.jti },
        });

        if (!savedRefreshToken || savedRefreshToken.revoked) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const jti = uuidv4();
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);

        await prisma.refreshToken.update({
            where: { id: payload.jti },
            data: {
                revoked: true,
            },
        });

        await prisma.refreshToken.create({
            data: {
                id: jti,
                hashedToken: newRefreshToken,
                userId: user.id,
            },
        });

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Unauthorized" });
    }
});


router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Missing refresh token." });
        }
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { jti: string };
        await prisma.refreshToken.update({
            where: { id: payload.jti },
            data: { revoked: true },
        });
        res.status(200).json({ message: "Logged out" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to logout" });
    }
});


export default router;

