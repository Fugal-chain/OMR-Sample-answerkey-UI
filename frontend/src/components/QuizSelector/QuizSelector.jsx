import { Badge } from '../ui/index.js'

function isQuestionAnswered(question) {
  if (question?.type === 'MCQ') return Boolean(question.answer)
  return Array.isArray(question?.answers) && question.answers.some((answer) => String(answer).trim())
}

function getQuizStatus(quiz, savedQuestions) {
  if (!Array.isArray(savedQuestions)) {
    return quiz.hasAnswerKey
      ? { label: '✅ Completed', variant: 'success' }
      : { label: '⭕ No Answer Key', variant: 'default' }
  }

  const answeredCount = savedQuestions.filter(isQuestionAnswered).length

  if (answeredCount === 0) {
    return { label: '⭕ No Answer Key', variant: 'default' }
  }

  if (answeredCount >= quiz.totalQuestions) {
    return { label: '✅ Completed', variant: 'success' }
  }

  return {
    label: `🟡 Partially Done (${answeredCount}/${quiz.totalQuestions})`,
    variant: 'warning',
  }
}

/**
 * QuizSelector — Step 1 screen.
 * Displays a list of quizzes; user picks one to enter the answer key.
 */
export function QuizSelector({
  quizzes,
  selectedQuiz,
  onSelectQuiz,
  savedAnswers = {},
  isLoading = false,
  error = '',
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid var(--color-gray-200)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '2px solid var(--color-gray-200)',
        background: 'linear-gradient(135deg, var(--color-gray-50), #fff)',
      }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: 'var(--color-gray-900)' }}>
          Select Quiz
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 4 }}>
          Choose a quiz to enter or edit its answer key
        </p>
      </div>

      {/* Quiz list */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading && (
          <div style={{
            padding: 24,
            borderRadius: 14,
            border: '2px dashed var(--color-gray-200)',
            textAlign: 'center',
            color: 'var(--color-gray-500)',
            fontSize: 14,
            fontWeight: 600,
          }}>
            Loading OMR sheets...
          </div>
        )}

        {!isLoading && error && (
          <div style={{
            padding: 18,
            borderRadius: 14,
            border: '2px solid #fca5a5',
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: 13,
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {!isLoading && !error && quizzes.length === 0 && (
          <div style={{
            padding: 24,
            borderRadius: 14,
            border: '2px dashed var(--color-gray-200)',
            textAlign: 'center',
            color: 'var(--color-gray-500)',
            fontSize: 14,
            fontWeight: 600,
          }}>
            No OMR sheets available.
          </div>
        )}

        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            status={getQuizStatus(quiz, savedAnswers[quiz.id]?.questions)}
            isSelected={selectedQuiz?.id === quiz.id}
            onSelect={() => onSelectQuiz(quiz)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * QuizCard — individual selectable quiz row.
 */
function QuizCard({ quiz, status, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 18,
        borderRadius: 14,
        border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
        background: isSelected ? '#eff6ff' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = '#93c5fd'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-gray-200)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Icon */}
        <div style={{
          padding: 10,
          background: 'var(--color-primary-light)',
          borderRadius: 12,
          flexShrink: 0,
          fontSize: 20,
        }}>
          📄
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-gray-900)' }}>
            {quiz.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 2 }}>
            {quiz.subject}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {quiz.date ? (
              <MetaChip icon="📅">
                {quiz.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </MetaChip>
            ) : (
              <MetaChip icon="🆔">{quiz.examId}</MetaChip>
            )}
            <MetaChip icon="📝">{quiz.totalQuestions} Questions</MetaChip>
            <Badge variant="primary">OMR Configured</Badge>
          </div>
        </div>

        {/* Status */}
        <div style={{ flexShrink: 0 }}>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>
    </button>
  )
}

function MetaChip({ icon, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-gray-500)' }}>
      <span>{icon}</span>
      {children}
    </span>
  )
}
