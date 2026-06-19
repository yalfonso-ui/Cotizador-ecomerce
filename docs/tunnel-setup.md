# Guía de implementación: Cloudflare Tunnel para Ecommerce-Lemonade

## Contexto

Este proyecto es una **SPA Vue 3 + Vite 5**. Hasta ahora, exponer el dev server a Internet dependía de `localtunnel` (`npm run share`), que tiene varios problemas:

- ❌ URLs **efímeras** (cambian cada vez que reinicias el tunnel).
- ❌ Sin TLS real — el navegador muestra advertencias de seguridad.
- ❌ Dependiente de un servicio externo (localtunnel.me) que puede estar caído o throttlear.
- ❌ No es gestionable desde un panel central.

**Cloudflare Tunnel** resuelve todos estos problemas usando el daemon `cloudflared` que establece conexiones **salientes** desde tu máquina hacia la red de Cloudflare, sin abrir puertos.

## Arquitectura

```
┌─────────────────┐   conexión saliente     ┌─────────────────────┐
│  Vite dev server │ ◄─────  localhost:5173  │  cloudflared daemon  │
│  (localhost)    │                          │  (este repo)        │
└─────────────────┘                          └──────────┬──────────┘
                                                        │ outbound-only
                                                        │ puerto 7844
                                                        ▼
                                            ┌──────────────────────┐
                                            │  Cloudflare Edge     │
                                            │  (dashboard + DNS)  │
                                            └──────────┬───────────┘
                                                       │ HTTPS
                                                       ▼
                                                  👤 Usuarios
                                              (dev.tu-dominio.com)
```

## Comparación de scripts

| Script | Comando | Cuándo usarlo |
|---|---|---|
| `npm run dev` | `vite --port 5173` | Solo local, sin acceso externo |
| `npm run share` | `npx localtunnel --port 5173` | Compatibilidad — efímero, sin TLS |
| `npm run share:cf` | `cloudflared tunnel --config cloudflared/config.yml run` | **Recomendado** — TLS real, dominio estable |
| `npm run share:dev` | `concurrently -k -n vite,cf "vite" "cloudflared tunnel --config cloudflared/config.yml run"` | Dev + tunnel en un solo proceso |

## Configuración del proyecto

### `cloudflared/config.yml` (declarativo, se commitea)

Define:
- `tunnel`: nombre o UUID del tunnel.
- `credentials-file`: ruta al JSON de credenciales (NO commiteado).
- `ingress`: mapeo hostname público → `http://localhost:5173`.
- Catch-all `http_status:404` obligatorio al final.

### `cloudflared/*.json` y `*.pem` (NO se commitean)

`cloudflared tunnel create` genera:
- `<UUID>.json`: credenciales del tunnel (contiene el secreto `TunnelSecret`).
- `cert.pem`: origin certificate para service tokens (si se usa Access).

Ambos están en `.gitignore`.

### `package.json` scripts

```json
{
  "share": "npx localtunnel --port 5173",         // existente, compatibilidad
  "share:cf": "cloudflared tunnel --config cloudflared/config.yml run",
  "share:dev": "concurrently -k -n vite,cf \"vite\" \"cloudflared tunnel --config cloudflared/config.yml run\""
}
```

> Nota: `concurrently` no está en `devDependencies`. Si quieres usar `share:dev`, instálalo con `npm i -D concurrently`.

## Seguridad

| Recurso | En repo | Notas |
|---|---|---|
| `cloudflared/config.yml` | ✅ Sí | Solo declarativo, sin secretos |
| `cloudflared/<UUID>.json` | ❌ No | Contiene `TunnelSecret` |
| `cloudflared/cert.pem` | ❌ No | Origin cert para Access tokens |
| `cloudflared/.cloudflared/` | ❌ No | Cert local tras `cloudflared login` |

## Verificación de impacto (GitNexus)

Esta implementación es **aditiva** y de **riesgo bajo**:

- `package.json`: añadir 2 scripts nuevos, sin tocar los existentes. Blast radius: **0 callers internos** (validado con `gitnexus impact`).
- `cloudflared/`: carpeta nueva, no afecta a imports del código fuente.
- `.gitignore`: 3 líneas añadidas.
- `vite.config.js`: no modificado (los `allowedHosts` no son necesarios con ingress explícito).

Para re-validar tras los cambios:

```bash
gitnexus analyze
gitnexus detect-changes   # confirma que solo tocamos lo esperado
gitnexus impact --uid "File:package.json" --summary-only
```

## Rollback

Si `cloudflared` da problemas, simplemente ejecuta `npm run share` (vuelve a `localtunnel`). No se elimina nada, solo se deja de usar.

Para revertir completamente:

```bash
git rm -r cloudflared docs/tunnel-setup.md
# editar package.json y remover los scripts share:cf y share:dev
# editar .gitignore y remover las líneas de cloudflared
```

## Referencias

- [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
- [Create a tunnel (dashboard)](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/get-started/create-remote-tunnel/)
- [cloudflared downloads](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/)
- [Troubleshooting](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/troubleshoot-tunnels/)
