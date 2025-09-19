"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, MessageCircle, Brain, BookOpen } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { SummarizationPanel } from "@/components/summarization-panel"
import { ChatbotPanel } from "@/components/chatbot-panel"
import { QuizPanel } from "@/components/quiz-panel"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileUpload = (file: File, text: string) => {
    setUploadedFile(file)
    setExtractedText(text)
    setActiveTab("summarize")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 logo" />
              <h1 className="text-2xl font-bold text-balance logo">AI Study Assistant</h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground hidden md:block">
                Upload, Summarize, Chat, and Quiz with your study materials
              </p>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="summarize" disabled={!uploadedFile} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summarize
            </TabsTrigger>
            <TabsTrigger value="chat" disabled={!uploadedFile} className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="quiz" disabled={!uploadedFile} className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Study Material
                </CardTitle>
                <CardDescription>
                  Upload a PDF of your textbook, notes, or syllabus to get started with AI-powered study assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>

            {uploadedFile && (
              <Card>
                <CardHeader>
                  <CardTitle>File Uploaded Successfully</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{uploadedFile.name}</span>
                    <span>({Math.round(uploadedFile.size / 1024)} KB)</span>
                  </div>
                  <Button onClick={() => setActiveTab("summarize")} className="mt-4">
                    Start Analyzing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="summarize">
            <SummarizationPanel text={extractedText} fileName={uploadedFile?.name || ""} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatbotPanel text={extractedText} fileName={uploadedFile?.name || ""} />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizPanel text={extractedText} fileName={uploadedFile?.name || ""} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
