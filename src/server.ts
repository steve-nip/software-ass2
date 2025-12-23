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

mkdirSync(path.join(__dirname, '../uploads'), { recursive: true })

// 正確 serve 前端檔案（從 src/../public）
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', imageRoute)  
app.use('/api', annotationRoute)
app.use('/api', labelRoute)

// 正確 serve 上傳圖片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 最後捕捉所有剩餘請求
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

let port = 8100;
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Open http://localhost:${port} in browser`)
})

export { app };