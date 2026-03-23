function normalizeQuestionType(type) {
  if (type === 'Numerical' || type === 'numeric') return 'Numeric'
  if (type === 'mcq' || type === 'MCQ') return 'MCQ'
  return type
}

function flattenQuestions(omrSheet) {
  return omrSheet.sections.flatMap((section) =>
    section.parts.flatMap((part) =>
      part.questions.map((question) => ({
        questionNumber: question.question_number,
        type: normalizeQuestionType(question.type),
        totalBubbles: normalizeQuestionType(question.type) === 'Numeric' ? 4 : undefined,
        sectionName: section.section_name,
        part: part.part,
        description: part.description,
      }))
    )
  )
}

function mapAnswerKeysToConfiguration(answerKeys = []) {
  return answerKeys.map((answerKey) => {
    const type = normalizeQuestionType(answerKey.question_type)

    return {
      questionNumber: answerKey.question_index,
      type,
      totalBubbles: type === 'Numeric' ? answerKey.digit_count ?? 4 : undefined,
      allowDecimal: type === 'Numeric' ? answerKey.allow_decimal ?? true : undefined,
      allowFraction: type === 'Numeric' ? answerKey.allow_fraction ?? true : undefined,
      allowNegative: type === 'Numeric' ? answerKey.allow_negative ?? true : undefined,
    }
  })
}

function mapOmrSheetToQuiz(wrapper) {
  if (Array.isArray(wrapper.answer_keys)) {
    const quiz = wrapper.quiz ?? {}

    return {
      id: quiz.quiz_id,
      name: quiz.title,
      examId: quiz.quiz_id,
      subject: wrapper.omr_config?.sheet_name ?? '',
      totalQuestions: quiz.total_questions ?? wrapper.answer_keys.length,
      sections: [],
      omrConfiguration: mapAnswerKeysToConfiguration(wrapper.answer_keys),
      hasAnswerKey: false,
    }
  }

  const omrSheet = wrapper.omr_sheet
  const sectionNames = omrSheet.sections.map((section) => section.section_name)

  return {
    id: omrSheet.exam_id,
    name: omrSheet.name,
    examId: omrSheet.exam_id,
    subject: sectionNames.join(', '),
    totalQuestions: omrSheet.total_questions,
    sections: omrSheet.sections,
    omrConfiguration: flattenQuestions(omrSheet),
    hasAnswerKey: false,
  }
}

export async function getOmrSheets() {
  const response = await fetch('/api/omr-sheets')

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to load OMR sheets.')
  }

  return response.json()
}

export async function getQuizDefinitions() {
  const response = await getOmrSheets()
  return response.omr_sheets.map(mapOmrSheetToQuiz)
}
