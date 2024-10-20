import * as classes from './GanttChart.module.css'
import { ArrayElement, arrayUnique } from '../../utils/array'
import { ReactNode, useMemo, useState, useEffect, CSSProperties } from 'react'
import { Button, Collapse, Popover, Skeleton } from '@mantine/core'
import { CaretDown, CaretUp } from 'phosphor-react'
import { DateRange, GanttChartContext, IGanttChartContext, IGanttChartDataElement } from './context'
import GanttChartRangeSlider from './components/GanttChartRangeSlider/GanttChartRangeSlider'
import GanttChartZoomContainer from './components/GanttChartZoomContainer/GanttChartZoomContainer'
import GanttChartTicks from './components/GanttChartTicks/GanttChartTicks'

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
  minRange?: DateRange
  initialRangeDuration?: number
  rangeStorageKey?: string
}

const GanttChart = (props: IGanttChartProps) => {
  const {
    columns,
    data,
    itemPopover,
    onItemClick,
    minRange,
    initialRangeDuration = 3600 * 24 * 30 * 3 * 1000,
    rangeStorageKey,
  } = props

  const storedRangeKey = rangeStorageKey ? `gantt-chart-range-${rangeStorageKey}` : undefined
  const storedRange = useMemo<DateRange | undefined>(() => {
    if (!storedRangeKey) {
      return undefined
    }

    const rawRange = localStorage.getItem(storedRangeKey)

    if (rawRange === null) {
      return undefined
    }

    try {
      return JSON.parse(rawRange)
    } catch {
      return undefined
    }
  }, [storedRangeKey && localStorage.getItem(storedRangeKey)])

  const [range, setRange] = useState<DateRange | undefined>(storedRange)
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])

  const [popover, setPopover] = useState<string>()
  const [hoveredTimelineItem, setHoveredTimelineItem] = useState<string>()
  const [hoveredEventItem, setHoveredEventItem] = useState<string>()

  useEffect(() => {
    if (storedRangeKey && range) {
      localStorage.setItem(storedRangeKey, JSON.stringify(range))
    }
  }, [range, storedRangeKey])

  const groups: Array<{ groupId: string; groupNode: ReactNode }> = arrayUnique(
    data?.map((row) => ({
      groupId: row.groupId,
      groupNode: row.groupNode,
    })) || [],
    (a, b) => a.groupId === b.groupId,
  )

  const currentTime = useMemo(() => Date.now(), [])

  const contextValue = useMemo<IGanttChartContext>(() => {
    // Calculate total range based on the provided data
    const totalRange: DateRange = [
      Math.min(
        ...(data ?? []).map((item) =>
          Math.min(
            ...item.timeline.map((timelineItem) => timelineItem.startDate.getTime()),
            ...item.events.map((timelineEvent) => timelineEvent.time.getTime()),
          ),
        ),
        ...(minRange ? [minRange[0]] : []),
      ),
      Math.max(
        ...(data ?? []).map((item) =>
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

    const isVisible = (timelineRange: DateRange) => {
      const [rangeStart, rangeEnd] = timelineRange
      const [visibleStart, visibleEnd] = filteredRange

      return rangeEnd >= visibleStart && rangeStart <= visibleEnd
    }

    return {
      data: data || [],
      currentTime,
      totalRange,
      filteredRange,
      setRange,
      getTimelineLeftPosition,
      getTimelineWidth,
      isVisible,
    }
  }, [data, currentTime, range?.join(','), minRange?.join(','), initialRangeDuration])

  const { getTimelineLeftPosition, getTimelineWidth, isVisible } = contextValue

  if (!data) {
    return <Skeleton height={200} />
  }

  if (data.length === 0) {
    return null
  }

  return (
    <GanttChartContext.Provider value={contextValue}>
      <div className={classes.chartContainer}>
        <div className={classes.chartBox}>
          <GanttChartRangeSlider />
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
            <GanttChartTicks />
          </div>
          <GanttChartZoomContainer>
            <div className={classes.contentBackground}>
              {columns.map((column) => (
                <div
                  key={column.label}
                  className={classes.columnBackground}
                  style={{ width: column.width }}
                />
              ))}
              <div className={classes.timelineBackground}>
                {isVisible([currentTime, currentTime]) && (
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
                                    isVisible([
                                      timelineItem.startDate.getTime(),
                                      timelineItem.endDate.getTime(),
                                    ]),
                                  )
                                  .map((timelineItem, index) => (
                                    <div
                                      key={index + ' ' + timelineItem.startDate.getTime()}
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
                                    isVisible([
                                      timelineEvent.time.getTime(),
                                      timelineEvent.time.getTime(),
                                    ]),
                                  )
                                  .map((timelineEvent) => (
                                    <div
                                      key={timelineEvent.id}
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
          </GanttChartZoomContainer>
        </div>
      </div>
    </GanttChartContext.Provider>
  )
}

export default GanttChart
