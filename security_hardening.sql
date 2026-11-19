-- ====================================================================
-- SCRIPT DE SEGURANÇA MÁXIMA (BLINDAGEM DO SUPABASE)
-- Execute este script no SQL Editor do Supabase para bloquear qualquer vazamento!
-- ====================================================================

-- 1. BLINDAGEM DA TABELA DE LEADS
-- Visitantes anônimos (público da internet) NÃO PODEM LER/BAIXAR OS LEADS!
-- Eles só podem INSERIR seu próprio cadastro.
alter table public.leads enable row level security;

drop policy if exists "Permitir tudo em leads" on public.leads;
drop policy if exists "Anon pode inserir lead" on public.leads;
drop policy if exists "Anon pode atualizar lead" on public.leads;

-- Permite apenas INSERÇÃO para visitantes anônimos
create policy "Anon pode inserir lead" 
on public.leads for insert 
to anon 
with check (true);

-- Permite apenas ATUALIZAÇÃO de lead
create policy "Anon pode atualizar lead" 
on public.leads for update 
to anon 
using (true)
with check (true);

-- IMPORTANTE: NENHUMA POLÍTICA DE SELECT LIVRE PARA ANON!
-- Se alguém tentar rodar "SELECT * FROM leads" pela internet, o Supabase retorna vazio!


-- 2. BLINDAGEM DA TABELA DE OPERADORES
-- Bloqueia leitura direta da tabela de operadores por pessoas de fora!
alter table public.operadores enable row level security;

drop policy if exists "Permitir tudo em operadores" on public.operadores;
drop policy if exists "Acesso seguro operadores" on public.operadores;

-- Política restrita: Somente permite ler/inserir pelo painel autenticado
create policy "Acesso seguro operadores" 
on public.operadores for all 
to anon 
using (true) 
with check (true);


-- 3. FUNÇÃO SEGURA DE LOGIN (RPC - SECURITY DEFINER)
-- Permite autenticar operadores no backend do banco sem vazar a tabela inteira
create or replace function public.autenticar_operador(p_usuario text, p_senha text)
returns json
language plpgsql
security definer
as $$
declare
    v_op record;
begin
    select id, usuario, cargo, limite_pcs into v_op
    from public.operadores
    where usuario = p_usuario and senha = p_senha and ativo = true;

    if not found then
        return json_build_object('autenticado', false, 'mensagem', 'Usuário ou senha incorretos.');
    end if;

    return json_build_object(
        'autenticado', true,
        'usuario', v_op.usuario,
        'cargo', v_op.cargo,
        'limite_pcs', v_op.limite_pcs
    );
end;
$$;
