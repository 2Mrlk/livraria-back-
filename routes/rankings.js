import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// GET /api/rankings/turmas (Ranking Histórico Geral)
router.get('/turmas', async (req, res) => {
    try {
        // Puxa as turmas trazendo em cascata os alunos e os minutos que cada aluno registrou
        const { data: turmas, error } = await supabase
            .from('turmas')
            .select(`
                id,
                nome,
                alunos (
                    id,
                    logs_leitura ( minutos )
                )
            `)

        if (error) throw error

        // Processa e consolida as somas de minutos acumulados por cada turma
        const ranking = turmas.map(t => {
            let totalMinutos = 0
            t.alunos?.forEach(aluno => {
                aluno.logs_leitura?.forEach(log => {
                    totalMinutos += log.minutos
                })
            })
            return { nome_turma: t.nome, total_minutos: totalMinutos }
        })
        
        // Ordena do maior recordista de minutos para o menor
        ranking.sort((a, b) => b.total_minutos - a.total_minutos)

        return res.json(ranking)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// GET /api/rankings/recentes (Ranking Dinâmico filtrado por dias, ex: últimos 7 dias)
router.get('/recentes', async (req, res) => {
    try {
        const dias = parseInt(req.query.dias) || 7
        const dataLimite = new Date()
        dataLimite.setDate(dataLimite.getDate() - dias)
        const dataFiltroStr = dataLimite.toISOString().split('T')[0]

        // Busca filtrando as leituras de acordo com o intervalo de dias selecionado
        const { data: turmas, error } = await supabase
            .from('turmas')
            .select(`
                id,
                nome,
                alunos (
                    id,
                    logs_leitura ( minutos, data_registro )
                )
            `)

        if (error) throw error

        const ranking = turmas.map(t => {
            let totalMinutos = 0
            t.alunos?.forEach(aluno => {
                aluno.logs_leitura?.forEach(log => {
                    if (log.data_registro >= dataFiltroStr) {
                        totalMinutos += log.minutos
                    }
                })
            })
            return { nome_turma: t.nome, total_minutos: totalMinutos }
        }).sort((a, b) => b.total_minutos - a.total_minutos)

        return res.json(ranking)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

export default router