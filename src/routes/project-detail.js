import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import express from "express";
import multer from "multer";
import streamifier from "streamifier";


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
    // Find the project with all related data EXCEPT project_timeline
    const project = await prisma.project.findUnique({
      where: { project_id },
      include: {
        projectDetail: true,
        project_features: true,
        project_goals: true,
        team_members: true,
        // Removed project_timeline from include
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Check if project details exist
    if (!project.projectDetail) {
      return res.status(404).json({ error: "Project details not found" })
    }

    // Log the raw project detail data for debugging
    console.log("Raw project detail data:", project.projectDetail)

    // Parse project images and flowchart
    let projectImages = []
    let projectFlowchart = { mermaid_code: "", description: "" }

    try {
      projectImages = JSON.parse(project.projectDetail.project_images)
    } catch (error) {
      console.error("Error parsing project images:", error)
    }

    try {
      projectFlowchart = JSON.parse(project.projectDetail.project_flowchart)
    } catch (error) {
      console.error("Error parsing project flowchart:", error)
      console.log("Raw flowchart data:", project.projectDetail.project_flowchart)
    }

    // Format the response to match the exact JSON structure requested
    const formattedResponse = {
      project_id: project.project_id,
      project_title: project.project_title,
      project_subtitle: project.project_subtitle,
      project_images: projectImages,
      project_tech_stacks: JSON.parse(project.project_tech_stacks),
      project_link: project.project_link,
      project_status: project.project_status,
      personal: project.personal,
      project_description: project.project_description,

      // Format project features to remove database-specific fields
      project_features: project.project_features.map((feature) => ({
        feature_id: feature.feature_id,
        feature_name: feature.feature_name,
        feature_description: feature.feature_description,
      })),

      // Parse technical specifications
      technical_specifications: JSON.parse(project.technical_specifications),

      // Format project goals to remove database-specific fields
      project_goals: project.project_goals.map((goal) => ({
        goal_id: goal.goal_id,
        goal_name: goal.goal_name,
        goal_description: goal.goal_description,
      })),

      // Add project flowchart
      project_flowchart: projectFlowchart,

      // Format team members to remove database-specific fields
      team_members: project.team_members.map((member) => ({
        member_id: member.member_id,
        member_name: member.member_name,
        member_role: member.member_role,
      })),
    }

    return res.status(200).json(formattedResponse)
  } catch (error) {
    console.error("Error fetching project details:", error)
    return res.status(500).json({
      error: "Failed to fetch project details",
      details: error.message,
      stack: error.stack,
    })
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
      try {
        imageUrls = JSON.parse(project.projectDetail.project_images)
      } catch (error) {
        console.error("Error parsing existing images:", error)
        imageUrls = []
      }
    }

    // Prepare project flowchart data
    const projectFlowchart = {
      mermaid_code: flowchart_code || "",
      description: flowchart_description || "",
    }

    console.log("Saving flowchart:", projectFlowchart)

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

    // Parse the saved data to verify it was stored correctly
    const savedImages = JSON.parse(projectDetail.project_images)
    const savedFlowchart = JSON.parse(projectDetail.project_flowchart)

    // Format the response to match the requested structure
    const formattedResponse = {
      message: "Project details saved successfully",
      project_images: savedImages,
      project_flowchart: savedFlowchart,
    }

    return res.status(200).json(formattedResponse)
  } catch (error) {
    console.error("Error saving project details:", error)
    return res.status(500).json({
      error: "Failed to save project details",
      details: error.message,
      stack: error.stack,
    })
  }
})

export default router
