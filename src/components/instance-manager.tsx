"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Power, PowerOff, RefreshCw, Server, Clock, AlertCircle } from "lucide-react"
import { fetchInstanceStatus, startInstance, stopInstance } from "@/lib/api"

type InstanceStatus = "running" | "stopped" | "pending" | "stopping" | "unknown"

interface InstanceDetails {
  status: InstanceStatus
  instanceId: string
  instanceType: string
  publicIp?: string
  launchTime?: string
}

export function InstanceManager() {
  const [instance, setInstance] = useState<InstanceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState(false)
  const { toast } = useToast()

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const data = await fetchInstanceStatus()
      setInstance(data)
    } catch (error) {
      console.error("Failed to fetch instance status:", error)
      toast({
        title: "Error",
        description: "Failed to fetch instance status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Set up polling every 15 seconds
    const intervalId = setInterval(fetchStatus, 15000)

    return () => clearInterval(intervalId)
  }, [])

  const handleStartInstance = async () => {
    if (!instance) return

    setActionInProgress(true)
    try {
      await startInstance()
      toast({
        title: "Starting Instance",
        description: "Your instance is starting. This may take a moment.",
      })
      // Update the UI immediately to show pending state
      setInstance({ ...instance, status: "pending" })
      // Fetch the actual status after a short delay
      setTimeout(fetchStatus, 2000)
    } catch (error) {
      console.error("Failed to start instance:", error)
      toast({
        title: "Error",
        description: "Failed to start instance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(false)
    }
  }

  const handleStopInstance = async () => {
    if (!instance) return

    setActionInProgress(true)
    try {
      await stopInstance()
      toast({
        title: "Stopping Instance",
        description: "Your instance is stopping. This may take a moment.",
      })
      // Update the UI immediately to show stopping state
      setInstance({ ...instance, status: "stopping" })
      // Fetch the actual status after a short delay
      setTimeout(fetchStatus, 2000)
    } catch (error) {
      console.error("Failed to stop instance:", error)
      toast({
        title: "Error",
        description: "Failed to stop instance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(false)
    }
  }

  const handleRefresh = () => {
    fetchStatus()
  }

  const getStatusBadge = (status: InstanceStatus) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-500">
            <Power className="h-3 w-3 mr-1" /> Running
          </Badge>
        )
      case "stopped":
        return (
          <Badge variant="outline" className="text-rose-500 border-rose-500">
            <PowerOff className="h-3 w-3 mr-1" /> Stopped
          </Badge>
        )
      case "pending":
      case "stopping":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            <Clock className="h-3 w-3 mr-1 animate-spin" /> {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" /> Unknown
          </Badge>
        )
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading && !instance) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Loading Instance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <p className="text-muted-foreground">Fetching instance information...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>EC2 Trading Bot</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || actionInProgress}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>{instance?.instanceId || "Loading instance ID..."}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <Server className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status</span>
            <div>{instance ? getStatusBadge(instance.status) : "Unknown"}</div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Type</span>
            <span className="text-sm">{instance?.instanceType || "Unknown"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Public IP</span>
            <span className="text-sm font-mono">{instance?.publicIp || "None"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Launch Time</span>
            <span className="text-sm">{formatDate(instance?.launchTime)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-center border-t pt-6">
        {instance?.status === "stopped" && (
          <Button
            onClick={handleStartInstance}
            disabled={actionInProgress}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {actionInProgress ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Start Instance
              </>
            )}
          </Button>
        )}

        {instance?.status === "running" && (
          <Button
            onClick={handleStopInstance}
            disabled={actionInProgress}
            variant="outline"
            className="border-rose-500 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
          >
            {actionInProgress ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Stop Instance
              </>
            )}
          </Button>
        )}

        {(instance?.status === "pending" || instance?.status === "stopping") && (
          <Button disabled className="opacity-50">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            {instance.status === "pending" ? "Starting..." : "Stopping..."}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
