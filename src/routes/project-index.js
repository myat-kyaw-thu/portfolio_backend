import express from "express"
import { PrismaClient } from "@prisma/client"
import multer from "multer"
import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"
dotenv.config()

const router = express.Router()
const prisma = new PrismaClient()

// Parse the Cloudinary URL from environment variable
const cloudinaryUrl = process.env.CLOUDINARY_URL || ""
// The URL format is: cloudinary://<api_key>:<api_secret>@<cloud_name>
const cloudinaryUrlRegex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/
const match = cloudinaryUrl.match(cloudinaryUrlRegex)

if (match) {
  const [, api_key, api_secret, cloud_name] = match

  // Configure Cloudinary
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  })
} else {
  console.error("Invalid CLOUDINARY_URL format. Please check your environment variables.")
}

// Configure multer for memory storage (not disk storage)
const storage = multer.memoryStorage()

// Create upload middleware with size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "project_covers",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      },
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

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

    // Handle image upload if file was provided
    let imagePath = projectData.project_cover_img || ""
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer)
        // Store the secure URL
        imagePath = result.secure_url
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError)
        return res.status(500).json({ error: "Failed to upload image" })
      }
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
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer)
        // Store the secure URL
        imagePath = result.secure_url

        // Note: We don't need to delete old images from Cloudinary for this implementation
        // If you want to delete old images, you would need to store the public_id in your database
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError)
        return res.status(500).json({ error: "Failed to upload image" })
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