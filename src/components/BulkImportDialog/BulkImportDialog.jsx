import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import toast from 'react-hot-toast'
import { Modal } from '../ui/index.js'
import { parseBulkImport } from '../../utils/validation.js'

/**
 * BulkImportDialog — modal for pasting / typing answers in bulk.
 *
 * Supported formats:
 *   1:A  |  1,A  |  1 A  |  A (sequential)
 */
export function BulkImportDialog({
  isOpen,
  onClose,
  onImport,
  mcqQuestionNumbers = [],
  existingAnsweredQuestionNumbers = [],
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [showImportChoice, setShowImportChoice] = useState(false)
  const maxMcqCount = mcqQuestionNumbers.length
  const hasExistingAnswers = existingAnsweredQuestionNumbers.length > 0
  const unansweredQuestionNumbers = mcqQuestionNumbers.filter(
    (questionNumber) => !existingAnsweredQuestionNumbers.includes(questionNumber)
  )

  const resetDialogState = () => {
    setText('')
    setError('')
    setShowImportChoice(false)
  }

  const applyImport = (mode) => {
    const parserConfig =
      mode === 'continue'
        ? {
            allQuestionNumbers: mcqQuestionNumbers,
            sequentialQuestionNumbers: unansweredQuestionNumbers,
          }
        : {
            allQuestionNumbers: mcqQuestionNumbers,
            sequentialQuestionNumbers: mcqQuestionNumbers,
          }

    if (mode === 'continue' && unansweredQuestionNumbers.length === 0) {
      const message = 'All MCQ questions already have answers. Clear or change some answers before continuing import.'
      setError(message)
      toast.error(message)
      return
    }

    const { data, error: parseError } = parseBulkImport(text, parserConfig)
    if (parseError) {
      setError(parseError)
      toast.error(parseError)
      return
    }

    const finalData =
      mode === 'continue'
        ? data.filter(
            (entry) => !existingAnsweredQuestionNumbers.includes(entry.questionNumber)
          )
        : data

    if (!finalData.length) {
      const message = 'All imported answers target questions that already have answers.'
      setError(message)
      toast.error(message)
      return
    }

    if (mode === 'continue' && finalData.length < data.length) {
      toast.success(`Imported ${finalData.length} new answers and skipped previously filled MCQ questions.`)
    }

    onImport(finalData)
    resetDialogState()
    onClose()
  }

  const handleImport = () => {
    setError('')
    if (hasExistingAnswers) {
      setShowImportChoice(true)
      return
    }

    applyImport('restart')
  }

  const handleClose = () => { resetDialogState(); onClose() }

  const handleTextChange = (nextValue) => {
    setError('')
    setShowImportChoice(false)

    const lines = nextValue.split('\n')
    const nonEmptyLineCount = lines.filter((line) => line.trim()).length

    if (nonEmptyLineCount > maxMcqCount) {
      toast.error(`You can import only ${maxMcqCount} MCQ answers for this sheet.`)

      const trimmedLines = []
      let acceptedCount = 0

      for (const line of lines) {
        if (!line.trim()) {
          trimmedLines.push(line)
          continue
        }

        if (acceptedCount < maxMcqCount) {
          trimmedLines.push(line)
          acceptedCount += 1
        }
      }

      setText(trimmedLines.join('\n'))
      return
    }

    setText(nextValue)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Answers"
      subtitle="Import multiple answers at once"
      icon="📤"
      maxWidth={560}
    >
      {showImportChoice ? (
        <div>
          <div style={{
            marginBottom: 16,
            padding: '14px 16px',
            borderRadius: 12,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontSize: 13,
            lineHeight: 1.6,
          }}>
            Existing bulk-imported or manually entered MCQ answers were found.
            <br />
            Choose how you want this new import to behave.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => applyImport('restart')}
              style={choiceButtonStyle}
            >
              <strong>Start from the first question again</strong>
              <span style={choiceHintStyle}>
                Import from the beginning of the MCQ list and overwrite matching questions.
              </span>
            </button>

            <button
              onClick={() => applyImport('continue')}
              style={choiceButtonStyle}
            >
              <strong>Continue with unanswered questions only</strong>
              <span style={choiceHintStyle}>
                Skip MCQ questions that already have answers and import only the remaining ones.
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              onClick={() => setShowImportChoice(false)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: '2px solid var(--color-gray-200)',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                color: 'var(--color-gray-700)',
              }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Format guide */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: 14,
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 8 }}>
              Supported formats:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                ['1:A', 'question number : answer'],
                ['1,A', 'question number , answer'],
                ['1 A', 'question number (space) answer'],
                ['A / B / C / D', 'sequential MCQ answers (one per line)'],
              ].map(([code, desc]) => (
                <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1e40af' }}>
                  <span style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', flexShrink: 0 }} />
                  <code style={{ background: '#dbeafe', padding: '1px 7px', borderRadius: 5, fontWeight: 600 }}>{code}</code>
                  <span style={{ color: '#2563eb' }}>— {desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            fontSize: 12,
            color: '#92400e',
            lineHeight: 1.55,
          }}>
            Bulk import supports only MCQ questions.
            <br />
            Maximum allowed entries: <strong>{maxMcqCount}</strong>
          </div>

          <div style={{ marginTop: 4 }}>
            <div style={{
              border: `2px solid ${error ? '#fca5a5' : 'var(--color-gray-200)'}`,
              borderRadius: 10,
              overflow: 'hidden',
              transition: 'border-color 0.15s',
              background: '#fff',
            }}>
              <CodeMirror
                value={text}
                onChange={handleTextChange}
                placeholder={'1:A\n2:B\n3:C\n4:D\n...'}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  highlightActiveLine: false,
                  highlightActiveLineGutter: false,
                  autocompletion: false,
                  syntaxHighlighting: false,
                }}
                extensions={[EditorView.lineWrapping]}
                theme="light"
                height="220px"
                style={{
                  fontSize: 14,
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--color-red)' }}>⚠️ {error}</p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button
              onClick={handleClose}
              style={{
                padding: '10px 20px', borderRadius: 10,
                border: '2px solid var(--color-gray-200)',
                background: '#fff', cursor: 'pointer', fontWeight: 600,
                fontSize: 13, color: 'var(--color-gray-700)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!text.trim()}
              style={{
                padding: '10px 22px', borderRadius: 10,
                border: 'none', background: 'var(--color-primary)',
                color: '#fff', cursor: !text.trim() ? 'not-allowed' : 'pointer', fontWeight: 700,
                fontSize: 13, boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                opacity: !text.trim() ? 0.5 : 1,
              }}
            >
              Apply Import
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

const choiceButtonStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '2px solid var(--color-gray-200)',
  background: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  color: 'var(--color-gray-800)',
}

const choiceHintStyle = {
  fontSize: 12,
  color: 'var(--color-gray-500)',
  lineHeight: 1.5,
}
