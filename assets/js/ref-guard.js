/**
 * Proteção de Acesso por Referência (?ref=)
 * Bloqueia acessos diretos sem ref e exibe apenas tela escura lisa com o domínio
 */
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref') || urlParams.get('op');

    if (ref && ref.trim() !== '') {
        sessionStorage.setItem('funnel_ref', ref.trim());
    }

    const activeRef = (ref && ref.trim() !== '') ? ref.trim() : sessionStorage.getItem('funnel_ref');

    // Se NÃO tiver ?ref= na URL nem na sessão: bloqueia e mostra tela lisa com o domínio
    if (!activeRef) {
        // Bloqueia exibição imediata
        const style = document.createElement('style');
        style.id = 'guard-shield-style';
        style.innerHTML = 'body > * { display: none !important; }';
        document.head.appendChild(style);

        function renderBlankDomainScreen() {
            const host = (window.location.hostname && window.location.hostname !== "" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")
                ? window.location.hostname 
                : "facilitasolucoescontract.online";
            document.title = host;
            document.body.innerHTML = `
                <div style="margin:0;padding:0;width:100vw;height:100vh;background-color:#080c14;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;letter-spacing:1.5px;user-select:none;">
                    <span>${host}</span>
                </div>
            `;
            document.body.style.margin = '0';
            document.body.style.backgroundColor = '#080c14';
            document.body.style.overflow = 'hidden';
            
            const shield = document.getElementById('guard-shield-style');
            if (shield) shield.remove();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderBlankDomainScreen);
        } else {
            renderBlankDomainScreen();
        }
    }
})();
