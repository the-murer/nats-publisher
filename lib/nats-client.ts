import {
  connect,
  type NatsConnection,
  type Msg,
  type JetStreamManager,
  type JetStreamClient,
} from "nats.ws";

export class NatsClient {
  private connection: NatsConnection | null = null;
  private jetstream: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;

  async connect(
    url: string,
    options?: {
      username?: string;
      password?: string;
      token?: string;
    }
  ): Promise<void> {
    try {
      const connectOptions: any = {
        servers: [url],
      };

      // if (options?.username && options?.password) {
      //   connectOptions.user = options.username
      //   connectOptions.pass = options.password
      // }

      // if (options?.token) {
      //   connectOptions.token = options.token
      // }

      this.connection = await connect(connectOptions);
      this.jetstream = this.connection.jetstream();
      this.jsm = await this.connection.jetstreamManager();

      console.log("[v0] Connected to NATS server:", url);
    } catch (error) {
      console.error("[v0] Failed to connect to NATS:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.jetstream = null;
      this.jsm = null;
      console.log("[v0] Disconnected from NATS");
    }
  }

  async publish(subject: string, data: string | Uint8Array): Promise<void> {
    if (!this.connection) throw new Error("Not connected to NATS server");

    const payload =
      typeof data === "string" ? new TextEncoder().encode(data) : data;
    this.connection.publish(subject, payload);
    console.log("[v0] Published message to subject:", subject);
  }

  async request(subject: string, data: string | Uint8Array): Promise<any> {
    if (!this.connection) throw new Error("Not connected to NATS server");

    const reply = await this.connection.request(subject, data, {
      timeout: 5000,
    });

    const response = await reply.json();
    console.log("[v0] Received response from subject:", subject, response);
    return response;
  }

  async publishJetStream(
    subject: string,
    data: string | Uint8Array,
    streamName?: string
  ): Promise<void> {
    if (!this.jetstream) {
      throw new Error("JetStream not available - not connected to NATS server");
    }

    const payload =
      typeof data === "string" ? new TextEncoder().encode(data) : data;

    try {
      const ack = await this.jetstream.publish(subject, payload);
      console.log("[v0] Published JetStream message:", {
        subject,
        stream: ack.stream,
        seq: ack.seq,
      });
    } catch (error) {
      console.error("[v0] JetStream publish failed:", error);
      throw error;
    }
  }

  async subscribe(
    subject: string,
    callback: (msg: Msg) => void
  ): Promise<void> {
    if (!this.connection) {
      throw new Error("Not connected to NATS server");
    }

    const subscription = this.connection.subscribe(subject);

    for await (const msg of subscription) {
      callback(msg);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && !this.connection.isClosed();
  }

  getConnection(): NatsConnection | null {
    return this.connection;
  }

  getJetStream(): JetStreamClient | null {
    return this.jetstream;
  }

  getJetStreamManager(): JetStreamManager | null {
    return this.jsm;
  }
}

// Singleton instance
export const natsClient = new NatsClient();
