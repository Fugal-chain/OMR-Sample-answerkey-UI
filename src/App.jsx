import { useCallback, useEffect, useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { Toaster } from 'react-hot-toast'
import { getQuizDefinitions } from './api/omrSheetsApi.js'
import { AnswerKeyProvider, useAnswerKey } from './context/AnswerKeyContext.jsx'
import { TopBar } from './components/TopBar/index.js'
import { QuizSelector } from './components/QuizSelector/index.js'
import { TagSidebar } from './components/TagSidebar/index.js'
import { AnswerTagCard } from './components/TagSidebar/DraggableTag.jsx'
import { AnswerKeySetup } from './components/AnswerKeySetup/index.js'
import { AIChatbot } from './components/AIChatbot/index.js'
import { BulkImportDialog } from './components/BulkImportDialog/index.js'

/**
 * Inner app — consumes the AnswerKeyContext.
 */
function AppContent() {
  const { saveAnswers, getAnswers, savedAnswers } = useAnswerKey()
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [inSetupMode, setInSetupMode] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [activeTag, setActiveTag] = useState(null)
  const [bulkImportPayload, setBulkImportPayload] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true)
  const [quizLoadError, setQuizLoadError] = useState('')

  /* ---- lifted undo/redo for TopBar ---- */
  const [undoRedoFns, setUndoRedoFns] = useState(null)
  const handleUndoRedoReady = useCallback((fns) => {
    setUndoRedoFns(fns)
  }, [])

  /* ---- autosave status for TopBar ---- */
  const [autosaveStatus, setAutosaveStatus] = useState({ state: 'idle', savedAt: null })
  const handleAutosaveStatus = useCallback((status) => {
    setAutosaveStatus(status)
  }, [])

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
    setUndoRedoFns(null)
    setAutosaveStatus({ state: 'idle', savedAt: null })
  }

  const handleBack = () => {
    setSelectedQuiz(null)
    setInSetupMode(false)
    setUndoRedoFns(null)
    setAutosaveStatus({ state: 'idle', savedAt: null })
  }

  const handleSave = (answers) => {
    saveAnswers(selectedQuiz.id, answers)
  }

  const savedAnswerKey = selectedQuiz ? getAnswers(selectedQuiz.id) : null

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
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Toaster position="top-right" toastOptions={{ duration: 2600 }} />
      {/* Sticky top navigation bar */}
      <TopBar
        selectedQuiz={inSetupMode ? selectedQuiz : null}
        undoRedoFns={inSetupMode ? undoRedoFns : null}
        autosaveStatus={inSetupMode ? autosaveStatus : null}
      />

      {/* Page content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 28px' }}>
        {!inSetupMode ? (
          /* ── Step 1: Quiz selection ── */
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
          /* ── Step 2: 2-column answer-key layout ── */
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={clearDragState}
            onDragCancel={clearDragState}
          >
            {/* Mobile chatbot — collapsible at top */}
            <div className="mobile-chatbot-container">
              <AIChatbot collapsible defaultCollapsed />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: 20,
              alignItems: 'start',
            }} className="setup-grid">
              {/* Left — Answer-option drag tags + Chatbot */}
              <div className="sidebar-column">
                <TagSidebar />
              </div>

              {/* Centre — Answer key editor */}
              <div>
                <AnswerKeySetup
                  quiz={selectedQuiz}
                  savedQuestions={savedAnswerKey}
                  bulkImportPayload={bulkImportPayload}
                  onBulkImportApplied={() => setBulkImportPayload(null)}
                  onBack={handleBack}
                  onSave={handleSave}
                  onBulkImport={() => setBulkOpen(true)}
                  onUndoRedoReady={handleUndoRedoReady}
                  onAutosaveStatus={handleAutosaveStatus}
                />
              </div>
            </div>
            <DragOverlay>
              {activeTag ? <AnswerTagCard tag={activeTag} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Bulk-import modal */}
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

/**
 * App root — wraps everything in the AnswerKey context provider.
 */
export default function App() {
  return (
    <AnswerKeyProvider>
      <AppContent />
    </AnswerKeyProvider>
  )
}
