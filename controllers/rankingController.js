import { supabase } from '../config/supabase.js'

// Histórico geral de todos os tempos
export async function listarRankingTurmas(req, res) {
    try {
        const { data: turmasData, error } = await supabase
            .from('turmas')
            .select(`
                id,
                nome,
                alunos (
                    logs_leitura ( minutos )
                )
            `)

        if (error) throw error

        const ranking = turmasData.map(turma => {
            let acumuladoSala = 0
            turma.alunos?.forEach(aluno => {
                aluno.logs_leitura?.forEach(log => {
                    acumuladoSala += log.minutos
                })
            })
            return { id: turma.id, nome: turma.nome, total_minutos: acumuladoSala }
        })
        .sort((a, b) => b.total_minutos - a.total_minutos)

        return res.json(ranking)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Filtro dinâmico recente via Stored Procedure RPC
export async function listarRankingRecente(req, res) {
    try {
        const dias = req.query.dias ? Number(req.query.dias) : 7

        if (isNaN(dias) || dias <= 0) {
            return res.status(400).json({ error: 'O parâmetro de dias deve ser válido e maior que zero.' })
        }

        const { data: ranking, error } = await supabase
            .rpc('obter_ranking_salas_recentes', { dias_passados: dias })

        if (error) throw error

        return res.json(ranking)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}