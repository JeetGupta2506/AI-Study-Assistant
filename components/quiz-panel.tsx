"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Brain, CheckCircle, XCircle, RotateCcw, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

interface QuizPanelProps {
  text: string
  fileName: string
}

export function QuizPanel({ text, fileName }: QuizPanelProps) {
  const [quiz, setQuiz] = useState<Question[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
    const [numQuestions, setNumQuestions] = useState(5)

  const generateQuiz = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const response = await api.generateQuiz(text, numQuestions)
      if (!response.questions || !Array.isArray(response.questions)) {
        throw new Error('Invalid quiz format received from server')
      }
      setQuiz(response.questions)
      setCurrentQuestionIndex(0)
      setSelectedAnswers({})
      setShowResults(false)
      setQuizCompleted(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz'
      setError(message)
      setQuiz(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (quiz?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      // Force radio group to reset selection
      const radioGroup = document.querySelector('input[type="radio"]:checked') as HTMLInputElement;
      if (radioGroup) {
        radioGroup.checked = false;
      }
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      // Force radio group to reset selection
      const radioGroup = document.querySelector('input[type="radio"]:checked') as HTMLInputElement;
      if (radioGroup) {
        radioGroup.checked = false;
      }
    }
  }

  const submitQuiz = () => {
    setShowResults(true)
    setQuizCompleted(true)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(false)
  }

  const calculateScore = () => {
    if (!quiz) return 0
    let correct = 0
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++
      }
    })
    return Math.round((correct / quiz.length) * 100)
  }

  const downloadQuiz = () => {
    if (!quiz) return

    let content = `Quiz - ${fileName}\n\n`
    quiz.forEach((question, index) => {
      content += `${index + 1}. ${question.question}\n`
      question.options.forEach((option, optIndex) => {
        content += `   ${String.fromCharCode(97 + optIndex)}) ${option}\n`
      })
      content += `   Correct Answer: ${String.fromCharCode(97 + question.correct_answer)}) ${question.options[question.correct_answer]}\n`
      content += `   Explanation: ${question.explanation}\n\n`
    })

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(".pdf", "")}_quiz.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentQuestion = quiz?.[currentQuestionIndex]
  const progress = quiz ? ((currentQuestionIndex + 1) / quiz.length) * 100 : 0
  const score = calculateScore()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Brain className="h-5 w-5" />
            AI Quiz Generator
          </CardTitle>
          <CardDescription className="text-center">
            Generate practice questions and flashcards based on your study material to test your knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{fileName}</span>
            <Badge variant="secondary">Ready for quiz generation</Badge>
          </div>

          {!quiz && (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="mb-4 flex items-center gap-2 justify-center">
                <Label htmlFor="num-questions" className="font-medium">Number of Questions:</Label>
                <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(Number(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 10, 15, 20].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center">
                <Button onClick={generateQuiz} disabled={isGenerating} className="w-48 bg-sky-500 text-white hover:bg-sky-600">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      Generate Practice Quiz
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {quiz && !showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Practice Quiz</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={downloadQuiz} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Badge variant="outline">
                  Question {currentQuestionIndex + 1} of {quiz.length}
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>

          <CardContent className="space-y-6">
            {currentQuestion && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold leading-relaxed text-center">{currentQuestion.question}</h3>

                <RadioGroup
                  key={`question-${currentQuestionIndex}`} // Force re-render on question change
                  value={showResults ? selectedAnswers[currentQuestionIndex]?.toString() : undefined}
                  onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, Number.parseInt(value))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button onClick={previousQuestion} disabled={currentQuestionIndex === 0} variant="outline">
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === quiz.length - 1 ? (
                  <Button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length !== quiz.length}>
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} disabled={selectedAnswers[currentQuestionIndex] === undefined}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && quiz && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quiz Results</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={resetQuiz} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                <Badge variant={score >= 70 ? "default" : "destructive"} className="text-lg px-3 py-1">
                  {score}%
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className={score >= 70 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CheckCircle className={`h-4 w-4 ${score >= 70 ? "text-green-600" : "text-red-600"}`} />
              <AlertDescription className={score >= 70 ? "text-green-800" : "text-red-800"}>
                {score >= 70
                  ? `Great job! You scored ${score}% on this quiz. You have a solid understanding of the material.`
                  : `You scored ${score}%. Consider reviewing the material and trying again to improve your understanding.`}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">Detailed Results:</h3>
              {quiz.map((question, index) => {
                const userAnswer = selectedAnswers[index]
                const isCorrect = userAnswer === question.correct_answer

                return (
                  <Card
                    key={question.id}
                    className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{question.question}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Your answer:</span>{" "}
                                <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                  {question.options[userAnswer]}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p>
                                  <span className="text-muted-foreground">Correct answer:</span>{" "}
                                  <span className="text-green-600">{question.options[question.correct_answer]}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-md p-3 ml-7">
                          <p className="text-sm text-muted-foreground">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}