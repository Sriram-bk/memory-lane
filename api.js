import express from 'express'
import sqlite3 from 'sqlite3'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // In production, always use environment variable

const app = express()
const port = 4001
const db = new sqlite3.Database('memories.db')

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error(`Invalid file type for ${file.originalname}. Only JPEG, PNG and GIF are allowed.`))
      return
    }
    cb(null, true)
  }
}).array('images', 10)

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create memories table with user_id foreign key
  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      timestamp DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create images table with foreign key to memories
  db.run(`
    CREATE TABLE IF NOT EXISTS memory_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memory_id INTEGER,
      filename TEXT,
      original_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
    )
  `)
})

// Upload endpoint for images
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `File ${err.field} is too large. Maximum size is 5MB.`
        })
      }
      return res.status(400).json({
        error: `Upload error: ${err.message}`
      })
    } else if (err) {
      return res.status(400).json({
        error: err.message
      })
    }

    try {
      const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`
      }))
      res.json({ files })
    } catch (error) {
      // Clean up any uploaded files if there's an error
      req.files?.forEach(file => {
        const filePath = path.join(uploadsDir, file.filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
      res.status(500).json({ error: error.message })
    }
  })
})

// Get all memories for authenticated user
app.get('/memories', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      m.*,
      json_group_array(
        json_object(
          'id', mi.id,
          'url', '/uploads/' || mi.filename,
          'originalName', mi.original_name
        )
      ) as images
    FROM memories m
    LEFT JOIN memory_images mi ON m.id = mi.memory_id
    WHERE m.user_id = ?
    GROUP BY m.id
    ORDER BY m.timestamp DESC
  `, [req.user.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    // Parse the images JSON string for each memory
    const memories = rows.map(memory => ({
      ...memory,
      images: JSON.parse(memory.images).filter(img => img.id !== null)
    }))
    res.json({ memories })
  })
})

// Create new memory for authenticated user
app.post('/memories', authenticateToken, (req, res) => {
  const { title, description, timestamp, images } = req.body

  if (!title || !description || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: title, description, timestamp',
    })
    return
  }

  db.serialize(() => {
    // Begin transaction
    db.run('BEGIN TRANSACTION')

    // Insert memory with user_id
    const memoryStmt = db.prepare(
      'INSERT INTO memories (user_id, title, description, timestamp) VALUES (?, ?, ?, ?)'
    )

    memoryStmt.run(req.user.id, title, description, timestamp, function (err) {
      if (err) {
        db.run('ROLLBACK')
        res.status(500).json({ error: err.message })
        return
      }

      const memoryId = this.lastID

      // If there are images, insert them
      if (images && images.length > 0) {
        const imageStmt = db.prepare(
          'INSERT INTO memory_images (memory_id, filename, original_name) VALUES (?, ?, ?)'
        )

        for (const image of images) {
          const filename = path.basename(image.url)
          imageStmt.run(memoryId, filename, image.originalName, (err) => {
            if (err) {
              db.run('ROLLBACK')
              res.status(500).json({ error: err.message })
              return
            }
          })
        }
        imageStmt.finalize()
      }

      // Commit transaction
      db.run('COMMIT')
      res.status(201).json({ message: 'Memory created successfully', id: memoryId })
    })
  })
})

// Get single memory for authenticated user
app.get('/memories/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  db.get(`
    SELECT 
      m.*,
      json_group_array(
        json_object(
          'id', mi.id,
          'url', '/uploads/' || mi.filename,
          'originalName', mi.original_name
        )
      ) as images
    FROM memories m
    LEFT JOIN memory_images mi ON m.id = mi.memory_id
    WHERE m.id = ? AND m.user_id = ?
    GROUP BY m.id
  `, [id, req.user.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (!row) {
      res.status(404).json({ error: 'Memory not found' })
      return
    }
    // Parse the images JSON string
    const memory = {
      ...row,
      images: JSON.parse(row.images).filter(img => img.id !== null)
    }
    res.json({ memory })
  })
})

// Update memory for authenticated user
app.put('/memories/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { title, description, timestamp, images } = req.body

  if (!title || !description || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: title, description, timestamp',
    })
    return
  }

  // First verify the memory belongs to the user
  db.get('SELECT id FROM memories WHERE id = ? AND user_id = ?', [id, req.user.id], (err, memory) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found or unauthorized' })
    }

    db.serialize(() => {
      // Begin transaction
      db.run('BEGIN TRANSACTION')

      // Update memory
      const memoryStmt = db.prepare(
        'UPDATE memories SET title = ?, description = ?, timestamp = ? WHERE id = ? AND user_id = ?'
      )

      memoryStmt.run(title, description, timestamp, id, req.user.id, (err) => {
        if (err) {
          db.run('ROLLBACK')
          res.status(500).json({ error: err.message })
          return
        }

        // Get existing images
        db.all('SELECT id, filename, original_name FROM memory_images WHERE memory_id = ?', [id], (err, existingImages) => {
          if (err) {
            db.run('ROLLBACK')
            res.status(500).json({ error: err.message })
            return
          }

          // Create a map of existing image URLs to their database records
          const existingImageMap = new Map(
            existingImages.map(img => [`/uploads/${img.filename}`, img])
          )

          // Determine which images to keep and which to delete
          const newImageUrls = new Set(images ? images.map(img => img.url) : [])
          const imagesToDelete = existingImages.filter(img => !newImageUrls.has(`/uploads/${img.filename}`))
          const imagesToAdd = images ? images.filter(img => !existingImageMap.has(img.url)) : []

          // Delete removed images
          const deletePromises = imagesToDelete.map(image => {
            return new Promise((resolve, reject) => {
              // Delete from database
              db.run('DELETE FROM memory_images WHERE id = ?', [image.id], (err) => {
                if (err) {
                  reject(err)
                  return
                }

                // Delete file
                const filePath = path.join(uploadsDir, image.filename)
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath)
                }
                resolve()
              })
            })
          })

          Promise.all(deletePromises)
            .then(() => {
              // Add new images
              if (imagesToAdd.length > 0) {
                const imageStmt = db.prepare(
                  'INSERT INTO memory_images (memory_id, filename, original_name) VALUES (?, ?, ?)'
                )

                imagesToAdd.forEach(image => {
                  const filename = path.basename(image.url)
                  imageStmt.run(id, filename, image.originalName, (err) => {
                    if (err) {
                      throw err
                    }
                  })
                })
                imageStmt.finalize()
              }

              // Commit transaction
              db.run('COMMIT')
              res.json({ message: 'Memory updated successfully' })
            })
            .catch(err => {
              db.run('ROLLBACK')
              res.status(500).json({ error: err.message })
            })
        })
      })
    })
  })
})

// Delete memory for authenticated user
app.delete('/memories/:id', authenticateToken, (req, res) => {
  const { id } = req.params

  // First verify the memory belongs to the user
  db.get('SELECT id FROM memories WHERE id = ? AND user_id = ?', [id, req.user.id], (err, memory) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found or unauthorized' })
    }

    // Get images to delete files
    db.all('SELECT filename FROM memory_images WHERE memory_id = ?', [id], (err, images) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }

      db.serialize(() => {
        // Begin transaction
        db.run('BEGIN TRANSACTION')

        // Delete images first (due to foreign key constraint)
        db.run('DELETE FROM memory_images WHERE memory_id = ?', [id], (err) => {
          if (err) {
            db.run('ROLLBACK')
            res.status(500).json({ error: err.message })
            return
          }

          // Then delete the memory
          db.run('DELETE FROM memories WHERE id = ? AND user_id = ?', [id, req.user.id], (err) => {
            if (err) {
              db.run('ROLLBACK')
              res.status(500).json({ error: err.message })
              return
            }

            // Delete image files
            images.forEach(image => {
              const filePath = path.join(uploadsDir, image.filename)
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
              }
            })

            // Commit transaction
            db.run('COMMIT')
            res.json({ message: 'Memory deleted successfully' })
          })
        })
      })
    })
  })
})

// Authentication endpoints
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide username, email, and password' })
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' })
          }
          return res.status(500).json({ error: err.message })
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' })
        res.status(201).json({ message: 'User created successfully', token })
      }
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide username and password' })
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }

      const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '24h' })
      res.json({ token })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
