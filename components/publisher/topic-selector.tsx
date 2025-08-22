"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNatsStore } from "@/lib/nats-store";
import { Zap, Reply } from "lucide-react";
import {
  getMessageTypeIcon,
  getMessageTypeColor,
} from "@/lib/topics/topic-utils";

interface TopicSelectorProps {
  selectedTopicId: string;
  onTopicChange: (topicId: string) => void;
  localVariables: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
}

export function TopicSelector({
  selectedTopicId,
  onTopicChange,
  localVariables,
  onVariableChange,
}: TopicSelectorProps) {
  const { topics, globalVariables } = useNatsStore();
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const resolvePayload = (
    payload: string,
    localVars: Record<string, string>
  ) => {
    const allVars = { ...globalVariables, ...localVars };
    return payload.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVars[key] || match;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topic-select">Select Topic Configuration</Label>
        <Select value={selectedTopicId} onValueChange={onTopicChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a topic configuration" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                <div className="flex items-center gap-2">
                  {topic.name}
                  {getMessageTypeIcon(topic.messageType || "publish")}
                  {topic.isJetStream && topic.messageType !== "jetstream" && (
                    <Zap className="h-3 w-3" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTopic && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Topic</Label>
              <div className="font-mono text-sm p-2 bg-muted rounded">
                {resolvePayload(selectedTopic.topic, localVariables)}
              </div>
              {selectedTopic.topic !==
                resolvePayload(selectedTopic.topic, localVariables) && (
                <div className="text-xs text-muted-foreground mt-1">
                  Template: {selectedTopic.topic}
                </div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <div className="flex items-center gap-2 p-2">
                <Badge
                  className={`flex items-center gap-1 text-white ${getMessageTypeColor(
                    selectedTopic.messageType || "publish"
                  )}`}
                >
                  {getMessageTypeIcon(selectedTopic.messageType || "publish")}
                  {(selectedTopic.messageType || "publish").toUpperCase()}
                </Badge>
                {selectedTopic.isJetStream &&
                  selectedTopic.messageType !== "jetstream" && (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      JetStream
                    </Badge>
                  )}
                {selectedTopic.streamName && (
                  <span className="text-sm text-muted-foreground">
                    ({selectedTopic.streamName})
                  </span>
                )}
              </div>
            </div>
          </div>

          {selectedTopic.responseTopic && (
            <div>
              <Label className="text-sm font-medium">Response Topic</Label>
              <div className="font-mono text-sm p-2 bg-muted rounded flex items-center gap-2">
                <Reply className="h-4 w-4" />
                {resolvePayload(selectedTopic.responseTopic, localVariables)}
              </div>
              {selectedTopic.responseTopic !==
                resolvePayload(selectedTopic.responseTopic, localVariables) && (
                <div className="text-xs text-muted-foreground mt-1">
                  Template: {selectedTopic.responseTopic}
                </div>
              )}
            </div>
          )}

          {/* Variable Editor */}
          {Object.keys(localVariables).length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Variables</Label>
              <div className="grid gap-2">
                {Object.entries(localVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Label className="w-24 text-sm">{key}:</Label>
                    <Input
                      value={value}
                      onChange={(e) => onVariableChange(key, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payload Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Resolved Payload</Label>
            <div className="bg-muted p-3 rounded-md">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {resolvePayload(selectedTopic.payload, localVariables)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
