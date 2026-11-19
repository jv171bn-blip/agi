/**
 * Proteção Estrita de Acesso por Referência (?ref= / ?op=)
 * O conteúdo do funil SÓ É ACESSÍVEL se houver o parâmetro 'ref' ou 'op' diretamente na URL.
 * Se o visitante acessar a URL direta sem ref, é barrado imediatamente com a tela de domínio estacionado.
 */
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Procura por ref ou op diretamente na URL atual (case-insensitive)
    let refFromUrl = null;
    for (const [key, value] of urlParams.entries()) {
        const lowerKey = key.toLowerCase();
        if ((lowerKey === 'ref' || lowerKey === 'op') && value && value.trim() !== '') {
            refFromUrl = value.trim();
            break;
        }
    }

    // Se NÃO estiver na URL, barra IMEDIATAMENTE (sem fallback para sessão)
    if (!refFromUrl) {
        // Bloqueia renderização do conteúdo restrito imediatamente
        const shield = document.createElement('style');
        shield.id = 'guard-shield-style';
        shield.innerHTML = 'html, body { overflow: hidden !important; } body > * { display: none !important; }';
        document.head.appendChild(shield);

        function renderParkedDomainScreen() {
            const host = (window.location.hostname && window.location.hostname !== "" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
                ? window.location.hostname 
                : "servidordominio.online";
            
            document.title = host + " - Domínio Registrado";

            const container = document.createElement('div');
            container.id = 'parked-domain-page';
            container.style.cssText = `
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(180deg, #0b0f19 0%, #111827 100%);
                color: #e2e8f0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
                z-index: 99999999;
                box-sizing: border-box;
                text-align: center;
            `;

            container.innerHTML = `
                <div style="max-width: 460px; width: 100%; background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 2.5rem 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); backdrop-filter: blur(12px);">
                    <div style="width: 56px; height: 56px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; color: #60a5fa;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </div>

                    <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #34d399; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                        Domínio Ativo
                    </div>

                    <h1 style="font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin: 0 0 0.5rem 0; word-break: break-all;">
                        ${host}
                    </h1>

                    <p style="font-size: 0.875rem; color: #94a3b8; line-height: 1.5; margin: 0 0 1.75rem 0;">
                        Este endereço web foi configurado e reservado com sucesso. O novo portal está em fase de implantação.
                    </p>

                    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 14px; padding: 0.85rem 1rem; display: flex; justify-content: space-around; text-align: center; margin-bottom: 1.5rem; font-size: 11px; color: #cbd5e1;">
                        <div>
                            <span style="color: #64748b; display: block; margin-bottom: 2px;">Status</span>
                            <strong style="color: #38bdf8;">Online</strong>
                        </div>
                        <div style="border-left: 1px solid rgba(255, 255, 255, 0.08); padding-left: 1rem;">
                            <span style="color: #64748b; display: block; margin-bottom: 2px;">Segurança</span>
                            <strong style="color: #34d399;">SSL Ativo</strong>
                        </div>
                        <div style="border-left: 1px solid rgba(255, 255, 255, 0.08); padding-left: 1rem;">
                            <span style="color: #64748b; display: block; margin-bottom: 2px;">Servidor</span>
                            <strong style="color: #a78bfa;">Cloud</strong>
                        </div>
                    </div>

                    <div style="font-size: 11px; color: #475569; letter-spacing: 0.3px;">
                        © ${new Date().getFullYear()} • Hospedagem e Gerenciamento de Domínios
                    </div>
                </div>
            `;

            if (document.body) {
                document.body.appendChild(container);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(container);
                });
            }
            
            // Remove o shield para renderizar a tela de domínio
            if (shield) shield.remove();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderParkedDomainScreen);
        } else {
            renderParkedDomainScreen();
        }
    } else {
        // Se TEM ref na URL, atualiza/salva na sessão para uso pelo lead
        sessionStorage.setItem('funnel_ref', refFromUrl);
    }
})();
