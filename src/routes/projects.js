import express from "express"
import { PrismaClient } from "@prisma/client"

const router = express.Router()
const prisma = new PrismaClient()

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
    res.json(projects)
  } catch (error) {
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

    res.json(project)
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
router.post("/", async (req, res) => {
  try {
    const {
      project_id,
      project_title,
      project_subtitle,
      project_cover_img,
      project_tech_stacks,
      project_link,
      project_status,
      personal,
      project_description,
      technical_specifications,
      project_features,
      project_goals,
      project_timeline,
      team_members,
    } = req.body

    // Validate required fields
    if (!project_id || !project_title) {
      return res.status(400).json({ error: "project_id and project_title are required" })
    }

    // Create project with nested relations
    const newProject = await prisma.project.create({
      data: {
        project_id,
        project_title,
        project_subtitle,
        project_cover_img,
        project_tech_stacks,
        project_link,
        project_status,
        personal,
        project_description,
        technical_specifications,
        project_features: {
          create: project_features || [],
        },
        project_goals: {
          create: project_goals || [],
        },
        project_timeline: {
          create: project_timeline || [],
        },
        team_members: {
          create: team_members || [],
        },
      },
      include: {
        project_features: true,
        project_goals: true,
        project_timeline: true,
        team_members: true,
      },
    })

    res.status(201).json(newProject)
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "A project with this project_id already exists" })
    }
    res.status(500).json({ error: error.message })
  }
})

// PUT update project (requires API key)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const {
      project_title,
      project_subtitle,
      project_cover_img,
      project_tech_stacks,
      project_link,
      project_status,
      personal,
      project_description,
      technical_specifications,
      project_features,
      project_goals,
      project_timeline,
      team_members,
    } = req.body

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Update project with transaction to handle relations
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Delete existing relations if new ones are provided
      if (project_features) {
        await tx.projectFeature.deleteMany({
          where: { projectId: id },
        })
      }

      if (project_goals) {
        await tx.projectGoal.deleteMany({
          where: { projectId: id },
        })
      }

      if (project_timeline) {
        await tx.projectTimeline.deleteMany({
          where: { projectId: id },
        })
      }

      if (team_members) {
        await tx.teamMember.deleteMany({
          where: { projectId: id },
        })
      }

      // Update the project and create new relations
      return tx.project.update({
        where: { id },
        data: {
          project_title,
          project_subtitle,
          project_cover_img,
          project_tech_stacks,
          project_link,
          project_status,
          personal,
          project_description,
          technical_specifications,
          project_features: project_features
            ? {
                create: project_features,
              }
            : undefined,
          project_goals: project_goals
            ? {
                create: project_goals,
              }
            : undefined,
          project_timeline: project_timeline
            ? {
                create: project_timeline,
              }
            : undefined,
          team_members: team_members
            ? {
                create: team_members,
              }
            : undefined,
        },
        include: {
          project_features: true,
          project_goals: true,
          project_timeline: true,
          team_members: true,
        },
      })
    })

    res.json(updatedProject)
  } catch (error) {
    res.status(500).json({ error: error.message })
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

