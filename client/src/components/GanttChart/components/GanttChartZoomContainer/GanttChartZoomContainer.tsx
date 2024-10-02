import { TouchEvent, Touch, WheelEvent, useEffect, useRef, PropsWithChildren } from 'react'
import * as classes from '../../GanttChart.module.css'
import { DateRange, useGanttChartContext } from '../../context'

const GanttChartZoomContainer = (props: PropsWithChildren) => {
  const { children } = props

  const { setRange, totalRange, filteredRange } = useGanttChartContext()

  const initialTouch = useRef<{ initialDistance: number; initialRange: DateRange } | null>(null)

  // Disable page zooming to prevent that page zooms on pinch gesture
  useEffect(() => {
    const handleWheelGlobal = (e: globalThis.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    window.addEventListener('wheel', handleWheelGlobal, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheelGlobal)
    }
  }, [])

  // Touch events for pinch to zoom
  const zoomRange = (zoomFactor: number, currentRange: DateRange) => {
    const center = (currentRange[0] + currentRange[1]) / 2

    setRange([
      Math.max(center - (center - currentRange[0]) * zoomFactor, totalRange[0]),
      Math.min(center + (currentRange[1] - center) * zoomFactor, totalRange[1]),
    ])
  }

  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2),
    )
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      initialTouch.current = {
        initialDistance: getTouchDistance(e.touches[0], e.touches[1]),
        initialRange: filteredRange,
      }
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialTouch.current) {
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1])

      zoomRange(
        currentDistance / initialTouch.current.initialDistance,
        initialTouch.current.initialRange,
      )
    }
  }

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      e.preventDefault()

      zoomRange(e.deltaY < 0 ? 1.05 : 0.95, filteredRange)
    }
  }

  return (
    <div
      className={classes.content}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
      style={{ touchAction: 'pan-x pan-y' }}
    >
      {children}
    </div>
  )
}

export default GanttChartZoomContainer
