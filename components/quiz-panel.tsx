"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Brain, CheckCircle, XCircle, RotateCcw, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
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

  const sampleQuiz: Question[] = [
    {
      id: "1",
      question: "What is the basic unit of life according to cell theory?",
      options: ["Atom", "Molecule", "Cell", "Tissue"],
      correctAnswer: 2,
      explanation:
        "According to cell theory, the cell is the basic unit of life. All living organisms are composed of one or more cells.",
    },
    {
      id: "2",
      question: "Which process do plants use to convert sunlight into energy?",
      options: ["Cellular respiration", "Photosynthesis", "Fermentation", "Glycolysis"],
      correctAnswer: 1,
      explanation:
        "Photosynthesis is the process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen.",
    },
    {
      id: "3",
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic reticulum"],
      correctAnswer: 2,
      explanation:
        "Mitochondria are called the powerhouse of the cell because they produce ATP, the energy currency of the cell.",
    },
    {
      id: "4",
      question: "Which type of cells have a membrane-bound nucleus?",
      options: ["Prokaryotic cells", "Eukaryotic cells", "Both types", "Neither type"],
      correctAnswer: 1,
      explanation:
        "Eukaryotic cells have a membrane-bound nucleus, while prokaryotic cells have their genetic material freely floating in the cytoplasm.",
    },
    {
      id: "5",
      question: "What is homeostasis?",
      options: [
        "The process of cell division",
        "The maintenance of stable internal conditions",
        "The breakdown of glucose",
        "The formation of proteins",
      ],
      correctAnswer: 1,
      explanation:
        "Homeostasis is the process by which living organisms maintain stable internal conditions despite changes in their external environment.",
    },
  ]

  const generateQuiz = async () => {
    setIsGenerating(true)

    // Simulate AI quiz generation
    setTimeout(() => {
      setQuiz(sampleQuiz)
      setIsGenerating(false)
      setCurrentQuestionIndex(0)
      setSelectedAnswers({})
      setShowResults(false)
      setQuizCompleted(false)
    }, 3000)
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
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
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
      if (selectedAnswers[index] === question.correctAnswer) {
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
      content += `   Correct Answer: ${String.fromCharCode(97 + question.correctAnswer)}) ${question.options[question.correctAnswer]}\n`
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Quiz Generator
          </CardTitle>
          <CardDescription>
            Generate practice questions and flashcards based on your study material to test your knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{fileName}</span>
            <Badge variant="secondary">Ready for quiz generation</Badge>
          </div>

          {!quiz && (
            <Button onClick={generateQuiz} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Practice Quiz
                </>
              )}
            </Button>
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
                <h3 className="text-lg font-semibold leading-relaxed">{currentQuestion.question}</h3>

                <RadioGroup
                  value={selectedAnswers[currentQuestionIndex]?.toString()}
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
                const isCorrect = userAnswer === question.correctAnswer

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
                                  <span className="text-green-600">{question.options[question.correctAnswer]}</span>
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
