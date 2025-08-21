"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useNatsStore, type NatsServer } from "@/lib/nats-store"
import { ServerCard } from "./server-card"
import { ServerEditDialog } from "./server-edit-dialog"
import { Server } from "lucide-react"

export function ServerList() {
  const { servers } = useNatsStore()
  const [editingServer, setEditingServer] = useState<NatsServer | null>(null)

  const handleEdit = (server: NatsServer) => {
    setEditingServer(server)
  }

  const handleCloseEdit = () => {
    setEditingServer(null)
  }

  if (servers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Server className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No servers configured</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">Add your first NATS server to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} onEdit={handleEdit} />
        ))}
      </div>
      {editingServer && <ServerEditDialog server={editingServer} onClose={handleCloseEdit} />}
    </>
  )
}
