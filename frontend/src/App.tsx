import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ToastContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/LoadingSpinner'

// Lazy load pages for route-based code splitting
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'))
const AttendancePage = lazy(() => import('@/pages/AttendancePage'))
const MoodPage = lazy(() => import('@/pages/MoodPage'))
const JournalPage = lazy(() => import('@/pages/JournalPage'))
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'))
const StudentDetailsPage = lazy(() => import('@/pages/StudentDetailsPage'))
const TeacherDashboard = lazy(() => import('@/pages/TeacherDashboard'))
const TeacherStudentsPage = lazy(() => import('@/pages/TeacherStudentsPage'))
const TeacherAssignmentsPage = lazy(() => import('@/pages/TeacherAssignmentsPage'))
const TeacherDetailsPage = lazy(() => import('@/pages/TeacherDetailsPage'))
const TeacherParentPage = lazy(() => import('@/pages/TeacherParentPage'))
const ParentDashboard = lazy(() => import('@/pages/ParentDashboard'))

// Initialize TanStack Query client for API state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Landing / auth */}
                <Route path="/" element={<LandingPage />} />

                {/* Student routes */}
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/attendance" element={<AttendancePage />} />
                <Route path="/student/mood" element={<MoodPage />} />
                <Route path="/student/journal" element={<JournalPage />} />
                <Route path="/student/exercises" element={<ExercisesPage />} />
                <Route path="/student/details" element={<StudentDetailsPage />} />

                {/* Teacher routes */}
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/students" element={<TeacherStudentsPage />} />
                <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
                <Route path="/teacher/student-details" element={<StudentDetailsPage />} />
                <Route path="/teacher/details" element={<TeacherDetailsPage />} />
                <Route path="/teacher/parent-contact" element={<TeacherParentPage />} />

                {/* Parent routes */}
                <Route path="/parent" element={<ParentDashboard />} />

                {/* Fallback — redirect unknown paths to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
