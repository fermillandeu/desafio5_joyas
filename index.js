const express = require("express");
const app = express();
const cors = require("cors");

const { pool, obtenerJoyas, filtrarJoyas } = require("./consultas");

app.use(cors());


app.use((req, res, next) => {
    console.log(`Ruta consultada: ${req.method} ${req.url}`);
    next();
});


app.get("/joyas", async (req, res) => {
    try {
        const { limit = 10, page = 1, order_by = "id_ASC" } = req.query;
        const offset = (page - 1) * limit;
        const joyas = await obtenerJoyas(limit, offset, order_by);

        const HATEOAS = joyas.map((j) => ({
            id: j.id,
            name: j.nombre,
            href: `/joyas/${j.id}`,
        }));

        res.json({
            total: joyas.length,
            joyas: HATEOAS,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get("/joyas/filtros", async (req, res) => {
    try {
        const filtros = {
            precio_max: req.query.precio_max,
            precio_min: req.query.precio_min,
            categoria: req.query.categoria,
            metal: req.query.metal,
        };

        const joyas = await filtrarJoyas(filtros);
        res.json({ results: joyas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/joyas/:id", async (req, res) => {
    try {
        const { id } = req.params; 
        const consulta = "SELECT * FROM inventario WHERE id = $1"; 
        const { rows } = await pool.query(consulta, [id]); 

        if (rows.length === 0) {
            return res.status(404).json({ error: "Joya no encontrada" }); 
        }

        res.json(rows[0]); 
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});
app.listen(3000, () => console.log("Server ON"));
