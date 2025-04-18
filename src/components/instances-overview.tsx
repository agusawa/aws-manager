"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Server, Power, PowerOff, Clock } from "lucide-react"
import { getInstances } from "@/lib/aws-actions"

export function InstancesOverview() {
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    stopped: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const instances = await getInstances()

        // Calculate stats from instances
        const total = instances.length
        const running = instances.filter((instance) => instance.status === "running").length
        const stopped = instances.filter((instance) => instance.status === "stopped").length
        const pending = instances.filter((instance) => ["pending", "stopping"].includes(instance.status)).length

        setStats({
          total,
          running,
          stopped,
          pending,
        })
      } catch (error) {
        console.error("Failed to fetch instance stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchStats, 30000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Running</CardTitle>
          <Power className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.running}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stopped</CardTitle>
          <PowerOff className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.stopped}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>
    </>
  )
}
