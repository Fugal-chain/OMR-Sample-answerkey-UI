import { useCallback, useEffect, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { Toaster } from 'react-hot-toast'
import { getQuizDefinitions, saveQuizAnswerKey } from './api/omrSheetsApi.js'
import { AnswerKeyProvider, useAnswerKey } from './context/AnswerKeyContext.jsx'
import { useMediaQuery } from './hooks/useMediaQuery.js'
import { useOmrTour } from './hooks/useOmrTour.js'
import { TopBar } from './components/TopBar/index.js'
import { QuizSelector } from './components/QuizSelector/index.js'
import { TagSidebar } from './components/TagSidebar/index.js'
import { AnswerTagCard } from './components/TagSidebar/DraggableTag.jsx'
import { AnswerKeySetup } from './components/AnswerKeySetup/index.js'
import { AIChatbot } from './components/AIChatbot/index.js'
import { BulkImportDialog } from './components/BulkImportDialog/index.js'

function AppContent() {
  const { saveAnswers, getAnswerRecord, savedAnswers } = useAnswerKey()
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [inSetupMode, setInSetupMode] = useState(false)
  const [editorControls, setEditorControls] = useState(null)
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', savedAt: null, scope: null })
  const [bulkOpen, setBulkOpen] = useState(false)
  const [activeTag, setActiveTag] = useState(null)
  const [bulkImportPayload, setBulkImportPayload] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true)
  const [quizLoadError, setQuizLoadError] = useState('')
  const isTabletOrBelow = useMediaQuery('(max-width: 768px)')
  const { startTour } = useOmrTour(inSetupMode)

  useEffect(() => {
    let isMounted = true

    async function loadQuizzes() {
      try {
        setIsLoadingQuizzes(true)
        setQuizLoadError('')
        const nextQuizzes = await getQuizDefinitions()
        if (isMounted) setQuizzes(nextQuizzes)
      } catch (error) {
        if (isMounted) {
          setQuizLoadError(error.message || 'Failed to load OMR sheets.')
        }
      } finally {
        if (isMounted) setIsLoadingQuizzes(false)
      }
    }

    loadQuizzes()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setInSetupMode(true)
    setSaveStatus({ state: 'idle', savedAt: null, scope: null })
  }

  const handleBack = () => {
    setSelectedQuiz(null)
    setInSetupMode(false)
    setEditorControls(null)
    setSaveStatus({ state: 'idle', savedAt: null, scope: null })
  }

  const handleDraftSave = useCallback((answers) => {
    if (selectedQuiz?.id == null) return

    saveAnswers(selectedQuiz.id, answers, { source: 'local-draft' })
    setSaveStatus({
      state: 'draft-saved',
      savedAt: Date.now(),
      scope: 'local',
    })
  }, [saveAnswers, selectedQuiz?.id])

  const handlePersist = useCallback(async (answers) => {
    if (selectedQuiz?.id == null) {
      throw new Error('No quiz is selected.')
    }

    setSaveStatus({ state: 'syncing', savedAt: null, scope: 'database' })
    const payload = await saveQuizAnswerKey(selectedQuiz.id, answers)
    saveAnswers(selectedQuiz.id, answers, { source: 'database' })
    setSaveStatus({
      state: 'saved',
      savedAt: Date.now(),
      scope: 'database',
    })
    return payload
  }, [saveAnswers, selectedQuiz?.id])

  const selectedAnswerRecord = selectedQuiz ? getAnswerRecord(selectedQuiz.id) : null
  const savedAnswerKey = selectedAnswerRecord?.source === 'local-draft' ? selectedAnswerRecord.questions : null

  const handleDragStart = (event) => {
    const tag = event.active?.data?.current?.tag ?? null
    setActiveTag(tag)
  }

  const clearDragState = () => {
    setActiveTag(null)
  }

  const handleBulkImport = (entries) => {
    setBulkImportPayload({
      quizId: selectedQuiz?.id ?? null,
      entries,
      appliedAt: Date.now(),
    })
    setBulkOpen(false)
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" toastOptions={{ duration: 2600 }} />
      <TopBar
        selectedQuiz={inSetupMode ? selectedQuiz : null}
        saveStatus={inSetupMode ? saveStatus : null}
        editorControls={inSetupMode ? editorControls : null}
      />

      <main className="app-main">
        {inSetupMode === false ? (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-gray-900)' }}>
                Enter Answer Key
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginTop: 6 }}>
                Select a quiz below to begin entering or editing the correct answers.
              </p>
            </div>

            <QuizSelector
              quizzes={quizzes}
              selectedQuiz={selectedQuiz}
              savedAnswers={savedAnswers}
              isLoading={isLoadingQuizzes}
              error={quizLoadError}
              onSelectQuiz={handleSelectQuiz}
            />
          </div>
        ) : (
          <DndContext
            onDragStart={isTabletOrBelow ? undefined : handleDragStart}
            onDragEnd={isTabletOrBelow ? undefined : clearDragState}
            onDragCancel={isTabletOrBelow ? undefined : clearDragState}
          >
            <div className="setup-layout">
              {isTabletOrBelow === false && (
                <div className="setup-sidebar-stack">
                  <div className="fixed-drag-panel">
                    <TagSidebar />
                  </div>
                  <div className="fixed-chatbot-panel">
                    <AIChatbot variant="desktop" />
                  </div>
                </div>
              )}

              <div className="setup-main-column">
                {isTabletOrBelow && <AIChatbot variant="mobile" />}
                <AnswerKeySetup
                  quiz={selectedQuiz}
                  savedQuestions={savedAnswerKey}
                  bulkImportPayload={bulkImportPayload}
                  onBulkImportApplied={() => setBulkImportPayload(null)}
                  onBack={handleBack}
                  onSave={handleDraftSave}
                  onPersist={handlePersist}
                  onBulkImport={() => setBulkOpen(true)}
                  onStartTour={startTour}
                  onSaveStatusChange={setSaveStatus}
                  onRegisterNavbarActions={setEditorControls}
                  enableDragDrop={isTabletOrBelow === false}
                />
              </div>
            </div>
            <DragOverlay>
              {isTabletOrBelow === false && activeTag ? <AnswerTagCard tag={activeTag} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <BulkImportDialog
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        mcqQuestionNumbers={
          selectedQuiz?.omrConfiguration
            ?.filter((question) => question.type === 'MCQ')
            .map((question) => question.questionNumber) ?? []
        }
        existingAnsweredQuestionNumbers={
          (savedAnswerKey ?? [])
            .filter((question) => question.type === 'MCQ' && question.answer)
            .map((question) => question.questionNumber)
        }
        onImport={handleBulkImport}
      />
    </div>
  )
}

export default function App() {
  return (
    <AnswerKeyProvider>
      <AppContent />
    </AnswerKeyProvider>
  )
}
