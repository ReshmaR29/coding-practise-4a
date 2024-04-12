const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => console.log('Server Started Succesfully'))
  } catch (e) {
    console.log(`DB error message ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT
   *
  FROM
   cricket_team`
  const players = await db.all(getPlayersQuery)
  response.send(
    players.map(eachObject => {
      return {
        playerId: eachObject.player_id,
        playerName: eachObject.player_name,
        jerseyNumber: eachObject.jersey_number,
        role: eachObject.role,
      }
    }),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId}`
  const player = await db.get(getPlayerQuery)
  response.send(
    player.map(eachOject => {
      return snake_caseTocamelCase(eachOject)
    }),
  )
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES(${playerName},${jerseyNumber},${role});`
  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `
    UPDATE
     cricket_team 
     SET
    player_name=${playerName},
    jersey_number=${jerseyNumber},
    role=${role}
     WHERE player_id=${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
