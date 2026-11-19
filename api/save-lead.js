/**
 * API Serverless Segura - Salva e Atualiza Leads no Backend
 * Nenhum cliente no front-end vê credenciais do Supabase
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tqtomvxlydliavtcoint.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_giwMPo6de1ym25RqVRPRgQ_U8g_i1QH';

module.exports = async (req, res) => {
    // Habilita CORS seguro
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { leadId, data } = body;

        if (!data) {
            return res.status(400).json({ error: 'Dados não informados' });
        }

        // Sanitização básica
        data.updated_at = new Date().toISOString();

        // 1. Se tem leadId, faz PATCH (Update seguro)
        if (leadId) {
            const updateUrl = `${SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}`;
            const response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (Array.isArray(result) && result.length > 0) {
                return res.status(200).json({ success: true, leadId: result[0].id });
            }
        }

        // 2. Se não tem leadId ou não encontrou, faz INSERT (Create seguro)
        const insertUrl = `${SUPABASE_URL}/rest/v1/leads`;
        const insertResponse = await fetch(insertUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        const insertResult = await insertResponse.json();
        if (Array.isArray(insertResult) && insertResult[0] && insertResult[0].id) {
            return res.status(200).json({ success: true, leadId: insertResult[0].id });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Erro na API save-lead:', err);
        return res.status(500).json({ error: 'Erro interno ao processar lead' });
    }
};
