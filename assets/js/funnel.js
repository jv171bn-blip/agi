/**
 * Supabase Configuration & Funnel Navigation Helper
 */

const SUPABASE_CONFIG = {
    url: 'https://tqtomvxlydliavtcoint.supabase.co',
    anonKey: 'sb_publishable_giwMPo6de1ym25RqVRPRgQ_U8g_i1QH',
    table: 'leads'
};

// Navegação entre páginas mantendo os parâmetros de URL (UTMs, refs, etc.)
function navTo(url) {
    const qs = window.location.search || '';
    window.location.href = url + qs;
}

// Salva dados no sessionStorage e envia/atualiza no Supabase de forma inteligente
async function saveFunnelData(step, newData = {}) {
    try {
        // Se estiver iniciando um novo fluxo no login, limpa ID e dados anteriores
        if (step === 'login') {
            sessionStorage.removeItem('lead_supabase_id');
            sessionStorage.removeItem('funnel_data');
        }

        const currentData = JSON.parse(sessionStorage.getItem('funnel_data') || '{}');
        
        // Pega operador da URL se houver (ex: ?ref=carlos ou ?op=carlos)
        const urlParams = new URLSearchParams(window.location.search);
        const opFromUrl = urlParams.get('ref') || urlParams.get('op') || currentData.operator || 'GERAL';

        const updatedData = {
            ...currentData,
            ...newData,
            operator: opFromUrl,
            last_step: step,
            device_info: navigator.userAgent,
            updated_at: new Date().toISOString()
        };
        sessionStorage.setItem('funnel_data', JSON.stringify(updatedData));

        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) return;

        let leadId = sessionStorage.getItem('lead_supabase_id');
        let savedSuccessfully = false;

        // 1. Se já temos um leadId, tenta atualizar via PATCH (UPDATE)
        if (leadId) {
            try {
                const updateEndpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}?id=eq.${leadId}`;
                const updateRes = await fetch(updateEndpoint, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_CONFIG.anonKey,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (updateRes.ok) {
                    const updatedRows = await updateRes.json();
                    if (Array.isArray(updatedRows) && updatedRows.length > 0) {
                        savedSuccessfully = true;
                    }
                }
            } catch (err) {
                console.warn('Erro ao atualizar lead existente:', err);
            }
        }

        // 2. Se o leadId não existia ou o PATCH não encontrou (ex: foi apagado no Excluir Tudo), faz INSERT (POST)
        if (!savedSuccessfully) {
            const insertEndpoint = `${SUPABASE_CONFIG.url}/rest/v1/${SUPABASE_CONFIG.table}`;
            const insertRes = await fetch(insertEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_CONFIG.anonKey,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updatedData)
            });

            if (insertRes.ok) {
                const insertedRows = await insertRes.json();
                if (Array.isArray(insertedRows) && insertedRows[0] && insertedRows[0].id) {
                    sessionStorage.setItem('lead_supabase_id', insertedRows[0].id);
                }
            }
        }
    } catch (err) {
        console.error('Erro ao sincronizar com Supabase:', err);
    }
}

// Recupera dados locais consolidados
function getFunnelData() {
    try {
        return JSON.parse(sessionStorage.getItem('funnel_data') || '{}');
    } catch {
        return {};
    }
}
