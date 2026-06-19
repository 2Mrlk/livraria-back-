import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'sesi-campanha-secret-key-mudar'
const JWT_EXPIRES = '7d'

export async function login(req, res) {
    try {
        const { email, senha } = req.body
        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
        }

        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !admin) {
            return res.status(401).json({ error: 'Credenciais inválidas.' })
        }

        // Comparação simples de senha (use bcrypt em produção real)
        if (admin.senha !== senha) {
            return res.status(401).json({ error: 'Credenciais inválidas.' })
        }

        const token = jwt.sign(
            { sub: admin.id, email: admin.email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        )

        return res.json({
            token,
            admin: { id: admin.id, email: admin.email, nome: admin.nome }
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export async function register(req, res) {
    try {
        const { email, senha, nome } = req.body
        if (!email || !senha || !nome) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' })
        }

        const { data, error } = await supabase
            .from('admin_users')
            .insert([{ email, senha, nome }])
            .select()
            .single()

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        return res.status(201).json({ message: 'Admin criado com sucesso.', admin: { id: data.id, email: data.email, nome: data.nome } })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export async function logout(req, res) {
    // JWT é stateless — logout é feito no cliente descartando o token
    return res.json({ message: 'Logout realizado com sucesso.' })
}

export async function me(req, res) {
    try {
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('id, email, nome')
            .eq('id', req.adminId)
            .single()

        if (error || !admin) {
            return res.status(404).json({ error: 'Admin não encontrado.' })
        }

        return res.json(admin)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
