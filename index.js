const express = require('express');
const app = express();
const pg = require('pg');

app.use(express.json())

const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'postgres',
});

async function init() {
    try {
        await client.connect();
        console.log('Connected to the database');

        await client.query('DROP TABLE IF EXISTS flavors');
        await client.query(`
            CREATE TABLE flavors (
            id SERIAL PRIMARY KEY,
            flavor VARCHAR(50)
            )
        `);
        await client.query(`insert into flavors(flavor) values('chocolate')`)
        await client.query(`insert into flavors(flavor) values('vanilla')`)
        await client.query(`insert into flavors(flavor) values('strawberry')`)

        console.log('Table "flavors" created successfully');
    } catch (err) {
        console.error('Error during database initialization:', err);
    }
}
init();

app.listen(3000, function() {
    console.log("listening on port 3000");
})

app.get('/api/flavors', async (req, res) => {
    try {
        const result = await client.query('select * from flavors');
        res.json(result.rows); // Send the rows as JSON response
    } catch (err) {
        console.error('Error fetching flavors:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/flavors/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const result = await client.query('SELECT * from flavors where id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]); 
        } else {
            res.status(404).send('Flavor not found');
        }
    } catch (err) {
        console.error('Error fetching flavor:', err);
        res.status(500).send('Internal Server Error');
    } 
});

app.post('/api/flavors', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('Flavor name is required');
    }

    try {
        const result = await client.query(
            'INSERT INTO flavors (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        delete from flavors
        where id = $1`
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    }
    catch(ex){
        next(ex)
    }
})

app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        update flavors
        SET flavor=$1
        where id=$3 returning *`
        const response = await client.query(SQL, [req.body.flavor, req.params.id])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }
})