#!/usr/bin/env npx tsx
/**
 * PoP Provider Verification Script
 *
 * Tests the integration with various Proof of Personhood providers.
 *
 * Usage:
 *   npx tsx scripts/verify-providers.ts gitcoin <address>
 *   npx tsx scripts/verify-providers.ts brightid <context_id>
 *   npx tsx scripts/verify-providers.ts poh <address>
 *
 * Environment Variables:
 *   GITCOIN_PASSPORT_API_KEY - API key for Gitcoin Passport
 */

const provider = process.argv[2]
const identifier = process.argv[3]

async function testGitcoinPassport(address: string) {
  const apiKey = process.env.GITCOIN_PASSPORT_API_KEY
  const scorerId = process.env.GITCOIN_PASSPORT_SCORER_ID

  if (!apiKey) {
    console.error('❌ GITCOIN_PASSPORT_API_KEY environment variable is required')
    console.log('\nGet your API key at: https://developer.passport.xyz/')
    process.exit(1)
  }

  if (!scorerId) {
    console.error('❌ GITCOIN_PASSPORT_SCORER_ID environment variable is required')
    console.log('\nCreate a scorer at: https://developer.passport.xyz/')
    process.exit(1)
  }

  console.log('🔍 Testing Gitcoin Passport verification...')
  console.log(`   Address:   ${address}`)
  console.log(`   Scorer ID: ${scorerId}`)
  console.log('')

  try {
    const response = await fetch(
      `https://api.passport.xyz/v2/stamps/${scorerId}/score/${address}`,
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status} ${errorText}`)
      process.exit(1)
    }

    const data = await response.json()
    const score = parseFloat(data.score)

    console.log('━'.repeat(50))
    console.log('✅ Gitcoin Passport Verification Result')
    console.log('━'.repeat(50))
    console.log(`   Address:   ${data.address}`)
    console.log(`   Score:     ${score.toFixed(2)}`)
    console.log(`   Status:    ${data.status}`)
    console.log(`   Timestamp: ${data.last_score_timestamp}`)
    console.log('')

    // Determine verification level
    let level = 'insufficient'
    if (score >= 35) level = 'high_trust'
    else if (score >= 25) level = 'trusted'
    else if (score >= 15) level = 'basic'

    console.log(`   Level:     ${level}`)

    if (score >= 15) {
      console.log('')
      console.log('✅ Verification PASSED - Score meets minimum threshold (15)')
    } else {
      console.log('')
      console.log('⚠️  Verification FAILED - Score below minimum threshold (15)')
    }

    console.log('━'.repeat(50))

    // Output JSON for documentation
    console.log('')
    console.log('Raw Response (for documentation):')
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

async function testBrightID(contextId: string) {
  const context = process.env.BRIGHTID_CONTEXT || 'pohi'
  const nodeUrl = process.env.BRIGHTID_NODE_URL || 'https://app.brightid.org/node/v5'

  console.log('🔍 Testing BrightID verification...')
  console.log(`   Context:    ${context}`)
  console.log(`   Context ID: ${contextId}`)
  console.log('')

  try {
    const response = await fetch(
      `${nodeUrl}/verifications/${context}/${contextId}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`❌ API Error: ${response.status}`)
      console.error(`   ${JSON.stringify(errorData)}`)

      if (response.status === 404) {
        console.log('')
        console.log('ℹ️  User not verified in BrightID or context not found')
      }
      process.exit(1)
    }

    const data = await response.json()

    console.log('━'.repeat(50))
    console.log('✅ BrightID Verification Result')
    console.log('━'.repeat(50))
    console.log(`   Unique:    ${data.data?.unique ?? false}`)
    console.log(`   Context:   ${data.data?.context}`)
    console.log(`   Timestamp: ${data.data?.timestamp}`)
    console.log('━'.repeat(50))

    console.log('')
    console.log('Raw Response (for documentation):')
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

async function testProofOfHumanity(address: string) {
  const subgraphUrl = process.env.POH_SUBGRAPH_URL ||
    'https://gateway.thegraph.com/api/subgraphs/id/CvzNejNZR2UTQ66wL7miGgfWh9dmiwgTtTfgQCBvMQRE'

  console.log('🔍 Testing Proof of Humanity verification...')
  console.log(`   Address: ${address}`)
  console.log('')

  try {
    const query = `
      query GetSubmission($id: ID!) {
        submission(id: $id) {
          id
          registered
          submissionTime
          status
        }
      }
    `

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { id: address.toLowerCase() },
      }),
    })

    if (!response.ok) {
      console.error(`❌ Subgraph Error: ${response.status}`)
      process.exit(1)
    }

    const data = await response.json()
    const submission = data.data?.submission

    console.log('━'.repeat(50))
    console.log('✅ Proof of Humanity Verification Result')
    console.log('━'.repeat(50))

    if (submission) {
      console.log(`   Address:    ${submission.id}`)
      console.log(`   Registered: ${submission.registered}`)
      console.log(`   Status:     ${submission.status}`)
      console.log(`   Time:       ${new Date(submission.submissionTime * 1000).toISOString()}`)

      if (submission.registered) {
        console.log('')
        console.log('✅ Verification PASSED - User is registered')
      } else {
        console.log('')
        console.log('⚠️  Verification FAILED - User not registered')
      }
    } else {
      console.log('   No submission found for this address')
      console.log('')
      console.log('⚠️  Verification FAILED - No PoH registration')
    }

    console.log('━'.repeat(50))

    console.log('')
    console.log('Raw Response (for documentation):')
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

function printUsage() {
  console.log('PoP Provider Verification Script')
  console.log('')
  console.log('Usage:')
  console.log('  npx tsx scripts/verify-providers.ts <provider> <identifier>')
  console.log('')
  console.log('Providers:')
  console.log('  gitcoin  <address>     - Test Gitcoin Passport')
  console.log('  brightid <context_id>  - Test BrightID')
  console.log('  poh      <address>     - Test Proof of Humanity')
  console.log('')
  console.log('Environment Variables:')
  console.log('  GITCOIN_PASSPORT_API_KEY    - API key (from developer.passport.xyz)')
  console.log('  GITCOIN_PASSPORT_SCORER_ID  - Scorer ID (from developer.passport.xyz)')
  console.log('  BRIGHTID_CONTEXT            - BrightID context (default: pohi)')
  console.log('  BRIGHTID_NODE_URL           - BrightID node URL')
  console.log('  POH_SUBGRAPH_URL            - Proof of Humanity subgraph URL')
  console.log('')
  console.log('Examples:')
  console.log('  GITCOIN_PASSPORT_API_KEY=xxx GITCOIN_PASSPORT_SCORER_ID=123 \\')
  console.log('    npx tsx scripts/verify-providers.ts gitcoin 0x123...')
  console.log('  npx tsx scripts/verify-providers.ts brightid my-context-id')
  console.log('  npx tsx scripts/verify-providers.ts poh 0x123...')
}

async function main() {
  if (!provider || !identifier) {
    printUsage()
    process.exit(1)
  }

  switch (provider.toLowerCase()) {
    case 'gitcoin':
    case 'gitcoin-passport':
      await testGitcoinPassport(identifier)
      break

    case 'brightid':
      await testBrightID(identifier)
      break

    case 'poh':
    case 'proof-of-humanity':
      await testProofOfHumanity(identifier)
      break

    default:
      console.error(`❌ Unknown provider: ${provider}`)
      console.log('')
      printUsage()
      process.exit(1)
  }
}

main()
