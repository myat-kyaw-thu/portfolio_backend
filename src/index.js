import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

// Import routes
import projectsRouter from "./routes/projects.js"
import projectIndexRouter from "./routes/project-index.js"

// Import middleware
import apiKeyMiddleware from "./middleware/auth.js"

// Initialize environment variables
dotenv.config()

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Apply API key authentication middleware globally
app.use(apiKeyMiddleware)

// Routes
app.use("/api/projects", projectsRouter)
app.use("/api/project-index", projectIndexRouter)

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Portfolio Projects API",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle Prisma disconnection on app termination
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  process.exit(0)
})

// endpoints: {
//       projects: "/api/projects",
//       projectIndex: "/api/project-index",
//     },