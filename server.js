import 'dotenv/config'
import express from 'express'

// ── Imports de Rotas do Novo App de Leitura ─────────────────────
import studentsRouter from './routes/students.js'       
import readingsRouter from './routes/readings.js'       
import rankingsRouter from './routes/rankings.js'       
import adminRouter from './routes/admin.js'             

const app = express()

// ── Middlewares Globais ──────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configuração do CORS (Para permitir a comunicação do Front com o Back)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})

// ── Definição das Rotas Oficiais ─────────────────────────────────
app.use('/api/students', studentsRouter)
app.use('/api/readings', readingsRouter)
app.use('/api/rankings', rankingsRouter)
app.use('/api/admin', adminRouter) 

// Diagnóstico rápido (Para você testar no navegador)
app.get('/health', (_, res) => res.json({ status: 'ok', environment: 'reading-app' }))

// Tratamento de Erro 404 para caminhos errados
app.use((req, res) => res.status(404).json({ error: `A rota ${req.path} não existe neste servidor.` }))

// Executa o servidor localmente caso não esteja em produção (Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`🚀 API Escolar rodando localmente em http://localhost:${PORT}`)
    })
}

export default app
