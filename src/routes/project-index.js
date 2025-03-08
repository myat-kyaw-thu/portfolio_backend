import express from "express"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

// GET all project indexes (public)
router.get("/", async (req, res) => {
  try {
    const projectIndexes = await prisma.projectIndex.findMany()
    res.json(projectIndexes)
  } catch (error) {
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
router.post("/", async (req, res) => {
  try {
    const {
      project_id,
      project_title,
      project_subtitle,
      project_cover_img,
      project_tech_stacks,
      project_link,
      github_link,
      project_status,
      personal,
    } = req.body

    // Validate required fields
    if (!project_id || !project_title) {
      return res.status(400).json({ error: "project_id and project_title are required" })
    }

    // Create project index
    const newProjectIndex = await prisma.projectIndex.create({
      data: {
        project_id,
        project_title,
        project_subtitle,
        project_cover_img,
        project_tech_stacks,
        project_link,
        github_link,
        project_status,
        personal,
      },
    })

    res.status(201).json(newProjectIndex)
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "A project index with this project_id already exists" })
    }
    res.status(500).json({ error: error.message })
  }
})

// PUT update project index (requires API key)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const {
      project_title,
      project_subtitle,
      project_cover_img,
      project_tech_stacks,
      project_link,
      github_link,
      project_status,
      personal,
    } = req.body

    // Check if project index exists
    const existingProjectIndex = await prisma.projectIndex.findUnique({
      where: { id },
    })

    if (!existingProjectIndex) {
      return res.status(404).json({ error: "Project index not found" })
    }

    // Update project index
    const updatedProjectIndex = await prisma.projectIndex.update({
      where: { id },
      data: {
        project_title,
        project_subtitle,
        project_cover_img,
        project_tech_stacks,
        project_link,
        github_link,
        project_status,
        personal,
      },
    })

    res.json(updatedProjectIndex)
  } catch (error) {
    res.status(500).json({ error: error.message })
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

