import Card from '@/components/Card'
import Table from '@/components/Table'
import type { DisplayAssignment } from '@/hooks/useAssignments'

interface AssignmentsPanelProps {
  assignments: DisplayAssignment[]
  assignmentCount: number
}

export default function AssignmentsPanel({
  assignments,
  assignmentCount,
}: AssignmentsPanelProps) {
  const headers = ['Subject', 'Task', 'Description', 'Due Date', 'Status', 'Attachment']

  return (
    <Card title="Teacher Assignments">
      <Table headers={headers} minWidth="560px">
        {assignmentCount === 0 ? (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center', padding: '20px 0', color: 'var(--sd-text-muted)' }}>
              No assignments assigned yet.
            </td>
          </tr>
        ) : (
          assignments.map((item, i) => (
            <tr key={`${item.subject}-${item.dueDate}-${i}`}>
              <td>{item.subject}</td>
              <td>{item.task}</td>
              <td>{item.description ?? '-'}</td>
              <td>{item.formattedDate}</td>
              <td>{item.statusLabel}</td>
              <td>
                {item.attachment?.dataUrl ? (
                  <a
                    style={{ color: 'var(--sd-sidebar-1)', textDecoration: 'underline', cursor: 'pointer' }}
                    href={item.attachment.dataUrl}
                    download={item.attachment.name}
                  >
                    Download
                  </a>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))
        )}
      </Table>
    </Card>
  )
}
