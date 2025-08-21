"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNatsStore } from "@/lib/nats-store"
import { Variable } from "lucide-react"

export function GlobalVariables() {
  const { globalVariables, setGlobalVariable, deleteGlobalVariable } = useNatsStore()
  const [newGlobalKey, setNewGlobalKey] = useState("")
  const [newGlobalValue, setNewGlobalValue] = useState("")

  const addGlobalVariable = () => {
    if (newGlobalKey.trim() && newGlobalValue.trim()) {
      setGlobalVariable(newGlobalKey.trim(), newGlobalValue.trim())
      setNewGlobalKey("")
      setNewGlobalValue("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Variable className="h-5 w-5" />
          Global Variables
        </CardTitle>
        <CardDescription>
          Variables available across all topics. Use {"{{variableName}}"} syntax in topics and payloads to substitute
          values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Variable name (e.g., userId)"
            value={newGlobalKey}
            onChange={(e) => setNewGlobalKey(e.target.value)}
          />
          <Input
            placeholder="Variable value (e.g., user123)"
            value={newGlobalValue}
            onChange={(e) => setNewGlobalValue(e.target.value)}
          />
          <Button onClick={addGlobalVariable}>Add</Button>
        </div>
        {Object.keys(globalVariables).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(globalVariables).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {value}
                <button onClick={() => deleteGlobalVariable(key)} className="ml-1 text-xs hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
