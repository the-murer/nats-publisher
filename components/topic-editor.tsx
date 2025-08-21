"use client"

import { TopicHelp } from "@/components/topics/topic-help"
import { GlobalVariables } from "@/components/topics/global-variables"
import { TopicForm } from "@/components/topics/topic-form"
import { TopicList } from "@/components/topics/topic-list"

export function TopicEditor() {
  return (
    <div className="space-y-6">
      <TopicHelp />
      <GlobalVariables />

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Topic Configurations</h3>
          <p className="text-sm text-muted-foreground">
            Configure NATS topics with different message types and response handling
          </p>
        </div>
        <TopicForm />
      </div>

      <TopicList />
    </div>
  )
}
