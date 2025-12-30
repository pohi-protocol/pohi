#!/usr/bin/env npx tsx
/**
 * Gitcoin Passport Verification Test Script
 *
 * Usage:
 *   GITCOIN_PASSPORT_API_KEY=xxx GITCOIN_PASSPORT_SCORER_ID=xxx npx tsx scripts/test-gitcoin-passport.ts [address]
 *
 * Get API key and Scorer ID from: https://developer.passport.xyz/
 */

const API_KEY = process.env.GITCOIN_PASSPORT_API_KEY
const SCORER_ID = process.env.GITCOIN_PASSPORT_SCORER_ID

// Default test address (can be overridden via CLI argument)
const TEST_ADDRESS = process.argv[2] || '0x839395e20bbB182fa440d08F850E6c7A8f6F0780'

async function main() {
  console.log('='.repeat(60))
  console.log('Gitcoin Passport Verification Test')
  console.log('='.repeat(60))
  console.log()

  if (!API_KEY) {
    console.error('❌ GITCOIN_PASSPORT_API_KEY environment variable is required')
    console.error('   Get one from: https://developer.passport.xyz/')
    process.exit(1)
  }

  if (!SCORER_ID) {
    console.error('❌ GITCOIN_PASSPORT_SCORER_ID environment variable is required')
    console.error('   Get one from: https://developer.passport.xyz/')
    process.exit(1)
  }

  console.log(`📍 Address: ${TEST_ADDRESS}`)
  console.log(`🔑 Scorer ID: ${SCORER_ID}`)
  console.log()

  try {
    // Call Gitcoin Passport API v2
    const url = `https://api.passport.xyz/v2/stamps/${SCORER_ID}/score/${TEST_ADDRESS}`
    console.log(`🌐 API URL: ${url}`)
    console.log()

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    })

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`)
    console.log()

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      process.exit(1)
    }

    const data = await response.json()

    console.log('📊 Response Data:')
    console.log(JSON.stringify(data, null, 2))
    console.log()

    // Parse and display results
    const score = parseFloat(data.score)
    const timestamp = data.last_score_timestamp

    console.log('='.repeat(60))
    console.log('VERIFICATION RESULT')
    console.log('='.repeat(60))
    console.log()
    console.log(`✅ Address: ${data.address}`)
    console.log(`📊 Score: ${score}`)
    console.log(`📅 Timestamp: ${timestamp}`)
    console.log()

    // Determine verification level
    let level: string
    let emoji: string
    if (score >= 35) {
      level = 'HIGH_TRUST'
      emoji = '🏆'
    } else if (score >= 25) {
      level = 'TRUSTED'
      emoji = '✅'
    } else if (score >= 15) {
      level = 'BASIC'
      emoji = '👍'
    } else {
      level = 'INSUFFICIENT'
      emoji = '⚠️'
    }

    console.log(`${emoji} Verification Level: ${level}`)
    console.log()

    // Output for README
    console.log('='.repeat(60))
    console.log('FOR README:')
    console.log('='.repeat(60))
    const date = new Date().toISOString().split('T')[0]
    console.log(`| **Gitcoin Passport** | Web3 identity score | Medium | ✅ Tested (${date}) |`)
    console.log()
    console.log('Evidence:')
    console.log(`- Address: ${data.address}`)
    console.log(`- Score: ${score}`)
    console.log(`- Level: ${level}`)
    console.log(`- API Timestamp: ${timestamp}`)
    console.log()

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
