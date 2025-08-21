"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNatsStore } from "@/lib/nats-store"
import { natsClient } from "@/lib/nats-client"
import { useToastContext } from "@/components/ui/toast-provider"
import { Headphones, Play, Square, MessageCircle, Clock, Move, X } from "lucide-react"

interface SubscriptionMessage {
  id: string
  timestamp: Date
  topic: string
  payload: string
  headers?: Record<string, string>
}

interface ActiveSubscription {
  id: string
  topic: string
  startTime: Date
  messageCount: number
  isActive: boolean
}

export function SubscriptionModal() {
  const { isConnected } = useNatsStore()
  const { toast } = useToastContext()
  const [isOpen, setIsOpen] = useState(false)
  const [subscriptionTopic, setSubscriptionTopic] = useState("")
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([])
  const [messages, setMessages] = useState<SubscriptionMessage[]>([])
  const [isSubscribing, setIsSubscribing] = useState(false)

  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart])

  const handleSubscribe = async () => {
    if (!isConnected || !subscriptionTopic.trim()) {
      toast({
        title: "Connection Required",
        description: "Please connect to NATS server and provide a topic",
        type: "error",
      })
      return
    }

    setIsSubscribing(true)
    try {
      const subscriptionId = crypto.randomUUID()
      const subscription: ActiveSubscription = {
        id: subscriptionId,
        topic: subscriptionTopic.trim(),
        startTime: new Date(),
        messageCount: 0,
        isActive: true,
      }

      setActiveSubscriptions((prev) => [...prev, subscription])

      await natsClient.subscribe(subscriptionTopic.trim(), (msg) => {
        const message: SubscriptionMessage = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          topic: subscriptionTopic.trim(),
          payload: msg.data ? new TextDecoder().decode(msg.data) : "",
          headers: msg.headers ? Object.fromEntries(msg.headers.entries()) : undefined,
        }

        setMessages((prev) => [message, ...prev.slice(0, 99)])
        setActiveSubscriptions((prev) =>
          prev.map((sub) => (sub.id === subscriptionId ? { ...sub, messageCount: sub.messageCount + 1 } : sub)),
        )
      })

      setSubscriptionTopic("")
      toast({
        title: "Subscription Active",
        description: `Successfully subscribed to ${subscriptionTopic.trim()}`,
        type: "success",
      })
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleUnsubscribe = async (subscriptionId: string, topic: string) => {
    try {
      await natsClient.unsubscribe(topic)
      setActiveSubscriptions((prev) =>
        prev.map((sub) => (sub.id === subscriptionId ? { ...sub, isActive: false } : sub)),
      )
      toast({
        title: "Unsubscribed",
        description: `Stopped subscription to ${topic}`,
        type: "info",
      })
    } catch (error) {
      toast({
        title: "Unsubscribe Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      })
    }
  }

  const clearMessages = () => {
    setMessages([])
    toast({
      title: "Messages Cleared",
      description: "All received messages have been cleared",
      type: "info",
    })
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Headphones className="h-4 w-4 mr-2" />
        Subscribe to Topic
      </Button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" />

      <div
        ref={modalRef}
        className="fixed z-50 bg-background border rounded-lg shadow-lg w-[800px] max-h-[600px] overflow-hidden flex flex-col"
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <div
          className="flex items-center justify-between p-4 border-b cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Topic Subscription</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          {/* Subscription Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="sub-topic" className="sr-only">
                    Topic
                  </Label>
                  <Input
                    id="sub-topic"
                    placeholder="user.events.* or specific.topic.name"
                    value={subscriptionTopic}
                    onChange={(e) => setSubscriptionTopic(e.target.value)}
                    disabled={!isConnected}
                  />
                </div>
                <Button onClick={handleSubscribe} disabled={!isConnected || isSubscribing || !subscriptionTopic.trim()}>
                  {isSubscribing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
              {!isConnected && (
                <p className="text-sm text-muted-foreground mt-2">Connect to a NATS server to enable subscriptions</p>
              )}
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeSubscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={sub.isActive ? "default" : "secondary"}>
                          {sub.isActive ? "Active" : "Stopped"}
                        </Badge>
                        <span className="font-mono text-sm">{sub.topic}</span>
                        <span className="text-xs text-muted-foreground">
                          {sub.messageCount} messages • {sub.startTime.toLocaleTimeString()}
                        </span>
                      </div>
                      {sub.isActive && (
                        <Button size="sm" variant="outline" onClick={() => handleUnsubscribe(sub.id, sub.topic)}>
                          <Square className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Received Messages ({messages.length})
                </CardTitle>
                {messages.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearMessages}>
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages received yet</p>
                  <p className="text-sm">Subscribe to a topic to start monitoring messages</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div key={msg.id} className="border rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{msg.topic}</span>
                          <span className="text-xs text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</span>
                        </div>
                        {msg.headers && Object.keys(msg.headers).length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium">Headers:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(msg.headers).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-muted p-2 rounded text-sm">
                          <pre className="font-mono whitespace-pre-wrap">{msg.payload}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
