#!/usr/bin/env node

import { Command } from 'commander'
import { setJsonOutput } from './utils/output.js'
import { configCommand } from './commands/config.js'
import { attestCommand } from './commands/attest.js'
import { verifyCommand } from './commands/verify.js'
import { statusCommand } from './commands/status.js'

const program = new Command()

program
  .name('pohi')
  .description('Proof of Human Intent - AI executes. Humans authorize. Machines verify.')
  .version('0.1.0')
  .option('--json', 'Output results as JSON')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts()
    if (opts.json) {
      setJsonOutput(true)
    }
  })

// Add commands
program.addCommand(configCommand)
program.addCommand(attestCommand)
program.addCommand(verifyCommand)
program.addCommand(statusCommand)

// Examples in help
program.addHelpText('after', `

Examples:
  # Configure CLI
  $ pohi config set approvalUrl https://your-server.com
  $ pohi config set worldIdAppId app_xxxxx
  $ pohi config set worldIdAction approve_deployment

  # Request human approval for a commit
  $ pohi attest -r owner/repo -c abc123def456

  # Request approval and record on-chain
  $ pohi attest -r owner/repo -c abc123def456 --record -n sepolia

  # Verify an attestation from file
  $ pohi verify -f attestation.json

  # Verify on-chain status by hash
  $ pohi verify -H 0x123...abc -n mainnet

  # Check if a commit has been approved
  $ pohi status -r owner/repo -c abc123def456 -n mainnet

  # Use JSON output (for CI/CD)
  $ pohi --json attest -r owner/repo -c abc123

Environment Variables:
  POHI_APPROVAL_URL   Approval server URL
  POHI_APP_ID         World ID App ID
  POHI_ACTION         World ID Action name
  POHI_NETWORK        Chain network (mainnet/sepolia)
  POHI_PRIVATE_KEY    Private key for on-chain operations
`)

program.parse()
