"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Power, PowerOff, RefreshCw, Server, Clock, AlertCircle } from "lucide-react"
import { useRetrieveEc2InstanceQuery, useStartEc2InstanceMutation, useStopEc2InstanceMutation } from "@/state/queries/ec2-instances"
import { InstanceStatus } from "@/types/ec2-instances.types"
import { Skeleton } from "@/components/ui/skeleton"
import { day } from "@/lib/day"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function InstanceManager() {
  const { toast } = useToast()
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showStopDialog, setShowStopDialog] = useState(false)

  const { mutateAsync: startInstance, isPending: isStarting } = useStartEc2InstanceMutation()
  const { mutateAsync: stopInstance, isPending: isStopping } = useStopEc2InstanceMutation()

  const { data, isLoading, isFetching, refetch } = useRetrieveEc2InstanceQuery(process.env.NEXT_PUBLIC_AWS_EC2_INSTANCE_ID!)
  const instance = data?.data

  const handleStartInstance = async () => {
    if (!instance) return

    try {
      await startInstance(instance.instanceId)
      toast({
        title: "Instance started",
        description: "Your instance is starting. This may take a moment.",
      })
    } catch (error) {
      console.error("Failed to start instance:", error)
      toast({
        title: "Error",
        description: "Failed to start instance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowStartDialog(false)
    }
  }

  const handleStopInstance = async () => {
    if (!instance) return

    try {
      await stopInstance(instance.instanceId)
      toast({
        title: "Instance stopped",
        description: "Your instance is stopping. This may take a moment.",
      })
    } catch (error) {
      console.error("Failed to stop instance:", error)
      toast({
        title: "Error",
        description: "Failed to stop instance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowStopDialog(false)
    }
  }

  const handleRefresh = () => {
    refetch()
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
    return day(dateString).format('lll')
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center border-t pt-6">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    )
  }

  if (!instance) return null

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{instance.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>{instance.instanceId}</CardDescription>
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
            <span className="text-sm">{instance.instanceType || "Unknown"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Public IP</span>
            <span className="text-sm font-mono">{instance.publicIp || "None"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Launch Time</span>
            <span className="text-sm">{formatDate(instance.launchTime)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-center border-t pt-6">
        {instance.status === "stopped" && (
          <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                disabled={isLoading || isStarting || isStopping}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isStarting ? (
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
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start Instance</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to start this instance? This will incur AWS charges.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStartInstance}>
                  Start Instance
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {instance.status === "running" && (
          <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                disabled={isLoading || isStarting || isStopping}
                variant="outline"
                className="border-rose-500 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
              >
                {isStopping ? (
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
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Stop Instance</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to stop this instance? This will terminate any running processes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStopInstance}>
                  Stop Instance
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {(instance.status === "pending" || instance.status === "stopping") && (
          <Button disabled className="opacity-50">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            {instance.status === "pending" ? "Starting..." : "Stopping..."}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
