"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Lightbulb, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatbotPanelProps {
  text: string
  fileName: string
}

export function ChatbotPanel({ text, fileName }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI study assistant. I've analyzed your document "${fileName}" and I'm ready to answer any questions you have about the content. Feel free to ask me about specific concepts, definitions, or relationships between topics!`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [useStreaming, setUseStreaming] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue;
    setInputValue("")
    setIsTyping(true)

    // Create a temporary message for the assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      if (useStreaming) {
        await api.sendChatMessageStream(
          currentInput, 
          text,
          // On chunk received
          (chunk: string) => {
            setMessages((prev) => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + chunk }
                : msg
            ))
          },
          // On completion
          () => {
            setIsTyping(false)
          },
          // On error
          (error: string) => {
            setMessages((prev) => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: "I apologize, but I encountered an error while processing your request. Please try again." }
                : msg
            ))
            setIsTyping(false)
            console.error('Error in chat:', error)
          }
        )
      } else {
        // Use regular non-streaming API
        const response = await api.sendChatMessage(currentInput, text)
        setMessages((prev) => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: response.content }
            : msg
        ))
        setIsTyping(false)
      }
    } catch (error) {
      setMessages((prev) => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: "I apologize, but I encountered an error while processing your request. Please try again." }
          : msg
      ))
      setIsTyping(false)
      console.error('Error in chat:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <MessageCircle className="h-5 w-5" />
            Interactive Q&A Chatbot
          </CardTitle>
          <CardDescription className="text-center">
            Ask questions about your study material and get instant AI-powered answers with explanations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              AI Assistant Active
            </Badge>
            <span className="text-sm text-muted-foreground">Analyzing: {fileName}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Switch
              id="chat-streaming"
              checked={useStreaming}
              onCheckedChange={setUseStreaming}
            />
            <Label htmlFor="chat-streaming" className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              Streaming
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="h-[600px] flex flex-col bg-background rounded-lg">
        <div className="flex-1 flex flex-col p-0">
          {/* Messages with scrollable area */}
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                          em: ({node, ...props}) => <em className="italic" {...props} />,
                          code: ({node, ...props}) => <code className="bg-muted rounded px-1" {...props} />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input - Fixed to bottom */}
          <div className="sticky bottom-0 bg-background border-t p-4">
            <div className="flex gap-2 w-full">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your study material..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} size="icon" className="bg-sky-500 text-white hover:bg-sky-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}