import { EC2Client, DescribeInstancesCommand, StartInstancesCommand, StopInstancesCommand } from "@aws-sdk/client-ec2"
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server"

const client = new EC2Client({
  region: process.env.AWS_EC2_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

function verifyUser(request: NextRequest) {
  const allowedUserId = process.env.ALLOWED_USER_ID!;

  const { userId: clerkUserId } = getAuth(request);

  if (clerkUserId !== allowedUserId) {
    throw new Error('Unauthorized');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyUser(request);

    const { id } = await params;
    const command = new DescribeInstancesCommand({
      InstanceIds: [id],
    })

    const response = await client.send(command)
    const instance = response.Reservations?.[0]?.Instances?.[0]

    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {        
        instanceId: instance.InstanceId,
        name: instance.Tags?.find((tag) => tag.Key === 'Name')?.Value,
        status: instance.State?.Name,
        instanceType: instance.InstanceType,
        publicIp: '[REDACTED]',
        launchTime: instance.LaunchTime,
      },
    })
  } catch (error) {
    console.error("Error fetching instance:", error)
    return NextResponse.json(
      { error: "Failed to fetch instance details" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }>  }
) {
  try {
    verifyUser(request);

    const { id } = await params;
    const command = new StartInstancesCommand({
      InstanceIds: [id],
    })

    await client.send(command)
    return NextResponse.json({ message: "Instance starting" })
  } catch (error) {
    console.error("Error starting instance:", error)
    return NextResponse.json(
      { error: "Failed to start instance" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyUser(request);

    const { id } = await params;
    const command = new StopInstancesCommand({
      InstanceIds: [id],
    })

    await client.send(command)
    return NextResponse.json({ message: "Instance stopping" })
  } catch (error) {
    console.error("Error stopping instance:", error)
    return NextResponse.json(
      { error: "Failed to stop instance" },
      { status: 500 }
    )
  }
}

