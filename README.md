# NATS Interface

A simple NATS message publisher based on post to manage servers, topics and variables.

## 🚀 Features

- **Server Management**: Add, configure, and manage multiple NATS servers
- **Topic Editor**: Create and manage topics with custom payloads and variables
- **Message Publishing**: Publish messages to NATS and JetStream with real-time feedback
- **Configuration Management**: Export and import NATS configurations
- **Real-time Connection Status**: Monitor connection health and server status
- **Modern UI**: Beautiful, responsive interface built with Radix UI components
- **Type Safety**: Full TypeScript support for better development experience

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nats-interface
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Server Management
1. Navigate to the "Servers" tab
2. Add your NATS server details (URL, credentials if needed)
3. Test the connection to ensure it's working
4. Select a server to connect to

### Topic & Payload Editor
1. Go to the "Topics & Payloads" tab
2. Create topics with custom payloads
3. Use variables in your payloads for dynamic content
4. Save and organize your topics for easy access

### Message Publishing
1. Select the "Publish" tab
2. Choose a topic from your saved topics
3. Customize the payload if needed
4. Publish messages to NATS or JetStream
5. Monitor publishing status and results

### Configuration Management
1. Access the "Configuration" tab
2. Export your current configuration for backup
3. Import configurations to restore settings
4. Share configurations with team members

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── message-publisher.tsx
│   ├── config-manager.tsx
│   ├── connection-status.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── nats-store.ts     # Zustand store
│   ├── nats-client.ts    # NATS client logic
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── styles/               # Additional styles
└── public/               # Static assets
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
