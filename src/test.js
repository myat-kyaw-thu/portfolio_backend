import axios from "axios"
async function testProjectDetailsRoute() {
  try {
    const response = await axios.get("http://localhost:8000/api/projects/shwe-min-lab-admin")

    console.log("API Response:")
    console.log(JSON.stringify(response.data, null, 2))

    // Verify project_flowchart exists and has mermaid_code
    if (response.data.project_flowchart && response.data.project_flowchart.mermaid_code) {
      console.log("\nProject flowchart mermaid code exists ✅")

      // Show first few lines of mermaid code
      const mermaidCode = response.data.project_flowchart.mermaid_code
      console.log("\nMermaid code preview:")
      console.log(mermaidCode.split("\n").slice(0, 5).join("\n") + "...")
    } else {
      console.error("\nProject flowchart mermaid code is missing ❌")
    }
  } catch (error) {
    console.error("Error testing route:", error.message)
    if (error.response) {
      console.error("Response data:", error.response.data)
    }
  }
}

testProjectDetailsRoute()
