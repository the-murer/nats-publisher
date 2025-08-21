"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"

export function TopicHelp() {
  const [showHelp, setShowHelp] = useState(false)
  const action = "exampleAction" // Declare the variable here

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <HelpCircle className="h-5 w-5" />
            How to Use NATS Interface
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)}>
            {showHelp ? "Hide" : "Show"} Help
          </Button>
        </div>
      </CardHeader>
      {showHelp && (
        <CardContent className="text-sm text-blue-800 space-y-3">
          <div>
            <strong>Message Types:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                • <strong>Publish:</strong> Fire-and-forget messages. Optional response topic for listening to replies.
              </li>
              <li>
                • <strong>Request:</strong> Send message and wait for response. Shows the actual response received.
              </li>
              <li>
                • <strong>JetStream:</strong> Persistent messaging with acknowledgments. Optional response topic for
                replies.
              </li>
            </ul>
          </div>
          <div>
            <strong>Variables:</strong> Use <code className="bg-blue-100 px-1 rounded">{"{{variableName}}"}</code> in
            topics and payloads. Global variables are available across all topics, local variables are topic-specific.
          </div>
          <div>
            <strong>Topics:</strong> Use dot notation like{" "}
            <code className="bg-blue-100 px-1 rounded">user.cmd.{action}.profile</code>
            for hierarchical message routing with variables.
          </div>
          <div>
            <strong>Response Topics:</strong> For publish/jetstream, specify where to listen for responses. For
            requests, responses are automatically handled.
          </div>
        </CardContent>
      )}
    </Card>
  )
}
