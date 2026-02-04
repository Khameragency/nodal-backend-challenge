# Nodal Backend Challenge - Fase 2

Módulo de orquestación para regenerar el Informe de Mercado (Fase 2) cuando se modifica el Brief (Fase 1). Implementa RAG simulado, cola real con reintentos y persistencia en PostgreSQL.

## Arquitectura

- `routes/` expone los endpoints HTTP.
- `plugins/` contiene adaptadores (DB, cola, repositorios) que se pueden reemplazar.
- `lib/` define interfaces y mocks (AI, Knowledge Base, repositorio, pipeline).
- `worker.js` ejecuta el pipeline en segundo plano usando BullMQ.

## Endpoints

### PATCH `/projects/{id}/brief`

Recibe `{ "brief": "..." }` y responde `202 Accepted` en milisegundos. Encola el job de regeneración.

### GET `/projects/{id}`

Devuelve el estado actual (`PROCESSING`, `COMPLETED`, `FAILED`) y el resultado si existe.

## Ejecutar con Docker Compose

```bash
docker compose up --build
```

Servicios:
- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Ejecutar localmente

```bash
npm install
npm run dev
```

En otra terminal:

```bash
npm run worker
```

## Ejemplo rápido (cURL)

```bash
curl -X PATCH http://localhost:3001/projects/123/brief \
  -H "Content-Type: application/json" \
  -d '{"brief":"Nuevo brief de prueba"}'

curl http://localhost:3001/projects/123
```

## Decisiones y resiliencia

- **"He diseñado la estrategia de reintentos asumiendo X..."**  
  He diseñado la estrategia de reintentos asumiendo que el proveedor de IA puede fallar de manera transitoria o estar indisponible por períodos largos; por eso uso `attempts` y `backoff` exponencial en BullMQ, manteniendo el job en Redis hasta que se agoten los intentos.

- **"Para manejar la concurrencia, he decidido aplicar Y..."**  
  Para manejar la concurrencia, he decidido aplicar versionado por `brief_version` y un `jobId` determinístico por versión; así, un job viejo no puede sobrescribir resultados de una actualización más reciente.

- **"Si tuviera que escalar esto a 1 millón de requests, cambiaría Z..."**  
  Si tuviera que escalar esto a 1 millón de requests, cambiaría el almacenamiento por particionado o sharding en Postgres, agregaría autoscaling de workers, y migraría a un broker más robusto con prioridades, además de cachear lecturas y usar un API gateway.

## ¿Qué pasa si la IA se cae por 1 hora?

El sistema se mantiene estable porque los jobs se guardan en Redis y se reintentan automáticamente con backoff. El estado del proyecto sigue siendo `PROCESSING` hasta que se agoten los intentos, y el usuario puede re-disparar el proceso con otro PATCH si lo desea.
