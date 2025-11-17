"use client";

import { useState, useRef, useEffect } from "react";
import { grammarApi, type Grammar } from "@/lib/api/grammar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiZap, FiSend } from "react-icons/fi";
import { Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIExplanationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grammar: Grammar;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIExplanationDialog({ open, onOpenChange, grammar }: AIExplanationDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage when dialog opens
  useEffect(() => {
    if (open && grammar.id) {
      const storageKey = `grammar-chat-${grammar.id}`;
      const savedMessages = localStorage.getItem(storageKey);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Error loading saved messages:", e);
        }
      }
    }
  }, [open, grammar.id]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && grammar.id) {
      const storageKey = `grammar-chat-${grammar.id}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, grammar.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExplainGrammar = async () => {
    if (isLoading) return;
    
    // Add user message first
    const userMessage = "Explicar esta gramática";
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Add loading placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

    try {
      // Build context with previous messages (excluding the loading placeholder)
      const context = messages
        .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
        .join("\n\n");

      const response = await grammarApi.ask(grammar.id, userMessage, context);
      
      // Replace loading placeholder with actual response
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: "assistant", content: response };
        return newMessages;
      });
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: "Error: No se pudo obtener la explicación. Verifica que la API Key esté configurada."
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Add loading placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

    try {
      // Build context with previous messages (excluding the loading placeholder)
      const context = messages
        .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
        .join("\n\n");

      const response = await grammarApi.ask(grammar.id, userMessage, context);
      
      // Replace loading placeholder with actual response
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: "assistant", content: response };
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: "Error: No se pudo procesar tu pregunta."
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear input when dialog closes
  useEffect(() => {
    if (!open) {
      setInput("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-[#FFFDFB]/95 backdrop-blur-sm border-2 border-[#191918]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#191918]" />
            Explicación con IA - {grammar.name}
          </DialogTitle>
          <DialogDescription>
            Chat con Gemini AI sobre esta gramática formal
          </DialogDescription>
        </DialogHeader>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border-2 border-[#191918] bg-[#F5F1ED]">
          {messages.length === 0 && !isLoading && (
            <div className="flex justify-end">
              <button
                onClick={handleExplainGrammar}
                className="max-w-[80%] rounded-2xl p-4 bg-[#191918] text-white hover:bg-[#2D2925] transition-colors cursor-pointer border-2 border-[#191918]"
              >
                <div className="text-sm leading-relaxed flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Explicar esta gramática
                </div>
              </button>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-[#191918] text-white"
                    : "bg-white border-2 border-[#191918]"
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-70">
                  {message.role === "user" ? "Tú" : "Gemini AI"}
                </div>
                {message.role === "assistant" ? (
                  message.content === "..." ? (
                    <div className="text-sm leading-relaxed flex items-center gap-1">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Pregunta algo sobre esta gramática..."
            disabled={isLoading}
            className="flex-1 bg-[#F5F1ED] border-[#191918]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-[#191918] hover:bg-[#2D2925] text-white"
            size="icon"
          >
            <FiSend className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
