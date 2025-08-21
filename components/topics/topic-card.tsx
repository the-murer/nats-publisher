"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useNatsStore, type TopicConfig } from "@/lib/nats-store"
import { Edit, Trash2, Send, ArrowLeftRight, Zap } from "lucide-react"

interface TopicCardProps {
  topic: TopicConfig
  onEdit: (topic: TopicConfig) => void
}

export function TopicCard({ topic, onEdit }: TopicCardProps) {
  const { globalVariables, deleteTopic } = useNatsStore()

  const handleDelete = (topicId: string) => {
    deleteTopic(topicId)
  }

  const resolveText = (text: string, localVars: Record<string, string>) => {
    const allVars = { ...globalVariables, ...localVars }
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVars[key] || match
    })
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "request":
        return <ArrowLeftRight className="h-3 w-3" />
      case "jetstream":
        return <Zap className="h-3 w-3" />
      default:
        return <Send className="h-3 w-3" />
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "request":
        return "bg-blue-500"
      case "jetstream":
        return "bg-purple-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{topic.name}</CardTitle>
            <Badge
              className={`flex items-center gap-1 text-white ${getMessageTypeColor(topic.messageType || "publish")}`}
            >
              {getMessageTypeIcon(topic.messageType || "publish")}
              {(topic.messageType || "publish").toUpperCase()}
            </Badge>
            {topic.isJetStream && topic.messageType !== "jetstream" && (
              <Badge variant="default" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                JetStream
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(topic)}>
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
                  <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{topic.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(topic.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription>
          <div className="space-y-1">
            <div className="font-mono text-sm">{resolveText(topic.topic, topic.variables)}</div>
            {topic.topic !== resolveText(topic.topic, topic.variables) && (
              <div className="text-xs text-muted-foreground">Template: {topic.topic}</div>
            )}
            {topic.responseTopic && (
              <div className="text-xs">Response: {resolveText(topic.responseTopic, topic.variables)}</div>
            )}
            {topic.streamName && <div className="text-xs">Stream: {topic.streamName}</div>}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-sm font-medium">Payload Preview:</div>
          <div className="bg-muted p-3 rounded-md">
            <pre className="text-xs font-mono whitespace-pre-wrap">{resolveText(topic.payload, topic.variables)}</pre>
          </div>
          {Object.keys(topic.variables).length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Variables:</span>
              {Object.entries(topic.variables).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
