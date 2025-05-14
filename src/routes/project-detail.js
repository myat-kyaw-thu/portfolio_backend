const express = require("express")
const { PrismaClient } = require("@prisma/client")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")

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
        folder: "project_images",
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

// Get project details by project_id
router.get("/:project_id", async (req, res) => {
  try {
    const { project_id } = req.params

    // Find the project first
    const project = await prisma.project.findUnique({
      where: { project_id },
      include: {
        projectDetail: true,
        project_features: true,
        project_goals: true,
        team_members: true,
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Parse JSON strings into objects
    const response = {
      project_id: project.project_id,
      project_title: project.project_title,
      project_subtitle: project.project_subtitle,
      project_tech_stacks: JSON.parse(project.project_tech_stacks),
      project_link: project.project_link,
      project_status: project.project_status,
      personal: project.personal,
      project_description: project.project_description,
      technical_specifications: JSON.parse(project.technical_specifications),
      project_features: project.project_features.map((feature) => ({
        feature_id: feature.feature_id,
        feature_name: feature.feature_name,
        feature_description: feature.feature_description,
      })),
      project_goals: project.project_goals.map((goal) => ({
        goal_id: goal.goal_id,
        goal_name: goal.goal_name,
        goal_description: goal.goal_description,
      })),
      team_members: project.team_members.map((member) => ({
        member_id: member.member_id,
        member_name: member.member_name,
        member_role: member.member_role,
      })),
    }

    // Add project details if they exist
    if (project.projectDetail) {
      const projectFlowchart = JSON.parse(project.projectDetail.project_flowchart)
      response.project_images = JSON.parse(project.projectDetail.project_images)
      response.project_flowchart = {
        mermaid_code: projectFlowchart.mermaid_code,
        description: projectFlowchart.description,
      }
    } else {
      response.project_images = []
      response.project_flowchart = {
        mermaid_code: "",
        description: "",
      }
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching project details:", error)
    return res.status(500).json({ error: "Failed to fetch project details" })
  }
})

// Create or update project details
router.post("/:project_id", upload.array("images", 10), async (req, res) => {
  try {
    const { project_id } = req.params
    const { flowchart_code, flowchart_description } = req.body

    // Find the project
    const project = await prisma.project.findUnique({
      where: { project_id },
      include: { projectDetail: true },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Upload images to Cloudinary if provided
    let imageUrls = []
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer))
      const uploadResults = await Promise.all(uploadPromises)
      imageUrls = uploadResults.map((result) => result.secure_url)
    } else if (project.projectDetail) {
      // Keep existing images if no new ones are uploaded
      imageUrls = JSON.parse(project.projectDetail.project_images)
    }

    // Prepare project flowchart data
    const projectFlowchart = {
      mermaid_code: flowchart_code || "",
      description: flowchart_description || "",
    }

    // Create or update project details
    let projectDetail
    if (project.projectDetail) {
      // Update existing project details
      projectDetail = await prisma.projectDetail.update({
        where: { id: project.projectDetail.id },
        data: {
          project_images: JSON.stringify(imageUrls),
          project_flowchart: JSON.stringify(projectFlowchart),
        },
      })
    } else {
      // Create new project details
      projectDetail = await prisma.projectDetail.create({
        data: {
          project_images: JSON.stringify(imageUrls),
          project_flowchart: JSON.stringify(projectFlowchart),
          project: {
            connect: { id: project.id },
          },
        },
      })

      // Update the project to set is_details to true
      await prisma.project.update({
        where: { id: project.id },
        data: { is_details: true },
      })
    }

    return res.status(200).json({
      message: "Project details saved successfully",
      projectDetail: {
        ...projectDetail,
        project_images: JSON.parse(projectDetail.project_images),
        project_flowchart: JSON.parse(projectDetail.project_flowchart),
      },
    })
  } catch (error) {
    console.error("Error saving project details:", error)
    return res.status(500).json({ error: "Failed to save project details" })
  }
})

// Delete project details
router.delete("/:project_id", async (req, res) => {
  try {
    const { project_id } = req.params

    // Find the project
    const project = await prisma.project.findUnique({
      where: { project_id },
      include: { projectDetail: true },
    })

    if (!project || !project.projectDetail) {
      return res.status(404).json({ error: "Project details not found" })
    }

    // Delete the project details
    await prisma.projectDetail.delete({
      where: { id: project.projectDetail.id },
    })

    // Update the project to set is_details to null or false
    await prisma.project.update({
      where: { id: project.id },
      data: { is_details: false },
    })

    return res.status(200).json({ message: "Project details deleted successfully" })
  } catch (error) {
    console.error("Error deleting project details:", error)
    return res.status(500).json({ error: "Failed to delete project details" })
  }
})

module.exports = router
