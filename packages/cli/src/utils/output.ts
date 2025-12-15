import chalk from 'chalk'

export interface OutputOptions {
  json?: boolean
}

let outputJson = false

export function setJsonOutput(json: boolean): void {
  outputJson = json
}

export function isJsonOutput(): boolean {
  return outputJson
}

export function success(message: string, data?: Record<string, unknown>): void {
  if (outputJson && data) {
    console.log(JSON.stringify({ success: true, ...data }, null, 2))
  } else {
    console.log(chalk.green('✓') + ' ' + message)
    if (data && !outputJson) {
      Object.entries(data).forEach(([key, value]) => {
        console.log(chalk.gray(`  ${key}: `) + String(value))
      })
    }
  }
}

export function error(message: string, err?: Error | unknown): void {
  if (outputJson) {
    console.log(JSON.stringify({
      success: false,
      error: message,
      details: err instanceof Error ? err.message : String(err),
    }, null, 2))
  } else {
    console.error(chalk.red('✗') + ' ' + message)
    if (err) {
      console.error(chalk.gray('  ' + (err instanceof Error ? err.message : String(err))))
    }
  }
}

export function info(message: string): void {
  if (!outputJson) {
    console.log(chalk.blue('ℹ') + ' ' + message)
  }
}

export function warn(message: string): void {
  if (!outputJson) {
    console.log(chalk.yellow('⚠') + ' ' + message)
  }
}

export function log(message: string): void {
  if (!outputJson) {
    console.log(message)
  }
}

export function table(data: Record<string, unknown>[]): void {
  if (outputJson) {
    console.log(JSON.stringify(data, null, 2))
  } else {
    console.table(data)
  }
}

export function header(title: string): void {
  if (!outputJson) {
    console.log('')
    console.log(chalk.bold.cyan(title))
    console.log(chalk.cyan('─'.repeat(title.length)))
  }
}

export function outputAttestation(attestation: Record<string, unknown>): void {
  if (outputJson) {
    console.log(JSON.stringify(attestation, null, 2))
  } else {
    header('Attestation')
    if (attestation.attestation_hash) {
      console.log(chalk.gray('Hash:              ') + attestation.attestation_hash)
    }
    if (attestation.subject && typeof attestation.subject === 'object') {
      const subject = attestation.subject as Record<string, unknown>
      if (subject.repository) {
        console.log(chalk.gray('Repository:        ') + subject.repository)
      }
      if (subject.commit_sha) {
        console.log(chalk.gray('Commit:            ') + subject.commit_sha)
      }
    }
    if (attestation.human_proof && typeof attestation.human_proof === 'object') {
      const proof = attestation.human_proof as Record<string, unknown>
      console.log(chalk.gray('Verification:      ') + proof.verification_level)
      console.log(chalk.gray('Nullifier:         ') + String(proof.nullifier_hash).slice(0, 20) + '...')
    }
    if (attestation.timestamp) {
      console.log(chalk.gray('Timestamp:         ') + attestation.timestamp)
    }
  }
}
