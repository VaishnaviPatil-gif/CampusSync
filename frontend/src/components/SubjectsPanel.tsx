import styles from '@/pages/StudentDashboard.module.css'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import type { SubjectEntry } from '@/types'

const SUBJECTS: SubjectEntry[] = [
  { name: 'Mathematics', status: 'weak' },
  { name: 'Chemistry', status: 'weak' },
  { name: 'Physics', status: 'stable' },
  { name: 'English', status: 'strong' },
  { name: 'Computer Science', status: 'strong' },
  { name: 'Aptitude', status: 'stable' },
]

const BADGE_LABELS: Record<string, string> = {
  weak: 'Weak',
  stable: 'Stable',
  strong: 'Strong',
}

export default function SubjectsPanel() {
  const leftCol = SUBJECTS.slice(0, 3)
  const rightCol = SUBJECTS.slice(3)

  return (
    <Card title="Subjects Overview">
      <div className={styles.subjects}>
        {[leftCol, rightCol].map((col, colIdx) => (
          <ul key={colIdx} className={styles.subjectList}>
            {col.map(({ name, status }) => (
              <li
                key={name}
                className={`${styles.subjectItem} ${status === 'weak' ? styles.subjectItemWeak : ''}`}
              >
                {name}
                <Badge variant={status === 'weak' ? 'weak' : 'good'}>
                  {BADGE_LABELS[status]}
                </Badge>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Card>
  )
}
