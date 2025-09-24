"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database } from "@/lib/supabase/database.types"
import { dayNames } from "./types" // Keep dayNames for UI iteration

// Use the generated Supabase types as the single source of truth
type Room = Database["public"]["Tables"]["room"]["Row"]
type TimeSlot = Database["public"]["Tables"]["timeslot"]["Row"]
type Course = Database["public"]["Tables"]["course"]["Row"]
type CourseOffering = Database["public"]["Tables"]["course_offering"]["Row"]
type Faculty = Database["public"]["Tables"]["faculty"]["Row"]
type DayName = Database["public"]["Enums"]["day_name"]
type CourseType = Database["public"]["Enums"]["course_type"]

// Payloads for insert forms should use the 'Insert' types
type RoomInsert = Database["public"]["Tables"]["room"]["Insert"]
type TimeSlotInsert = Database["public"]["Tables"]["timeslot"]["Insert"]
type CourseInsert = Database["public"]["Tables"]["course"]["Insert"]
type CourseOfferingInsert = Database["public"]["Tables"]["course_offering"]["Insert"]
type FacultyInsert = Database["public"]["Tables"]["faculty"]["Insert"]
type TimetableEntryInsert = Database["public"]["Tables"]["timetable_entry"]["Insert"]

type Context = {
  termId: number | null
  timeslots: TimeSlot[]
  rooms: Room[]
  faculty: Faculty[]
  courses: Course[]
  offerings: CourseOffering[]
}

export function AddEntitiesPanel(props: {
  onAddRoom: (payload: RoomInsert) => void
  onAddTimeSlot: (payload: Omit<TimeSlotInsert, "term_id">) => void
  onAddCourse: (payload: CourseInsert) => void
  onAddOffering: (payload: Omit<CourseOfferingInsert, "term_id">) => void
  onAddFaculty: (payload: FacultyInsert) => void
  onAddEntry: (payload: Omit<TimetableEntryInsert, "term_id">) => void
  context: Context
}) {
  const { context } = props

  return (
    <Tabs defaultValue="room">
      <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
        <TabsTrigger value="room">Room</TabsTrigger>
        <TabsTrigger value="timeslot">TimeSlot</TabsTrigger>
        <TabsTrigger value="course">Course</TabsTrigger>
        <TabsTrigger value="offering">Offering</TabsTrigger>
        <TabsTrigger value="faculty">Faculty</TabsTrigger>
        <TabsTrigger value="entry">Timetable Entry</TabsTrigger>
      </TabsList>

      <TabsContent value="room">
        <EntityCard title="Add Room">
          <AddRoomForm onSubmit={props.onAddRoom} />
        </EntityCard>
      </TabsContent>

      <TabsContent value="timeslot">
        <EntityCard title="Add TimeSlot">
          <AddTimeSlotForm onSubmit={props.onAddTimeSlot} disabled={!context.termId} />
          {!context.termId && (
            <p className="text-sm opacity-75 mt-2">Select a term above to add a timeslot for that term.</p>
          )}
        </EntityCard>
      </TabsContent>

      <TabsContent value="course">
        <EntityCard title="Add Course">
          <AddCourseForm onSubmit={props.onAddCourse} />
        </EntityCard>
      </TabsContent>

      <TabsContent value="offering">
        <EntityCard title="Add Offering">
          <AddOfferingForm onSubmit={props.onAddOffering} courses={context.courses} disabled={!context.termId} />
          {!context.termId && (
            <p className="text-sm opacity-75 mt-2">Select a term above to add an offering for that term.</p>
          )}
        </EntityCard>
      </TabsContent>

      <TabsContent value="faculty">
        <EntityCard title="Add Faculty">
          <AddFacultyForm onSubmit={props.onAddFaculty} />
        </EntityCard>
      </TabsContent>

      <TabsContent value="entry">
        <EntityCard title="Add Timetable Entry">
          <AddEntryForm
            onSubmit={props.onAddEntry}
            context={context}
            disabled={!context.termId || context.timeslots.length === 0 || context.offerings.length === 0}
          />
          {!context.termId && <p className="text-sm opacity-75 mt-2">Select a term above to add entries.</p>}
        </EntityCard>
      </TabsContent>
    </Tabs>
  )
}

function EntityCard(props: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-secondary text-secondary-foreground">
      <CardHeader>
        <CardTitle className="text-pretty">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
  )
}

function AddRoomForm(props: { onSubmit: (payload: RoomInsert) => void }) {
  const [name, setName] = useState("")
  const [capacity, setCapacity] = useState<number>(40)
  const [roomType, setRoomType] = useState<string>("Lecture")
  const [instituteId, setInstituteId] = useState<number>(1)

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit({
          name,
          capacity,
          room_type: roomType,
          institute_id: instituteId,
        })
        setName("")
        setCapacity(40)
        setRoomType("Lecture")
        setInstituteId(1)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="room-name">Name</Label>
        <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="room-capacity">Capacity</Label>
        <Input
          id="room-capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="room-type">Room Type</Label>
        <Input id="room-type" value={roomType} onChange={(e) => setRoomType(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="room-inst">Institute ID</Label>
        <Input
          id="room-inst"
          type="number"
          min={1}
          value={instituteId}
          onChange={(e) => setInstituteId(Number(e.target.value))}
          required
        />
      </div>
      <Button type="submit" className="md:col-span-4">
        Save Room
      </Button>
    </form>
  )
}

function AddTimeSlotForm(props: { onSubmit: (payload: Omit<TimeSlotInsert, "term_id">) => void; disabled?: boolean }) {
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("10:00")
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit({ start_time: start, end_time: end })
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="ts-start">Start Time</Label>
        <Input
          id="ts-start"
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          disabled={props.disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ts-end">End Time</Label>
        <Input id="ts-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} required disabled={props.disabled} />
      </div>
      <Button type="submit" disabled={props.disabled}>
        Save TimeSlot
      </Button>
    </form>
  )
}

function AddCourseForm(props: { onSubmit: (payload: CourseInsert) => void }) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [ctype, setCtype] = useState<CourseType>("Major")
  const [deptId, setDeptId] = useState<number>(1)
  const [th, setTh] = useState(3)
  const [lab, setLab] = useState(0)

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit({
          course_code: code,
          name,
          course_type: ctype,
          department_id: deptId,
          theory_credits: th,
          lab_credits: lab,
        })
        setCode("")
        setName("")
        setCtype("Major")
        setDeptId(1)
        setTh(3)
        setLab(0)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="c-code">Course Code</Label>
        <Input id="c-code" value={code} onChange={(e) => setCode(e.target.value)} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="c-name">Name</Label>
        <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={ctype} onValueChange={(v) => setCtype(v as CourseType)}>
          <SelectTrigger>
            <SelectValue placeholder="Course Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {["Major", "Minor", "Skill", "AEC", "VAC", "Lab"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-dept">Department ID</Label>
        <Input
          id="c-dept"
          type="number"
          min={1}
          value={deptId}
          onChange={(e) => setDeptId(Number(e.target.value))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-th">Theory Credits</Label>
        <Input id="c-th" type="number" min={0} value={th} onChange={(e) => setTh(Number(e.target.value))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-lab">Lab Credits</Label>
        <Input id="c-lab" type="number" min={0} value={lab} onChange={(e) => setLab(Number(e.target.value))} required />
      </div>
      <Button type="submit" className="md:col-span-6">
        Save Course
      </Button>
    </form>
  )
}

function AddOfferingForm(props: {
  onSubmit: (payload: Omit<CourseOfferingInsert, "term_id">) => void
  courses: Course[]
  disabled?: boolean
}) {
  const [courseId, setCourseId] = useState<number | null>(null)
  const [section, setSection] = useState<string | null>(null)
  const [limit, setLimit] = useState<number | null>(null)

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      onSubmit={(e) => {
        e.preventDefault()
        if (!courseId) return
        props.onSubmit({
          course_id: courseId,
          section,
          enrollment_limit: limit,
        })
        setCourseId(null)
        setSection(null)
        setLimit(null)
      }}
    >
      <div className="space-y-2 md:col-span-2">
        <Label>Course</Label>
        <Select
          value={courseId ? String(courseId) : undefined}
          onValueChange={(v) => setCourseId(Number(v))}
          disabled={props.disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {props.courses.map((c) => (
                <SelectItem key={c.course_id} value={String(c.course_id)}>
                  {c.course_code} — {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="off-sec">Section (opt)</Label>
        <Input id="off-sec" value={section ?? ""} onChange={(e) => setSection(e.target.value || null)} disabled={props.disabled} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="off-limit">Enroll Limit (opt)</Label>
        <Input
          id="off-limit"
          type="number"
          min={1}
          value={limit ?? ""}
          onChange={(e) => setLimit(e.target.value === "" ? null : Number(e.target.value))}
          disabled={props.disabled}
        />
      </div>
      <Button type="submit" disabled={props.disabled || !courseId}>
        Save Offering
      </Button>
    </form>
  )
}

function AddFacultyForm(props: {
  onSubmit: (payload: FacultyInsert) => void
}) {
  const [name, setName] = useState("")
  const [dept, setDept] = useState<number>(1)
  const [email, setEmail] = useState<string | null>(null)

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit({ name, department_id: dept, email })
        setName("")
        setDept(1)
        setEmail(null)
      }}
    >
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="f-name">Name</Label>
        <Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-dept">Department ID</Label>
        <Input
          id="f-dept"
          type="number"
          min={1}
          value={dept}
          onChange={(e) => setDept(Number(e.target.value))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="f-email">Email (opt)</Label>
        <Input id="f-email" type="email" value={email ?? ""} onChange={(e) => setEmail(e.target.value || null)} />
      </div>
      <Button type="submit">Save Faculty</Button>
    </form>
  )
}

function AddEntryForm(props: {
  onSubmit: (payload: Omit<TimetableEntryInsert, "term_id">) => void
  context: Context
  disabled?: boolean
}) {
  const { context } = props
  const [day, setDay] = useState<DayName>("Mon")
  const [timeslotId, setTimeslotId] = useState<number | null>(null)
  const [offeringId, setOfferingId] = useState<number | null>(null)
  const [roomId, setRoomId] = useState<number | null>(null)
  const [facultyId, setFacultyId] = useState<number | null>(null)

  const timeslotOptions = useMemo(
    () =>
      context.timeslots
        .slice()
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((t) => ({ value: t.timeslot_id, label: `${t.start_time}–${t.end_time}` })),
    [context.timeslots],
  )

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
      onSubmit={(e) => {
        e.preventDefault()
        if (!timeslotId || !offeringId || !roomId || !facultyId) return
        props.onSubmit({
          day,
          timeslot_id: timeslotId,
          offering_id: offeringId,
          room_id: roomId,
          faculty_id: facultyId,
        })
        setTimeslotId(null)
        setOfferingId(null)
        setRoomId(null)
        setFacultyId(null)
        setDay("Mon")
      }}
    >
      <div className="space-y-2">
        <Label>Day</Label>
        <Select value={day} onValueChange={(v) => setDay(v as DayName)} disabled={props.disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dayNames.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>TimeSlot</Label>
        <Select
          value={timeslotId ? String(timeslotId) : undefined}
          onValueChange={(v) => setTimeslotId(Number(v))}
          disabled={props.disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select timeslot" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {timeslotOptions.map((t) => (
                <SelectItem key={t.value} value={String(t.value)}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Offering</Label>
        <Select
          value={offeringId ? String(offeringId) : undefined}
          onValueChange={(v) => setOfferingId(Number(v))}
          disabled={props.disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select offering" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {context.offerings.map((o) => {
                const course = context.courses.find((c) => c.course_id === o.course_id)
                return (
                  <SelectItem key={o.offering_id} value={String(o.offering_id)}>
                    {course ? `${course.course_code} — ${course.name}` : `Offering #${o.offering_id}`}
                    {o.section ? ` • ${o.section}` : ""}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Room</Label>
        <Select
          value={roomId ? String(roomId) : undefined}
          onValueChange={(v) => setRoomId(Number(v))}
          disabled={props.disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select room" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {context.rooms.map((r) => (
                <SelectItem key={r.room_id} value={String(r.room_id)}>
                  {r.name} ({r.capacity})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Faculty</Label>
        <Select
          value={facultyId ? String(facultyId) : undefined}
          onValueChange={(v) => setFacultyId(Number(v))}
          disabled={props.disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {context.faculty.map((f) => (
                <SelectItem key={f.faculty_id} value={String(f.faculty_id)}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={props.disabled} className="md:col-span-6">
        Save Entry
      </Button>
    </form>
  )
}
