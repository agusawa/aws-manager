// API functions to interact with the Lambda backend

interface InstanceDetails {
  status: string
  instanceId: string
  instanceType: string
  publicIp?: string
  launchTime?: string
}

// Replace with your actual API endpoint
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "https://your-api-gateway-url.amazonaws.com/prod"

export async function fetchInstanceStatus(): Promise<InstanceDetails> {
  try {
    // For development/preview, return mock data if no API endpoint is set
    if (API_ENDPOINT === "https://your-api-gateway-url.amazonaws.com/prod") {
      return getMockInstanceData()
    }

    const response = await fetch(`${API_ENDPOINT}/instance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching instance status:", error)
    // Return mock data as fallback for preview
    return getMockInstanceData()
  }
}

export async function startInstance(): Promise<void> {
  try {
    // For development/preview, just wait a bit
    if (API_ENDPOINT === "https://your-api-gateway-url.amazonaws.com/prod") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return
    }

    const response = await fetch(`${API_ENDPOINT}/instance/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
  } catch (error) {
    console.error("Error starting instance:", error)
    throw error
  }
}

export async function stopInstance(): Promise<void> {
  try {
    // For development/preview, just wait a bit
    if (API_ENDPOINT === "https://your-api-gateway-url.amazonaws.com/prod") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return
    }

    const response = await fetch(`${API_ENDPOINT}/instance/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
  } catch (error) {
    console.error("Error stopping instance:", error)
    throw error
  }
}

// Mock data for development and preview
function getMockInstanceData(): InstanceDetails {
  // Randomly choose a status for demonstration
  const statuses = ["running", "stopped"]
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

  return {
    status: randomStatus,
    instanceId: "i-1234567890abcdef0",
    instanceType: "t4g.micro",
    publicIp: randomStatus === "running" ? "[REDACTED]" : undefined,
    launchTime: "2023-04-15T10:30:00Z",
  }
}
