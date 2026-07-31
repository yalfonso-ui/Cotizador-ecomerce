# Cloudflare Tunnel — Quickstart

Esta carpeta contiene la configuración declarativa de un **Cloudflare Tunnel** para exponer el dev server de Vite (`localhost:5173`) a Internet con TLS real, sin abrir puertos en el firewall.

> Documentación oficial: <https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/>

## 1. Prerrequisitos

- **Cuenta Cloudflare** (gratis): <https://dash.cloudflare.com/sign-up>
- **Dominio añadido a Cloudflare** (gestionado por sus nameservers). Si aún no tienes, ve a *Zero Trust → Networks → Tunnels → Create a tunnel*; el wizard te guía.
- **`cloudflared`** instalado localmente:
  - macOS: `brew install cloudflared`
  - Windows: `winget install Cloudflare.cloudflared`
  - Linux (Debian/Ubuntu): ver <https://pkg.cloudflare.com/>
  - O descárgalo desde <https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/>

## 2. Crear el tunnel (una sola vez)

### Opción A — Dashboard (recomendado)

1. Ve a <https://one.dash.cloudflare.com/> → **Networks** → **Connectors** → **Cloudflare Tunnels** → **Create a tunnel**.
2. Nombre sugerido: `ecommerce-lemonade-dev`.
3. Copia el **token** que aparece; lo usaremos en el paso 3.
4. En el wizard, **Publica una aplicación**:
   - **Subdomain**: `dev` (o el que prefieras)
   - **Domain**: tu dominio en Cloudflare
   - **Service type**: `HTTP`
   - **URL**: `localhost:5173`

### Opción B — CLI local

```bash
# Autentica cloudflared con tu cuenta
cloudflared tunnel login

# Crea el tunnel (esto genera cloudflared/<UUID>.json — NO commitear)
cloudflared tunnel create ecommerce-lemonade-dev

# Mapea un DNS público al tunnel
cloudflared tunnel route dns ecommerce-lemonade-dev dev.tu-dominio.com
```

## 3. Configurar credenciales locales

1. Descarga el archivo de credenciales desde el dashboard de Cloudflare (botón *Download* en la página del tunnel) y guárdalo como:
   ```
   cloudflared/<TUNNEL_ID>.json
   ```
   ⚠️ Este archivo contiene secretos — **NO** lo commitees (ya está en `.gitignore`).

2. Edita `cloudflared/config.yml` y reemplaza:
   - `<REEMPLAZAR_CON_TUNNEL_ID_O_NOMBRE>` → tu tunnel ID (UUID) o nombre.
   - `<REEMPLAZAR_CON_TU_DOMINIO_O_SUBDOMINIO>` → el hostname que configuraste en el dashboard (ej. `dev.tu-dominio.com`).

## 4. Ejecutar

```bash
# Terminal 1 — Vite dev server
npm run dev

# Terminal 2 — Cloudflare Tunnel
npm run share:cf
```

`cloudflared` imprimirá en consola el estado de la conexión. Una vez diga `Connection established`, abre el hostname público en tu navegador — debería apuntar a `localhost:5173` con HTTPS válido.

### Opción rápida: tunnel efímero sin cuenta Cloudflare

Si solo necesitas compartir la app por unos minutos (revisión rápida, demo, etc.) puedes usar un **quick tunnel** de Cloudflare. No requiere cuenta ni configuración previa, simplemente genera un URL temporal `*.trycloudflare.com`.

```bash
# Opción 1 — Una sola terminal, levanta Vite y tunnel juntos
npm run share:cf:dev

# Opción 2 — Dos terminales separadas
# Terminal 1
npm run dev
# Terminal 2
npm run share:cf:quick
```

`cloudflared` imprimirá una URL como `https://<palabras-aleatorias>.trycloudflare.com` — esa es tu URL pública con HTTPS válido. Cópiala y compártela.

**Limitaciones del quick tunnel:**
- El URL cambia cada vez que reinicias `cloudflared`
- No hay dashboard de Cloudflare para monitorearlo
- Adecuado para demos y previews rápidas, **no para producción**

## 5. Verificar

- En <https://one.dash.cloudflare.com/> → **Networks** → **Connectors** → **Tunnels**, tu tunnel debe aparecer con status **HEALTHY**.
- `cloudflared tunnel info <TUNNEL_ID>` muestra el estado local.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `failed to parse config: tunnel not found` | `tunnel:` no coincide con el nombre/UUID del tunnel creado | Verifica con `cloudflared tunnel list` |
| `Connection refused` en el log | El dev server no está corriendo en `localhost:5173` | Asegúrate de que `npm run dev` esté activo |
| DNS no resuelve | Falta `cloudflared tunnel route dns` o el subdomain no existe en Cloudflare | Verifica en el dashboard |
| `403 Forbidden` al abrir el hostname | El ingress no está bien configurado | Revisa que `hostname` en `config.yml` coincida con el DNS público |

Para más, ver la [guía de troubleshooting oficial](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/troubleshoot-tunnels/).
