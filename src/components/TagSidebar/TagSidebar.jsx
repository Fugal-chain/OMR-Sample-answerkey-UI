import { ANSWER_TAGS } from '../../data/quizzes.js'
import { DraggableTag } from './DraggableTag.jsx'

/**
 * TagSidebar — left panel showing draggable A/B/C/D answer-option tags.
 * Teachers drag these onto MCQ question rows to assign correct answers.
 */
export function TagSidebar() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid var(--color-gray-200)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 160px)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '2px solid var(--color-gray-200)',
        background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🏷️</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>
            Answer Options
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-gray-500)', lineHeight: 1.55 }}>
          Drag the correct option onto each question row
        </p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* How-to box */}
        <div style={{
          background: '#eff6ff',
          border: '2px solid #bfdbfe',
          borderRadius: 10,
          padding: 14,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <InfoDot />
            <div style={{ fontSize: 12, color: '#1e40af' }}>
              <p style={{ fontWeight: 700, marginBottom: 6 }}>How to use:</p>
              <ul style={{ paddingLeft: 14, margin: 0, lineHeight: 1.9 }}>
                <li>Drag an option (A, B, C, or D)</li>
                <li>Drop it onto any MCQ question</li>
                <li>Only one answer per question</li>
                <li>Dropping replaces the previous answer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ANSWER_TAGS.map((tag) => (
            <DraggableTag key={tag.id} tag={tag} />
          ))}
        </div>

        {/* Tip */}
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff, #fdf2f8)',
          border: '2px solid #e9d5ff',
          borderRadius: 10,
          padding: 14,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>
            💡 Quick Tip
          </p>
          <p style={{ fontSize: 12, color: '#6d28d9', lineHeight: 1.55 }}>
            You can also click the A / B / C / D buttons directly on each question for faster entry!
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoDot() {
  return (
    <div style={{
      width: 18, height: 18,
      background: '#3b82f6',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, marginTop: 1,
    }}>
      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>i</span>
    </div>
  )
}
