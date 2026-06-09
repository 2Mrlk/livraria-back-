import 'dotenv/config'
import express from 'express'

// ── Imports de Rotas do App de Leitura Escolar SESI ─────────────
import studentsRouter from './routes/students.js'       
import readingsRouter from './routes/readings.js'       
import rankingsRouter from './routes/rankings.js'       
import adminRouter from './routes/admin.js'             

const app = express()

// ── Middlewares Globais ──────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS configurado para aceitar requisições de qualquer origem
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})

// ── Rotas Oficiais da Aplicação ──────────────────────────────────
app.use('/api/students', studentsRouter)
app.use('/api/readings', readingsRouter)
app.use('/api/rankings', rankingsRouter)
app.use('/api/admin', adminRouter) 

// Rota de Diagnóstico (Health Check)
app.get('/health', (_, res) => res.json({ status: 'ok', environment: 'vercel', timestamp: new Date().toISOString() }))

// Tratamento de rotas inexistentes (404)
app.use((req, res) => res.status(404).json({ error: `Rota ${req.path} não encontrada no sistema de leitura.` }))

// Executa o listen apenas localmente (Evita erros no ambiente serverless da Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`🚀 API Escolar rodando localmente em http://localhost:${PORT}`)
    })
}

// Essencial para a Vercel mapear as rotas dinamicamente
export default app