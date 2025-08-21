"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useNatsStore, type TopicConfig } from "@/lib/nats-store"
import { TopicCard } from "./topic-card"
import { TopicEditDialog } from "./topic-edit-dialog"
import { MessageSquare } from "lucide-react"

export function TopicList() {
  const { topics } = useNatsStore()
  const [editingTopic, setEditingTopic] = useState<TopicConfig | null>(null)

  const handleEdit = (topic: TopicConfig) => {
    setEditingTopic(topic)
  }

  const handleCloseEdit = () => {
    setEditingTopic(null)
  }

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No topics configured</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Add your first topic configuration to get started with NATS messaging
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onEdit={handleEdit} />
        ))}
      </div>
      {editingTopic && <TopicEditDialog topic={editingTopic} onClose={handleCloseEdit} />}
    </>
  )
}
