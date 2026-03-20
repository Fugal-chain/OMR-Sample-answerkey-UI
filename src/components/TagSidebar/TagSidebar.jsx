import { ANSWER_TAGS } from '../../data/quizzes.js'
import { DraggableTag } from './DraggableTag.jsx'

/**
 * TagSidebar — left panel showing draggable A/B/C/D answer-option tags.
 * Teachers drag these onto MCQ question rows to assign correct answers.
 */
export function TagSidebar() {
  return (
    <aside className="sidebar-panel" data-tour="option-grid">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span style={{ fontSize: 18 }}>▣</span>
          <span>Answer Options</span>
        </div>
        <p className="sidebar-copy">
          Use this 2x2 grid to drag options into MCQ rows or click answers directly in the center panel.
        </p>
      </div>

      <div className="option-grid">
        {ANSWER_TAGS.map((tag) => (
          <DraggableTag key={tag.id} tag={tag} />
        ))}
      </div>
    </aside>
  )
}
