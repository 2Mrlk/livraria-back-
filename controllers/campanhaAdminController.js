import { supabase } from '../config/supabase.js'

// Retorna estatísticas gerais (Cards de visão geral)
export async function obterMetricasGerais(req, res) {
    try {
        // 1. Total de minutos acumulados na escola
        const { data: logs } = await supabase.from('logs_leitura').select('minutos')
        const totalMinutos = logs?.reduce((acc, cur) => acc + cur.minutos, 0) || 0

        // 2. Contagem de Alunos ativos
        const { count: totalAlunos } = await supabase.from('alunos').select('*', { count: 'exact', head: true })

        // 3. Contagem de Turmas
        const { count: totalTurmas } = await supabase.from('turmas').select('*', { count: 'exact', head: true })

        return res.json({
            total_minutos: totalMinutos,
            total_alunos: totalAlunos || 0,
            total_turmas: totalTurmas || 0,
            meta_global: 1000000
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Lista detalhada de todas as turmas e o desempenho acumulado
export async function relatorioTurmas(req, res) {
    try {
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

        const resultado = turmas.map(t => {
            let totalMinutos = 0
            let qteAlunos = t.alunos?.length || 0
            
            t.alunos?.forEach(aluno => {
                aluno.logs_leitura?.forEach(log => {
                    totalMinutos += log.minutos
                })
            })

            return {
                id: t.id,
                nome: t.nome,
                total_alunos: qteAlunos,
                total_minutos: totalMinutos
            }
        }).sort((a, b) => b.total_minutos - a.total_minutos)

        return res.json(resultado)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Lista os últimos logs lançados no sistema (Auditoria)
export async function listarUltimosLogs(req, res) {
    try {
        const { data: logs, error } = await supabase
            .from('logs_leitura')
            .select(`
                id,
                minutos,
                data_registro,
                criado_em,
                alunos (
                    nome,
                    rm,
                    turmas ( nome )
                )
            `)
            .order('criado_em', { ascending: false })
            .limit(50)

        if (error) throw error

        return res.json(logs)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Permite ao admin remover um log suspeito/errado
export async function excluirLogLeitura(req, res) {
    try {
        const { id } = req.params
        const { error } = await supabase.from('logs_leitura').delete().eq('id', id)
        
        if (error) throw error
        return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}