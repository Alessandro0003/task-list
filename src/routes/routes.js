import { Database } from "../config/database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "../utils/build-route-path.js";

const database = new Database();

export const routes = [

  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title is required' }),
        )
      }

      if (!description) {
        return res.writeHead(400).end(
          JSON.stringify({message: 'description is required' })
        )
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', task)

      return res.writeHead(201).end(JSON.stringify({ message: 'Task created success !!'}))
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks))
    }
  },

  {
    method: 'GET',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { search } = req.query

      const tasks = database.select('tasks', { id } ,{
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks))
    }
  },

  

  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),

    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end(JSON.stringify({ message: 'Task not found!!'}))
      }

      database.update('tasks', id, {
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: new Date()
      })

      return res.writeHead(200).end(JSON.stringify({message: 'Task updated success'}))
    }
  },

  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params

        const [ task ] = database.select('tasks', { id })

        if (!task) {
          return res.writeHead(404).end(JSON.stringify({ message: 'Task not found!!'}))
        }

        database.delete('tasks', id)

        return res.writeHead(200).end(JSON.stringify({ message: 'Task deleted success!!'}))
    }
  },

  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      const isTaskCompleted = !!task.completed_at
      const completed_at = isTaskCompleted ? null : new Date()

      database.update('tasks', id, { completed_at })

      if (completed_at) {
        return res.writeHead(200).end(JSON.stringify({ message: 'Task completed success!!'}))
      } 
      return res.writeHead(204).end()
    }
  }
]