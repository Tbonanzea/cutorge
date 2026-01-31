# Plan de Implementación: CutForge MVP

## Resumen Ejecutivo

Transformar CutForge de un prototipo de cotización a una plataforma completa de corte personalizado con:
- Flujo de cotización → pago → orden
- Pagos via MercadoPago + transferencia bancaria
- Notificaciones por Email + WhatsApp
- Dashboards para admin y usuarios
- Landing page con branding industrial/metálico
- Optimizaciones de SEO y mobile

---

## Fases de Implementación

### Fase 0: Fundación y Limpieza (Pre-requisito)
**Objetivo**: Arreglar bugs existentes y preparar la base

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| Fix paginación usuarios | `src/app/(dashboard)/users/data-table.tsx` | `handlePageChange()` está vacío |
| Seed materiales en DB | `prisma/seed.ts` (crear) | Mover mock data de `materials.ts` a DB |
| Eliminar datos hardcoded | `src/app/actions/materials.ts` | Descomentar query Prisma |
| Centralizar EXTRA_SERVICES | `src/lib/constants.ts` (crear) | Están duplicados en 3 archivos |
| Proteger rutas admin | `src/middleware.ts` | Verificar `role === 'ADMIN'` |

---

### Fase 1: Checkout Flow Completo (MVP Crítico)
**Objetivo**: Que las cotizaciones se guarden y el usuario reciba confirmación

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| API de órdenes | `src/app/api/orders/route.ts` (crear) | POST: crear orden, GET: listar |
| Conectar useSubmitQuote | `src/hooks/useSubmitQuote.ts` | Reemplazar mock por llamada real |
| Guardar OrderItems | API de órdenes | Incluir archivos, materiales, cantidades, precios |
| Página de confirmación | `src/app/quoting/success/page.tsx` (crear) | Mostrar #orden, resumen, próximos pasos |
| Email de confirmación (user) | Integrar Resend | Email al usuario con detalles de cotización |
| Email notificación (admin) | Integrar Resend | Notificar nueva cotización recibida |
| WhatsApp link | Página de confirmación | Botón "Contactar por WhatsApp" |

**Dependencias**: Configurar Resend (o similar) en Supabase/Vercel

---

### Fase 2: Admin Dashboard
**Objetivo**: Que el admin pueda gestionar el negocio

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| Lista de órdenes | `src/app/(dashboard)/orders/page.tsx` | Tabla con filtros por status |
| Detalle de orden | `src/app/(dashboard)/orders/[id]/page.tsx` | Ver items, archivos, totales |
| Cambiar status orden | Server action | PENDING → QUOTED → PAID → SHIPPED → COMPLETED |
| CRUD Materiales | `src/app/(dashboard)/materials/` | Listar, crear, editar, eliminar materiales |
| CRUD MaterialTypes | Misma sección | Gestionar espesores/dimensiones por material |
| CRUD Extras | `src/app/(dashboard)/extras/` | Gestionar servicios adicionales con precios |
| Dashboard overview | `src/app/(dashboard)/page.tsx` | Métricas: órdenes pendientes, ingresos, etc. |

---

### Fase 3: Sistema de Pagos
**Objetivo**: Permitir pagos online y por transferencia

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| Integrar MercadoPago SDK | `src/lib/mercadopago.ts` | Configurar credenciales |
| Crear preferencia de pago | `src/app/api/payments/route.ts` | Generar link de pago MP |
| Checkout MercadoPago | `src/app/checkout/page.tsx` | Redirigir a MP o mostrar Checkout Pro |
| Webhook de pagos | `src/app/api/webhooks/mercadopago/route.ts` | Recibir confirmación de pago |
| Opción transferencia | UI de checkout | Mostrar datos bancarios + instrucciones |
| Confirmar transferencia (admin) | Dashboard admin | Marcar pago manual como recibido |
| Actualizar estado orden | Automático | PENDING → PAID cuando pago confirmado |

**Modelo de flujo**:
```
Cotización aprobada → Elegir método de pago
├── MercadoPago → Redirect → Webhook → Orden pagada
└── Transferencia → Mostrar CBU → Admin confirma → Orden pagada
```

---

### Fase 4: User Dashboard
**Objetivo**: Que el usuario vea sus órdenes y estado

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| Mis órdenes | `src/app/(dashboard)/my-orders/page.tsx` | Lista de órdenes del usuario |
| Detalle de orden | `src/app/(dashboard)/my-orders/[id]/page.tsx` | Ver estado, items, tracking |
| Completar perfil | `src/app/(dashboard)/profile/page.tsx` | Editar datos personales |
| Gestionar direcciones | Sección en perfil | CRUD de direcciones de envío |
| Historial de archivos | Opcional | Ver DXFs subidos anteriormente |

---

### Fase 5: Landing Page + Branding
**Objetivo**: Convertir visitantes en clientes

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| Nueva paleta de colores | `src/app/globals.css` | Industrial: grises, azul oscuro, naranja |
| Actualizar componentes UI | `src/components/ui/*` | Aplicar nuevos colores |
| Hero section | `src/app/page.tsx` | Propuesta de valor + CTA "Cotizar ahora" |
| Sección "Cómo funciona" | Landing | 3-4 pasos visuales del proceso |
| Showcase de materiales | Landing | Grid de materiales disponibles |
| Sección de confianza | Landing | Testimonios, garantías, certificaciones |
| Footer mejorado | `src/components/Footer.tsx` | Links útiles, contacto, redes |
| About page | `src/app/about/page.tsx` | Historia, equipo, instalaciones |

**Paleta Industrial sugerida**:
```css
--primary: oklch(0.25 0.02 250);      /* Azul acero oscuro */
--secondary: oklch(0.85 0.01 250);    /* Gris claro */
--accent: oklch(0.65 0.18 50);        /* Naranja industrial */
--background: oklch(0.98 0 0);        /* Blanco hueso */
--foreground: oklch(0.15 0 0);        /* Negro carbón */
```

---

### Fase 6: Mobile + SEO + Performance
**Objetivo**: App lista para producción

| Tarea | Archivo(s) | Descripción |
|-------|------------|-------------|
| Audit responsive | Todas las páginas | Revisar breakpoints, touch targets |
| Mobile navigation | Header/NavBar | Hamburger menu, drawer navigation |
| Quoting flow mobile | `/quoting/*` | Optimizar para pantallas pequeñas |
| Metadata por página | Cada `page.tsx` | Títulos, descripciones únicos |
| OpenGraph images | `public/og-*.png` | Imágenes para compartir en redes |
| Sitemap | `src/app/sitemap.ts` | Generación automática |
| Robots.txt | `public/robots.txt` | Directivas de crawling |
| Schema.org | Layout principal | JSON-LD para LocalBusiness |
| Core Web Vitals | Auditar | LCP, FID, CLS optimization |

---

### Fase 7: Migración a Supabase (Opcional/Posterior)
**Objetivo**: Consolidar infraestructura en un solo proveedor

| Tarea | Descripción |
|-------|-------------|
| Supabase Storage | Migrar archivos de S3 a Supabase Storage |
| Actualizar `/api/file` | Usar Supabase Storage SDK |
| Migrar DB | Mover PostgreSQL a Supabase (si aplica) |
| Actualizar Prisma | Nuevo connection string |
| Variables de entorno | Eliminar AWS_*, usar SUPABASE_* |

**Nota**: Esta fase es opcional. La arquitectura actual funciona bien. Solo migrar si el beneficio de consolidación justifica el esfuerzo.

---

## Archivos Críticos a Modificar

```
src/
├── app/
│   ├── api/
│   │   ├── orders/route.ts         # CREAR
│   │   ├── payments/route.ts       # CREAR
│   │   └── webhooks/mercadopago/   # CREAR
│   ├── (dashboard)/
│   │   ├── orders/                 # CREAR
│   │   ├── materials/              # CREAR
│   │   ├── extras/                 # CREAR
│   │   ├── my-orders/              # CREAR
│   │   └── profile/page.tsx        # MODIFICAR
│   ├── quoting/
│   │   └── success/page.tsx        # CREAR
│   ├── checkout/page.tsx           # CREAR
│   ├── page.tsx                    # REHACER (landing)
│   └── globals.css                 # MODIFICAR (colores)
├── hooks/
│   └── useSubmitQuote.ts           # MODIFICAR
├── lib/
│   ├── constants.ts                # CREAR
│   ├── mercadopago.ts              # CREAR
│   └── email.ts                    # CREAR (Resend)
├── middleware.ts                   # MODIFICAR (protección admin)
└── components/
    └── ui/*                        # MODIFICAR (tema)

prisma/
├── schema.prisma                   # Ya completo
└── seed.ts                         # CREAR
```

---

## Orden de Dependencias

```
Fase 0 ──→ Fase 1 ──→ Fase 2 ──┬──→ Fase 3
                               │
                               └──→ Fase 4

Fase 5 (paralelo después de Fase 1)
Fase 6 (paralelo después de Fase 1)
Fase 7 (opcional, al final)
```

**MVP Mínimo**: Fases 0 + 1 + 2 (parcial)
**MVP Completo**: Fases 0-4
**Producción Ready**: Fases 0-6

---

## Verificación

### Flujo de prueba E2E:
1. Visitar landing page → CTA visible
2. Subir archivo DXF → Preview funciona
3. Seleccionar material y cantidad → Precios calculados
4. Agregar extras → Suma correcta
5. Review → Totales correctos
6. Submit → Orden creada en DB
7. Página de éxito → Número de orden visible
8. Email recibido → Usuario y admin
9. Admin dashboard → Orden aparece como PENDING
10. Pagar con MercadoPago → Webhook actualiza a PAID
11. User dashboard → Usuario ve su orden

### Comandos de verificación:
```bash
npm run build          # Sin errores de TypeScript
npm run lint           # Sin warnings
npx prisma studio      # Verificar datos en DB
```

---

## Estimación de Complejidad

| Fase | Complejidad | Dependencias Externas |
|------|-------------|----------------------|
| 0 | Baja | Ninguna |
| 1 | Media-Alta | Resend (email) |
| 2 | Media | Ninguna |
| 3 | Alta | MercadoPago SDK, webhooks |
| 4 | Baja | Ninguna |
| 5 | Media | Diseño visual |
| 6 | Media | Ninguna |
| 7 | Media | Supabase Storage |

---

## Próximos Pasos Inmediatos

1. **Configurar servicios externos**:
   - Crear cuenta Resend para emails
   - Obtener credenciales MercadoPago (sandbox primero)

2. **Comenzar con Fase 0**:
   - Fix paginación
   - Seed de materiales
   - Protección de rutas

3. **Continuar con Fase 1**:
   - API de órdenes
   - Conectar submit real
