"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import {
  getMessageTypeIcon,
  getMessageTypeColor,
} from "@/lib/topics/topic-utils";

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

interface PublishHistoryProps {
  logs: PublishLog[];
  onClearLogs: () => void;
}

export function PublishHistory({ logs, onClearLogs }: PublishHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message History
            </CardTitle>
            <CardDescription>
              Recent messaging activity with responses
            </CardDescription>
          </div>
          {logs.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearLogs}>
              Clear History
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages sent yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : log.status === "waiting" ? (
                        <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-mono text-sm">{log.topic}</span>
                      <Badge
                        className={`flex items-center gap-1 text-white ${getMessageTypeColor(
                          log.messageType
                        )}`}
                      >
                        {getMessageTypeIcon(log.messageType)}
                        {log.messageType.toUpperCase()}
                      </Badge>
                      {log.isJetStream && log.messageType !== "jetstream" && (
                        <Badge
                          variant="default"
                          className="flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          JS
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {log.responseTime && <span>{log.responseTime}ms</span>}
                      <span>{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {log.streamName && (
                    <div className="text-xs text-muted-foreground">
                      Stream: {log.streamName}
                    </div>
                  )}
                  {log.responseTopic && (
                    <div className="text-xs text-muted-foreground">
                      Response Topic: {log.responseTopic}
                    </div>
                  )}

                  {log.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {log.error}
                    </div>
                  )}

                  {log.response && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-green-700">
                        Response:
                      </div>
                      <div className="bg-green-50 p-2 rounded text-sm">
                        <pre className="font-mono whitespace-pre-wrap">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View Payload
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
                      {log.payload}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
