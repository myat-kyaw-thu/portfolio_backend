import { PrismaClient } from "@prisma/client"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import path from "path"

// Import routes
import apiKeyMiddleware from "./middleware/auth.js"
import achievementsRouter from "./routes/achievements.js"
import projectDetailsRouter from "./routes/project-detail.js"
import projectIndexRouter from "./routes/project-index.js"

dotenv.config()
const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))


if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

app.use(apiKeyMiddleware)

// Routes
app.use("/api/projects", projectDetailsRouter)
app.use("/api/project-index", projectIndexRouter)
app.use("/api/achievements", achievementsRouter)


// Note: Static file serving won't work on Vercel serverless
// This will only work in local development
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")))
}

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Portfolio API",
    authentication: "API key required for POST, PUT, DELETE operations",
  })
})

// Start server in development, but export app for serverless
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

// Handle Prisma disconnection on app termination
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

// Export for Vercel serverless deployment
export default app
