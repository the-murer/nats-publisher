"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerManager } from "@/components/server-manager"
import { TopicEditor } from "@/components/topic-editor"
import { MessagePublisher } from "@/components/message-publisher"
import { ConfigManager } from "@/components/config-manager"
import { ConnectionStatus } from "@/components/connection-status"
import { useNatsStore } from "@/lib/nats-store"

export default function NatsInterface() {
  const { servers, currentServer, isConnected } = useNatsStore()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">NATS Interface</h1>
            <p className="text-muted-foreground">Manage NATS servers, topics, and JetStream publishing</p>
          </div>
          <ConnectionStatus />
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="servers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="topics">Topics & Payloads</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="servers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Server Management</CardTitle>
                <CardDescription>Add and manage NATS servers for connections</CardDescription>
              </CardHeader>
              <CardContent>
                <ServerManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Topic & Payload Editor</CardTitle>
                <CardDescription>Create and manage topics with custom payloads and variables</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publish" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Publisher</CardTitle>
                <CardDescription>Publish messages to NATS and JetStream</CardDescription>
              </CardHeader>
              <CardContent>
                <MessagePublisher />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Management</CardTitle>
                <CardDescription>Export and import your NATS configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
