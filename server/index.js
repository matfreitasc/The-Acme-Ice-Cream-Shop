const pg = require('pg')
const express = require('express')
const path = require('path')
const client = new pg.Client(
	process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db'
)
const app = express()

app.use(express.json())
app.use(require('morgan')('dev'))

/**
 * @api {get} /api/flavors Get all flavors
 * @apiName GetFlavors
 * @apiGroup Flavors
 * @apiSuccess {String} name Flavor's name.
 * @apiSuccess {Boolean} is_favorite Flavor's favorite status.
 * @apiSuccess {Date} created_at Flavor's creation date.
 * @apiSuccess {Date} updated_at Flavor's last update date.
 * @apiError {String} error Error message.
 */

app.get('/api/flavors', async (req, res, next) => {
	try {
		const response = await client.query('SELECT * FROM flavors')
		res.send(response.rows)
	} catch (error) {
		next(error)
	}
})

/**
 *  @api {get} /api/flavors/:id Get a flavor
 *  @apiName GetFlavor
 *  @apiGroup Flavors
 *  @apiParam {Number} id Flavor's unique ID.
 *  @apiSuccess {String} name Flavor's name.
 *  @apiSuccess {Boolean} is_favorite Flavor's favorite status.
 *  @apiSuccess {Date} created_at Flavor's creation date.
 *  @apiSuccess {Date} updated_at Flavor's last update date.
 *  @apiError {String} error Error message.
 */
app.get('/api/flavors/:id', async (req, res, next) => {
	try {
		const response = await client.query('SELECT * FROM flavors WHERE id = $1', [
			req.params.id,
		])
		res.send(response.rows[0])
	} catch (error) {
		next(error)
	}
})
/**
 * @api {post} /api/flavors Create a flavor
 * @apiName CreateFlavor
 * @apiGroup Flavors
 * @apiParam {String} name Flavor's name.
 * @apiParam {Boolean} is_favorite Flavor's favorite status.
 * @apiSuccess {String} name Flavor's name.
 * @apiSuccess {Boolean} is_favorite Flavor's favorite status.
 * @apiSuccess {Date} created_at Flavor's creation date.
 * @apiSuccess {Date} updated_at Flavor's last update date.
 * @apiError {String} error Error message.
 */
app.post('/api/flavors', async (req, res, next) => {
	try {
		const response = await client.query(
			'INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *',
			[req.body.name, req.body.is_favorite]
		)
		res.send(response.rows[0])
	} catch (error) {
		next(error)
	}
})
/**
 * @api {put} /api/flavors/:id Update a flavor
 * @apiName UpdateFlavor
 * @apiGroup Flavors
 * @apiParam {Number} id Flavor's unique ID.
 * @apiParam {String} name Flavor's name.
 * @apiParam {Boolean} is_favorite Flavor's favorite status.
 * @apiSuccess {String} name Flavor's name.
 * @apiSuccess {Boolean} is_favorite Flavor's favorite status.
 * @apiSuccess {Date} created_at Flavor's creation date.
 * @apiSuccess {Date} updated_at Flavor's last update date.
 * @apiError {String} error Error message.
 */
app.put('/api/flavors/:id', async (req, res, next) => {
	try {
		const response = await client.query(
			'UPDATE flavors SET name = $1, is_favorite = $2 WHERE id = $3 RETURNING *',
			[req.body.name, req.body.is_favorite, req.params.id]
		)
		res.send(response.rows[0])
	} catch (error) {
		next(error)
	}
})
/**
 * @api {delete} /api/flavors/:id Delete a flavor
 * @apiName DeleteFlavor
 * @apiGroup Flavors
 * @apiParam {Number} id Flavor's unique ID.
 * @apiSuccess {String} name Flavor's name.
 * @apiSuccess {Boolean} is_favorite Flavor's favorite status.
 * @apiSuccess {Date} created_at Flavor's creation date.
 * @apiSuccess {Date} updated_at Flavor's last update date.
 * @apiError {String} error Error message.
 */
app.delete('/api/flavors/:id', async (req, res, next) => {
	try {
		const response = await client.query('DELETE FROM flavors WHERE id = $1', [
			req.params.id,
		])
		res.send(response.rows[0])
	} catch (error) {
		next(error)
	}
})
// Show docs page as root
app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname, 'index.html'))
})

// seed data and start server

const init = async () => {
	try {
		await client.connect()
		await client.query(`
		DROP TABLE IF EXISTS flavors;
        CREATE TABLE IF NOT EXISTS flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        is_favorite BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)
		await client.query(`
      INSERT INTO flavors (name, is_favorite) VALUES ('Vanilla', true);
      INSERT INTO flavors (name, is_favorite) VALUES ('Chocolate', false);
      INSERT INTO flavors (name, is_favorite) VALUES ('Strawberry', false);
    `)
		app.listen(process.env.PORT || 3000, () => {
			console.log('Server is listening...')
		})
	} catch (error) {
		console.error('Error starting server!')
		console.error(error)
	}
}

init()
