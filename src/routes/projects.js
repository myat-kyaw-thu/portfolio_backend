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
const API_URL = process.env.API_URL || "http://localhost:3000"

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

// GET all projects (public)
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        project_features: true,
        project_goals: true,
        project_timeline: true,
        team_members: true,
      },
    })

    // Process the results to ensure consistent data types
    const formattedProjects = projects.map((project) => {
      return {
        ...project,
        project_tech_stacks:
          typeof project.project_tech_stacks === "string"
            ? JSON.parse(project.project_tech_stacks)
            : project.project_tech_stacks,
        technical_specifications:
          typeof project.technical_specifications === "string"
            ? JSON.parse(project.technical_specifications)
            : project.technical_specifications,
      }
    })

    res.json(formattedProjects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ error: error.message })
  }
})

// GET project by id (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        project_features: true,
        project_goals: true,
        project_timeline: true,
        team_members: true,
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Format the response
    const formattedProject = {
      ...project,
      project_tech_stacks:
        typeof project.project_tech_stacks === "string"
          ? JSON.parse(project.project_tech_stacks)
          : project.project_tech_stacks,
      technical_specifications:
        typeof project.technical_specifications === "string"
          ? JSON.parse(project.technical_specifications)
          : project.technical_specifications,
    }

    res.json(formattedProject)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET project by project_id (public)
router.get("/by-project-id/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params

    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        project_features: true,
        project_goals: true,
        project_timeline: true,
        team_members: true,
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create new project (requires API key)
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

    // Handle image path if file was uploaded
    let imagePath = projectData.project_cover_img || ""
    if (req.file) {
      // Change this line to include the full URL
      imagePath = `${API_URL}/uploads/${req.file.filename}`
    }

    // Prepare data for database
    const data = {
      project_id: projectData.project_id,
      project_title: projectData.project_title,
      project_subtitle: projectData.project_subtitle,
      project_cover_img: imagePath,
      project_tech_stacks:
        typeof projectData.project_tech_stacks === "string"
          ? projectData.project_tech_stacks
          : JSON.stringify(projectData.project_tech_stacks),
      project_link: projectData.project_link,
      project_status: projectData.project_status,
      personal: projectData.personal,
      project_description: projectData.project_description,
      technical_specifications:
        typeof projectData.technical_specifications === "string"
          ? projectData.technical_specifications
          : JSON.stringify(projectData.technical_specifications),
      project_features: {
        create: projectData.project_features || [],
      },
      project_goals: {
        create: projectData.project_goals || [],
      },
      project_timeline: {
        create: projectData.project_timeline || [],
      },
      team_members: {
        create: projectData.team_members || [],
      },
    }

    // Create project with nested relations
    const newProject = await prisma.project.create({
      data,
      include: {
        project_features: true,
        project_goals: true,
        project_timeline: true,
        team_members: true,
      },
    })

    // Format the response
    const formattedProject = {
      ...newProject,
      project_tech_stacks:
        typeof newProject.project_tech_stacks === "string"
          ? JSON.parse(newProject.project_tech_stacks)
          : newProject.project_tech_stacks,
      technical_specifications:
        typeof newProject.technical_specifications === "string"
          ? JSON.parse(newProject.technical_specifications)
          : newProject.technical_specifications,
    }

    res.status(201).json(formattedProject)
  } catch (error) {
    console.error("Error creating project:", error)
    res.status(500).json({ error: error.message || "Failed to create project" })
  }
})

// PUT update project (requires API key)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" })
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
    let imagePath = projectData.project_cover_img || existingProject.project_cover_img
    if (req.file) {
      // Change this line to include the full URL
      imagePath = `${API_URL}/uploads/${req.file.filename}`

      // When deleting old images, make sure to handle the full URL
      if (existingProject.project_cover_img && existingProject.project_cover_img.includes("/uploads/")) {
        try {
          // Extract just the path part after the domain
          const urlParts = existingProject.project_cover_img.split("/uploads/")
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

    // Update project with transaction to handle relations
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Delete existing relations
      await tx.projectFeature.deleteMany({
        where: { projectId: id },
      })

      await tx.projectGoal.deleteMany({
        where: { projectId: id },
      })

      await tx.projectTimeline.deleteMany({
        where: { projectId: id },
      })

      await tx.teamMember.deleteMany({
        where: { projectId: id },
      })

      // Update the project and create new relations
      return tx.project.update({
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
          project_status: projectData.project_status,
          personal: projectData.personal,
          project_description: projectData.project_description,
          technical_specifications:
            typeof projectData.technical_specifications === "string"
              ? projectData.technical_specifications
              : JSON.stringify(projectData.technical_specifications),
          project_features: {
            create: projectData.project_features || [],
          },
          project_goals: {
            create: projectData.project_goals || [],
          },
          project_timeline: {
            create: projectData.project_timeline || [],
          },
          team_members: {
            create: projectData.team_members || [],
          },
        },
        include: {
          project_features: true,
          project_goals: true,
          project_timeline: true,
          team_members: true,
        },
      })
    })

    // Format the response
    const formattedProject = {
      ...updatedProject,
      project_tech_stacks:
        typeof updatedProject.project_tech_stacks === "string"
          ? JSON.parse(updatedProject.project_tech_stacks)
          : updatedProject.project_tech_stacks,
      technical_specifications:
        typeof updatedProject.technical_specifications === "string"
          ? JSON.parse(updatedProject.technical_specifications)
          : updatedProject.technical_specifications,
    }

    res.json(formattedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    res.status(500).json({ error: error.message || "Failed to update project" })
  }
})

// DELETE project (requires API key)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id },
    })

    res.json({ message: "Project deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

