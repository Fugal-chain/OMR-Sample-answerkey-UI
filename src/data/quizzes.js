/**
 * Mock quiz data for the OMR Exam Dashboard.
 * In a real app, this would come from an API.
 */

export const QUIZZES = [
  {
    id: '1',
    name: 'Midterm Mathematics Exam',
    subject: 'Mathematics',
    date: new Date('2025-03-15'),
    totalQuestions: 10,
    hasAnswerKey: true,
    omrConfiguration: [
      { questionNumber: 1, type: 'MCQ' },
      { questionNumber: 2, type: 'MCQ' },
      { questionNumber: 3, type: 'MCQ' },
      { questionNumber: 4, type: 'MCQ' },
      { questionNumber: 5, type: 'MCQ' },
      { questionNumber: 6, type: 'MCQ' },
      { questionNumber: 7, type: 'MCQ' },
      { questionNumber: 8, type: 'Numeric' },
      { questionNumber: 9, type: 'Numeric' },
      { questionNumber: 10, type: 'MCQ' },
    ],
  },
  {
    id: '2',
    name: 'Physics Unit Test',
    subject: 'Physics',
    date: new Date('2025-03-20'),
    totalQuestions: 8,
    hasAnswerKey: false,
    omrConfiguration: [
      { questionNumber: 1, type: 'MCQ' },
      { questionNumber: 2, type: 'MCQ' },
      { questionNumber: 3, type: 'MCQ' },
      { questionNumber: 4, type: 'MCQ' },
      { questionNumber: 5, type: 'MCQ' },
      { questionNumber: 6, type: 'MCQ' },
      { questionNumber: 7, type: 'Numeric' },
      { questionNumber: 8, type: 'Numeric' },
    ],
  },
  {
    id: '3',
    name: 'Chemistry Quarterly Assessment',
    subject: 'Chemistry',
    date: new Date('2025-04-02'),
    totalQuestions: 6,
    hasAnswerKey: false,
    omrConfiguration: [
      { questionNumber: 1, type: 'MCQ' },
      { questionNumber: 2, type: 'MCQ' },
      { questionNumber: 3, type: 'MCQ' },
      { questionNumber: 4, type: 'MCQ' },
      { questionNumber: 5, type: 'Numeric' },
      { questionNumber: 6, type: 'Numeric' },
    ],
  },
]

/**
 * MCQ option color mapping
 */
export const OPTION_COLORS = {
  A: '#16a34a',
  B: '#16a34a',
  C: '#16a34a',
  D: '#16a34a',
}

/**
 * Draggable answer option tags
 */
export const ANSWER_TAGS = [
  { id: 'A', option: 'A', color: OPTION_COLORS.A },
  { id: 'B', option: 'B', color: OPTION_COLORS.B },
  { id: 'C', option: 'C', color: OPTION_COLORS.C },
  { id: 'D', option: 'D', color: OPTION_COLORS.D },
]

/**
 * AI chatbot response map
 */
export const BOT_RESPONSES = {
  bulk: `To use bulk import:
1. Click the "Bulk Import" button at the top
2. Enter answers in format: 1:A, 2:B, 3:C or paste from Excel
3. Click Apply to populate all answers at once`,

  tag: `To use drag & drop answer options:
1. Look at the left sidebar with options A, B, C, D
2. Click and drag an option (e.g., "A")
3. Drop it on any MCQ question row
4. The answer is automatically set!

Only one option tag per question. Dragging a new option replaces the previous one.`,

  numeric: `For numeric questions with multiple answers:
1. Type a value and click "Add"
2. Use quick value buttons (0, 1, 2, 5, 10, 100)
3. Add as many correct answers as needed
4. Remove answers by hovering and clicking ×

Multiple answers are useful when different formats are acceptable!`,

  undo: `Keyboard shortcuts:
• Ctrl+Z / Cmd+Z: Undo last change
• Ctrl+Y / Cmd+Y: Redo

You can also use the Undo/Redo buttons at the top of the answer key editor!`,

  export: `To export your answer key:
1. Save your answers first
2. The system will generate a downloadable file
3. You can use this for OMR evaluation or backup`,

  validate: `Validation tips:
• MCQ: Only A, B, C, or D are valid
• Numeric: Enter numbers only (decimals allowed)
• All questions must have an answer before saving
• Red borders indicate validation errors`,

  default: `I can help you with:
• Drag & drop answer options (A, B, C, D)
• Multiple numeric answers
• Bulk import and quick entry
• Undo/Redo operations
• Validation and error fixes

What would you like to know?`,
}

/**
 * Quick action suggestions for the chatbot
 */
export const QUICK_ACTIONS = [
  { label: 'How do I bulk edit?', key: 'bulk' },
  { label: 'How to use tags?', key: 'tag' },
  { label: 'Numeric answers?', key: 'numeric' },
  { label: 'Keyboard shortcuts?', key: 'undo' },
]
