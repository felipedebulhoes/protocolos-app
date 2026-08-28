# Auditoria dos domínios — 28/08/2026

| Domínio | Estado HTTP | Diagnóstico |
|---|---:|---|
| `protocolapp-wtasisww.manus.space` | Ativo | Único domínio atualmente vinculado ao projeto ProtoUro. |
| `protocolos.felipebulhoes.com` | 503 / origem 404 | DNS chega à infraestrutura Manus, mas o domínio não está vinculado a um projeto/deployment. Deve ser religado ao ProtoUro. |
| `paciente.felipebulhoes.com` | 503 / origem 404 | DNS chega à infraestrutura Manus, mas o domínio não está vinculado a um projeto/deployment. Deve ser religado ao ProtoUro. |
| `felipebulhoes.com` | 200 | Site público ativo; não deve ser vinculado ao ProtoUro. |
| `www.felipebulhoes.com` | 503 / origem 404 | DNS chega à infraestrutura Manus, mas o alias `www` não está vinculado. Deve ser ligado ao projeto do site público e redirecionado/canonizado para `felipebulhoes.com`. |
| `bulhoesurohealth.com` | Sem resolução DNS | Domínio antigo/inativo; não deve ser usado como destino atual sem nova configuração DNS. |

## Ação necessária no painel Manus

No projeto **ProtoUro**, abrir **Settings → Domains** e adicionar novamente:

- `protocolos.felipebulhoes.com`
- `paciente.felipebulhoes.com`

No projeto do **site público**, abrir **Settings → Domains** e adicionar:

- `www.felipebulhoes.com`

O domínio raiz `felipebulhoes.com` já responde normalmente no site público. Alterações de vínculo de domínio são configurações de hospedagem e não podem ser corrigidas pelo código-fonte do app.
