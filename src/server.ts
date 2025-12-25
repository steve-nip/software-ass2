import express from 'express'
import { db } from './db.js'
import { ImageMessager } from './prepare'
import cors from "cors";
import {annotationRoute} from './api/annotation'
import { imageRoute } from './api/image'
import {labelRoute} from './api/label'
import { mkdirSync } from 'fs';
import path from 'path';

let app = express();

// 確保 uploads 資料夾存在（專案根目錄）
mkdirSync(path.join(__dirname, '../uploads'), { recursive: true })

// 提供前端靜態檔案（public 資料夾）
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// API routes
app.use('/api', imageRoute)  
app.use('/api', annotationRoute)
app.use('/api', labelRoute)

// 提供上傳的圖片檔案（uploads 資料夾）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 捕捉所有其他請求，回傳 index.html（支援前端路由）
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

let port = 8100;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Open http://localhost:${port} in browser`)
})

// 為了讓測試可以使用 Supertest 直接測試 app
export { app };