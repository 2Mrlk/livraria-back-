import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'b7store-secret-change-in-production'

// Middleware interno para validar o token enviado pelo aplicativo do Aluno
async function requireStudent(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso negado. Token estudantil não fornecido.' })
        }
        const token = authHeader.slice(7)
        const payload = jwt.verify(token, JWT_SECRET)
        req.studentId = payload.sub
        next()
    } catch {
        return res.status(401).json({ error: 'Sessão de aluno expirada. Por favor, entre novamente.' })
    }
}

// POST /api/readings/registrar (Salva a leitura do dia com a trava de segurança)
router.post('/registrar', requireStudent, async (req, res) => {
    try {
        const minutos = parseInt(req.body.minutos)
        if (!minutos || minutos <= 0) return res.status(400).json({ error: 'Informe um tempo de leitura válido.' })
        
        // Regra de Negócio: Bloqueia abusos impedindo registros acima de 16 minutos diários
        if (minutos > 16) {
            return res.status(400).json({ error: 'Limite diário excedido! O máximo permitido é de 16 minutos por dia.' })
        }

        const hoje = new Date().toISOString().split('T')[0]

        // Verifica se este aluno já fez um lançamento no dia de hoje
        const { data: existente } = await supabase
            .from('logs_leitura')
            .select('id')
            .eq('aluno_id', req.studentId)
            .eq('data_registro', hoje)
            .single()

        if (existente) {
            return res.status(400).json({ error: 'Você já registrou a sua leitura de hoje! Retorne amanhã para pontuar mais.' })
        }

        // Insere o log de leitura na tabela correspondente
        const { error } = await supabase
            .from('logs_leitura')
            .insert({
                aluno_id: req.studentId,
                minutos: minutos,
                data_registro: hoje
            })

        if (error) throw error

        return res.json({ message: `Parabéns! Registramos com sucesso mais ${minutos} minutos na conta da sua turma.` })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// GET /api/readings/dashboard (Alimenta o termômetro geral na tela inicial do aluno)
router.get('/dashboard', requireStudent, async (req, res) => {
    try {
        // Soma todos os minutos que existem na escola para preencher a barra global
        const { data: todosLogs } = await supabase.from('logs_leitura').select('minutos')
        const totalEscola = todosLogs?.reduce((acc, cur) => acc + cur.minutos, 0) || 0

        return res.json({
            termometro_geral: totalEscola
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

export default router