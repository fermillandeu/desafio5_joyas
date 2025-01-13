
const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "1234",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true,
});

const obtenerJoyas = async (limit, offset, orderBy = "id_ASC") => {
    const [campo, orden] = orderBy.split("_");
    const consulta = `
        SELECT * FROM inventario
        ORDER BY ${campo} ${orden}
        LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(consulta, [limit, offset]);
    return rows;
};

const filtrarJoyas = async ({ precio_max, precio_min, categoria, metal }) => {
    let consulta = "SELECT * FROM inventario WHERE 1=1";
    const valores = [];

    if (precio_max) {
        consulta += " AND precio <= $1";
        valores.push(precio_max);
    }
    if (precio_min) {
        consulta += " AND precio >= $2";
        valores.push(precio_min);
    }
    if (categoria) {
        consulta += " AND categoria = $3";
        valores.push(categoria);
    }
    if (metal) {
        consulta += " AND metal = $4";
        valores.push(metal);
    }

    const { rows } = await pool.query(consulta, valores);
    return rows;
};

module.exports = { pool, obtenerJoyas, filtrarJoyas };
