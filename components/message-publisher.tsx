"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TopicConfig, useNatsStore } from "@/lib/nats-store";
import { natsClient } from "@/lib/nats-client";
import { TopicSelector } from "@/components/publisher/topic-selector";
import { CustomPublisher } from "@/components/publisher/custom-publisher";
import { PublishHistory } from "@/components/publisher/publish-history";
import { SubscriptionModal } from "@/components/publisher/subscription-modal";
import {
  Send,
  Clock,
  AlertCircle,
  ArrowLeftRight,
  Zap,
  Edit,
} from "lucide-react";
import { TopicEditDialog } from "./topics/topic-edit-dialog";

interface PublishLog {
  id: string;
  timestamp: Date;
  topic: string;
  payload: string;
  messageType: "publish" | "request" | "jetstream";
  responseTopic?: string;
  streamName?: string;
  status: "success" | "error" | "waiting";
  error?: string;
  response?: string;
  responseTime?: number;
  isJetStream?: boolean;
  ackInfo?: {
    stream: string;
    seq: number;
  };
}

export function MessagePublisher() {
  const { topics, globalVariables, isConnected, currentServer } =
    useNatsStore();
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [customPayload, setCustomPayload] = useState("{}");
  const [customResponseTopic, setCustomResponseTopic] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMessageType, setCustomMessageType] = useState<
    "publish" | "request" | "jetstream"
  >("publish");
  const [isJetStream, setIsJetStream] = useState(false);
  const [streamName, setStreamName] = useState("");
  const [localVariables, setLocalVariables] = useState<Record<string, string>>(
    {}
  );
  const [publishLogs, setPublishLogs] = useState<PublishLog[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicConfig | null>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  // Update local variables when topic changes
  useEffect(() => {
    if (selectedTopic) {
      setLocalVariables({ ...selectedTopic.variables });
      setIsJetStream(selectedTopic.isJetStream);
      setStreamName(selectedTopic.streamName || "");
    }
  }, [selectedTopic]);

  const resolvePayload = (
    payload: string,
    localVars: Record<string, string>
  ) => {
    const allVars = { ...globalVariables, ...localVars };
    return payload.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVars[key] || match;
    });
  };

  const handlePublish = async () => {
    if (!isConnected || !currentServer) {
      alert("Please connect to a NATS server first");
      return;
    }

    const topic = isCustomMode ? customTopic : selectedTopic?.topic;
    const payload = isCustomMode ? customPayload : selectedTopic?.payload;
    const messageType = isCustomMode
      ? customMessageType
      : selectedTopic?.messageType || "publish";
    const responseTopic = isCustomMode
      ? customResponseTopic
      : selectedTopic?.responseTopic;

    if (!topic || !payload) {
      alert("Please provide both topic and payload");
      return;
    }

    setIsPublishing(true);
    const startTime = Date.now();

    const logEntry: PublishLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      topic: isCustomMode ? topic : resolvePayload(topic, localVariables),
      payload: isCustomMode ? payload : resolvePayload(payload, localVariables),
      messageType,
      responseTopic: responseTopic
        ? isCustomMode
          ? responseTopic
          : resolvePayload(responseTopic, localVariables)
        : undefined,
      isJetStream:
        messageType === "jetstream" ||
        (isCustomMode ? isJetStream : selectedTopic?.isJetStream || false),
      streamName: isCustomMode ? streamName : selectedTopic?.streamName,
      status: messageType === "request" ? "waiting" : "success",
    };

    try {
      const resolvedTopic = isCustomMode
        ? topic
        : resolvePayload(topic, localVariables);
      const resolvedPayload = isCustomMode
        ? payload
        : resolvePayload(payload, localVariables);

      if (messageType === "request") {
        // Request-response pattern
        const response = await natsClient.request(
          resolvedTopic,
          resolvedPayload
        );
        logEntry.response = response;
        logEntry.responseTime = Date.now() - startTime;
        logEntry.status = "success";
        console.log("[v0] NATS request completed successfully");
      } else if (messageType === "jetstream" || logEntry.isJetStream) {
        // JetStream publish
        await natsClient.publishJetStream(
          resolvedTopic,
          resolvedPayload,
          logEntry.streamName
        );
        console.log("[v0] JetStream message published successfully");

        if (logEntry.responseTopic) {
          console.log(
            "[v0] Listening for responses on:",
            logEntry.responseTopic
          );
        }
      } else {
        // Regular publish
        await natsClient.publish(resolvedTopic, resolvedPayload);
        console.log("[v0] NATS message published successfully");

        if (logEntry.responseTopic) {
          console.log(
            "[v0] Listening for responses on:",
            logEntry.responseTopic
          );
        }
      }

      setPublishLogs((prev) => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
    } catch (error) {
      logEntry.status = "error";
      logEntry.error = error instanceof Error ? error.message : "Unknown error";
      logEntry.responseTime = Date.now() - startTime;
      setPublishLogs((prev) => [logEntry, ...prev.slice(0, 49)]);
      console.error("[v0] Publish failed:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const updateLocalVariable = (key: string, value: string) => {
    setLocalVariables((prev) => ({ ...prev, [key]: value }));
  };

  const clearLogs = () => {
    setPublishLogs([]);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "request":
        return <ArrowLeftRight className="h-3 w-3" />;
      case "jetstream":
        return <Zap className="h-3 w-3" />;
      default:
        return <Send className="h-3 w-3" />;
    }
  };

  const handleEdit = (topic: TopicConfig) => {
    setEditingTopic(topic);
  };

  const handleCloseEdit = () => {
    setEditingTopic(null);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-orange-800 dark:text-orange-200">
              Not connected to NATS server. Please connect to a server first.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Publisher Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Message Publisher
              </CardTitle>
              <CardDescription>
                Publish messages, make requests, or send JetStream messages to
                NATS topics
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <SubscriptionModal />
              {selectedTopic && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(selectedTopic)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <Label htmlFor="custom-mode" className="text-sm">
                  Custom Mode
                </Label>
                <Switch
                  id="custom-mode"
                  checked={isCustomMode}
                  onCheckedChange={setIsCustomMode}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCustomMode ? (
            <CustomPublisher
              topic={customTopic}
              onTopicChange={setCustomTopic}
              payload={customPayload}
              onPayloadChange={setCustomPayload}
              messageType={customMessageType}
              onMessageTypeChange={(type) => {
                setCustomMessageType(type);
                setIsJetStream(type === "jetstream");
              }}
              responseTopic={customResponseTopic}
              onResponseTopicChange={setCustomResponseTopic}
              streamName={streamName}
              onStreamNameChange={setStreamName}
            />
          ) : (
            <TopicSelector
              selectedTopicId={selectedTopicId}
              onTopicChange={setSelectedTopicId}
              localVariables={localVariables}
              onVariableChange={updateLocalVariable}
            />
          )}

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handlePublish}
              disabled={
                !isConnected ||
                isPublishing ||
                (!isCustomMode && !selectedTopic)
              }
            >
              {isPublishing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {isCustomMode
                    ? customMessageType === "request"
                      ? "Waiting for response..."
                      : "Publishing..."
                    : selectedTopic?.messageType === "request"
                    ? "Waiting for response..."
                    : "Publishing..."}
                </>
              ) : (
                <>
                  {isCustomMode
                    ? getMessageTypeIcon(customMessageType)
                    : getMessageTypeIcon(
                        selectedTopic?.messageType || "publish"
                      )}
                  <span className="ml-2">
                    {isCustomMode
                      ? customMessageType === "request"
                        ? "Send Request"
                        : customMessageType === "jetstream"
                        ? "Publish to JetStream"
                        : "Publish Message"
                      : selectedTopic?.messageType === "request"
                      ? "Send Request"
                      : selectedTopic?.messageType === "jetstream"
                      ? "Publish to JetStream"
                      : "Publish Message"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PublishHistory logs={publishLogs} onClearLogs={clearLogs} />
      {editingTopic && (
        <TopicEditDialog topic={editingTopic} onClose={handleCloseEdit} />
      )}
    </div>
  );
}
