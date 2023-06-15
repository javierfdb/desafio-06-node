import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    allowExitOnIdle: true,  // cerrar sesion de conexion despues de cada consulta
})

export default pool;