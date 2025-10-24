import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

export function generateAccessToken(user: User) {
    return jwt.sign({ userId: user.id }, JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
}

export function generateRefreshToken(user: User, jti: string) {
    return jwt.sign({ userId: user.id, jti }, JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
}

export function generateTokens(user: User, jti: string) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, jti);
    return { accessToken, refreshToken };
}

