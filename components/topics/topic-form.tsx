"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useNatsStore, type TopicConfig } from "@/lib/nats-store";
import { Plus, Eye, Send, ArrowLeftRight, Zap } from "lucide-react";

interface TopicFormData {
  name: string;
  topic: string;
  payload: string;
  variables: Record<string, string>;
  messageType: "publish" | "request" | "jetstream";
  responseTopic: string;
  isJetStream: boolean;
  streamName: string;
}

const initialFormData: TopicFormData = {
  name: "",
  topic: "",
  payload: "{}",
  variables: {},
  messageType: "publish",
  responseTopic: "",
  isJetStream: false,
  streamName: "",
};

interface TopicFormProps {
  editingTopic?: TopicConfig | null;
  onClose?: () => void;
}

export function TopicForm({ editingTopic, onClose }: TopicFormProps) {
  const { globalVariables, addTopic, updateTopic } = useNatsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TopicFormData>(
    editingTopic
      ? {
          name: editingTopic.name,
          topic: editingTopic.topic,
          payload: editingTopic.payload,
          variables: { ...editingTopic.variables },
          messageType: editingTopic.messageType || "publish",
          responseTopic: editingTopic.responseTopic || "",
          isJetStream: editingTopic.isJetStream,
          streamName: editingTopic.streamName || "",
        }
      : initialFormData
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [newVariableKey, setNewVariableKey] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.topic.trim()) {
      return;
    }

    const topicData = {
      name: formData.name.trim(),
      topic: formData.topic.trim(),
      payload: formData.payload.trim(),
      variables: formData.variables,
      messageType: formData.messageType,
      responseTopic: formData.responseTopic.trim() || undefined,
      isJetStream:
        formData.messageType === "jetstream" ? true : formData.isJetStream,
      streamName: formData.streamName.trim() || undefined,
    };

    if (editingTopic) {
      updateTopic(editingTopic.id, topicData);
    } else {
      addTopic(topicData);
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setPreviewMode(false);
    onClose?.();
  };

  const addVariable = () => {
    if (newVariableKey.trim() && newVariableValue.trim()) {
      setFormData({
        ...formData,
        variables: {
          ...formData.variables,
          [newVariableKey.trim()]: newVariableValue.trim(),
        },
      });
      setNewVariableKey("");
      setNewVariableValue("");
    }
  };

  const removeVariable = (key: string) => {
    const { [key]: _, ...rest } = formData.variables;
    setFormData({ ...formData, variables: rest });
  };

  const resolveText = (text: string, localVars: Record<string, string>) => {
    const allVars = { ...globalVariables, ...localVars };
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVars[key] || match;
    });
  };

  const getUsedVariables = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map((match) => match.slice(2, -2));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? "Edit Topic" : "Add New Topic"}
            </DialogTitle>
            <DialogDescription>
              Configure your NATS topic with message type, payload, and response
              handling
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Topic Name *</Label>
                <Input
                  id="name"
                  placeholder="User Command"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="messageType">Message Type *</Label>
                <Select
                  value={formData.messageType}
                  onValueChange={(value: "publish" | "request" | "jetstream") =>
                    setFormData({
                      ...formData,
                      messageType: value,
                      isJetStream: value === "jetstream",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Publish - Fire and forget
                      </div>
                    </SelectItem>
                    <SelectItem value="request">
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Request - Wait for response
                      </div>
                    </SelectItem>
                    <SelectItem value="jetstream">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        JetStream - Persistent messaging
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">NATS Subject *</Label>
              <Input
                id="topic"
                placeholder="user.cmd.{{action}}.profile"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                required
              />
              {getUsedVariables(formData.topic).length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Preview: {resolveText(formData.topic, formData.variables)}
                </div>
              )}
            </div>

            {(formData.messageType === "publish" ||
              formData.messageType === "jetstream") && (
              <div className="space-y-2">
                <Label htmlFor="responseTopic">Response Topic (Optional)</Label>
                <Input
                  id="responseTopic"
                  placeholder="user.response.{{action}}.profile"
                  value={formData.responseTopic}
                  onChange={(e) =>
                    setFormData({ ...formData, responseTopic: e.target.value })
                  }
                />
                {formData.responseTopic &&
                  getUsedVariables(formData.responseTopic).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Preview:{" "}
                      {resolveText(formData.responseTopic, formData.variables)}
                    </div>
                  )}
                <p className="text-xs text-muted-foreground">
                  Topic to listen for responses after publishing the message
                </p>
              </div>
            )}

            {formData.messageType === "jetstream" && (
              <div className="space-y-2">
                <Label htmlFor="streamName">Stream Name</Label>
                <Input
                  id="streamName"
                  placeholder="USER_COMMANDS"
                  value={formData.streamName}
                  onChange={(e) =>
                    setFormData({ ...formData, streamName: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  JetStream stream name for persistent message storage
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="payload">Payload (JSON)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {previewMode ? "Edit" : "Preview"}
                </Button>
              </div>
              {previewMode ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Resolved payload:
                  </div>
                  <Textarea
                    value={resolveText(formData.payload, formData.variables)}
                    readOnly
                    className="font-mono text-sm"
                    rows={8}
                  />
                  <div className="text-xs text-muted-foreground">
                    Variables used:{" "}
                    {getUsedVariables(formData.payload).join(", ") || "None"}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    id="payload"
                    placeholder='{"action": "{{action}}", "userId": "{{userId}}", "data": {}}'
                    value={formData.payload}
                    onChange={(e) =>
                      setFormData({ ...formData, payload: e.target.value })
                    }
                    className="font-mono text-sm"
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{variableName}}"} syntax to insert variables.
                    Example: {"{{userId}}"}, {"{{action}}"}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Local Variables</Label>
              <p className="text-xs text-muted-foreground">
                Variables specific to this topic. Override global variables with
                the same name.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Variable name"
                  value={newVariableKey}
                  onChange={(e) => setNewVariableKey(e.target.value)}
                />
                <Input
                  placeholder="Variable value"
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                />
                <Button type="button" onClick={addVariable}>
                  Add
                </Button>
              </div>
              {Object.keys(formData.variables).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.variables).map(([key, value]) => (
                    <Badge
                      key={key}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {key}: {value}
                      <button
                        type="button"
                        onClick={() => removeVariable(key)}
                        className="ml-1 text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTopic ? "Update" : "Add"} Topic
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
