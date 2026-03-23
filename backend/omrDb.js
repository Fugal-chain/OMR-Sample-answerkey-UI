import mysql from 'mysql2/promise'

const DEFAULT_LISTING_USER_ID = 5

function createConnection(env) {
  return mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  })
}

function toBoolean(value) {
  if (value == null) return null
  return Boolean(value)
}

function mapQuizRow(row) {
  return {
    quiz_id: row.quiz_id,
    title: row.title,
    description: row.description,
    quiz_date: row.quiz_date,
    is_online: toBoolean(row.is_online),
    created_by: row.created_by,
    total_questions: row.total_questions,
    total_mark: row.total_mark,
    folder_id: row.folder_id,
    created_at: row.created_at,
  }
}

function mapConfigRow(row) {
  if (!row) return null

  return {
    config_id: row.config_id,
    quiz_id: row.quiz_id,
    user_id: row.user_id,
    sheet_name: row.sheet_name,
    template_type: row.template_type,
    mcq_questions: row.mcq_questions,
    numeric_questions: row.numeric_questions,
    created_at: row.created_at,
    sheet_code: row.sheet_code,
    omr_name: row.omr_name,
  }
}

function mapAnswerEntryRow(row) {
  return {
    answer_key_id: row.answer_entry_id,
    answer_sheet_id: row.config_id,
    question_index: row.question_index,
    question_type: row.question_type,
    correct_answer: row.correct_answer,
    mark: row.mark,
    allow_decimal: toBoolean(row.allow_decimal),
    allow_fraction: toBoolean(row.allow_fraction),
    allow_negative: toBoolean(row.allow_negative),
    digit_count: row.digit_count,
    barcode: null,
  }
}

export async function loadOmrSheetsFromDatabase(env, options = {}) {
  const connection = await createConnection(env)
  const listingUserId = options.userId ?? DEFAULT_LISTING_USER_ID

  try {
    const [quizRows] = await connection.query(
      `
        SELECT
          quiz_id,
          title,
          description,
          quiz_date,
          is_online,
          created_by,
          total_questions,
          total_mark,
          folder_id,
          created_at
        FROM quiz
        WHERE created_by = ?
        ORDER BY created_at DESC, quiz_id DESC
      `,
      [listingUserId]
    )

    const [configRows] = await connection.query(
      `
        SELECT
          config_id,
          quiz_id,
          user_id,
          sheet_name,
          template_type,
          mcq_questions,
          numeric_questions,
          created_at,
          sheet_code,
          omr_name
        FROM omr_configurations
        WHERE user_id = ?
        ORDER BY quiz_id, created_at DESC, config_id DESC
      `,
      [listingUserId]
    )

    const [answerEntryRows] = await connection.query(`
      SELECT
        config_id,
        answer_entry_id,
        question_index,
        question_type,
        correct_answer,
        mark,
        allow_decimal,
        allow_fraction,
        allow_negative,
        digit_count
      FROM answer_key_entries
      ORDER BY config_id, question_index
    `)

    const configByQuiz = new Map()
    for (const row of configRows) {
      if (!configByQuiz.has(row.quiz_id)) {
        configByQuiz.set(row.quiz_id, row)
      }
    }

    const answerKeysByConfig = new Map()
    for (const row of answerEntryRows) {
      if (!answerKeysByConfig.has(row.config_id)) {
        answerKeysByConfig.set(row.config_id, [])
      }

      answerKeysByConfig.get(row.config_id).push(mapAnswerEntryRow(row))
    }

    return {
      omr_sheets: quizRows.map((quizRow) => {
        const config = configByQuiz.get(quizRow.quiz_id)

        return {
          quiz: mapQuizRow(quizRow),
          omr_config: mapConfigRow(config),
          answer_keys: config ? answerKeysByConfig.get(config.config_id) ?? [] : [],
        }
      }),
    }
  } finally {
    await connection.end()
  }
}
