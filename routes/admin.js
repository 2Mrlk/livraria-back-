import { Router } from 'express'
import { login, logout, me, register } from '../controllers/authController.js'
import { requireCampanhaAdmin as requireAdmin } from '../middleware/adminAuthMiddleware.js'

// Novos controladores da gestão de leitura da escola
import { 
    obterMetricasGerais, 
    relatorioTurmas, 
    listarUltimosLogs, 
    excluirLogLeitura 
} from '../controllers/campanhaAdminController.js'

const router = Router()

// ── Auth (Públicas - não exigem token) ─────────────────────────
router.post('/auth/login', login)
router.post('/auth/register', register) 

// ── Rotas protegidas (Tudo abaixo exige o Token Admin) ──────────
router.use(requireAdmin)

router.post('/auth/logout', logout)
router.get('/auth/me', me)

// ── Rotas da Aba de Admin Escolar (O monitoramento que você pediu) ──
router.get('/metricas', obterMetricasGerais)
router.get('/relatorio-turmas', relatorioTurmas)
router.get('/logs', listarUltimosLogs)
router.delete('/logs/:id', excluirLogLeitura)

export default router
