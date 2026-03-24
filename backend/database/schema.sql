DROP DATABASE IF EXISTS ZipGrade;
CREATE DATABASE IF NOT EXISTS ZipGrade;
USE ZipGrade;

-- ================= USERS =================
CREATE TABLE users (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL,
  email_id VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255),
  provider VARCHAR(20) DEFAULT 'local',
  provider_id VARCHAR(255),
  created_time BIGINT
);

CREATE INDEX idx_users_email ON users(email_id);


-- ================= FOLDERS =================
CREATE TABLE folders (
  folder_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  created_time BIGINT,
  user_id BIGINT,
  parent_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES folders(folder_id) ON DELETE CASCADE
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);


-- ================= QUIZ =================
CREATE TABLE quiz (
  quiz_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description TEXT,
  quiz_date BIGINT,
  is_online BOOLEAN DEFAULT FALSE,
  created_by BIGINT,
  total_questions INT,
  total_mark INT,
  folder_id BIGINT,
  created_at BIGINT,
  FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_folder_id ON quiz(folder_id);
CREATE INDEX idx_quiz_created_by ON quiz(created_by);


-- ================= OMR CONFIGURATIONS =================
CREATE TABLE omr_configurations (
  omr_config_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  sheet_code VARCHAR(100) NOT NULL UNIQUE,
  omr_name VARCHAR(50),
  sheet_name VARCHAR(50),
  template_type VARCHAR(255),
  mcq_questions INT,
  numeric_questions INT,
  created_at BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_omr_config_user_id ON omr_configurations(user_id);


-- ================= QUIZ ↔ OMR CONFIG =================
CREATE TABLE quiz_omr_configs (
  quiz_id BIGINT,
  omr_config_id BIGINT,
  PRIMARY KEY (quiz_id, omr_config_id),
  FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id) ON DELETE CASCADE,
  FOREIGN KEY (omr_config_id) REFERENCES omr_configurations(omr_config_id) ON DELETE CASCADE
);


-- ================= HEADER FIELDS =================
CREATE TABLE header_fields (
  field_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  field_name VARCHAR(25) NOT NULL
);


-- ================= OMR HEADER =================
CREATE TABLE omr_header (
  header_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  omr_config_id BIGINT,
  field_id BIGINT,
  FOREIGN KEY (omr_config_id) REFERENCES omr_configurations(omr_config_id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES header_fields(field_id) ON DELETE CASCADE
);

CREATE INDEX idx_omr_header_config_id ON omr_header(omr_config_id);
CREATE INDEX idx_omr_header_field_id ON omr_header(field_id);


-- ================= ANSWER KEY =================
CREATE TABLE answer_key_entries (
  answer_entry_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  omr_config_id BIGINT,
  question_index INT NOT NULL,
  question_type ENUM('mcq','numeric') NOT NULL,
  correct_answer VARCHAR(50),
  mark DECIMAL(5,2),
  allow_decimal BOOLEAN,
  allow_fraction BOOLEAN,
  allow_negative BOOLEAN,
  digit_count INT NOT NULL,
  FOREIGN KEY (omr_config_id) REFERENCES omr_configurations(omr_config_id) ON DELETE CASCADE,
  CONSTRAINT unique_question_per_config UNIQUE (omr_config_id, question_index)
);

CREATE INDEX idx_answer_key_config_id ON answer_key_entries(omr_config_id);
CREATE INDEX idx_answer_key_config_question 
ON answer_key_entries(omr_config_id, question_index);


-- ================= OMR SCANS =================
CREATE TABLE omr_scans (
  scan_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  omr_config_id BIGINT,
  scan_image_path VARCHAR(255) NOT NULL,
  upload_type ENUM('scan','upload') NOT NULL,
  uploaded_at BIGINT,
  FOREIGN KEY (omr_config_id) REFERENCES omr_configurations(omr_config_id) ON DELETE CASCADE
);

CREATE INDEX idx_omr_scans_config_id ON omr_scans(omr_config_id);
CREATE INDEX idx_scans_config_time ON omr_scans(omr_config_id, uploaded_at);


-- ================= PARTICIPANTS =================
CREATE TABLE participants (
  participant_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  omr_config_id BIGINT,
  roll_number VARCHAR(50),
  name VARCHAR(100),
  participant_details JSON NOT NULL,
  FOREIGN KEY (omr_config_id) REFERENCES omr_configurations(omr_config_id) ON DELETE CASCADE
);

CREATE INDEX idx_participant_config_id ON participants(omr_config_id);
CREATE INDEX idx_participant_roll ON participants(roll_number);


-- ================= DETECTED VALUES =================
CREATE TABLE detected_values (
  response_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  answer_entry_id BIGINT,
  participant_id BIGINT,
  detected_value VARCHAR(50),
  is_correct BOOLEAN,
  FOREIGN KEY (answer_entry_id) REFERENCES answer_key_entries(answer_entry_id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

CREATE INDEX idx_detected_answer_entry ON detected_values(answer_entry_id);
CREATE INDEX idx_detected_participant ON detected_values(participant_id);
CREATE INDEX idx_detected_participant_answer 
ON detected_values(participant_id, answer_entry_id);


-- ================= RESULT =================
CREATE TABLE result (
  result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  scan_id BIGINT,
  participant_id BIGINT,
  correct_count INT,
  wrong_count INT,
  blank_count INT,
  total_mark DECIMAL(6,2),
  evaluated_at BIGINT,
  FOREIGN KEY (scan_id) REFERENCES omr_scans(scan_id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

CREATE INDEX idx_result_scan_id ON result(scan_id);
CREATE INDEX idx_result_participant_id ON result(participant_id);
CREATE INDEX idx_result_scan_participant 
ON result(scan_id, participant_id);