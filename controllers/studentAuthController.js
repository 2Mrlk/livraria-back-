import { supabase } from '../config/supabase.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'sesi-campanha-secret-key-mudar'
const JWT_EXPIRES = '30d'

export async function loginStudent(req, res) {
    try {
        const { rm } = req.body
        if (!rm) {
            return res.status(400).json({ error: 'O RM ou Matrícula é obrigatório.' })
        }

        const { data: aluno, error } = await supabase
            .from('alunos')
            .select('*, turmas(nome)')
            .eq('rm', rm)
            .single()

        if (error || !aluno) {
            return res.status(401).json({ error: 'Estudante não encontrado com este RM.' })
        }

        const token = jwt.sign(
            { sub: aluno.id, name: aluno.nome, turma_id: aluno.turma_id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        )

        return res.json({
            token,
            aluno: {
                id: aluno.id,
                rm: aluno.rm,
                nome: aluno.nome,
                turma: aluno.turmas?.nome || 'Sem Turma'
            }
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}