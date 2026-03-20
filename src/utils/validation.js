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

export function parseNumericValues(value) {
  return String(value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function validateNumericAnswers(answers = []) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return 'At least one numeric answer is required'
  }

  const seenValues = new Set()

  for (const answer of answers) {
    const trimmedAnswer = String(answer ?? '').trim()

    if (!isValidNumeric(trimmedAnswer)) {
      return 'Enter a valid number (e.g. 42 or 3.14)'
    }

    if (seenValues.has(trimmedAnswer)) {
      return 'Duplicate values are not allowed'
    }

    seenValues.add(trimmedAnswer)
  }

  return null
}

export function validateNumericInputValue(value, answers = []) {
  const parsedValues = parseNumericValues(value)
  if (!parsedValues.length) return null

  const existingValues = new Set(
    answers.map((answer) => String(answer ?? '').trim()).filter(Boolean)
  )
  const pendingValues = new Set()

  for (const answer of parsedValues) {
    const trimmedAnswer = String(answer ?? '').trim()

    if (!isValidNumeric(trimmedAnswer)) {
      return 'Enter a valid number (e.g. 42 or 3.14)'
    }

    if (existingValues.has(trimmedAnswer) || pendingValues.has(trimmedAnswer)) {
      return 'Duplicate values are not allowed'
    }

    pendingValues.add(trimmedAnswer)
  }

  return null
}

export function validateQuestion(question) {
  if (question.type === 'MCQ') {
    return validateMCQAnswer(question.answer)
  }

  if (question.type === 'Numeric') {
    return validateNumericAnswers(question.answers)
  }

  return null
}

/**
 * Validates all questions and returns an error map.
 * @param {Array} questions
 * @returns {Object} { [questionNumber]: errorMessage }
 */
export function validateAllQuestions(questions) {
  const errors = {}

  questions.forEach((q) => {
    const err = validateQuestion(q)
    if (err) errors[q.questionNumber] = err
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
