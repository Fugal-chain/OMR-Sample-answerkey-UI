function buildQuestions(start, end, type) {
  return Array.from({ length: end - start + 1 }, (_, index) => ({
    question_number: start + index,
    type,
  }))
}

function buildJeeSection(sectionName, mcqStart, numericalStart) {
  return {
    section_name: sectionName,
    parts: [
      {
        part: 'A',
        description: 'MCQ - Attempt All 20 Questions',
        questions: buildQuestions(mcqStart, mcqStart + 19, 'MCQ'),
      },
      {
        part: 'B',
        description: 'Numerical - Attempt any 10 Questions',
        questions: buildQuestions(numericalStart, numericalStart + 9, 'Numerical'),
      },
    ],
  }
}

export const MOCK_OMR_SHEETS_RESPONSE = {
  omr_sheets: [
    {
      omr_sheet: {
        name: 'IIT JEE Sample OMR Sheet - Multigraphics Group',
        exam_id: 'MG_IIT_2024_001',
        total_questions: 90,
        sections: [
          buildJeeSection('Physics', 1, 21),
          buildJeeSection('Chemistry', 31, 51),
          buildJeeSection('Mathematics', 61, 81),
        ],
      },
    },
    {
      omr_sheet: {
        name: 'NEET Practice OMR Sheet - Multigraphics Group',
        exam_id: 'MG_NEET_2024_002',
        total_questions: 45,
        sections: [
          {
            section_name: 'Physics',
            parts: [
              {
                part: 'A',
                description: 'MCQ - Attempt All Questions',
                questions: buildQuestions(1, 15, 'MCQ'),
              },
            ],
          },
          {
            section_name: 'Chemistry',
            parts: [
              {
                part: 'A',
                description: 'MCQ - Attempt All Questions',
                questions: buildQuestions(16, 30, 'MCQ'),
              },
            ],
          },
          {
            section_name: 'Biology',
            parts: [
              {
                part: 'A',
                description: 'MCQ - Attempt All Questions',
                questions: buildQuestions(31, 45, 'MCQ'),
              },
            ],
          },
        ],
      },
    },
    {
      omr_sheet: {
        name: 'State Engineering Entrance OMR Sheet',
        exam_id: 'SEE_2024_003',
        total_questions: 30,
        sections: [
          {
            section_name: 'Mathematics',
            parts: [
              {
                part: 'A',
                description: 'MCQ - Attempt All 15 Questions',
                questions: buildQuestions(1, 15, 'MCQ'),
              },
            ],
          },
          {
            section_name: 'Aptitude',
            parts: [
              {
                part: 'A',
                description: 'MCQ - Attempt All 10 Questions',
                questions: buildQuestions(16, 25, 'MCQ'),
              },
              {
                part: 'B',
                description: 'Numerical - Attempt All 5 Questions',
                questions: buildQuestions(26, 30, 'Numerical'),
              },
            ],
          },
        ],
      },
    },
  ],
}
