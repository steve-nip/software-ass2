import { Router } from "express"
import { db } from "../db"

let labelRoute = Router()

let list_labels = db.prepare(/* sql */`
    SELECT id, name, created_time
    FROM label
    ORDER BY name COLLATE NOCASE
`)

let insert_label = db.prepare(/* sql */`
    INSERT INTO label (name) 
    VALUES (?)
    RETURNING id, name, created_time
`)

let check_label_exists = db.prepare(/* sql */`
    SELECT id FROM label WHERE name = ?
`)

labelRoute.get('/labels', (req, res) => {
    try {
        let labels = list_labels.all()
        res.status(200).json({ labels })
    } catch (error) {
        console.error('GET /api/labels error:', error)
        res.status(500).json({ error: 'Failed to load labels' })
    }
})

labelRoute.post('/labels', (req, res) => {
    try {
        let { name } = req.body as { name?: string }

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Invalid label name' })
        }

        name = name.trim()

        // 檢查是否已存在（避免重複）
        const existing = check_label_exists.get(name)
        if (existing) {
            return res.status(400).json({ error: 'Label name already exists' })
        }

        // 讓資料庫自動產生 created_time
        const result = insert_label.get(name)

        res.status(201).json({
            id: result.id,
            name: result.name,
            created_time: result.created_time
        })
    } catch (error) {
        console.error('POST /api/labels error:', error)
        res.status(500).json({ error: 'Failed to create label' })
    }
})

export { labelRoute }