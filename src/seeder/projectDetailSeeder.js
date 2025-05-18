import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // Project data array - contains both project details
  const projectsData = [
    {
      project_id: "shwe-min-lab-admin",
      project_title: "Shwe Min Lab Admin Dashboard",
      project_subtitle: "Full-featured laboratory logistics and invoice management system",
      project_cover_img: "/images/covers/shwe-min-lab-admin.jpg",
      project_tech_stacks: JSON.stringify([
        "Laravel",
        "PHP",
        "Typescript",
        "Vue.js",
        "TailwindCSS",
        "Shadcn UI",
        "Firebase",
        "MySQL",
      ]),
      project_link: "https://app.uat.shwemin.mssmyanmar.com/login",
      project_status: "In Development",
      personal: false,
      project_description:
        "Shwe Min Lab Admin Dashboard is a comprehensive platform designed to manage clinics, runners, lab test workflows, invoice generation, pricing plans, and role-based permissions. The system aims to digitize and streamline the medical lab logistics process by enabling a scalable and modular admin experience.",
      technical_specifications: JSON.stringify({
        frontend: {
          frameworks: "Vue.js",
          libraries: "Shadcn UI, Vue Router, Firebase Auth, Pinia",
        },
        backend: {
          frameworks: "Laravel",
          languages: "PHP, TypeScript",
          authentication: "Firebase + Laravel Sanctum",
        },
        database: {
          type: "Relational",
          system: "MySQL",
        },
        styling: {
          framework: "TailwindCSS",
          component_library: "Shadcn UI",
        },
        architecture: {
          pattern: "Modular MVC + Component-driven frontend",
          state_management: "Pinia (Frontend)",
        },
        programming_languages: ["PHP", "TypeScript"],
        mobile_api: {
          developer: "Myat Kyaw Thu",
          scope: "Full mobile integration for clinics and runners",
        },
      }),
      is_details: true,
      features: [
        {
          feature_id: 1,
          feature_name: "Clinic & Runner Management",
          feature_description:
            "CRUD functionality for clinics and runners, with pricing plan assignment to specific clinics.",
        },
        {
          feature_id: 2,
          feature_name: "Lab Workflow Management",
          feature_description:
            "Manage lab test collection from clinics, assign to runners, confirm reception, and track delivery for invoicing.",
        },
        {
          feature_id: 3,
          feature_name: "Invoice Header/Footer Generator",
          feature_description: "Admin can customize PDF-ready invoice headers and footers for document consistency.",
        },
        {
          feature_id: 4,
          feature_name: "Dynamic Pricing Plan Import/Export",
          feature_description:
            "Supports Excel export of current pricing and bulk import of updated plans for system-wide changes.",
        },
        {
          feature_id: 5,
          feature_name: "Tube Rules Configuration",
          feature_description:
            "Assign specific tube types and required quantities per lab test for accurate logistics tracking.",
        },
        {
          feature_id: 6,
          feature_name: "Advertisement Management",
          feature_description:
            "Create and manage text sliders, fullscreen ads, and banner ads for system announcements or external promotions.",
        },
        {
          feature_id: 7,
          feature_name: "Role-Based Access Control",
          feature_description:
            "Create user roles, assign granular permissions, and control access to admin modules and data.",
        },
      ],
      goals: [
        {
          goal_id: 1,
          goal_name: "Centralized Admin Control",
          goal_description:
            "Provide a centralized interface to manage all clinical operations, test routing, and invoicing.",
        },
        {
          goal_id: 2,
          goal_name: "Automated Lab Workflow",
          goal_description:
            "Ensure accurate and timely test collection, delivery, and confirmation through a digital workflow.",
        },
        {
          goal_id: 3,
          goal_name: "Scalable Role Management",
          goal_description: "Implement role-based access control for multiple departments and admin tiers.",
        },
        {
          goal_id: 4,
          goal_name: "Efficient Pricing Management",
          goal_description: "Support rapid updates to lab pricing using import/export workflows integrated with Excel.",
        },
      ],
      team_members: [
        {
          member_id: 1,
          member_name: "Myat Kyaw Thu",
          member_role: "Fullstack Developer (Web + Mobile API)",
        },
        {
          member_id: 2,
          member_name: "Zayar Min Htike",
          member_role: "Project Manager / System Design",
        },
        {
          member_id: 3,
          member_name: "Kyaw Thiha Lynn",
          member_role: "UI/UX Designer",
        },
      ],
      project_detail: {
        project_images: JSON.stringify([
          "/screens/dashboard-overview.png",
          "/screens/clinic-runner-management.png",
          "/screens/labtest-workflow.png",
          "/screens/invoice-config.png",
        ]),
        project_flowchart: JSON.stringify({
          mermaid_code:
            "flowchart TB\n  A[Sidebar Menu] --> B[User Settings]\n  A --> C[Clinic / Runner]\n  A --> D[Ads / Pricing Plan]\n  A --> E[Invoice Header & Footer]\n  A --> F[Invoice List]\n  A --> G[Lab Management]\n  A --> H[Pickup Checking]\n  A --> I[Labtest Rule]\n  A --> J[Admin Profile]\n  A --> K[Permissions Management]\n  C --> C1[CRUD Clinics]\n  C --> C2[CRUD Runners]\n  C --> C3[Assign Pricing Plan to Clinics]\n  D --> D1[Text Slider Ad]\n  D --> D2[Fullscreen Ad]\n  D --> D3[Banner Ad]\n  D --> D4[Export Pricing to Excel]\n  D --> D5[Import Updated Pricing]\n  E --> E1[Create PDF Invoice Header/Footer]\n  F --> F1[View Generated Invoices]\n  G --> G1[Receive Lab Test]\n  G1 --> G2[Deliver to Runner]\n  G2 --> G3[Confirm Test Received]\n  G3 --> G4[Generate Invoice & Result]\n  G4 --> F1\n  I --> I1[Assign Tubes to Tests]\n  I --> I2[Set Tube Quantity]\n  J --> J1[Edit Profile]\n  K --> K1[Create Roles]\n  K1 --> K2[Assign Permissions]",
          description:
            "Structured user and admin journey through modules like clinic management, lab operations, invoicing, and role control.",
        }),
      },
    },
    // You can add your second project here if it's different
    // Currently both JSON objects in your attachment are identical
  ]

  // Process each project
  for (const projectData of projectsData) {
    const { features, goals, team_members, project_detail, ...projectMainData } = projectData

    // Create or update the project
    const project = await prisma.project.upsert({
      where: { project_id: projectMainData.project_id },
      update: projectMainData,
      create: projectMainData,
    })

    // Process features
    if (features && features.length > 0) {
      // Delete existing features for this project
      await prisma.projectFeature.deleteMany({
        where: { projectId: project.id },
      })

      // Create new features
      for (const feature of features) {
        await prisma.projectFeature.create({
          data: {
            ...feature,
            project: { connect: { id: project.id } },
          },
        })
      }
    }

    // Process goals
    if (goals && goals.length > 0) {
      // Delete existing goals for this project
      await prisma.projectGoal.deleteMany({
        where: { projectId: project.id },
      })

      // Create new goals
      for (const goal of goals) {
        await prisma.projectGoal.create({
          data: {
            ...goal,
            project: { connect: { id: project.id } },
          },
        })
      }
    }

    // Process team members
    if (team_members && team_members.length > 0) {
      // Delete existing team members for this project
      await prisma.teamMember.deleteMany({
        where: { projectId: project.id },
      })

      // Create new team members
      for (const member of team_members) {
        await prisma.teamMember.create({
          data: {
            ...member,
            project: { connect: { id: project.id } },
          },
        })
      }
    }

    // Process project details
    if (project_detail) {
      // Check if project details already exist
      const existingDetails = await prisma.projectDetail.findUnique({
        where: { projectId: project.id },
      })

      if (existingDetails) {
        // Update existing details
        await prisma.projectDetail.update({
          where: { id: existingDetails.id },
          data: project_detail,
        })
        console.log(`Updated details for project: ${project.project_title}`)
      } else {
        // Create new details
        await prisma.projectDetail.create({
          data: {
            ...project_detail,
            project: { connect: { id: project.id } },
          },
        })
        console.log(`Created details for project: ${project.project_title}`)
      }
    }

    console.log(`Processed project: ${project.project_title}`)
  }

  console.log("Seed completed successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
