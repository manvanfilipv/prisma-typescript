import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./routes/users";
import messageRoutes from "./routes/messages";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

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
