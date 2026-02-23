import { Hono } from 'hono'
import { db } from '../db.js'
import { studentSchema } from '../validation/student.schema.js'
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export const students = new Hono()

// GET all students
students.get('/', async (c) => {
  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM students')
  return c.json(rows)
})

// GET student by ID
students.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM students WHERE id = ?',
    [id]
  )

  if (rows.length === 0)
    return c.json({ message: 'Student not found' }, 404)

  return c.json(rows[0])
})

// CREATE student
students.post('/', async (c) => {
  try {
    const body = await c.req.json()
    console.log('Received body:', body)
    
    const validated = studentSchema.safeParse(body)

    if (!validated.success) {
      console.log('Validation errors:', validated.error)
      return c.json({ error: validated.error }, 400)
    }

    const { email } = validated.data

    const [existing] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM students WHERE email = ?',
      [email]
    )

    if (existing.length > 0)
      return c.json({ message: 'Email already exists' }, 409)

    await db.execute<ResultSetHeader>(
      'INSERT INTO students (first_name, last_name, email, age, course, year_level, gpa, enrollment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        validated.data.first_name,
        validated.data.last_name,
        validated.data.email,
        validated.data.age,
        validated.data.course,
        validated.data.year_level,
        validated.data.gpa,
        validated.data.enrollment_status
      ]
    )
    
    return c.json({ message: 'Student created successfully' }, 201)
  } catch (error) {
    console.error('Error creating student:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// UPDATE student
students.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const validated = studentSchema.safeParse(body)
  if (!validated.success)
    return c.json(validated.error, 400)

  const [result] = await db.execute<ResultSetHeader>(
    'UPDATE students SET first_name = ?, last_name = ?, email = ?, age = ?, course = ?, year_level = ?, gpa = ?, enrollment_status = ? WHERE id = ?',
    [
      validated.data.first_name,
      validated.data.last_name,
      validated.data.email,
      validated.data.age,
      validated.data.course,
      validated.data.year_level,
      validated.data.gpa,
      validated.data.enrollment_status,
      id
    ]
  )

  if (result.affectedRows === 0)
    return c.json({ message: 'Student not found' }, 404)

  return c.json({ message: 'Student updated successfully' })
})

// DELETE student
students.delete('/:id', async (c) => {
  const id = c.req.param('id')

  const [result] = await db.execute<ResultSetHeader>(
    'DELETE FROM students WHERE id = ?',
    [id]
  )

  if (result.affectedRows === 0)
    return c.json({ message: 'Student not found' }, 404)

  return c.json({ message: 'Student deleted successfully' })
})