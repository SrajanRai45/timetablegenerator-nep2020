"use client"

import { Card } from "@/components/ui/card"
import type { DayName, Room, TimeSlot, TimetableEntry, Course, CourseOffering, Faculty } from "./types"

export function TimetableGrid(props: {
  termId: number | null
  days: DayName[]
  timeSlots: TimeSlot[]
  entries: TimetableEntry[]
  offeringById: Map<number, CourseOffering>
  courseById: Map<number, Course>
  roomById: Map<number, Room>
  facultyById: Map<number, Faculty>
}) {
  const { days, timeSlots, entries } = props
  // Build a lookup: key = `${day}-${timeslot_id}`
  const cell = new Map<string, TimetableEntry>()
  for (const e of entries) {
    const k = `${e.day}-${e.timeslot_id}`
    cell.set(k, e)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `minmax(120px, 1fr) repeat(${days.length}, minmax(200px, 1fr))`,
        }}
      >
        {/* Header Row */}
        <div className="sticky left-0 z-10 bg-muted/40 font-medium px-3 py-2 border border-border">Time</div>
        {days.map((d) => (
          <div key={d} className="text-center font-medium px-3 py-2 border border-border bg-muted/40">
            {d}
          </div>
        ))}

        {/* Rows */}
        {timeSlots
          .slice()
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .map((ts) => (
            <>
              <div
                key={`label-${ts.timeslot_id}`}
                className="sticky left-0 z-10 bg-card px-3 py-3 border border-border"
              >
                <div className="text-sm font-medium">
                  {ts.start_time} – {ts.end_time}
                </div>
              </div>
              {days.map((d) => {
                const k = `${d}-${ts.timeslot_id}`
                const e = cell.get(k)
                return (
                  <div key={k} className="px-3 py-3 border border-border">
                    {e ? <EntryCard entry={e} {...props} /> : <EmptyCell />}
                  </div>
                )
              })}
            </>
          ))}
      </div>
    </div>
  )
}

function EmptyCell() {
  return <div className="text-sm opacity-60">—</div>
}

function EntryCard(props: {
  entry: TimetableEntry
  offeringById: Map<number, CourseOffering>
  courseById: Map<number, Course>
  roomById: Map<number, Room>
  facultyById: Map<number, Faculty>
}) {
  const { entry, offeringById, courseById, roomById, facultyById } = props
  const offering = offeringById.get(entry.offering_id)
  const course = offering ? courseById.get(offering.course_id) : undefined
  const room = roomById.get(entry.room_id)
  const fac = facultyById.get(entry.faculty_id)

  return (
    <Card className="bg-secondary text-secondary-foreground p-2">
      <div className="text-sm font-medium text-pretty">
        {course ? `${course.course_code} — ${course.name}` : `Offering #${entry.offering_id}`}
      </div>
      <div className="text-xs opacity-80 mt-1">
        {room ? `Room: ${room.name}` : "Room: —"}
        {" · "}
        {fac ? `Faculty: ${fac.name}` : "Faculty: —"}
      </div>
    </Card>
  )
}
