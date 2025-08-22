import { ArrowLeftRight, Send, Zap } from "lucide-react";

export const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case "request":
      return <ArrowLeftRight className="h-3 w-3" />;
    case "jetstream":
      return <Zap className="h-3 w-3" />;
    default:
      return <Send className="h-3 w-3" />;
  }
};

export const getMessageTypeColor = (type: string) => {
  switch (type) {
    case "request":
      return "bg-blue-500";
    case "jetstream":
      return "bg-purple-500";
    default:
      return "bg-green-500";
  }
};
