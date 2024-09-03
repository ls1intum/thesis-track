import * as classes from './GanttChart.module.css'
import { ArrayElement, arrayUnique } from '../../utils/array'
import {
  ReactNode,
  TouchEvent,
  Touch,
  WheelEvent,
  useMemo,
  useState,
  useEffect,
  CSSProperties,
  useRef,
} from 'react'
import { Button, Collapse, Group, Popover, RangeSlider, Text } from '@mantine/core'
import { formatDate } from '../../utils/format'
import { CaretDown, CaretUp } from 'phosphor-react'

interface IGanttChartProps {
  columns: Array<{
    label: string
    width: CSSProperties['width']
    textAlign?: CSSProperties['textAlign']
  }>
  data: Array<IGanttChartDataElement> | undefined
  itemPopover: (
    item: IGanttChartDataElement,
    timelineItem?: ArrayElement<IGanttChartDataElement['timeline']>,
    timelineEvent?: ArrayElement<IGanttChartDataElement['events']>,
  ) => ReactNode
  onItemClick?: (item: IGanttChartDataElement) => unknown
  initialRangeDuration?: number
  maxTicks?: number
  minRange?: DateRange
}

export interface IGanttChartDataElement {
  id: string
  groupId: string
  groupNode: ReactNode
  columns: ReactNode[]
  timeline: Array<{
    id: string
    startDate: Date
    endDate: Date
    color: string
  }>
  events: Array<{
    id: string
    icon: ReactNode
    time: Date
  }>
}

type DateRange = [number, number]

const isInDateRange = (range: DateRange, visibleRange: DateRange) => {
  const [rangeStart, rangeEnd] = range
  const [visibleStart, visibleEnd] = visibleRange

  return rangeEnd >= visibleStart && rangeStart <= visibleEnd
}

const GanttChart = (props: IGanttChartProps) => {
  const {
    columns,
    data,
    itemPopover,
    onItemClick,
    initialRangeDuration = 3600 * 24 * 30 * 3 * 1000,
    maxTicks = 6,
    minRange,
  } = props

  const [range, setRange] = useState<DateRange>()
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])

  const [popover, setPopover] = useState<string>()
  const [hoveredTimelineItem, setHoveredTimelineItem] = useState<string>()
  const [hoveredEventItem, setHoveredEventItem] = useState<string>()

  const initialTouch = useRef<{ initialDistance: number; initialRange: DateRange } | null>(null)

  const currentTime = useMemo(() => Date.now(), [])

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

  if (!data || data.length === 0) {
    return null
  }

  // Calculate total range based on the provided data
  const totalRange: DateRange = [
    Math.min(
      ...data.map((item) =>
        Math.min(
          ...item.timeline.map((timelineItem) => timelineItem.startDate.getTime()),
          ...item.events.map((timelineEvent) => timelineEvent.time.getTime()),
        ),
      ),
      ...(minRange ? [minRange[0]] : []),
    ),
    Math.max(
      ...data.map((item) =>
        Math.max(
          ...item.timeline.map((timelineItem) => timelineItem.endDate.getTime()),
          ...item.events.map((timelineEvent) => timelineEvent.time.getTime()),
        ),
      ),
      ...(minRange ? [minRange[1]] : []),
    ),
  ]

  // Default filtered range to currentTime if there are elements larger than current Time
  const initialEndTime = Math.min(currentTime, totalRange[1])
  const filteredRange: DateRange = [
    Math.max(totalRange[0], range?.[0] ?? initialEndTime - initialRangeDuration),
    Math.min(totalRange[1], range?.[1] ?? initialEndTime),
  ]
  const filteredRangeDuration = filteredRange[1] - filteredRange[0]

  const groups: Array<{ groupId: string; groupNode: ReactNode }> = arrayUnique(
    data.map((row) => ({
      groupId: row.groupId,
      groupNode: row.groupNode,
    })),
    (a, b) => a.groupId === b.groupId,
  )

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

  const generateTicks = () => {
    const timeOffset = 0.05 * filteredRangeDuration
    const startDate = new Date(filteredRange[0] + timeOffset)
    const endDate = new Date(filteredRange[1] - timeOffset)

    let calculatedTicks: Array<{ label: string; type: string; value: number }> = []

    // Add Now tick if currentTime is in filtered range
    if (currentTime >= startDate.getTime() && currentTime <= endDate.getTime()) {
      calculatedTicks.push({
        type: 'now',
        value: currentTime,
        label: 'Now',
      })
    }

    let lastYear = startDate.getFullYear()
    let lastMonth = startDate.getMonth()

    for (let time = startDate.getTime(); time <= endDate.getTime(); time += 3600 * 24 * 1000) {
      const iterationDate = new Date(time)

      // Don't add tick if it's close to the "Now" tick
      if (Math.abs(time - currentTime) <= 0.1 * filteredRangeDuration) {
        continue
      }

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
      } else {
        calculatedTicks.push({
          label: `${iterationDate.toLocaleString('default', { day: '2-digit' })}.`,
          type: 'day',
          value: time,
        })
      }

      lastYear = iterationDate.getFullYear()
      lastMonth = iterationDate.getMonth()
    }

    const priorityTicks = ['now', 'year', 'month']

    // clear non priority items if there are too many ticks and ticks include priority items
    if (
      calculatedTicks.length > maxTicks &&
      calculatedTicks.some((row) => priorityTicks.includes(row.type))
    ) {
      calculatedTicks = calculatedTicks.filter((row) => priorityTicks.includes(row.type))
    }

    // reduce ticks until smaller than maxTicks
    let lastTickCount = calculatedTicks.length
    while (calculatedTicks.length > maxTicks) {
      calculatedTicks = calculatedTicks.filter(
        (row, index) => priorityTicks.includes(row.type) || index % 2 === 0,
      )

      if (calculatedTicks.length === lastTickCount) {
        calculatedTicks = calculatedTicks.filter((row) => priorityTicks.includes(row.type))

        priorityTicks.pop()
      }

      lastTickCount = calculatedTicks.length
    }

    return calculatedTicks
  }

  const ticks = generateTicks()

  const getTimelineLeftPosition = (startTime: number) => {
    return `${Math.max((100 * (startTime - filteredRange[0])) / filteredRangeDuration, 0)}%`
  }

  const getTimelineWidth = (timelineRange: DateRange) => {
    return `${
      (100 *
        (Math.min(timelineRange[1], filteredRange[1]) -
          Math.max(timelineRange[0], filteredRange[0]))) /
      filteredRangeDuration
    }%`
  }

  return (
    <div className={classes.chartContainer}>
      <div className={classes.chartBox}>
        <Group mb='md' mt={30}>
          <Text fw='bold'>Timeline Range Filter:</Text>
          <RangeSlider
            style={{ flex: 1 }}
            min={totalRange[0]}
            max={totalRange[1]}
            step={3600 * 24 * 1000}
            value={filteredRange}
            onChange={setRange}
            label={(value) => formatDate(new Date(value), { withTime: false })}
          />
        </Group>
        <div className={classes.headers}>
          {columns.map((column) => (
            <div
              key={column.label}
              className={classes.dataHeader}
              style={{ width: column.width, textAlign: column.textAlign }}
            >
              {column.label}
            </div>
          ))}
          <div className={classes.timelineHeader}>
            {ticks.map((tick) => (
              <div
                key={tick.value}
                className={classes.timelineTick}
                style={{
                  left: getTimelineLeftPosition(tick.value),
                }}
              >
                {tick.label}
              </div>
            ))}
          </div>
        </div>
        <div
          className={classes.content}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onWheel={handleWheel}
          style={{ touchAction: 'pan-x pan-y' }}
        >
          <div className={classes.contentBackground}>
            {columns.map((column) => (
              <div
                key={column.label}
                className={classes.columnBackground}
                style={{ width: column.width }}
              />
            ))}
            <div className={classes.timelineBackground}>
              {isInDateRange([currentTime, currentTime], filteredRange) && (
                <div
                  className={classes.nowDivider}
                  style={{
                    left: getTimelineLeftPosition(currentTime),
                  }}
                />
              )}
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.groupId} className={classes.groupRow}>
              <div>
                <Button
                  variant='transparent'
                  px={0}
                  onClick={() =>
                    setCollapsedGroups((prev) =>
                      prev.includes(group.groupId)
                        ? [...prev.filter((x) => x !== group.groupId)]
                        : [...prev, group.groupId],
                    )
                  }
                  rightSection={
                    collapsedGroups.includes(group.groupId) ? <CaretDown /> : <CaretUp />
                  }
                >
                  {group.groupNode}
                </Button>
              </div>
              <div className={classes.groupContent}>
                <Collapse in={!collapsedGroups.includes(group.groupId)}>
                  {data
                    .filter((row) => row.groupId === group.groupId)
                    .map((item) => (
                      <Popover
                        key={item.id}
                        opened={popover === `${item.groupId}-${item.id}`}
                        withArrow
                        shadow='md'
                      >
                        <Popover.Target>
                          <div
                            className={classes.groupContentRow}
                            style={{
                              cursor: onItemClick ? 'pointer' : undefined,
                            }}
                            onMouseEnter={() => setPopover(`${item.groupId}-${item.id}`)}
                            onMouseLeave={() => setPopover(undefined)}
                            onClick={() => onItemClick?.(item)}
                          >
                            {columns.map((column, index) => (
                              <div
                                key={column.label}
                                className={classes.dataColumn}
                                style={{ width: column.width, textAlign: column.textAlign }}
                              >
                                {item.columns[index]}
                              </div>
                            ))}
                            <div className={classes.timelineColumn}>
                              {item.timeline
                                .filter((timelineItem) =>
                                  isInDateRange(
                                    [
                                      timelineItem.startDate.getTime(),
                                      timelineItem.endDate.getTime(),
                                    ],
                                    filteredRange,
                                  ),
                                )
                                .map((timelineItem) => (
                                  <div
                                    key={timelineItem.startDate.getTime()}
                                    className={classes.timelinePart}
                                    onMouseEnter={() => setHoveredTimelineItem(timelineItem.id)}
                                    onMouseLeave={() => setHoveredTimelineItem(undefined)}
                                    style={{
                                      left: getTimelineLeftPosition(
                                        timelineItem.startDate.getTime(),
                                      ),
                                      width: getTimelineWidth([
                                        timelineItem.startDate.getTime(),
                                        timelineItem.endDate.getTime(),
                                      ]),
                                      backgroundColor: timelineItem.color,
                                    }}
                                  />
                                ))}
                              {item.events
                                .filter((timelineEvent) =>
                                  isInDateRange(
                                    [timelineEvent.time.getTime(), timelineEvent.time.getTime()],
                                    filteredRange,
                                  ),
                                )
                                .map((timelineEvent) => (
                                  <div
                                    key={timelineEvent.time.getTime()}
                                    className={classes.timelineEvent}
                                    onMouseEnter={() => setHoveredEventItem(timelineEvent.id)}
                                    onMouseLeave={() => setHoveredEventItem(undefined)}
                                    style={{
                                      left: getTimelineLeftPosition(timelineEvent.time.getTime()),
                                    }}
                                  >
                                    {timelineEvent.icon}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </Popover.Target>
                        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                          {itemPopover(
                            item,
                            item.timeline.find((row) => row.id === hoveredTimelineItem),
                            item.events.find((row) => row.id === hoveredEventItem),
                          )}
                        </Popover.Dropdown>
                      </Popover>
                    ))}
                </Collapse>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GanttChart
