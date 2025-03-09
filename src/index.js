import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import path from "path"

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
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(morgan("dev"))

// Apply API key authentication middleware globally
app.use(apiKeyMiddleware)

// Routes
app.use("/api/projects", projectsRouter)
app.use("/api/project-index", projectIndexRouter)

// Serve static files from the public directory
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")))

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Portfolio Projects API",
    endpoints: {
      projects: "/api/projects",
      projectIndex: "/api/project-index",
    },
    authentication: "API key required for POST, PUT, DELETE operations",
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

