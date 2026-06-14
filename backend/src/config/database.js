const { Pool } = require('pg');

// ⚠️  TODO: PROBLEMA DE SEGURIDAD - Credenciales hardcodeadas
// En producción, TODAS las credenciales deben provenir de variables de entorno
// o de un servicio de gestión de secretos (AWS Secrets Manager, etc.)
// Ver .env.example para la configuración correcta.
//
// Pasos para corregir:
// 1. Crear archivo .env con las credenciales reales (ver .env.example)
// 2. Descomentar las líneas de process.env y eliminar los valores fijos

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',   // TODO: Solo variable de entorno
  port:     process.env.DB_PORT     || 5432,          // TODO: Solo variable de entorno
  database: process.env.DB_NAME     || 'pos_db',      // TODO: Solo variable de entorno
  user:     process.env.DB_USER     || 'postgres',    // TODO: Solo variable de entorno
  password: process.env.DB_PASSWORD || 'postgres',    // TODO: Solo variable de entorno

  // TODO: Habilitar SSL para conexiones en producción (RDS, Cloud SQL, etc.)
   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // TODO: Configurar pool según la carga esperada
  max:              10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// TODO: Implementar lógica de reconexión automática (retry) para alta disponibilidad
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err.message);
  // TODO: Enviar alerta a sistema de monitoreo (CloudWatch, Datadog, etc.)
});

module.exports = pool;
