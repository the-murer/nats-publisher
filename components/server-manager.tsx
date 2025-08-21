"use client"

import { ServerForm } from "@/components/servers/server-form"
import { ServerList } from "@/components/servers/server-list"

export function ServerManager() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">NATS Servers</h3>
          <p className="text-sm text-muted-foreground">Manage your NATS server connections</p>
        </div>
        <ServerForm />
      </div>

      <ServerList />
    </div>
  )
}
