import { useCallback, useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const TOUR_STORAGE_KEY = 'omr-answer-key-tour-completed'

export function useOmrTour(isEnabled) {
  const driverRef = useRef(null)
  const autoStartedRef = useRef(false)

  const startTour = useCallback(() => {
    if (!isEnabled) return

    driverRef.current?.destroy()
    const tour = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      steps: [
        {
          element: '[data-tour="option-grid"]',
          popover: {
            title: 'Option Grid',
            description: 'Drag or tap these A, B, C, and D tiles to assign MCQ answers quickly.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '[data-tour="answer-input-section"]',
          popover: {
            title: 'Answer Input',
            description: 'Set MCQ and numeric answers here. The layout is optimized for quick review and fast entry.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-tour="save-answer-key"]',
          popover: {
            title: 'Save Answer Key',
            description: 'Use this for a manual validated save. Autosave is active, but this still gives a clear confirmation point.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '[data-tour="bulk-import"]',
          popover: {
            title: 'Bulk Import',
            description: 'Paste multiple MCQ answers at once with line numbers, import limits, and conflict handling.',
            side: 'bottom',
            align: 'center',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true')
      },
    })

    driverRef.current = tour
    tour.drive()
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled || autoStartedRef.current) return
    if (localStorage.getItem(TOUR_STORAGE_KEY) === 'true') return

    autoStartedRef.current = true
    const timer = window.setTimeout(() => {
      startTour()
    }, 450)

    return () => window.clearTimeout(timer)
  }, [isEnabled, startTour])

  return { startTour }
}
