
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AddEntitiesPanel } from "@/components/timetable/add-entities"
import { TuplesTable } from "@/components/timetable/tuples-table"
import { TimetableGrid } from "@/components/timetable/timetable-grid"
import { dayNames, dayOrder } from "@/components/timetable/types"
import { supabase } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"
import { toast } from "sonner"

// Define types based on the database schema for type-safety
type Program = Database["public"]["Tables"]["program"]["Row"]
type Term = Database["public"]["Tables"]["term"]["Row"]
type Room = Database["public"]["Tables"]["room"]["Row"]
type TimeSlot = Database["public"]["Tables"]["timeslot"]["Row"]
type Course = Database["public"]["Tables"]["course"]["Row"]
type CourseOffering = Database["public"]["Tables"]["course_offering"]["Row"]
type Faculty = Database["public"]["Tables"]["faculty"]["Row"]
type TimetableEntry = Database["public"]["Tables"]["timetable_entry"]["Row"]

export default function HomePage() {
  // Data state, fetched from Supabase
  const [programs, setPrograms] = useState<Program[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [offerings, setOfferings] = useState<CourseOffering[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])

  // UI selection state
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null)

  // --- Data Fetching ---

  // Fetch initial non-dependent data
  const fetchInitialData = useCallback(async () => {
    const [programs, rooms, courses, faculty] = await Promise.all([
      supabase.from("program").select("*"),
      supabase.from("room").select("*"),
      supabase.from("course").select("*"),
      supabase.from("faculty").select("*"),
    ])

    if (programs.data) setPrograms(programs.data)
    if (rooms.data) setRooms(rooms.data)
    if (courses.data) setCourses(courses.data)
    if (faculty.data) setFaculty(faculty.data)

    if (programs.data?.length) {
      const initialProgramId = programs.data[0].program_id
      setSelectedProgramId(initialProgramId)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Fetch terms when a program is selected
  const fetchTerms = useCallback(async () => {
    if (!selectedProgramId) {
      setTerms([])
      setSelectedTermId(null)
      return
    }
    const { data } = await supabase.from("term").select("*").eq("program_id", selectedProgramId)
    setTerms(data ?? [])
    if (data?.length) {
      setSelectedTermId(data[0].term_id)
    } else {
      setSelectedTermId(null)
    }
  }, [selectedProgramId])

  useEffect(() => {
    fetchTerms()
  }, [fetchTerms])

  // Fetch term-dependent data
  const fetchTermData = useCallback(async () => {
    if (!selectedTermId) {
      setTimeSlots([])
      setOfferings([])
      setEntries([])
      return
    }
    const [timeslots, offerings, entries] = await Promise.all([
      supabase.from("timeslot").select("*").eq("term_id", selectedTermId),
      supabase.from("course_offering").select("*").eq("term_id", selectedTermId),
      supabase.from("timetable_entry").select("*").eq("term_id", selectedTermId),
    ])
    if (timeslots.data) setTimeSlots(timeslots.data)
    if (offerings.data) setOfferings(offerings.data)
    if (entries.data) setEntries(entries.data)
  }, [selectedTermId])

  useEffect(() => {
    fetchTermData()
  }, [fetchTermData])

  // --- Derived Data for UI ---

  const availableTerms = useMemo(
    () => terms.filter((t) => (selectedProgramId ? t.program_id === selectedProgramId : true)),
    [terms, selectedProgramId],
  )

  // Maps for efficient lookups in rendering
  const roomById = useMemo(() => new Map(rooms.map((r) => [r.room_id, r])), [rooms])
  const facultyById = useMemo(() => new Map(faculty.map((f) => [f.faculty_id, f])), [faculty])
  const courseById = useMemo(() => new Map(courses.map((c) => [c.course_id, c])), [courses])
  const offeringById = useMemo(() => new Map(offerings.map((o) => [o.offering_id, o])), [offerings])

  // --- Event Handlers ---

  const handleGenerate = async () => {
    if (!selectedTermId) return

    toast.info("Generating timetable...", { id: "generate-toast", duration: 0 })

    try {
      const { data, error } = await supabase.functions.invoke("generate-timetable", {
        body: { term_id: selectedTermId },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      toast.success("Timetable generated successfully!", { id: "generate-toast" })
      fetchTermData() // Refresh entries
    } catch (error: any) {
      toast.error("Failed to generate timetable.", { id: "generate-toast", description: error.message })
    }
  }

  // Generic handler to add an entity and refresh its data
  const handleAddEntity = async <T extends { data: any[] | null; error: any }>(
    promise: Promise<T>,
    refreshFunc: () => void,
    name: string,
  ) => {
    const { error } = await promise
    if (error) {
      toast.error(`Failed to add ${name}.`, { description: error.message })
    } else {
      toast.success(`${name} added successfully.`)
      refreshFunc()
    }
  }

  return (
    <main className="min-h-dvh p-4 md:p-6 lg:p-8 space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-pretty">Timetable Generation</CardTitle>
            <CardDescription>Select a Program and Term, then generate or edit the timetable.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={selectedProgramId ? String(selectedProgramId) : ""}
                onValueChange={(v) => setSelectedProgramId(Number(v))}
              >
                <SelectTrigger id="program" aria-label="Select Program">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {programs.map((p) => (
                      <SelectItem key={p.program_id} value={String(p.program_id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select
                value={selectedTermId ? String(selectedTermId) : ""}
                onValueChange={(v) => setSelectedTermId(Number(v))}
                disabled={!availableTerms.length}
              >
                <SelectTrigger id="term" aria-label="Select Term">
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availableTerms.map((t) => (
                      <SelectItem key={t.term_id} value={String(t.term_id)}>
                        {`Year ${t.year} • Sem ${t.semester}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                className="w-full"
                variant="default"
                onClick={handleGenerate}
                disabled={!selectedProgramId || !selectedTermId}
                aria-label="Generate Timetable"
              >
                Generate Timetable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-pretty">Attributes & New Elements</CardTitle>
          <CardDescription>
            Add new Rooms, TimeSlots, Courses, Offerings, Faculty, and Timetable Entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddEntitiesPanel
            onAddRoom={(payload) =>
              handleAddEntity(supabase.from("room").insert(payload as any), fetchInitialData, "Room")
            }
            onAddTimeSlot={(payload) => {
              if (!selectedTermId) return
              handleAddEntity(
                supabase.from("timeslot").insert({ ...payload, term_id: selectedTermId }),
                fetchTermData,
                "Time Slot",
              )
            }}
            onAddCourse={(payload) =>
              handleAddEntity(supabase.from("course").insert(payload as any), fetchInitialData, "Course")
            }
            onAddOffering={(payload) => {
              if (!selectedTermId) return
              handleAddEntity(
                supabase.from("course_offering").insert({ ...payload, term_id: selectedTermId }),
                fetchTermData,
                "Course Offering",
              )
            }}
            onAddFaculty={(payload) =>
              handleAddEntity(supabase.from("faculty").insert(payload as any), fetchInitialData, "Faculty")
            }
            onAddEntry={(payload) => {
              if (!selectedTermId) return
              handleAddEntity(
                supabase.from("timetable_entry").insert({ ...payload, term_id: selectedTermId }),
                fetchTermData,
                "Timetable Entry",
              )
            }}
            context={{
              termId: selectedTermId ?? null,
              timeslots: timeSlots,
              rooms,
              faculty,
              courses,
              offerings: offerings,
            }}
          />
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-pretty">Tuples (Table Contents)</CardTitle>
          <CardDescription>Current data for each schema table.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section aria-labelledby="rooms-heading">
            <h3 id="rooms-heading" className="text-sm font-medium opacity-80 mb-2">
              room
            </h3>
            <TuplesTable
              items={rooms}
              columns={[
                { key: "room_id", header: "ID" },
                { key: "name", header: "Name" },
                { key: "capacity", header: "Capacity" },
                { key: "room_type", header: "Type" },
              ]}
            />
          </section>

          <Separator />

          <section aria-labelledby="timeslots-heading">
            <h3 id="timeslots-heading" className="text-sm font-medium opacity-80 mb-2">
              timeslot (current term)
            </h3>
            <TuplesTable
              items={timeSlots}
              columns={[
                { key: "timeslot_id", header: "ID" },
                { key: "start_time", header: "Start" },
                { key: "end_time", header: "End" },
              ]}
            />
          </section>

          <Separator />

          <section aria-labelledby="courses-heading">
            <h3 id="courses-heading" className="text-sm font-medium opacity-80 mb-2">
              course
            </h3>
            <TuplesTable
              items={courses}
              columns={[
                { key: "course_id", header: "ID" },
                { key: "course_code", header: "Code" },
                { key: "name", header: "Name" },
                { key: "course_type", header: "Type" },
                { key: "theory_credits", header: "Th" },
                { key: "lab_credits", header: "Lab" },
              ]}
            />
          </section>

          <Separator />

          <section aria-labelledby="offerings-heading">
            <h3 id="offerings-heading" className="text-sm font-medium opacity-80 mb-2">
              course_offering (current term)
            </h3>
            <TuplesTable
              items={offerings.map((o) => ({
                ...o,
                course_name: courseById.get(o.course_id)?.name ?? "",
              }))}
              columns={[
                { key: "offering_id", header: "ID" },
                { key: "course_id", header: "Course ID" },
                { key: "course_name", header: "Course" },
                { key: "section", header: "Section" },
                { key: "enrollment_limit", header: "Limit" },
              ]}
            />
          </section>

          <Separator />

          <section aria-labelledby="faculty-heading">
            <h3 id="faculty-heading" className="text-sm font-medium opacity-80 mb-2">
              faculty
            </h3>
            <TuplesTable
              items={faculty}
              columns={[
                { key: "faculty_id", header: "ID" },
                { key: "name", header: "Name" },
                { key: "email", header: "Email" },
              ]}
            />
          </section>

          <Separator />

          <section aria-labelledby="entries-heading">
            <h3 id="entries-heading" className="text-sm font-medium opacity-80 mb-2">
              timetable_entry (current term)
            </h3>
            <TuplesTable
              items={entries
                .sort((a, b) => {
                  if (a.day === b.day) {
                    const slotA = timeSlots.find(ts => ts.timeslot_id === a.timeslot_id)
                    const slotB = timeSlots.find(ts => ts.timeslot_id === b.timeslot_id)
                    return slotA?.start_time.localeCompare(slotB?.start_time ?? '') ?? 0
                  }
                  return dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder]
                })
                .map((e) => ({
                  ...e,
                  course: (() => {
                    const off = offeringById.get(e.offering_id)
                    return off ? (courseById.get(off.course_id)?.name ?? "") : ""
                  })(),
                  room: roomById.get(e.room_id)?.name ?? "",
                  faculty: facultyById.get(e.faculty_id)?.name ?? "",
                  timeslot: (() => {
                    const ts = timeSlots.find((t) => t.timeslot_id === e.timeslot_id)
                    return ts ? `${ts.start_time}–${ts.end_time}` : ""
                  })(),
                }))}
              columns={[
                { key: "entry_id", header: "ID" },
                { key: "day", header: "Day" },
                { key: "timeslot", header: "Time" },
                { key: "course", header: "Course" },
                { key: "room", header: "Room" },
                { key: "faculty", header: "Faculty" },
              ]}
            />
          </section>
        </CardContent>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-pretty">Timetable</CardTitle>
          <CardDescription>
            Grid view by day and timeslot for the selected term. Add entries or generate above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableGrid
            termId={selectedTermId ?? null}
            days={dayNames}
            timeSlots={timeSlots}
            entries={entries}
            offeringById={offeringById}
            courseById={courseById}
            roomById={roomById}
            facultyById={facultyById}
          />
        </CardContent>
      </Card>
    </main>
  )
}
