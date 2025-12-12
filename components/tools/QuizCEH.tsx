'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Image from 'next/image'

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
  media: string
  version: string
}

export default function QuizCEH() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<string>('12')

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

  const getQuestionCountByVersion = () => {
    return allQuestions.filter(q => q.version === selectedVersion).length
  }

  const startQuiz = (count: number) => {
    // Filter questions by selected version
    const filteredByVersion = allQuestions.filter(q => q.version === selectedVersion)

    if (filteredByVersion.length === 0) {
      alert(`Aucune question disponible pour la version ${selectedVersion}`)
      return
    }

    // Shuffle and select random questions
    const shuffled = [...filteredByVersion].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    setSelectedQuestions(selected)
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setScore(0)
    setQuizFinished(false)
  }

  const isMultipleAnswer = (question: Question) => {
    return question.answer.includes(' ')
  }

  const getCorrectAnswers = (question: Question): string[] => {
    return question.answer.split(' ').filter(a => a.trim() !== '')
  }

  const handleAnswerToggle = (answer: string) => {
    if (showResult) return

    const currentQuestion = selectedQuestions[currentQuestionIndex]
    const isMultiple = isMultipleAnswer(currentQuestion)

    if (isMultiple) {
      // Multiple choice: toggle selection
      if (selectedAnswers.includes(answer)) {
        setSelectedAnswers(selectedAnswers.filter(a => a !== answer))
      } else {
        setSelectedAnswers([...selectedAnswers, answer])
      }
    } else {
      // Single choice: replace selection
      setSelectedAnswers([answer])
    }
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswers.length === 0) return

    const currentQuestion = selectedQuestions[currentQuestionIndex]
    const correctAnswers = getCorrectAnswers(currentQuestion)

    // Check if selected answers match correct answers
    const isCorrectAnswer =
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every(a => correctAnswers.includes(a)) &&
      correctAnswers.every(a => selectedAnswers.includes(a))

    setIsCorrect(isCorrectAnswer)
    setShowResult(true)

    if (isCorrectAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswers([])
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
    setSelectedAnswers([])
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
    const availableCount = getQuestionCountByVersion()

    return (
      <div className="space-y-6">
        {/* Hidden SEO content */}
        <div className="sr-only" aria-hidden="true">
          <h1>Quiz CEH Gratuit - Entraînement Certification Certified Ethical Hacker</h1>
          <p>
            Préparez-vous gratuitement à l'examen CEH (Certified Ethical Hacker) avec notre quiz d'entraînement en ligne.
            Test gratuit CEH, questions d'examen CEH gratuites, préparation CEH sans frais, quiz ethical hacker gratuit.
            Entraînement CEH v8, v9, v10, v11, v12 100% gratuit. Test blanc CEH, examen blanc CEH gratuit en ligne.
            Questions CEH officielles gratuites, pratique CEH sans inscription, quiz cybersécurité gratuit.
            Formation CEH gratuite, entraînement ethical hacking gratuit, test CEH en français gratuit.
            Préparation examen CEH gratuitement, quiz piratage éthique gratuit, certification CEH préparation gratuite.
            Questions type examen CEH gratuites, simulation CEH gratuite, exercices CEH sans abonnement.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz CEH Gratuit - Certified Ethical Hacker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              Entraînez-vous <strong>gratuitement</strong> pour l'examen de certification CEH avec {allQuestions.length} questions
              officielles. Sélectionnez la version et le nombre de questions :
            </p>

            {/* Version Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                📚 Version CEH
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors"
              >
                <option value="8">CEH v8</option>
                <option value="9">CEH v9</option>
                <option value="10">CEH v10</option>
                <option value="11">CEH v11</option>
                <option value="12">CEH v12</option>
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {availableCount} questions disponibles pour la version {selectedVersion}
              </p>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                🎯 Nombre de questions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => startQuiz(10)}
                  disabled={availableCount < 10}
                  className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">10 Questions</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quiz rapide gratuit</div>
                </button>

                <button
                  onClick={() => startQuiz(50)}
                  disabled={availableCount < 50}
                  className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-4xl mb-2">📚</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">50 Questions</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Entraînement moyen gratuit</div>
                </button>

                <button
                  onClick={() => startQuiz(125)}
                  disabled={availableCount < 125}
                  className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-4xl mb-2">🎓</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">125 Questions</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Examen complet gratuit</div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📌 À propos de ce quiz gratuit</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>100% gratuit</strong> - Questions tirées des examens CEH v8 à v12</li>
                <li>• Questions à choix unique et multiple gérées automatiquement</li>
                <li>• Les questions sont présentées de manière aléatoire</li>
                <li>• Des explications et images sont fournies pour certaines questions</li>
                <li>• Aucune inscription requise - Entraînement CEH entièrement gratuit</li>
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
          <CardTitle>Résultats du Quiz CEH v{selectedVersion} Gratuit</CardTitle>
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
              Nouveau Quiz Gratuit
            </Button>
            <Button
              onClick={() => {
                setQuizFinished(false)
                setCurrentQuestionIndex(0)
                setScore(0)
                setSelectedAnswers([])
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
  const isMultiple = isMultipleAnswer(currentQuestion)
  const correctAnswers = getCorrectAnswers(currentQuestion)

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
        Question {currentQuestionIndex + 1} / {selectedQuestions.length} • CEH v{selectedVersion}
        {isMultiple && <span className="ml-2 text-orange-600 dark:text-orange-400 font-semibold">• Réponses multiples</span>}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
          {isMultiple && (
            <div className="mt-2 text-sm text-orange-600 dark:text-orange-400 font-semibold">
              ⚠️ Cette question a plusieurs bonnes réponses. Sélectionnez toutes les réponses correctes.
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Image */}
          {currentQuestion.media && (
            <div className="my-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <img
                src={`/ceh_media/${currentQuestion.media}`}
                alt="Question illustration"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {answerOptions.map(({ letter, value }) => {
              const isSelected = selectedAnswers.includes(letter)
              const isCorrectAnswer = correctAnswers.includes(letter)
              const showAsCorrect = showResult && isCorrectAnswer
              const showAsWrong = showResult && isSelected && !isCorrectAnswer

              return (
                <button
                  key={letter}
                  onClick={() => handleAnswerToggle(letter)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected && !showResult
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  } ${
                    showAsCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : ''
                  } ${
                    showAsWrong
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : ''
                  } ${
                    showResult ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isMultiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={showResult}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    )}
                    <span className="font-bold text-gray-700 dark:text-gray-300 min-w-[24px]">
                      {letter}.
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 flex-1">{value}</span>
                    {showAsCorrect && <span className="text-green-600 dark:text-green-400 font-bold">✓</span>}
                    {showAsWrong && <span className="text-red-600 dark:text-red-400 font-bold">✗</span>}
                  </div>
                </button>
              )
            })}
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
                  {isMultiple ? (
                    <>
                      Les bonnes réponses sont : <strong>{correctAnswers.join(', ')}</strong>
                    </>
                  ) : (
                    <>
                      La bonne réponse est : <strong>{currentQuestion.answer}</strong>
                    </>
                  )}
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
                  disabled={selectedAnswers.length === 0}
                  className="flex-1"
                >
                  Valider {isMultiple ? `(${selectedAnswers.length} sélectionnée${selectedAnswers.length > 1 ? 's' : ''})` : ''}
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
