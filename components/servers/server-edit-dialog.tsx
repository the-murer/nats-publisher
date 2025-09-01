"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNatsStore, type NatsServer } from "@/lib/nats-store";

interface ServerFormData {
  name: string;
  url: string;
  seed: string;
  token: string;
}

interface ServerEditDialogProps {
  server: NatsServer;
  onClose: () => void;
}

export function ServerEditDialog({ server, onClose }: ServerEditDialogProps) {
  const { updateServer } = useNatsStore();
  const [formData, setFormData] = useState<ServerFormData>({
    name: server.name,
    url: server.url,
    seed: server.seed || "",
    token: server.token || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.url.trim()) {
      return;
    }

    const serverData = {
      name: formData.name.trim(),
      url: formData.url.trim(),
      seed: formData.seed.trim() || undefined,
      token: formData.token.trim() || undefined,
      isActive: server.isActive,
    };

    updateServer(server.id, serverData);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
            <DialogDescription>
              Update your NATS server connection details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name *</Label>
              <Input
                id="name"
                placeholder="Production NATS"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Server URL *</Label>
              <Input
                id="url"
                placeholder="ws://localhost:8080"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed</Label>
              <Input
                id="seed"
                placeholder="Optional"
                value={formData.seed}
                onChange={(e) =>
                  setFormData({ ...formData, seed: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                placeholder="Optional"
                value={formData.token}
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Server</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
