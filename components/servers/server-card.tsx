"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { useNatsStore, type NatsServer } from "@/lib/nats-store"
import { natsClient } from "@/lib/nats-client"
import { Edit, Trash2, Power, PowerOff } from "lucide-react"

interface ServerCardProps {
  server: NatsServer
  onEdit: (server: NatsServer) => void
}

export function ServerCard({ server, onEdit }: ServerCardProps) {
  const { servers, currentServer, updateServer, deleteServer, setCurrentServer, setConnectionStatus } = useNatsStore()
  const [testingConnection, setTestingConnection] = useState(false)

  const handleDelete = (serverId: string) => {
    deleteServer(serverId)
    if (currentServer?.id === serverId) {
      setCurrentServer(null)
      natsClient.disconnect()
      setConnectionStatus(false)
    }
  }

  const handleSetActive = async (server: NatsServer) => {
    // Disconnect from current server if connected
    if (natsClient.isConnected()) {
      await natsClient.disconnect()
      setConnectionStatus(false)
    }

    // Update active status
    servers.forEach((s) => updateServer(s.id, { isActive: false }))
    updateServer(server.id, { isActive: true })
    setCurrentServer(server)
  }

  const handleTestConnection = async (server: NatsServer) => {
    setTestingConnection(true)
    try {
      // Create a temporary connection to test
      const testClient = new (await import("@/lib/nats-client")).NatsClient()
      await testClient.connect(server.url, {
        username: server.username,
        password: server.password,
        token: server.token,
      })
      await testClient.disconnect()

      // Show success feedback
      console.log("[v0] Connection test successful for:", server.name)
    } catch (error) {
      console.error("[v0] Connection test failed:", error)
      alert(`Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <Card className={server.isActive ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{server.name}</CardTitle>
              {server.isActive && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestConnection(server)}
              disabled={testingConnection}
            >
              {testingConnection ? "Testing..." : "Test"}
            </Button>
            <Button size="sm" variant={server.isActive ? "default" : "outline"} onClick={() => handleSetActive(server)}>
              {server.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(server)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Server</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{server.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(server.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription className="flex items-center gap-4">
          <span>{server.url}</span>
          {server.username && (
            <Badge variant="secondary" className="text-xs">
              Auth: {server.username}
            </Badge>
          )}
          {server.token && (
            <Badge variant="secondary" className="text-xs">
              Token Auth
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
