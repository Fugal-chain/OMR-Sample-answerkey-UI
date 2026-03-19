/**
 * Validates a single MCQ answer.
 * @param {string} value
 * @returns {string|null} error message or null
 */
export function validateMCQAnswer(value) {
  if (!value || !value.trim()) return 'Answer is required'
  if (!['A', 'B', 'C', 'D'].includes(value.toUpperCase())) {
    return 'Please select A, B, C, or D'
  }
  return null
}

/**
 * Validates a numeric answer string.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidNumeric(value) {
  if (!value || !value.trim()) return false
  return !isNaN(parseFloat(value)) && isFinite(value)
}

/**
 * Validates all questions and returns an error map.
 * @param {Array} questions
 * @returns {Object} { [questionNumber]: errorMessage }
 */
export function validateAllQuestions(questions) {
  const errors = {}

  questions.forEach((q) => {
    if (q.type === 'MCQ') {
      const err = validateMCQAnswer(q.answer)
      if (err) errors[q.questionNumber] = err
    } else if (q.type === 'Numeric') {
      if (!q.answers || q.answers.length === 0) {
        errors[q.questionNumber] = 'At least one numeric answer is required'
      }
    }
  })

  return errors
}

/**
 * Parses bulk import text into { questionNumber, answer } pairs.
 * Supports: "1:A", "1,A", "1 A", or sequential "A" formats.
 * @param {string} text
 * @param {{ allQuestionNumbers?: number[], sequentialQuestionNumbers?: number[] } | number[]} config
 * @returns {{ data: Array, error: string|null }}
 */
export function parseBulkImport(text, config) {
  try {
    const isLegacyArray = Array.isArray(config)
    const allowedQuestionNumbers = isLegacyArray
      ? config
      : Array.isArray(config?.allQuestionNumbers)
        ? config.allQuestionNumbers
        : []
    const sequentialQuestionNumbers = isLegacyArray
      ? allowedQuestionNumbers
      : Array.isArray(config?.sequentialQuestionNumbers)
        ? config.sequentialQuestionNumbers
        : allowedQuestionNumbers
    const allowedQuestionSet = new Set(allowedQuestionNumbers)
    const lines = text.trim().split('\n')
    const data = []

    if (!allowedQuestionNumbers.length) {
      return { data: [], error: 'No MCQ questions available for bulk import.' }
    }

    for (const line of lines) {
      if (!line.trim()) continue

      let questionNumber
      let answer

      if (line.includes(':')) {
        const [q, a] = line.split(':')
        questionNumber = parseInt(q.trim())
        answer = a.trim().toUpperCase()
      } else if (line.includes(',')) {
        const [q, a] = line.split(',')
        questionNumber = parseInt(q.trim())
        answer = a.trim().toUpperCase()
      } else if (/^\d+\s+\w+$/.test(line.trim())) {
        const parts = line.trim().split(/\s+/)
        questionNumber = parseInt(parts[0])
        answer = parts[1].toUpperCase()
      } else {
        // Sequential — map only onto the allowed target sequence
        questionNumber = sequentialQuestionNumbers[data.length]
        answer = line.trim().toUpperCase()
      }

      if (!questionNumber || !allowedQuestionSet.has(questionNumber)) {
        return { data: [], error: `Invalid question number: ${questionNumber}` }
      }

      const mcqError = validateMCQAnswer(answer)
      if (mcqError) {
        return { data: [], error: `Invalid answer for question ${questionNumber}. Use only A, B, C, or D.` }
      }

      data.push({ questionNumber, answer })
    }

    if (!data.length) {
      return { data: [], error: 'No valid data found. Please check the format.' }
    }

    return { data, error: null }
  } catch (e) {
    return { data: [], error: e.message || 'Invalid format.' }
  }
}
