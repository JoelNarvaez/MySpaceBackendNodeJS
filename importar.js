const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ==========================================
// 1. PEGA AQUÍ LOS DATOS DE TU MYSQL DE RAILWAY
// ==========================================
const DB_HOST = 'acela.proxy.rlwy.net'; // Cambia si tu host es diferente
const DB_PORT = 46935;                  // Reemplaza con tu puerto de Railway
const DB_USER = 'root';                 // Reemplaza con tu usuario
const DB_PASSWORD = 'RGTepgaObtBAtWiPPnasqfBhZMYUCAog';                
const DB_NAME = 'railway';              // Reemplaza con tu base de datos de Railway

// Nombre del archivo .sql que exportaste de phpMyAdmin y pusiste en la carpeta backend/
const SQL_FILE_NAME = 'SPAMySpace.sql';

async function importarBaseDeDatos() {
  const filePath = path.join(__dirname, SQL_FILE_NAME);

  if (!fs.existsSync(filePath)) {
    console.error(`\n[ERROR] No se encontró el archivo "${SQL_FILE_NAME}" en la carpeta backend.`);
    console.log(`Por favor exporta tu base de datos desde phpMyAdmin y colócala aquí con ese nombre.\n`);
    process.exit(1);
  }

  console.log(`\nReading SQL file: ${SQL_FILE_NAME}...`);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log('Connecting to Railway MySQL...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true // Permite ejecutar todo el archivo .sql de un solo golpe
    });
    console.log('¡Conectado exitosamente!');
  } catch (error) {
    console.error('\n[ERROR] No se pudo conectar a la base de datos de Railway.');
    console.error('Verifica que hayas copiado correctamente los datos de HOST, PORT, USER, PASSWORD y DATABASE.\n');
    console.error(error.message);
    process.exit(1);
  }

  console.log('Importing tables and data... (this might take a few seconds)');
  try {
    await connection.query(sql);
    console.log('\n=========================================');
    console.log('🎉 ¡IMPORTACIÓN COMPLETADA CON ÉXITO! 🎉');
    console.log('Tu base de datos en Railway ya está lista.');
    console.log('=========================================\n');
  } catch (error) {
    console.error('\n[ERROR] Ocurrió un error al ejecutar el script SQL:');
    console.error(error.message);
  } finally {
    await connection.end();
  }
}

importarBaseDeDatos();
