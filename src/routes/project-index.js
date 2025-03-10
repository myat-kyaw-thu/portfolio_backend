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

// Add this after your router declaration
const API_URL = "http://localhost:8000"

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    fs.ensureDirSync(uploadDir) // Create directory if it doesn't exist
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, "_")}`
    cb(null, filename)
  },
})

// Create upload middleware with size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// GET all project indexes (public)
router.get("/", async (req, res) => {
  try {
    // Use a more explicit query with consistent field selection
    const projectIndexes = await prisma.projectIndex.findMany({
      select: {
        id: true,
        project_id: true,
        project_title: true,
        project_subtitle: true,
        project_cover_img: true,
        project_tech_stacks: true,
        project_link: true,
        github_link: true,
        project_status: true,
        personal: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Process the results to ensure consistent data types
    const formattedProjects = projectIndexes.map((project) => ({
      ...project,
      project_tech_stacks:
        typeof project.project_tech_stacks === "string"
          ? JSON.parse(project.project_tech_stacks)
          : project.project_tech_stacks,
    }))

    res.json(formattedProjects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ error: error.message })
  }
})

// GET project index by id (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const projectIndex = await prisma.projectIndex.findUnique({
      where: { id },
    })

    if (!projectIndex) {
      return res.status(404).json({ error: "Project index not found" })
    }

    res.json(projectIndex)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET project index by project_id (public)
router.get("/by-project-id/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params

    const projectIndex = await prisma.projectIndex.findUnique({
      where: { project_id: projectId },
    })

    if (!projectIndex) {
      return res.status(404).json({ error: "Project index not found" })
    }

    res.json(projectIndex)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create new project index (requires API key)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Get project data from form or JSON
    let projectData
    if (req.file) {
      // If multipart form data with image
      projectData = JSON.parse(req.body.data)
    } else {
      // If JSON data without image
      projectData = req.body
    }

    // Validate required fields
    if (!projectData.project_id || !projectData.project_title) {
      return res.status(400).json({ error: "project_id and project_title are required" })
    }

    // Handle image path if file was uploaded
    let imagePath = projectData.project_cover_img || ""
    if (req.file) {
      // Change this line to include the full URL
      imagePath = `${API_URL}/uploads/${req.file.filename}`
    }

    // Create project index
    const newProjectIndex = await prisma.projectIndex.create({
      data: {
        project_id: projectData.project_id,
        project_title: projectData.project_title,
        project_subtitle: projectData.project_subtitle,
        project_cover_img: imagePath,
        project_tech_stacks:
          typeof projectData.project_tech_stacks === "string"
            ? projectData.project_tech_stacks
            : JSON.stringify(projectData.project_tech_stacks),
        project_link: projectData.project_link,
        github_link: projectData.github_link || null,
        project_status: projectData.project_status,
        personal: projectData.personal,
      },
    })

    // Return the new project with parsed tech stacks
    res.status(201).json({
      ...newProjectIndex,
      project_tech_stacks:
        typeof newProjectIndex.project_tech_stacks === "string"
          ? JSON.parse(newProjectIndex.project_tech_stacks)
          : newProjectIndex.project_tech_stacks,
    })
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "A project index with this project_id already exists" })
    }
    res.status(500).json({ error: error.message || "Failed to create project" })
  }
})

// PUT update project index (requires API key)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params

    // Check if project index exists
    const existingProjectIndex = await prisma.projectIndex.findUnique({
      where: { id },
    })

    if (!existingProjectIndex) {
      return res.status(404).json({ error: "Project index not found" })
    }

    // Get project data from form or JSON
    let projectData
    if (req.file) {
      // If multipart form data with image
      projectData = JSON.parse(req.body.data)
    } else {
      // If JSON data without image
      projectData = req.body
    }

    // Handle image upload if provided
    let imagePath = projectData.project_cover_img || existingProjectIndex.project_cover_img
    if (req.file) {
      // Change this line to include the full URL
      imagePath = `${API_URL}/uploads/${req.file.filename}`

      // When deleting old images, make sure to handle the full URL
      if (existingProjectIndex.project_cover_img && existingProjectIndex.project_cover_img.includes("/uploads/")) {
        try {
          // Extract just the path part after the domain
          const urlParts = existingProjectIndex.project_cover_img.split("/uploads/")
          const filename = urlParts[1]
          const oldFilePath = path.join(process.cwd(), "public", "uploads", filename)
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath)
          }
        } catch (err) {
          console.error("Error deleting old image:", err)
          // Continue even if delete fails
        }
      }
    }

    // Update the project
    const updatedProjectIndex = await prisma.projectIndex.update({
      where: { id },
      data: {
        project_id: projectData.project_id,
        project_title: projectData.project_title,
        project_subtitle: projectData.project_subtitle,
        project_cover_img: imagePath,
        project_tech_stacks:
          typeof projectData.project_tech_stacks === "string"
            ? projectData.project_tech_stacks
            : JSON.stringify(projectData.project_tech_stacks),
        project_link: projectData.project_link,
        github_link: projectData.github_link || null,
        project_status: projectData.project_status,
        personal: projectData.personal,
      },
    })

    // Return the updated project with parsed tech stacks
    res.json({
      ...updatedProjectIndex,
      project_tech_stacks:
        typeof updatedProjectIndex.project_tech_stacks === "string"
          ? JSON.parse(updatedProjectIndex.project_tech_stacks)
          : updatedProjectIndex.project_tech_stacks,
    })
  } catch (error) {
    console.error("Error updating project:", error)
    res.status(500).json({ error: error.message || "Failed to update project" })
  }
})

// DELETE project index (requires API key)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check if project index exists
    const existingProjectIndex = await prisma.projectIndex.findUnique({
      where: { id },
    })

    if (!existingProjectIndex) {
      return res.status(404).json({ error: "Project index not found" })
    }

    // Delete project index
    await prisma.projectIndex.delete({
      where: { id },
    })

    res.json({ message: "Project index deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

