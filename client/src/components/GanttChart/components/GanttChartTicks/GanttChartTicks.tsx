import { useGanttChartContext } from '../../context'
import * as classes from '../../GanttChart.module.css'
import { useEffect, useRef } from 'react'

const GanttChartTicks = () => {
  const ticksRef = useRef<HTMLDivElement | null>(null)

  const { filteredRange, currentTime, getTimelineLeftPosition } = useGanttChartContext()

  useEffect(() => {
    if (!ticksRef.current) {
      return
    }

    const startDate = new Date(filteredRange[0])
    const endDate = new Date(filteredRange[1])
    const includeDays = filteredRange[1] - filteredRange[0] < 1000 * 3600 * 24 * 30 * 2

    const calculatedTicks: Array<{
      label: string
      type: string
      value: number
      element?: HTMLDivElement
    }> = []

    // Add Now tick if currentTime is in filtered range
    if (currentTime >= startDate.getTime() && currentTime <= endDate.getTime()) {
      calculatedTicks.push({
        type: 'now',
        value: currentTime,
        label: 'Now',
      })
    }

    // Populate ticks
    let lastYear = startDate.getFullYear()
    let lastMonth = startDate.getMonth()

    for (let time = startDate.getTime(); time <= endDate.getTime(); time += 3600 * 24 * 1000) {
      const iterationDate = new Date(time)

      if (iterationDate.getFullYear() !== lastYear) {
        calculatedTicks.push({
          label: `${iterationDate.toLocaleString('default', { year: 'numeric' })}`,
          type: 'year',
          value: time,
        })
      } else if (iterationDate.getMonth() !== lastMonth) {
        calculatedTicks.push({
          label: `${iterationDate.toLocaleString('default', { month: 'long' })}`,
          type: 'month',
          value: time,
        })
      } else if (includeDays) {
        calculatedTicks.push({
          label: `${iterationDate.toLocaleString('default', { day: '2-digit' })}.`,
          type: 'day',
          value: time,
        })
      }

      lastYear = iterationDate.getFullYear()
      lastMonth = iterationDate.getMonth()
    }

    calculatedTicks.sort((a, b) => a.value - b.value)

    // Add ticks to dom
    for (const tick of calculatedTicks) {
      const divElement = document.createElement('div')

      divElement.className = classes.timelineTick
      divElement.style.left = getTimelineLeftPosition(tick.value)
      divElement.innerText = tick.label

      ticksRef.current.appendChild(divElement)
      tick.element = divElement
    }

    // Remove ticks outside the available range
    const wrapperRect = ticksRef.current.getBoundingClientRect()
    for (const tick of calculatedTicks) {
      const tickRect = tick.element?.getBoundingClientRect()

      if (tickRect && (tickRect.left < wrapperRect.left || tickRect.right > wrapperRect.right)) {
        tick.element?.remove()
        tick.element = undefined
      }
    }

    // Remove ticks overlapping with other ticks
    const tickMargin = 5
    const isOverlapping = (a: DOMRect | undefined, b: DOMRect | undefined) => {
      return a && b && a.left - tickMargin < b.right && a.right + tickMargin > b.left
    }
    const priorityTicks = ['now', 'year', 'month', 'day']

    for (const currentPriority of priorityTicks) {
      const currentPriorityNumber = priorityTicks.indexOf(currentPriority)
      const currentPriorityTicks = calculatedTicks.filter((tick) => tick.type === currentPriority)

      for (const currentTick of currentPriorityTicks) {
        const currentRect = currentTick.element?.getBoundingClientRect()

        for (const tick of calculatedTicks) {
          const priorityNumber = priorityTicks.indexOf(tick.type)

          if (priorityNumber < currentPriorityNumber || tick === currentTick) {
            continue
          }

          if (tick.element) {
            const lowerRect = tick.element.getBoundingClientRect()

            if (isOverlapping(currentRect, lowerRect)) {
              tick.element.remove()
              tick.element = undefined
            }
          }
        }
      }
    }

    return () => {
      if (ticksRef.current) {
        ticksRef.current.innerHTML = ''
      }
    }
  }, [filteredRange.join(','), currentTime])

  return <div className={classes.timelineHeader} ref={ticksRef}></div>
}

export default GanttChartTicks
