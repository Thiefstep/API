const express = require('express')
const cors = require('cors')

const logger = require("./logger");
const champions = require('./champions.json')
const { capitalise } = require('./helpers/helpers')

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

app.get('/', (req, res) => {
  res.send("Welcome the Champion API")
})

app.get('/champions', (req, res) => {
  res.send(champions)
})

app.get('/champions/:name', (req, res) => {
  const name = req.params.name.toLowerCase()

  const foundChampion = champions.find(champion => champion.name.toLowerCase() === name)
  
  if (foundChampion === undefined) {
    res.status(404).send({ error: `Champion: ${name} not found :(`})
  }

  res.send(foundChampion)
})

app.post('/champions', (req, res) => {
  const ids = champions.map(champion => champion.id)
  let maxId = Math.max(...ids)
  const existingChampion = champions.find(champion => champion.name === req.body.name)

  if (existingChampion !== undefined) {
    res.status(409).send({error: "Champion already exists"})
  } else {
    maxId += 1
    const newChampion = req.body
    newChampion.id = maxId
    champions.push(newChampion)
    res.status(201).send(newChampion)
  }
})

app.patch("/champions/:name", (req, res) => {
  const foundChampion = champions.find(champion => champion.name.toLowerCase() === req.params.name.toLowerCase());

  if (foundChampion === undefined) {
    return res.status(404).send({error: "Champion does not exist"})
  }

  try {
    const updatedChampion = { ...req.body, name: capitalise(req.body.name), id: foundChampion.id}
    const idx = champions.findIndex(f => f.id === foundChampion.id);
    champions[idx] = updatedChampion;
    res.send(updatedChampion)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.delete("/champions/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const foundChampionIndex = champions.findIndex(champion => champion.name.toLowerCase() === name);

  if (foundChampionIndex === -1) {
    res.status(404).send({ error: "Champion does not exist" })
  } else {
    champions.splice(foundChampionIndex, 1);

    res.status(204).send()
  }
})

module.exports = app;