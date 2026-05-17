# Setup de base de datos para piloto anónimo

Este proyecto usará dos bases:

- Desarrollo: `test_vocacional`, con datos de prueba.
- Piloto: `test_vocacional_piloto`, limpia y sin datos personales.

No se debe ejecutar `prisma migrate reset` sobre la base actual de desarrollo sin confirmación explícita.

## 1. Crear base piloto

En PostgreSQL, crear una base nueva:

```sql
CREATE DATABASE test_vocacional_piloto;
```

## 2. Configurar `DATABASE_URL` para piloto

Usar una variable de entorno apuntando a la base nueva:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/test_vocacional_piloto"
```

Reemplaza `USER` y `PASSWORD` por las credenciales reales del entorno.

## 3. Ejecutar migraciones en la base piloto

La migración inicial ya está generada en:

```txt
prisma/migrations/20260517000000_init_anonymous_pilot/migration.sql
```

Con `DATABASE_URL` apuntando a `test_vocacional_piloto`, ejecutar:

```bash
npx prisma migrate deploy
```

La base piloto nacerá sin:

- `Student`
- `studentId`
- nombres
- emails
- DNI
- teléfonos
- direcciones
- datos de padres

## 4. Generar cliente Prisma

```bash
npx prisma generate
```

## 5. Cargar catálogo inicial

Esto carga preguntas, dimensiones, perfiles y pesos:

```bash
npm run db:seed
```

No crea estudiantes ni datos personales.

## 6. Limpiar solo datos transaccionales del piloto

Si necesitas limpiar respuestas y resultados sin borrar el catálogo:

```bash
npm run db:clean-pilot
```

Este script elimina:

- `TestResult`
- `SessionDimensionScore`
- `TestOpenAnswer`
- `TestAnswer`
- `TestSession`

No elimina:

- `Question`
- `Dimension`
- `VocationalProfile`
- `ProfileDimension`

## 7. Modelo anónimo

El piloto usa:

- `TestSession.id`: identificador técnico UUID.
- `participantCode`: código anónimo legible.
- `grade`: grado no identificable.
- `schoolCode`: código de colegio, no nombre real.
- `ageRange`: rango de edad, no edad exacta.
- `consentAccepted`: consentimiento.
- `isPilotData`: marca para sesiones del piloto.

Las respuestas, puntajes y resultados se relacionan por `sessionId`.
