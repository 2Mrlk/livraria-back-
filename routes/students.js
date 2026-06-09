import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'b7store-secret-change-in-production'

// POST /api/students/auth/login
router.post('/auth/login', async (req, res) => {
    try {
        const { rm } = req.body
        if (!rm) return res.status(400).json({ error: 'O número de RM é obrigatório' })

        // Procura o aluno na tabela do Supabase e junta os dados da turma dele
        const { data: aluno, error } = await supabase
            .from('alunos')
            .select('id, nome, rm, turmas(nome)')
            .eq('rm', rm)
            .single()

        if (error || !aluno) {
            return res.status(401).json({ error: 'Matrícula/RM não encontrada no sistema escolar.' })
        }

        // Gera o token de acesso simples para o aluno permanecer conectado
        const token = jwt.sign(
            { sub: aluno.id, nome: aluno.nome, rm: aluno.rm, role: 'student' },
            JWT_SECRET,
            { expiresIn: '30d' }
        )

        return res.json({
            token,
            aluno: {
                id: aluno.id,
                nome: aluno.nome,
                rm: aluno.rm,
                turma: aluno.turmas?.nome || 'Sem Turma'
            }
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

export default router