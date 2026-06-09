import { supabase } from '../config/supabase.js'

export async function registrarLeitura(req, res) {
    try {
        const aluno_id = req.alunoId
        const { minutos } = req.body
        const minutosNum = Number(minutos)

        if (!minutos || minutosNum <= 0) {
            return res.status(400).json({ error: 'Quantidade de minutos inválida.' })
        }

        const hoje = new Date().toISOString().split('T')[0]

        // 1. Soma o que o aluno já leu hoje
        const { data: logs, error: queryError } = await supabase
            .from('logs_leitura')
            .select('minutos')
            .eq('aluno_id', aluno_id)
            .eq('data_registro', hoje)

        if (queryError) throw queryError

        const totalLidoHoje = logs.reduce((acc, current) => acc + current.minutos, 0)

        // 2. Validação Antifraude dos 16 minutos diários
        if (totalLidoHoje + minutosNum > 16) {
            const restante = 16 - totalLidoHoje
            return res.status(400).json({
                error: `Limite diário excedido! Leste ${totalLidoHoje} min hoje. Só podes lançar mais ${restante} minutos.`
            })
        }

        // 3. Insere confiando no CURRENT_DATE do PostgreSQL
        const { data, error: insertError } = await supabase
            .from('logs_leitura')
            .insert({ aluno_id, minutos: minutosNum, data_registro: hoje })
            .select()
            .single()

        if (insertError) throw insertError

        return res.status(201).json({
            success: true,
            message: 'Leitura registada com sucesso! Parabéns! 📚',
            data
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export async function obterDashboardData(req, res) {
    try {
        const aluno_id = req.alunoId

        // Total da escola para o Termómetro
        const { data: todosLogs, error: errEscola } = await supabase
            .from('logs_leitura')
            .select('minutos')
        if (errEscola) throw errEscola
        const totalEscola = todosLogs.reduce((acc, cur) => acc + cur.minutos, 0)

        // Histórico pessoal
        const { data: logsAluno, error: errAluno } = await supabase
            .from('logs_leitura')
            .select('minutos, data_registro')
            .eq('aluno_id', aluno_id)
        if (errAluno) throw errAluno

        return res.json({
            termometro_geral: totalEscola,
            meta_escola: 1000000,
            historico_aluno: logsAluno
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}