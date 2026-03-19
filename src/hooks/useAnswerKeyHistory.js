import { useState, useCallback, useEffect } from 'react'

function cloneQuestionsState(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Hook that manages answer key state with full undo/redo history.
 * @param {Array} initialState - Initial questions array
 * @returns {{ questions, setQuestions, undo, redo, canUndo, canRedo }}
 */
export function useAnswerKeyHistory(initialState) {
  const [state, setState] = useState(() => ({
    history: [cloneQuestionsState(initialState)],
    index: 0,
  }))

  const { history, index } = state
  const questions = history[index] ?? history[history.length - 1] ?? []

  useEffect(() => {
    setState({
      history: [cloneQuestionsState(initialState)],
      index: 0,
    })
  }, [initialState])

  const setQuestions = useCallback((nextQuestions) => {
    setState((prev) => {
      const currentQuestions =
        prev.history[prev.index] ?? prev.history[prev.history.length - 1] ?? []
      const resolvedQuestions =
        typeof nextQuestions === 'function'
          ? nextQuestions(currentQuestions)
          : nextQuestions
      const trimmedHistory = prev.history.slice(0, prev.index + 1)
      const nextHistory = [...trimmedHistory, cloneQuestionsState(resolvedQuestions)]

      return {
        history: nextHistory,
        index: nextHistory.length - 1,
      }
    })
  }, [])

  const undo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1),
    }))
  }, [])

  const redo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.min(prev.history.length - 1, prev.index + 1),
    }))
  }, [])

  const canUndo = index > 0
  const canRedo = index < history.length - 1

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

      if (ctrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      } else if (
        ctrlOrCmd &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  return { questions, setQuestions, undo, redo, canUndo, canRedo }
}
