import { MOCK_OMR_SHEETS_RESPONSE } from '../data/omrSheetsData.js'

function normalizeQuestionType(type) {
  return type === 'Numerical' ? 'Numeric' : type
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

function mapOmrSheetToQuiz(wrapper) {
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
  await new Promise((resolve) => window.setTimeout(resolve, 200))
  return MOCK_OMR_SHEETS_RESPONSE
}

export async function getQuizDefinitions() {
  const response = await getOmrSheets()
  return response.omr_sheets.map(mapOmrSheetToQuiz)
}
