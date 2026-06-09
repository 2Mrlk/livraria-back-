import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'b7store-secret-change-in-production'

export async function requireCampanhaAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' })
        }

        const token = authHeader.slice(7)
        let payload
        try {
            payload = jwt.verify(token, JWT_SECRET)
        } catch {
            return res.status(401).json({ error: 'Sessão administrativa expirada ou inválida.' })
        }

        // Se você usa a tabela 'admin_users' original do seu projeto:
        const { data: admin } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', payload.sub)
            .single()

        if (!admin) {
            return res.status(403).json({ error: 'Acesso proibido. Requer nível de Administrador.' })
        }

        req.adminId = payload.sub
        next()
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}