"use server"

import { EC2Client, StartInstancesCommand, StopInstancesCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2"

// Initialize the EC2 client with the region from environment variables
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
})

export async function startInstance(instanceId: string): Promise<void> {
  console.log(`Starting instance ${instanceId}`)

  const command = new StartInstancesCommand({
    InstanceIds: [instanceId],
  })

  try {
    await ec2Client.send(command)
    console.log(`Successfully initiated start for instance ${instanceId}`)
  } catch (error) {
    console.error(`Error starting instance ${instanceId}:`, error)
    throw error
  }
}

export async function stopInstance(instanceId: string): Promise<void> {
  console.log(`Stopping instance ${instanceId}`)

  const command = new StopInstancesCommand({
    InstanceIds: [instanceId],
  })

  try {
    await ec2Client.send(command)
    console.log(`Successfully initiated stop for instance ${instanceId}`)
  } catch (error) {
    console.error(`Error stopping instance ${instanceId}:`, error)
    throw error
  }
}

export async function getInstances() {
  try {
    const command = new DescribeInstancesCommand({})
    const response = await ec2Client.send(command)

    // Transform the AWS response into our application's format
    const instances = []

    if (response.Reservations) {
      for (const reservation of response.Reservations) {
        if (reservation.Instances) {
          for (const instance of reservation.Instances) {
            // Skip terminated instances
            if (instance.State?.Name === "terminated") continue

            // Find the Name tag if it exists
            let name = "Unnamed Instance"
            if (instance.Tags) {
              const nameTag = instance.Tags.find((tag) => tag.Key === "Name")
              if (nameTag && nameTag.Value) {
                name = nameTag.Value
              }
            }

            instances.push({
              id: instance.InstanceId || "unknown",
              name: name,
              type: instance.InstanceType || "unknown",
              status: instance.State?.Name || "unknown",
              zone: instance.Placement?.AvailabilityZone || "unknown",
              publicIp: instance.PublicIpAddress,
              launchTime: instance.LaunchTime ? instance.LaunchTime.toISOString() : new Date().toISOString(),
            })
          }
        }
      }
    }

    return instances
  } catch (error) {
    console.error("Error fetching EC2 instances:", error)
    throw error
  }
}
