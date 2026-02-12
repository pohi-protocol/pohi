export const translations = {
  en: {
    // Nav
    title: 'Proof of Human Intent',
    tagline: 'AI executes. Humans authorize. Machines verify.',
    dashboard: 'Dashboard',
    backToDemo: 'Back to Demo',
    github: 'GitHub',
    docs: 'Docs',
    tryDemo: 'Try the Demo',
    learnMore: 'Learn More',

    // Hero
    heroTitle: 'Proof of Human Intent',
    heroSubtitle:
      'A cryptographic protocol that proves a real human approved critical software actions. Built for the AI era.',
    heroTagline: 'AI executes. Humans authorize. Machines verify.',
    heroBadge: 'Open Protocol',
    heroCta: 'Try Live Demo',
    heroCtaSecondary: 'Read the Paper',

    // Problem section
    problemTitle: 'The Problem',
    problemSubtitle: 'AI is writing more code than ever. But who approves it?',
    problemTimeline2024: 'AI writes code',
    problemTimeline2025: 'AI creates PRs',
    problemTimeline2026: 'AI deploys to production',
    problemQuestion: 'Can you PROVE a human approved it?',
    problemTraditional: 'Traditional',
    problemAiEra: 'AI Era',
    problemHumanWrites: 'Human writes code',
    problemAiWrites: 'AI writes code',
    problemHumanReviews: 'Human reviews',
    problemAiReviews: 'AI reviews',
    problemHumanMerges: 'Human merges',
    problemUnknown: '???',

    // Protocol flow
    flowTitle: 'How the Protocol Works',
    flowSubtitle: 'Three cryptographic steps to verifiable human approval',
    flowStep1Title: 'Verify Human',
    flowStep1Desc: 'Prove you are a unique human via a Proof of Personhood provider',
    flowStep2Title: 'Bind to Action',
    flowStep2Desc: 'Cryptographically bind your proof to a specific commit or deployment',
    flowStep3Title: 'Record Attestation',
    flowStep3Desc: 'Create a tamper-evident, independently verifiable attestation',
    flowVerify: 'VERIFY',
    flowBind: 'BIND',
    flowRecord: 'RECORD',

    // Approval Request
    approvalRequest: 'Approval Request',
    repository: 'Repository',
    commitSha: 'Commit SHA',
    description: 'Description',
    descriptionPlaceholder: 'What are you approving?',
    githubActionRequest: 'GitHub Action Approval Request',

    // Provider Selection
    selectProvider: 'Select Verification Method',
    verifyIdentity: 'Verify Your Identity',
    changeProvider: 'Change provider',

    // Providers
    worldId: 'World ID',
    worldIdDesc: 'ZK proof with Orb/Device verification',
    gitcoinPassport: 'Gitcoin Passport',
    gitcoinPassportDesc: 'Web3 identity score',
    brightId: 'BrightID',
    brightIdDesc: 'Social graph verification',
    civic: 'Civic',
    civicDesc: 'Gateway Pass verification',
    proofOfHumanity: 'Proof of Humanity',
    proofOfHumanityDesc: 'Kleros registry',
    holonym: 'Holonym',
    holonymDesc: 'ZK identity (Gov ID / ePassport)',
    idena: 'Idena',
    idenaDesc: 'AI-resistant CAPTCHA',
    coinbaseVerifications: 'Coinbase Verifications',
    coinbaseVerificationsDesc: 'KYC attestation (EAS)',
    humanityProtocol: 'Humanity Protocol',
    humanityProtocolDesc: 'Palm biometric verification',

    // Provider badges
    recommended: 'Recommended',
    highSybilResistance: 'High Sybil Resistance',
    mediumSybilResistance: 'Medium Sybil Resistance',

    // Supported Providers section
    supportedProviders: 'Supported Providers',
    providersSubtitle: 'Pluggable architecture supporting 9 Proof of Personhood providers',
    zkProofs: 'ZK Proofs',
    web3Score: 'Web3 Score',
    socialGraph: 'Social Graph',
    gatewayPass: 'Gateway Pass',
    kleros: 'Kleros',
    providersCount: '9 Providers',
    providersNote: 'World ID is the recommended provider for highest sybil resistance.',

    // Verification Status
    verifying: 'Verifying your humanity...',
    humanVerified: 'Human Verified',
    verificationFailed: 'Verification Failed',
    startNewVerification: 'Start new verification',
    tryAgain: 'Try again',
    alreadyApproved: 'Already Approved',
    alreadyApprovedDesc: 'This commit has already been verified by a human.',
    approvedAt: 'Approved at',
    checkingStatus: 'Checking approval status...',

    // Attestation
    attestationCreated: 'Attestation Created',
    attestationHash: 'Attestation Hash (SHA-256)',
    copyJson: 'Copy JSON',
    copyHash: 'Copy Hash',
    viewFullJson: 'View full attestation JSON',

    // How it works (simple)
    howItWorks: 'How It Works',
    step1Title: 'Choose Provider',
    step1Desc: 'Select your preferred proof-of-personhood provider',
    step2Title: 'Verify Human',
    step2Desc: "Complete verification to prove you're a unique human",
    step3Title: 'Create Attestation',
    step3Desc: 'Attestation is created binding your approval to the action',

    // Use Cases
    useCasesTitle: 'Use Cases',
    useCasesSubtitle: 'Real-world applications for verifiable human approval',
    useCase1Title: 'PR Merge Gating',
    useCase1Desc:
      'Require verified human approval before merging AI-generated pull requests. Integrates with GitHub Actions.',
    useCase2Title: 'Deployment Approval',
    useCase2Desc:
      'Ensure a verified human authorized every production deployment. Prevent autonomous AI deployments.',
    useCase3Title: 'Release Signing',
    useCase3Desc:
      'Create tamper-evident proof that a human authorized a software release. Auditable and verifiable.',
    useCase4Title: 'Compliance & Audit',
    useCase4Desc:
      'Immutable audit trail proving human oversight of AI-driven changes. Meets regulatory requirements.',

    // Architecture
    architectureTitle: 'Architecture',
    architectureSubtitle: 'Chain-neutral, zero-dependency core protocol',
    archLayer1: 'Applications',
    archLayer1Desc: 'GitHub Action, GitLab CI, Bitbucket Pipe, CLI',
    archLayer2: 'SDK',
    archLayer2Desc: 'World Chain client, on-chain recording',
    archLayer3: 'Core Protocol',
    archLayer3Desc: 'Attestation creation, validation, hashing (zero deps)',
    archLayer4: 'PoP Providers',
    archLayer4Desc: 'World ID, Gitcoin Passport, BrightID, +6 more',

    // Integration
    integrationTitle: 'Quick Integration',
    integrationSubtitle: 'Add human approval verification to your CI/CD pipeline in minutes',
    integrationTab1: 'GitHub Action',
    integrationTab2: 'TypeScript',
    integrationTab3: 'CLI',

    // Stats
    statsProviders: 'PoP Providers',
    statsPackages: 'npm Packages',
    statsZeroDeps: 'Zero Dependencies',
    statsChains: 'Chain Support',

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
    footerBuiltWith: 'Built with',
    footerProtocol: 'Protocol',
    footerResources: 'Resources',
    footerSpecification: 'Specification',
    footerPaper: 'Paper',
    footerSecurity: 'Security',
    footerChangelog: 'Changelog',

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
    // Nav
    title: 'Proof of Human Intent',
    tagline: 'AIが実行し、人間が承認し、機械が検証する。',
    dashboard: 'ダッシュボード',
    backToDemo: 'デモに戻る',
    github: 'GitHub',
    docs: 'ドキュメント',
    tryDemo: 'デモを試す',
    learnMore: '詳細を見る',

    // Hero
    heroTitle: 'Proof of Human Intent',
    heroSubtitle:
      '重要なソフトウェアアクションを実際の人間が承認したことを暗号学的に証明するプロトコル。AI時代のために構築。',
    heroTagline: 'AIが実行し、人間が承認し、機械が検証する。',
    heroBadge: 'オープンプロトコル',
    heroCta: 'ライブデモを試す',
    heroCtaSecondary: '論文を読む',

    // Problem section
    problemTitle: '課題',
    problemSubtitle: 'AIがかつてないほどコードを書いている。しかし、誰がそれを承認するのか？',
    problemTimeline2024: 'AIがコードを書く',
    problemTimeline2025: 'AIがPRを作成',
    problemTimeline2026: 'AIが本番環境にデプロイ',
    problemQuestion: '人間が承認したことを証明できますか？',
    problemTraditional: '従来',
    problemAiEra: 'AI時代',
    problemHumanWrites: '人間がコードを書く',
    problemAiWrites: 'AIがコードを書く',
    problemHumanReviews: '人間がレビュー',
    problemAiReviews: 'AIがレビュー',
    problemHumanMerges: '人間がマージ',
    problemUnknown: '???',

    // Protocol flow
    flowTitle: 'プロトコルの仕組み',
    flowSubtitle: '検証可能な人間の承認への3つの暗号学的ステップ',
    flowStep1Title: '人間を検証',
    flowStep1Desc: 'Proof of Personhoodプロバイダーを通じてユニークな人間であることを証明',
    flowStep2Title: 'アクションに紐付け',
    flowStep2Desc: '特定のコミットやデプロイメントに証明を暗号学的に紐付け',
    flowStep3Title: '証明を記録',
    flowStep3Desc: '改ざん不可能で独立検証可能な証明を作成',
    flowVerify: '検証',
    flowBind: '紐付け',
    flowRecord: '記録',

    // Approval Request
    approvalRequest: '承認リクエスト',
    repository: 'リポジトリ',
    commitSha: 'コミットSHA',
    description: '説明',
    descriptionPlaceholder: '何を承認しますか？',
    githubActionRequest: 'GitHub Action 承認リクエスト',

    // Provider Selection
    selectProvider: '検証方法を選択',
    verifyIdentity: '本人確認',
    changeProvider: 'プロバイダーを変更',

    // Providers
    worldId: 'World ID',
    worldIdDesc: 'Orb/Device検証によるZK証明',
    gitcoinPassport: 'Gitcoin Passport',
    gitcoinPassportDesc: 'Web3アイデンティティスコア',
    brightId: 'BrightID',
    brightIdDesc: 'ソーシャルグラフ検証',
    civic: 'Civic',
    civicDesc: 'ゲートウェイパス検証',
    proofOfHumanity: 'Proof of Humanity',
    proofOfHumanityDesc: 'Klerosレジストリ',
    holonym: 'Holonym',
    holonymDesc: 'ZKアイデンティティ（政府ID/eパスポート）',
    idena: 'Idena',
    idenaDesc: 'AI耐性CAPTCHA',
    coinbaseVerifications: 'Coinbase Verifications',
    coinbaseVerificationsDesc: 'KYC証明（EAS）',
    humanityProtocol: 'Humanity Protocol',
    humanityProtocolDesc: 'パーム生体認証',

    // Provider badges
    recommended: '推奨',
    highSybilResistance: '高いシビル耐性',
    mediumSybilResistance: '中程度のシビル耐性',

    // Supported Providers section
    supportedProviders: 'サポートプロバイダー',
    providersSubtitle: '9つのProof of Personhoodプロバイダーをサポートするプラガブルアーキテクチャ',
    zkProofs: 'ZK証明',
    web3Score: 'Web3スコア',
    socialGraph: 'ソーシャルグラフ',
    gatewayPass: 'ゲートウェイパス',
    kleros: 'Kleros',
    providersCount: '9プロバイダー',
    providersNote: 'World IDは最高のシビル耐性を持つ推奨プロバイダーです。',

    // Verification Status
    verifying: 'あなたの人間性を検証中...',
    humanVerified: '人間確認完了',
    verificationFailed: '検証に失敗しました',
    startNewVerification: '新しい検証を開始',
    tryAgain: '再試行',
    alreadyApproved: '承認済み',
    alreadyApprovedDesc: 'このコミットは既に人間によって検証されています。',
    approvedAt: '承認日時',
    checkingStatus: '承認状態を確認中...',

    // Attestation
    attestationCreated: '証明が作成されました',
    attestationHash: '証明ハッシュ（SHA-256）',
    copyJson: 'JSONをコピー',
    copyHash: 'ハッシュをコピー',
    viewFullJson: '完全なJSON証明を表示',

    // How it works (simple)
    howItWorks: '仕組み',
    step1Title: 'プロバイダーを選択',
    step1Desc: 'お好みの人格証明プロバイダーを選択',
    step2Title: '人間を検証',
    step2Desc: 'あなたがユニークな人間であることを証明',
    step3Title: '証明を作成',
    step3Desc: 'あなたの承認をアクションに紐付けた証明を作成',

    // Use Cases
    useCasesTitle: 'ユースケース',
    useCasesSubtitle: '検証可能な人間の承認の実世界での応用',
    useCase1Title: 'PRマージゲーティング',
    useCase1Desc:
      'AI生成のプルリクエストをマージする前に、検証済みの人間の承認を要求。GitHub Actionsと統合。',
    useCase2Title: 'デプロイメント承認',
    useCase2Desc:
      'すべての本番デプロイメントを検証済みの人間が承認したことを保証。自律的なAIデプロイメントを防止。',
    useCase3Title: 'リリース署名',
    useCase3Desc:
      '人間がソフトウェアリリースを承認した改ざん不可能な証明を作成。監査可能で検証可能。',
    useCase4Title: 'コンプライアンス＆監査',
    useCase4Desc: 'AI主導の変更に対する人間の監視を証明する不変の監査証跡。規制要件を満たす。',

    // Architecture
    architectureTitle: 'アーキテクチャ',
    architectureSubtitle: 'チェーンニュートラルな依存関係ゼロのコアプロトコル',
    archLayer1: 'アプリケーション',
    archLayer1Desc: 'GitHub Action、GitLab CI、Bitbucket Pipe、CLI',
    archLayer2: 'SDK',
    archLayer2Desc: 'World Chainクライアント、オンチェーン記録',
    archLayer3: 'コアプロトコル',
    archLayer3Desc: '証明の作成、検証、ハッシュ（依存関係ゼロ）',
    archLayer4: 'PoPプロバイダー',
    archLayer4Desc: 'World ID、Gitcoin Passport、BrightID、+6',

    // Integration
    integrationTitle: 'クイックインテグレーション',
    integrationSubtitle: '数分でCI/CDパイプラインに人間承認検証を追加',
    integrationTab1: 'GitHub Action',
    integrationTab2: 'TypeScript',
    integrationTab3: 'CLI',

    // Stats
    statsProviders: 'PoPプロバイダー',
    statsPackages: 'npmパッケージ',
    statsZeroDeps: '依存関係ゼロ',
    statsChains: 'チェーンサポート',

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
    footerBuiltWith: 'Built with',
    footerProtocol: 'プロトコル',
    footerResources: 'リソース',
    footerSpecification: '仕様',
    footerPaper: '論文',
    footerSecurity: 'セキュリティ',
    footerChangelog: '変更履歴',

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
