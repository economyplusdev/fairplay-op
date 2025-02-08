const backendSecret = process.env.BACKEND_SECRET
const isServerSetup = require('../../../modules/database/operations/isServerSetup')
const getSearchTerm = require('../../../modules/helpers/xbox/getSearchTerm')
const getRealmList = require('../../../modules/helpers/realms/getRealmList')
const stripFormatting = require('../../../modules/helpers/misc/stripFormatting')
const getLevenshteinDistance = require('../../../modules/helpers/misc/getLevenshteinDistance')

function getRealmAutoCompleteResults(realms, searchValue) {
  const MAX_RESULTS = 8
  const lowerSearch = searchValue.toLowerCase().trim()
  if (!lowerSearch) {
    return realms.slice(0, MAX_RESULTS).map(realm => ({
      name: stripFormatting(realm.name),
      value: realm.id.toString()
    }))
  }
  const preparedRealms = realms.map(realm => ({
    realm,
    plainName: stripFormatting(realm.name).toLowerCase().trim()
  }))
  const substringMatches = preparedRealms.filter(r => r.plainName.includes(lowerSearch))
  substringMatches.sort((a, b) => a.plainName.localeCompare(b.plainName))
  if (substringMatches.length >= MAX_RESULTS) {
    return substringMatches.slice(0, MAX_RESULTS).map(match => ({
      name: stripFormatting(match.realm.name),
      value: match.realm.id.toString()
    }))
  }
  const matchedIds = new Set(substringMatches.map(m => m.realm.id))
  const nonSubstringRealms = preparedRealms.filter(r => !matchedIds.has(r.realm.id))
  const fuzzyMatches = nonSubstringRealms.map(item => {
    const distance = getLevenshteinDistance(item.plainName, lowerSearch)
    return { distance, realm: item.realm }
  })
  fuzzyMatches.sort((a, b) => a.distance - b.distance)
  const neededFuzzyCount = MAX_RESULTS - substringMatches.length
  const topFuzzy = fuzzyMatches.slice(0, neededFuzzyCount)
  const finalResults = [
    ...substringMatches.map(m => m.realm),
    ...topFuzzy.map(m => m.realm)
  ].slice(0, MAX_RESULTS)
  return finalResults.map(realm => ({
    name: stripFormatting(realm.name),
    value: realm.id.toString()
  }))
}

module.exports = (fastify, opts, done) => {
  fastify.post('/api/discordbot/fetchAutoComplete/:id', async (req, reply) => {
    const guildID = req.params.id
    const catagory = req.query.catagory
    const searchValue = req.body.searchValue
    if (req.headers.authorization !== backendSecret) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    if (!(await isServerSetup(guildID, fastify.db))) {
      return reply.status(200).send({ error: 'Server is not setup', success: false })
    }
    if (catagory === 'username') {
      const cacheKey = `autocomplete:username:${guildID}:${searchValue}`
      let cached = null
      try {
        cached = await fastify.db.rocksdbGet(cacheKey)
      } catch (err) {
        if (!err.message.includes('NotFound')) {
          return reply.status(500).send({ autoCompletions: [], success: false })
        }
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (!parsed.expires || parsed.expires < Date.now()) {
            cached = null
          } else {
            const topOptions = parsed.data.data.slice(0, 8).map(person => ({
              name: person.uniqueModernGamertag,
              value: person.gamertag
            }))
            return reply.status(200).send({ autoCompletions: topOptions, success: true })
          }
        } catch (err) {
          cached = null
        }
      }
      const searchTerm = await getSearchTerm(searchValue, guildID, fastify.db)
      if (!searchTerm.success) {
        return reply.status(500).send({ autoCompletions: [], success: false })
      }
      await fastify.db.rocksdbPut(
        cacheKey,
        JSON.stringify({ data: searchTerm, expires: Date.now() + 1800 * 1000 })
      )
      const topOptions = searchTerm.data.slice(0, 8).map(person => ({
        name: person.uniqueModernGamertag,
        value: person.gamertag
      }))
      return reply.status(200).send({ autoCompletions: topOptions, success: true })
    }
    if (catagory === 'realm') {
      const cacheKey = `autocomplete:realm:${guildID}`
      let cached = null
      try {
        cached = await fastify.db.rocksdbGet(cacheKey)
      } catch (err) {
        if (!err.message.includes('NotFound')) {
          return reply.status(500).send({ autoCompletions: [], success: false })
        }
      }
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.expires && parsed.expires > Date.now()) {
            const realmList = parsed.data
            const topMatches = getRealmAutoCompleteResults(realmList.realms, searchValue)
            return reply.status(200).send({ autoCompletions: topMatches, success: true })
          }
        } catch (err) {}
      }
      const realmList = await getRealmList(guildID, fastify.db)
      if (!realmList.success) {
        return reply.status(500).send({ autoCompletions: [], success: false })
      }
      await fastify.db.rocksdbPut(
        cacheKey,
        JSON.stringify({ data: realmList, expires: Date.now() + 1800 * 1000 })
      )
      const topMatches = getRealmAutoCompleteResults(realmList.realms, searchValue)
      return reply.status(200).send({ autoCompletions: topMatches, success: true })
    }
    return reply.status(400).send({ error: 'Invalid category', success: false })
  })
  done()
}
