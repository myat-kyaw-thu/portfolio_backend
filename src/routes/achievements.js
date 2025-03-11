import express from "express"
import { PrismaClient } from "@prisma/client"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import fs from "fs-extra"
import path from "path"
import dotenv from "dotenv"
dotenv.config()

const router = express.Router()
const prisma = new PrismaClient()

const API_URL = process.env.API_URL || "http://localhost:3000"

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    fs.ensureDirSync(uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, "_")}`
    cb(null, filename)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// GET all achievements
router.get("/", async (req, res) => {
  try {
      const achievements = await prisma.Achievement.findMany({
        orderBy: { date: "desc" },
    })
      res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET achievement by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const achievement = await prisma.achievement.findUnique({
      where: { id: Number.parseInt(id) },
    })
    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" })
    }
    res.json(achievement)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create new achievement
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, type, date, description, category } = req.body
    let imageUrl = null

    if (req.file) {
      imageUrl = `${API_URL}/uploads/${req.file.filename}`
    }

    const achievement = await prisma.achievement.create({
      data: {
        title,
        type,
        date: new Date(date),
        description,
        category,
        imageUrl,
      },
    })

    res.status(201).json(achievement)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update achievement
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params
    const { title, type, date, description, category } = req.body
    let imageUrl = undefined

    if (req.file) {
      imageUrl = `${API_URL}/uploads/${req.file.filename}`
    }

    const achievement = await prisma.achievement.update({
      where: { id: Number.parseInt(id) },
      data: {
        title,
        type,
        date: new Date(date),
        description,
        category,
        ...(imageUrl && { imageUrl }),
      },
    })

    res.json(achievement)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE achievement
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await prisma.achievement.delete({
      where: { id: Number.parseInt(id) },
    })
    res.json({ message: "Achievement deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

