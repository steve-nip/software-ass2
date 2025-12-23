import { Router } from "express"
import { db } from "../db"

let annotationRoute = Router()

let find_image = db.prepare(/* sql */`
    SELECT id, filename, upload_time
    FROM image
    WHERE id = :id
`)

let find_label_by_id = db.prepare(/* sql */`
    SELECT id, name, created_time
    FROM label
    WHERE id = :id
`)

let find_image_label = db.prepare(/* sql */`
    SELECT id
    FROM image_label
    WHERE image_id = :image_id AND label_id = :label_id
`)

let insert_image_label = db.prepare(/* sql */`
    INSERT INTO image_label (image_id, label_id, annotation_time)
    VALUES (:image_id, :label_id, CURRENT_TIMESTAMP)
    RETURNING id
`)

let delete_image_label = db.prepare(/* sql */`
    DELETE FROM image_label
    WHERE image_id = :image_id AND label_id = :label_id
`)

annotationRoute.post('/images/:imageId/labels', (req, res) => {
    try {
        const image_id = Number(req.params.imageId)
        const { label_id } = req.body as { label_id?: unknown }
        
        if (!Number.isInteger(image_id) || image_id <= 0) {
            return res.status(400).json({ error: 'Invalid image id' })
        }
        
        if (!Number.isInteger(Number(label_id)) || Number(label_id) <= 0) {
            return res.status(400).json({ error: 'Invalid label id' })
        }
        
        const labelId = Number(label_id)
        
        const image = find_image.get({ id: image_id })
        if (!image) {
            return res.status(404).json({ error: 'Image not found' })
        }
        
        const label = find_label_by_id.get({ id: labelId })
        if (!label) {
            return res.status(404).json({ error: 'Label not found' })
        }

        const existing = find_image_label.get({ image_id, label_id: labelId })
        if (existing) {
            return res.status(409).json({ error: 'Label already assigned to image' })
        }

        // 使用 CURRENT_TIMESTAMP，讓資料庫自動產生時間
        const result = insert_image_label.get({ image_id, label_id: labelId })
        
        res.status(201).json({ 
            message: 'Label assigned successfully',
            annotation_id: result.id 
        })
    } catch (error) {
        console.error('Assign label error:', error)
        res.status(500).json({ error: 'Failed to assign label' })
    }
})

annotationRoute.delete('/images/:imageId/labels/:labelId', (req, res) => {
    try {
        const image_id = Number(req.params.imageId)
        const label_id = Number(req.params.labelId)
        
        if (!Number.isInteger(image_id) || image_id <= 0 || !Number.isInteger(label_id) || label_id <= 0) {
            return res.status(400).json({ error: 'Invalid image or label id' })
        }

        const image = find_image.get({ id: image_id })
        if (!image) {
            return res.status(404).json({ error: 'Image not found' })
        }

        const label = find_label_by_id.get({ id: label_id })
        if (!label) {
            return res.status(404).json({ error: 'Label not found' })
        }

        const removed = delete_image_label.run({ image_id, label_id })
        if (removed.changes === 0) {
            return res.status(404).json({ error: 'Label not assigned to image' })
        }

        res.status(200).json({ message: 'Label removed successfully' })
    } catch (error) {
        console.error('Remove label error:', error)
        res.status(500).json({ error: 'Failed to remove label' })
    }
})

export { annotationRoute }