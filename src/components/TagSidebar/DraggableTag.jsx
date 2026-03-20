import { useDraggable } from '@dnd-kit/core'

export function AnswerTagCard({ tag, isDragging = false }) {
  return (
    <div
      className="option-tile"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        background: tag.color,
        color: '#fff',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.92 : 1,
        transform: isDragging ? 'scale(1.04)' : 'scale(1)',
        transition: 'transform 0.15s, opacity 0.15s, box-shadow 0.15s',
        boxShadow: `0 16px 28px ${tag.color}33`,
        touchAction: 'none',
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{tag.option}</div>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 5,
        opacity: 0.85,
      }}>
        Option {tag.option}
      </div>
    </div>
  )
}

/**
 * DraggableTag — a large coloured pill that can be dragged onto a question row.
 * Shows the option letter (A/B/C/D) and uses dnd-kit.
 */
export function DraggableTag({ tag }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tag.id,
    data: {
      type: 'answer-tag',
      tag,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.28 : 1 }}
    >
      <AnswerTagCard tag={tag} />
    </div>
  )
}
