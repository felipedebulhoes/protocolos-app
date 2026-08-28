# Correção do WebSocket/HMR do Vite

## Sintoma

O preview carregava a aplicação, mas o cliente do Vite registrava `WebSocket closed without opened` ao tentar estabelecer o canal HMR através do proxy HTTPS do ambiente de desenvolvimento.

## Causa

O Vite roda em `middlewareMode` dentro do servidor HTTP criado pelo Express. O servidor HTTP existente não estava sendo fornecido à configuração `server.hmr`, portanto o upgrade do WebSocket não era tratado pelo mesmo servidor que atende o preview.

## Correção

Em `server/_core/index.ts`, a criação do Vite passou a usar:

```ts
server: {
  middlewareMode: true,
  hmr: { server },
}
```

## Validação em 28/08/2026

Após reiniciar o servidor, a rota `/?from_webdev=1` carregou e redirecionou corretamente para o login protegido. O console do navegador permaneceu sem erros de Vite, HMR ou WebSocket após o carregamento. Um teste de regressão verifica que a integração continua presente no bootstrap do servidor.

### Teste de continuidade

Foram feitas três edições controladas e consecutivas em `client/src/index.css`, todas processadas sem recarregar o servidor. Os logs registraram três eventos `hot updated: /src/index.css` e nenhum novo `failed to connect`, `WebSocket closed without opened` ou `UnhandledRejection`. A alteração temporária foi removida ao final, sem mudança visual residual.
