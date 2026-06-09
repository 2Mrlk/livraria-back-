import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'sesi-campanha-secret-key-mudar'

export async function requireStudent(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de acesso não fornecido.' })
        }

        const token = authHeader.slice(7)
        let payload
        try {
            payload = jwt.verify(token, JWT_SECRET)
        } catch {
            return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
        }

        const { data: aluno } = await supabase
            .from('alunos')
            .select('id')
            .eq('id', payload.sub)
            .single()

        if (!aluno) {
            return res.status(401).json({ error: 'Acesso negado. Aluno inválido.' })
        }

        req.alunoId = payload.sub
        req.alunoNome = payload.name
        req.alunoTurmaId = payload.turma_id
        next()
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}