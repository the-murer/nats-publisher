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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNatsStore, type NatsServer } from "@/lib/nats-store";
import { Plus } from "lucide-react";

interface ServerFormData {
  name: string;
  url: string;
  seed: string;
  token: string;
}

const initialFormData: ServerFormData = {
  name: "",
  url: "",
  seed: "",
  token: "",
};

interface ServerFormProps {
  editingServer?: NatsServer | null;
  onClose?: () => void;
}

export function ServerForm({ editingServer, onClose }: ServerFormProps) {
  const { addServer, updateServer } = useNatsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ServerFormData>(
    editingServer
      ? {
          name: editingServer.name,
          url: editingServer.url,
          seed: editingServer.seed || "",
          token: editingServer.token || "",
        }
      : initialFormData
  );

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
      isActive: false,
    };

    if (editingServer) {
      updateServer(editingServer.id, serverData);
    } else {
      addServer(serverData);
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    onClose?.();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingServer ? "Edit Server" : "Add New Server"}
            </DialogTitle>
            <DialogDescription>
              Configure your NATS server connection details
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
              <Label htmlFor="username">Seed</Label>
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
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="submit">
              {editingServer ? "Update" : "Add"} Server
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
