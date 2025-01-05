import express from 'express'
import sqlite3 from 'sqlite3'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 4001
const db = new sqlite3.Database('memories.db')

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
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

// Enable CORS for all routes
app.use(cors())
app.use(express.json())
// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

db.serialize(() => {
  // Create memories table
  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      timestamp DATE
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

app.get('/memories', (req, res) => {
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
    GROUP BY m.id
    ORDER BY m.timestamp DESC
  `, (err, rows) => {
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

app.post('/memories', (req, res) => {
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

    // Insert memory
    const memoryStmt = db.prepare(
      'INSERT INTO memories (title, description, timestamp) VALUES (?, ?, ?)'
    )

    memoryStmt.run(title, description, timestamp, function (err) {
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

app.get('/memories/:id', (req, res) => {
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
    WHERE m.id = ?
    GROUP BY m.id
  `, [id], (err, row) => {
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

app.put('/memories/:id', (req, res) => {
  const { id } = req.params
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

    // Update memory
    const memoryStmt = db.prepare(
      'UPDATE memories SET title = ?, description = ?, timestamp = ? WHERE id = ?'
    )

    memoryStmt.run(title, description, timestamp, id, (err) => {
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

app.delete('/memories/:id', (req, res) => {
  const { id } = req.params

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
        db.run('DELETE FROM memories WHERE id = ?', [id], (err) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
