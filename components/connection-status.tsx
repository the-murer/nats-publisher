"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNatsStore } from "@/lib/nats-store";
import { natsClient } from "@/lib/nats-client";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useState } from "react";

export function ConnectionStatus() {
  const {
    isConnected,
    currentServer,
    connectionError,
    setConnectionStatus,
    setCurrentServer,
  } = useNatsStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!currentServer) return;

    setIsConnecting(true);
    try {
      await natsClient.connect(currentServer.url, {
        seed: currentServer.seed,
        token: currentServer.token,
      });
      setConnectionStatus(true);
    } catch (error) {
      setConnectionStatus(
        false,
        error instanceof Error ? error.message : "Connection failed"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await natsClient.disconnect();
    setConnectionStatus(false);
  };

  if (!currentServer) {
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <WifiOff className="h-3 w-3" />
        No Server Selected
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={
          isConnected
            ? "default"
            : connectionError
            ? "destructive"
            : "secondary"
        }
        className="flex items-center gap-2"
      >
        {isConnecting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isConnecting
          ? "Connecting..."
          : isConnected
          ? "Connected"
          : "Disconnected"}
      </Badge>

      {currentServer && (
        <span className="text-sm text-muted-foreground">
          {currentServer.name}
        </span>
      )}

      {isConnected ? (
        <Button size="sm" variant="outline" onClick={handleDisconnect}>
          Disconnect
        </Button>
      ) : (
        <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
          Connect
        </Button>
      )}

      {connectionError && (
        <span className="text-sm text-destructive">{connectionError}</span>
      )}
    </div>
  );
}
