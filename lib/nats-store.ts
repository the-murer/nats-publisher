import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface NatsServer {
  id: string
  name: string
  url: string
  username?: string
  password?: string
  token?: string
  isActive: boolean
}

export interface TopicConfig {
  id: string
  name: string
  topic: string
  payload: string
  variables: Record<string, string>
  messageType: "publish" | "request" | "jetstream"
  responseTopic?: string
  isJetStream: boolean
  streamName?: string
}

export interface NatsConfig {
  servers: NatsServer[]
  topics: TopicConfig[]
  variables: Record<string, string>
  exportedAt?: string
}

interface NatsStore {
  // Connection state
  isConnected: boolean
  currentServer: NatsServer | null
  connectionError: string | null

  // Data
  servers: NatsServer[]
  topics: TopicConfig[]
  globalVariables: Record<string, string>

  // Actions
  setConnectionStatus: (connected: boolean, error?: string) => void
  setCurrentServer: (server: NatsServer | null) => void

  // Server management
  addServer: (server: Omit<NatsServer, "id">) => void
  updateServer: (id: string, updates: Partial<NatsServer>) => void
  deleteServer: (id: string) => void

  // Topic management
  addTopic: (topic: Omit<TopicConfig, "id">) => void
  updateTopic: (id: string, updates: Partial<TopicConfig>) => void
  deleteTopic: (id: string) => void

  // Variable management
  setGlobalVariable: (key: string, value: string) => void
  deleteGlobalVariable: (key: string) => void

  // Configuration
  exportConfig: () => NatsConfig
  importConfig: (config: NatsConfig) => void
  clearAll: () => void
}

export const useNatsStore = create<NatsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      currentServer: null,
      connectionError: null,
      servers: [],
      topics: [],
      globalVariables: {},

      // Connection actions
      setConnectionStatus: (connected, error) => set({ isConnected: connected, connectionError: error || null }),

      setCurrentServer: (server) => set({ currentServer: server }),

      // Server management
      addServer: (serverData) =>
        set((state) => ({
          servers: [...state.servers, { ...serverData, id: crypto.randomUUID(), isActive: false }],
        })),

      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((server) => (server.id === id ? { ...server, ...updates } : server)),
        })),

      deleteServer: (id) =>
        set((state) => ({
          servers: state.servers.filter((server) => server.id !== id),
          currentServer: state.currentServer?.id === id ? null : state.currentServer,
        })),

      // Topic management
      addTopic: (topicData) =>
        set((state) => ({
          topics: [...state.topics, { ...topicData, id: crypto.randomUUID() }],
        })),

      updateTopic: (id, updates) =>
        set((state) => ({
          topics: state.topics.map((topic) => (topic.id === id ? { ...topic, ...updates } : topic)),
        })),

      deleteTopic: (id) =>
        set((state) => ({
          topics: state.topics.filter((topic) => topic.id !== id),
        })),

      // Variable management
      setGlobalVariable: (key, value) =>
        set((state) => ({
          globalVariables: { ...state.globalVariables, [key]: value },
        })),

      deleteGlobalVariable: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.globalVariables
          return { globalVariables: rest }
        }),

      // Configuration
      exportConfig: () => {
        const state = get()
        return {
          servers: state.servers,
          topics: state.topics,
          variables: state.globalVariables,
          exportedAt: new Date().toISOString(),
        }
      },

      importConfig: (config) =>
        set({
          servers: config.servers || [],
          topics: config.topics || [],
          globalVariables: config.variables || {},
        }),

      clearAll: () =>
        set({
          servers: [],
          topics: [],
          globalVariables: {},
          currentServer: null,
          isConnected: false,
          connectionError: null,
        }),
    }),
    {
      name: "nats-interface-storage",
      partialize: (state) => ({
        servers: state.servers,
        topics: state.topics,
        globalVariables: state.globalVariables,
      }),
    },
  ),
)
