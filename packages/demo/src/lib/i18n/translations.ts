export const translations = {
  en: {
    // Header
    title: 'Proof of Human Intent',
    tagline: 'AI executes. Humans authorize. Machines verify.',
    dashboard: 'Dashboard',
    backToDemo: 'Back to Demo',

    // Approval Request
    approvalRequest: 'Approval Request',
    repository: 'Repository',
    commitSha: 'Commit SHA',
    description: 'Description',
    descriptionPlaceholder: 'What are you approving?',
    githubActionRequest: 'GitHub Action Approval Request',

    // Provider Selection
    selectProvider: 'Select Verification Provider',
    verifyIdentity: 'Verify Your Identity',
    changeProvider: 'Change provider',

    // Providers
    worldId: 'World ID',
    worldIdDesc: 'Zero-knowledge proof',
    gitcoinPassport: 'Gitcoin Passport',
    gitcoinPassportDesc: 'Web3 identity score',
    brightId: 'BrightID',
    brightIdDesc: 'Social graph verification',
    civic: 'Civic',
    civicDesc: 'Gateway pass',
    proofOfHumanity: 'Proof of Humanity',
    proofOfHumanityDesc: 'Kleros registry',

    // Verification Status
    verifying: 'Verifying...',
    humanVerified: 'Human Verified!',
    verificationFailed: 'Verification Failed',
    startNewVerification: 'Start new verification',
    tryAgain: 'Try again',
    alreadyApproved: 'Already Approved',
    alreadyApprovedDesc: 'This commit has already been verified by a human.',
    approvedAt: 'Approved at',
    checkingStatus: 'Checking approval status...',

    // Attestation
    attestationCreated: 'Attestation Created',
    attestationHash: 'Attestation Hash',
    copyJson: 'Copy JSON',
    copyHash: 'Copy Hash',
    viewFullJson: 'View full attestation JSON',

    // How it works
    howItWorks: 'How it works',
    step1Title: 'Choose Provider',
    step1Desc: 'Select your preferred proof-of-personhood provider',
    step2Title: 'Verify Human',
    step2Desc: "Complete verification to prove you're a unique human",
    step3Title: 'Create Attestation',
    step3Desc: 'Attestation is created binding your approval to the action',

    // Supported Providers
    supportedProviders: 'Supported Providers',
    zkProofs: 'ZK Proofs',
    web3Score: 'Web3 Score',
    socialGraph: 'Social Graph',
    gatewayPass: 'Gateway Pass',
    kleros: 'Kleros',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faq1Question: 'What is Proof of Human Intent?',
    faq1Answer:
      'PoHI is a protocol that creates cryptographically verifiable proof that a real human approved critical software actions. It combines proof-of-personhood verification with cryptographic binding to specific actions.',
    faq2Question: 'Why do I need this?',
    faq2Answer:
      "As AI agents increasingly write and deploy code, there's a growing need to verify that humans are still in control of critical decisions. PoHI provides an immutable record of human approval.",
    faq3Question: 'Is my identity exposed?',
    faq3Answer:
      'No. PoHI uses zero-knowledge proofs (via World ID) or pseudonymous verification. Your real identity is never revealed - only proof that you are a unique human.',
    faq4Question: 'How is this different from signing commits?',
    faq4Answer:
      'Git signatures prove ownership of a key, but not that the key owner is human or unique. PoHI adds a layer of proof-of-personhood verification.',

    // Footer
    footer: 'Your approval, cryptographically preserved for the future.',

    // Dashboard
    dashboardTitle: 'PoHI Dashboard',
    dashboardSubtitle: 'On-chain attestation explorer',
    loading: 'Loading...',
    registryContract: 'Registry Contract',
    network: 'Network',
    totalAttestations: 'Total Attestations',
    active: 'Active',
    revoked: 'Revoked',
    repositories: 'Repositories',
    byVerificationLevel: 'By Verification Level',
    device: 'Device',
    orb: 'Orb',
    secureDocument: 'Secure Document',
    searchPlaceholder: 'Search by repository, hash, or commit...',
    all: 'All',
    noAttestationsFound: 'No attestations found',
    commit: 'Commit',
    level: 'Level',
    status: 'Status',
    date: 'Date',
    hash: 'Hash',
    viewOnExplorer: 'View on Explorer',
    dataFetchedFrom: 'Data is fetched from World Chain Sepolia.',
  },
  ja: {
    // Header
    title: 'Proof of Human Intent',
    tagline: 'AIが実行し、人間が承認し、機械が検証する。',
    dashboard: 'ダッシュボード',
    backToDemo: 'デモに戻る',

    // Approval Request
    approvalRequest: '承認リクエスト',
    repository: 'リポジトリ',
    commitSha: 'コミットSHA',
    description: '説明',
    descriptionPlaceholder: '何を承認しますか？',
    githubActionRequest: 'GitHub Action 承認リクエスト',

    // Provider Selection
    selectProvider: '検証プロバイダーを選択',
    verifyIdentity: '本人確認',
    changeProvider: 'プロバイダーを変更',

    // Providers
    worldId: 'World ID',
    worldIdDesc: 'ゼロ知識証明',
    gitcoinPassport: 'Gitcoin Passport',
    gitcoinPassportDesc: 'Web3アイデンティティスコア',
    brightId: 'BrightID',
    brightIdDesc: 'ソーシャルグラフ検証',
    civic: 'Civic',
    civicDesc: 'ゲートウェイパス',
    proofOfHumanity: 'Proof of Humanity',
    proofOfHumanityDesc: 'Klerosレジストリ',

    // Verification Status
    verifying: '検証中...',
    humanVerified: '人間確認完了！',
    verificationFailed: '検証に失敗しました',
    startNewVerification: '新しい検証を開始',
    tryAgain: '再試行',
    alreadyApproved: '承認済み',
    alreadyApprovedDesc: 'このコミットは既に人間によって検証されています。',
    approvedAt: '承認日時',
    checkingStatus: '承認状態を確認中...',

    // Attestation
    attestationCreated: '証明が作成されました',
    attestationHash: '証明ハッシュ',
    copyJson: 'JSONをコピー',
    copyHash: 'ハッシュをコピー',
    viewFullJson: '完全なJSON証明を表示',

    // How it works
    howItWorks: '仕組み',
    step1Title: 'プロバイダーを選択',
    step1Desc: 'お好みの人格証明プロバイダーを選択',
    step2Title: '人間を検証',
    step2Desc: 'あなたがユニークな人間であることを証明',
    step3Title: '証明を作成',
    step3Desc: 'あなたの承認をアクションに紐付けた証明を作成',

    // Supported Providers
    supportedProviders: 'サポートされているプロバイダー',
    zkProofs: 'ZK証明',
    web3Score: 'Web3スコア',
    socialGraph: 'ソーシャルグラフ',
    gatewayPass: 'ゲートウェイパス',
    kleros: 'Kleros',

    // FAQ
    faqTitle: 'よくある質問',
    faq1Question: 'Proof of Human Intentとは？',
    faq1Answer:
      'PoHIは、重要なソフトウェアアクションを実際の人間が承認したことを暗号学的に証明するプロトコルです。人格証明と特定のアクションへの暗号的紐付けを組み合わせています。',
    faq2Question: 'なぜこれが必要なのですか？',
    faq2Answer:
      'AIエージェントがコードを書いてデプロイすることが増えるにつれ、重要な決定において人間がまだ制御していることを検証する必要性が高まっています。PoHIは人間の承認の不変の記録を提供します。',
    faq3Question: '私のアイデンティティは公開されますか？',
    faq3Answer:
      'いいえ。PoHIはゼロ知識証明（World ID経由）または仮名検証を使用します。あなたの実際のアイデンティティは決して明かされません - あなたがユニークな人間であるという証明のみです。',
    faq4Question: 'コミット署名との違いは？',
    faq4Answer:
      'Git署名は鍵の所有権を証明しますが、鍵の所有者が人間であるか、ユニークであるかは証明しません。PoHIは人格証明の検証レイヤーを追加します。',

    // Footer
    footer: 'あなたの承認を、暗号学的に未来へ。',

    // Dashboard
    dashboardTitle: 'PoHI ダッシュボード',
    dashboardSubtitle: 'オンチェーン証明エクスプローラー',
    loading: '読み込み中...',
    registryContract: 'レジストリコントラクト',
    network: 'ネットワーク',
    totalAttestations: '総証明数',
    active: 'アクティブ',
    revoked: '取消済み',
    repositories: 'リポジトリ',
    byVerificationLevel: '検証レベル別',
    device: 'デバイス',
    orb: 'Orb',
    secureDocument: 'セキュアドキュメント',
    searchPlaceholder: 'リポジトリ、ハッシュ、コミットで検索...',
    all: 'すべて',
    noAttestationsFound: '証明が見つかりません',
    commit: 'コミット',
    level: 'レベル',
    status: 'ステータス',
    date: '日時',
    hash: 'ハッシュ',
    viewOnExplorer: 'エクスプローラーで表示',
    dataFetchedFrom: 'データはWorld Chain Sepoliaから取得されています。',
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof (typeof translations)['en']
