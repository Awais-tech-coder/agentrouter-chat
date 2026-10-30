export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type ChatSession = {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  updatedAt: number;
};
