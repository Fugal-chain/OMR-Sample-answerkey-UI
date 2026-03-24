import mysql from 'mysql2/promise'

const DEFAULT_LISTING_USER_ID = 1

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
    sheet_name: row.sheet_name ?? row.omr_name ?? row.sheet_code,
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

function normalizeQuestionType(type) {
  return String(type ?? '').trim().toLowerCase() === 'numeric' ? 'numeric' : 'mcq'
}

function normalizeQuestionForPersistence(question) {
  const questionType = normalizeQuestionType(question.type)
  const numericAnswers = Array.isArray(question.answers)
    ? question.answers.map((answer) => String(answer ?? '').trim()).filter(Boolean)
    : []
  const mcqAnswer = String(question.answer ?? '').trim().toUpperCase()
  const points = Number(question.points)
  const digitCount = Number(question.totalBubbles)

  return {
    questionIndex: Number(question.questionNumber),
    questionType,
    correctAnswer:
      questionType === 'numeric'
        ? numericAnswers.join(',') || null
        : mcqAnswer || null,
    mark: Number.isFinite(points) ? points : 1,
    allowDecimal: questionType === 'numeric' ? Boolean(question.allowDecimal ?? true) : false,
    allowFraction: questionType === 'numeric' ? Boolean(question.allowFraction ?? true) : false,
    allowNegative: questionType === 'numeric' ? Boolean(question.allowNegative ?? true) : false,
    digitCount:
      questionType === 'numeric' && Number.isFinite(digitCount) && digitCount > 0
        ? digitCount
        : 1,
  }
}

async function findLinkedConfigId(connection, quizId, userId) {
  const [rows] = await connection.query(
    `
      SELECT oc.omr_config_id AS config_id
      FROM quiz_omr_configs qoc
      INNER JOIN omr_configurations oc
        ON oc.omr_config_id = qoc.omr_config_id
      WHERE qoc.quiz_id = ? AND oc.user_id = ?
      ORDER BY oc.created_at DESC, oc.omr_config_id DESC
      LIMIT 1
    `,
    [quizId, userId]
  )

  return rows[0]?.config_id ?? null
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
          qoc.quiz_id,
          oc.omr_config_id AS config_id,
          oc.user_id,
          oc.sheet_name,
          oc.template_type,
          oc.mcq_questions,
          oc.numeric_questions,
          oc.created_at,
          oc.sheet_code,
          oc.omr_name
        FROM quiz_omr_configs qoc
        INNER JOIN omr_configurations oc
          ON oc.omr_config_id = qoc.omr_config_id
        WHERE oc.user_id = ?
        ORDER BY qoc.quiz_id, oc.created_at DESC, oc.omr_config_id DESC
      `,
      [listingUserId]
    )

    const configIds = [...new Set(configRows.map((row) => row.config_id).filter(Boolean))]
    let answerEntryRows = []

    if (configIds.length > 0) {
      const placeholders = configIds.map(() => '?').join(', ')
      const [rows] = await connection.query(
        `
          SELECT
            omr_config_id AS config_id,
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
          WHERE omr_config_id IN (${placeholders})
          ORDER BY omr_config_id, question_index
        `,
        configIds
      )
      answerEntryRows = rows
    }

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

export async function saveAnswerKeyToDatabase(env, payload = {}, options = {}) {
  const connection = await createConnection(env)
  const userId = options.userId ?? DEFAULT_LISTING_USER_ID
  const quizId = Number(payload.quizId)
  const questions = Array.isArray(payload.questions) ? payload.questions : []

  if (!Number.isFinite(quizId)) {
    throw new Error('A valid quiz ID is required.')
  }

  const normalizedQuestions = questions
    .map(normalizeQuestionForPersistence)
    .filter((question) => Number.isFinite(question.questionIndex))
    .sort((left, right) => left.questionIndex - right.questionIndex)

  try {
    await connection.beginTransaction()

    const configId = await findLinkedConfigId(connection, quizId, userId)
    if (!configId) {
      throw new Error('No OMR configuration is linked to this quiz for the current user.')
    }

    await connection.query(
      'DELETE FROM answer_key_entries WHERE omr_config_id = ?',
      [configId]
    )

    if (normalizedQuestions.length > 0) {
      const placeholders = normalizedQuestions.map(() => '(?,?,?,?,?,?,?,?,?)').join(', ')
      const values = normalizedQuestions.flatMap((question) => [
        configId,
        question.questionIndex,
        question.questionType,
        question.correctAnswer,
        question.mark,
        question.allowDecimal,
        question.allowFraction,
        question.allowNegative,
        question.digitCount,
      ])

      await connection.query(
        `
          INSERT INTO answer_key_entries (
            omr_config_id,
            question_index,
            question_type,
            correct_answer,
            mark,
            allow_decimal,
            allow_fraction,
            allow_negative,
            digit_count
          )
          VALUES ${placeholders}
        `,
        values
      )
    }

    await connection.commit()

    return {
      quiz_id: quizId,
      omr_config_id: configId,
      saved_question_count: normalizedQuestions.length,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.end()
  }
}
