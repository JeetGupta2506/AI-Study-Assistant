"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = [
    "What is the difference between prokaryotic and eukaryotic cells?",
    "Explain the process of photosynthesis",
    "What are the key principles of evolution?",
    "How does homeostasis work in living organisms?",
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const simulateAIResponse = (question: string): string => {
    const responses: { [key: string]: string } = {
      prokaryotic:
        "Great question! Prokaryotic and eukaryotic cells are the two main types of cells:\n\n**Prokaryotic cells:**\n- No membrane-bound nucleus\n- Genetic material freely floating in cytoplasm\n- Examples: bacteria and archaea\n- Generally smaller and simpler\n\n**Eukaryotic cells:**\n- Have a membrane-bound nucleus\n- Genetic material contained within nucleus\n- Examples: plant, animal, and fungal cells\n- Contain various organelles like mitochondria, ER, etc.",

      photosynthesis:
        "Photosynthesis is the process by which plants convert light energy into chemical energy. Here's how it works:\n\n**Overall equation:** 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\n**Two main stages:**\n1. **Light reactions** (in thylakoids): Capture light energy and produce ATP and NADPH\n2. **Calvin cycle** (in stroma): Use ATP and NADPH to convert CO₂ into glucose\n\n**Importance:** Forms the base of most food chains and produces the oxygen we breathe!",

      evolution:
        "Evolution is the change in heritable traits of biological populations over successive generations. Key principles include:\n\n**Natural Selection:**\n- Organisms with favorable traits survive and reproduce more\n- These traits become more common over time\n\n**Key mechanisms:**\n- Mutation: Creates genetic variation\n- Gene flow: Movement of genes between populations\n- Genetic drift: Random changes in gene frequencies\n- Selection: Differential survival and reproduction\n\n**Evidence:** Fossil record, comparative anatomy, molecular biology, and direct observation.",

      homeostasis:
        "Homeostasis is the maintenance of stable internal conditions despite external changes. Here's how it works:\n\n**Key components:**\n- **Sensor:** Detects changes in the environment\n- **Control center:** Processes information and determines response\n- **Effector:** Carries out the response\n\n**Examples:**\n- Body temperature regulation (sweating, shivering)\n- Blood glucose control (insulin, glucagon)\n- pH balance in blood\n- Water balance in cells\n\n**Feedback loops:** Usually negative feedback to maintain stability, occasionally positive feedback for specific processes.",
    }

    // Find the most relevant response based on keywords
    const lowerQuestion = question.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response
      }
    }

    // Default response
    return `Based on the content in "${fileName}", I can help explain that concept. The document covers various biological topics including cell structure, evolution, and metabolic processes. Could you be more specific about what aspect you'd like me to explain? I can break down complex concepts into simpler terms and provide examples to help with your understanding.`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: simulateAIResponse(inputValue),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Interactive Q&A Chatbot
          </CardTitle>
          <CardDescription>
            Ask questions about your study material and get instant AI-powered answers with explanations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              AI Assistant Active
            </Badge>
            <span className="text-sm text-muted-foreground">Analyzing: {fileName}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Chat with your document</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
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
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
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

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                Suggested questions:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your study material..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
