import { z } from 'zod'

export const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().int().positive('Age must be a positive number'),
  course: z.string().min(1, 'Course is required'),
  year_level: z.number().int().min(1).max(5),
  gpa: z.number().min(0).max(4.0),
  enrollment_status: z.string().optional().default('enrolled')
})

export type StudentInput = z.infer<typeof studentSchema>