"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNatsStore } from "@/lib/nats-store"
import { Send, ArrowLeftRight, Zap, Variable } from "lucide-react"

interface CustomPublisherProps {
  topic: string
  onTopicChange: (topic: string) => void
  payload: string
  onPayloadChange: (payload: string) => void
  messageType: "publish" | "request" | "jetstream"
  onMessageTypeChange: (type: "publish" | "request" | "jetstream") => void
  responseTopic: string
  onResponseTopicChange: (topic: string) => void
  streamName: string
  onStreamNameChange: (name: string) => void
}

export function CustomPublisher({
  topic,
  onTopicChange,
  payload,
  onPayloadChange,
  messageType,
  onMessageTypeChange,
  responseTopic,
  onResponseTopicChange,
  streamName,
  onStreamNameChange,
}: CustomPublisherProps) {
  const { globalVariables } = useNatsStore()

  const resolveVariables = (text: string) => {
    let resolved = text
    Object.entries(globalVariables).forEach(([key, value]) => {
      resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value)
    })
    return resolved
  }

  const hasVariables = (text: string) => /\{\{[^}]+\}\}/.test(text)
  const resolvedTopic = resolveVariables(topic)
  const resolvedPayload = resolveVariables(payload)
  const resolvedResponseTopic = resolveVariables(responseTopic)

  return (
    <div className="space-y-4">
      {Object.keys(globalVariables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Variable className="h-4 w-4" />
              Available Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(globalVariables).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use variables in topics and payloads with {`{{variableName}}`} syntax
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="custom-topic">Topic *</Label>
          <Input
            id="custom-topic"
            placeholder="user.cmd.{{action}}.profile"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
          />
          {hasVariables(topic) && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Resolved:</span> {resolvedTopic}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-message-type">Message Type *</Label>
          <Select value={messageType} onValueChange={onMessageTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publish">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Publish
                </div>
              </SelectItem>
              <SelectItem value="request">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Request
                </div>
              </SelectItem>
              <SelectItem value="jetstream">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  JetStream
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(messageType === "publish" || messageType === "jetstream") && (
        <div className="space-y-2">
          <Label htmlFor="custom-response-topic">Response Topic (Optional)</Label>
          <Input
            id="custom-response-topic"
            placeholder="user.response.{{action}}.profile"
            value={responseTopic}
            onChange={(e) => onResponseTopicChange(e.target.value)}
          />
          {hasVariables(responseTopic) && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Resolved:</span> {resolvedResponseTopic}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Topic to listen for responses after publishing the message</p>
        </div>
      )}

      {messageType === "jetstream" && (
        <div className="space-y-2">
          <Label htmlFor="custom-stream">Stream Name</Label>
          <Input
            id="custom-stream"
            placeholder="USER_COMMANDS"
            value={streamName}
            onChange={(e) => onStreamNameChange(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="custom-payload">Payload (JSON)</Label>
        <Textarea
          id="custom-payload"
          placeholder='{"action": "{{action}}", "userId": "{{userId}}"}'
          value={payload}
          onChange={(e) => onPayloadChange(e.target.value)}
          className="font-mono text-sm"
          rows={6}
        />
        {hasVariables(payload) && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Resolved Payload:</Label>
            <div className="bg-muted p-2 rounded text-xs">
              <pre className="font-mono whitespace-pre-wrap">{resolvedPayload}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
