import { Router } from "express";
import { Formidable } from "formidable";
import { db } from "../db";
import fs from "fs";
import path from "path";

let imageRoute = Router();

let insert_images = db.prepare(/*sql*/ `
    INSERT INTO image (filename, file_size, mime_type)
    VALUES (:filename, :file_size, :mime_type)
    RETURNING id
`);

let list_images = db.prepare(/*sql*/ `
    SELECT 
        image.id,
        image.filename,
        image.upload_time,
        COUNT(image_label.id) AS labels_count 
    FROM image
    LEFT JOIN image_label ON image.id = image_label.image_id
    GROUP BY image.id 
    ORDER BY image.upload_time DESC
`);

let find_image = db.prepare(/*sql*/ `
    SELECT id, filename, upload_time
    FROM image
    WHERE id = :id 
`);

let list_image_labels = db.prepare(/*sql*/ `
    SELECT 
        label.id AS label_id, 
        label.name,
        label.created_time,
        image_label.id AS image_label_id,
        image_label.annotation_time
    FROM image_label
    JOIN label ON label.id = image_label.label_id
    WHERE image_label.image_id = :image_id
    ORDER BY label.name COLLATE NOCASE 
`);


// ✅ 上傳圖片 API
imageRoute.post("/uploads", async (req, res) => {
    try {
        let form = new Formidable({
            keepExtensions: true,
            uploadDir: path.join(__dirname, "../uploads"),
        });

        let [fields, files] = (await form.parse(req)) as any;
        let filename = files?.image?.[0]?.newFilename;

        if (!filename) {
            throw new Error("No File uploaded");
        }

        let result = insert_images.get({
            filename: filename,
            file_size: files?.image?.[0]?.size || 0,
            mime_type: files?.image?.[0]?.mimetype || "image/jpeg",
        });

        // ✅ 回傳完整 URL
        res.status(200).json({
            image_id: result.id,
            url: `/uploads/${filename}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
    }
});


// ✅ 取得所有圖片（統一回傳 URL）
imageRoute.get("/images", (req, res) => {
    try {
        let images = list_images.all();

        images = images.map(img => ({
            ...img,
            url: `/uploads/${img.filename}`
        }));

        res.status(200).json({ images });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});


// ✅ 取得單一圖片 + labels（統一回傳 URL）
imageRoute.get("/images/:imageId", (req, res) => {
    try {
        let image_id = Number(req.params.imageId);
        if (!Number.isInteger(image_id)) {
            return res.status(400).json({ error: "Invalid image ID" });
        }

        let image = find_image.get({ id: image_id });
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        let labels = list_image_labels.all({ image_id });

        res.status(200).json({
            image: {
                ...image,
                url: `/uploads/${image.filename}`
            },
            labels
        });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});


// ✅ 刪除圖片
imageRoute.delete("/images/:imageId", (req, res) => {
    const imageId = Number(req.params.imageId);

    if (!Number.isInteger(imageId) || imageId <= 0) {
        return res.status(400).json({ error: "Invalid image ID" });
    }

    try {
        const image = find_image.get({ id: imageId });

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        db.prepare("DELETE FROM image_label WHERE image_id = ?").run(imageId);
        db.prepare("DELETE FROM image WHERE id = ?").run(imageId);

        // ✅ 修正檔案路徑，指向正確的 uploads 資料夾
        const filePath = path.join(__dirname, "../uploads", image.filename);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image file:", err);
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Delete image error:", error);
        res.status(500).json({ error: "Failed to delete image" });
    }
});

export { imageRoute };