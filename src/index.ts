import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { students } from './routes/students.js'

const app = new Hono()

// Add CORS middleware
app.use('/*', cors({
  origin: 'http://localhost:4200',
  allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
  credentials: true,
}))

// Mount the students routes at /students
app.route('/students', students)

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})