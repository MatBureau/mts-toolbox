'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Question {
  A: string
  B: string
  C: string
  D: string
  E: string
  F: string
  G: string
  answer: string
  explanation: string
  question: string
  question_id: string
}

export default function QuizCEH() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load questions from JSON
    fetch('/ceh-questions.json')
      .then(res => res.json())
      .then(data => {
        setAllQuestions(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading questions:', err)
        setLoading(false)
      })
  }, [])

  const startQuiz = (count: number) => {
    // Shuffle and select random questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)
    setSelectedQuestions(selected)
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setScore(0)
    setQuizFinished(false)
  }

  const handleAnswerSelect = (answer: string) => {
    if (!showResult) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return

    const currentQuestion = selectedQuestions[currentQuestionIndex]
    const correct = selectedAnswer === currentQuestion.answer

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer('')
      setShowResult(false)
      setIsCorrect(false)
    } else {
      setQuizFinished(true)
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setQuizFinished(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer('')
    setShowResult(false)
    setScore(0)
  }

  const getAnswerOptions = (question: Question) => {
    const options = []
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

    for (const letter of letters) {
      const value = question[letter as keyof Question]
      if (value && typeof value === 'string' && value.trim() !== '') {
        options.push({ letter, value })
      }
    }

    return options
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Chargement des questions...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz CEH - Certified Ethical Hacker (v12)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Entraînez-vous pour l'examen de certification CEH avec {allQuestions.length} questions
              officielles. Choisissez le nombre de questions que vous souhaitez pratiquer :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <button
                onClick={() => startQuiz(10)}
                className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">10 Questions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quiz rapide</div>
              </button>

              <button
                onClick={() => startQuiz(50)}
                className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <div className="text-4xl mb-2">📚</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">50 Questions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Entraînement moyen</div>
              </button>

              <button
                onClick={() => startQuiz(125)}
                className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <div className="text-4xl mb-2">🎓</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">125 Questions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Examen complet</div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📌 À propos de ce quiz</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Questions tirées de l'examen CEH version 12</li>
                <li>• Les questions sont présentées de manière aléatoire</li>
                <li>• Chaque question a une seule bonne réponse</li>
                <li>• Des explications sont fournies pour certaines questions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizFinished) {
    const percentage = Math.round((score / selectedQuestions.length) * 100)
    const passed = percentage >= 70

    return (
      <Card>
        <CardHeader>
          <CardTitle>Résultats du Quiz CEH</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {score} / {selectedQuestions.length}
            </div>
            <div className="text-2xl text-gray-600 dark:text-gray-400 mb-6">
              {percentage}%
            </div>

            <div className={`inline-block px-6 py-3 rounded-lg text-lg font-semibold ${
              passed
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
            }`}>
              {passed ? '✓ Réussi (≥70%)' : '✗ Échec (<70%)'}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={resetQuiz}>
              Nouveau Quiz
            </Button>
            <Button
              onClick={() => {
                setQuizFinished(false)
                setCurrentQuestionIndex(0)
                setScore(0)
                setSelectedAnswer('')
                setShowResult(false)
              }}
              variant="secondary"
            >
              Recommencer ce quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex]
  const answerOptions = getAnswerOptions(currentQuestion)
  const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Counter */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Question {currentQuestionIndex + 1} / {selectedQuestions.length}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {answerOptions.map(({ letter, value }) => (
              <button
                key={letter}
                onClick={() => handleAnswerSelect(letter)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === letter
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                } ${
                  showResult && letter === currentQuestion.answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : ''
                } ${
                  showResult && selectedAnswer === letter && letter !== currentQuestion.answer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : ''
                } ${
                  showResult ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[24px]">
                    {letter}.
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">{value}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className={`p-4 rounded-lg ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`font-semibold mb-2 ${
                isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {isCorrect ? '✓ Correct !' : '✗ Incorrect'}
              </div>

              {!isCorrect && (
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  La bonne réponse est : <strong>{currentQuestion.answer}</strong>
                </div>
              )}

              {currentQuestion.explanation && (
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    📖 Explication :
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {currentQuestion.explanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!showResult ? (
              <>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="flex-1"
                >
                  Valider la réponse
                </Button>
                <Button
                  onClick={resetQuiz}
                  variant="secondary"
                >
                  Quitter
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex-1"
              >
                {currentQuestionIndex < selectedQuestions.length - 1 ? 'Question suivante →' : 'Voir les résultats'}
              </Button>
            )}
          </div>

          {/* Score Display */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            Score actuel : {score} / {currentQuestionIndex + (showResult ? 1 : 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
