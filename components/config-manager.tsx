"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useNatsStore } from "@/lib/nats-store"
import {
  Download,
  Upload,
  Trash2,
  Database,
  Server,
  MessageSquare,
  Variable,
  FileText,
  AlertTriangle,
} from "lucide-react"

export function ConfigManager() {
  const { servers, topics, globalVariables, exportConfig, importConfig, clearAll } = useNatsStore()
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const config = exportConfig()
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nats-config-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const config = JSON.parse(text)

      // Validate config structure
      if (!config || typeof config !== "object") {
        throw new Error("Invalid configuration file format")
      }

      importConfig(config)
      alert("Configuration imported successfully!")
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClearAll = () => {
    clearAll()
  }

  const getStorageSize = () => {
    try {
      const data = localStorage.getItem("nats-interface-storage")
      return data ? new Blob([data]).size : 0
    } catch {
      return 0
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const storageSize = getStorageSize()

  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuration Summary
          </CardTitle>
          <CardDescription>Overview of your current NATS configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Server className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{servers.length}</div>
                <div className="text-sm text-muted-foreground">Servers</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{topics.length}</div>
                <div className="text-sm text-muted-foreground">Topics</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Variable className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{Object.keys(globalVariables).length}</div>
                <div className="text-sm text-muted-foreground">Variables</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{formatBytes(storageSize)}</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Servers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Servers</CardTitle>
          </CardHeader>
          <CardContent>
            {servers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No servers configured</p>
            ) : (
              <div className="space-y-2">
                {servers.map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className="font-medium text-sm">{server.name}</div>
                      <div className="text-xs text-muted-foreground">{server.url}</div>
                    </div>
                    {server.isActive && <Badge variant="default">Active</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No topics configured</p>
            ) : (
              <div className="space-y-2">
                {topics.slice(0, 5).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className="font-medium text-sm">{topic.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{topic.topic}</div>
                    </div>
                    {topic.isJetStream && (
                      <Badge variant="default" className="text-xs">
                        JS
                      </Badge>
                    )}
                  </div>
                ))}
                {topics.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center">
                    ... and {topics.length - 5} more topics
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Global Variables */}
      {Object.keys(globalVariables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Global Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(globalVariables).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="font-mono text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Export/Import Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuration Management
          </CardTitle>
          <CardDescription>Export, import, and manage your NATS configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="space-y-3">
              <h4 className="font-medium">Export Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Download your current configuration as a JSON file for backup or sharing.
              </p>
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Configuration
              </Button>
            </div>

            {/* Import */}
            <div className="space-y-3">
              <h4 className="font-medium">Import Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Load a previously exported configuration file. This will merge with your current settings.
              </p>
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="w-full bg-transparent"
                disabled={isImporting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Importing..." : "Import Configuration"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Import configuration file"
              />
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h4 className="font-medium text-destructive">Danger Zone</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Permanently delete all your configuration data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full md:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Configuration Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your servers, topics, variables, and settings. This action cannot
                    be undone.
                    <br />
                    <br />
                    Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                    Yes, Clear All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• Export your configuration regularly as a backup</div>
          <div>• Use variables in payloads with the syntax: {`{{variable_name}}`}</div>
          <div>• JetStream topics require a stream name for proper publishing</div>
          <div>• Test connections before publishing to ensure server availability</div>
          <div>• Configuration files can be shared between different instances</div>
        </CardContent>
      </Card>
    </div>
  )
}
