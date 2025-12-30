# Gitcoin Passport Verification Evidence

**Date**: 2025-12-31
**API Version**: v2

## Test Parameters

| Parameter | Value |
|-----------|-------|
| Scorer ID | 11894 |
| Address | `0x839395e20bbb182fa440d08f850e6c7a8f6f0780` |
| API Endpoint | `https://api.passport.xyz/v2/stamps/{scorer_id}/score/{address}` |

## Result

| Field | Value |
|-------|-------|
| **Score** | 54.33 |
| **Threshold** | 20.00 |
| **Passing** | true |
| **Verification Level** | HIGH_TRUST (score >= 35) |
| **Last Score Timestamp** | 2025-12-30T15:13:22.540039+00:00 |
| **Expiration** | 2026-01-25T14:39:54.119000+00:00 |

## Stamps (18 total)

| Stamp | Score |
|-------|-------|
| ETHScore#50 | 16.02 |
| NFTScore#50 | 16.25 |
| GitcoinContributorStatistics#totalContributionAmountGte#1000 | 4.99 |
| ETHScore#90 | 2.93 |
| NFTScore#90 | 2.41 |
| ETHScore#75 | 2.40 |
| NFTScore#75 | 2.36 |
| ExperiencedCommunityStaker | 2.16 |
| NFT | 1.03 |
| GitcoinContributorStatistics#totalContributionAmountGte#100 | 1.02 |
| ETHGasSpent#0.25 | 0.78 |
| BeginnerCommunityStaker | 0.67 |
| SnapshotProposalsProvider | 0.24 |
| GitcoinContributorStatistics#totalContributionAmountGte#10 | 0.22 |
| GnosisSafe | 0.22 |
| ETHnumTransactions#100 | 0.21 |
| Ens | 0.21 |
| ETHDaysActive#50 | 0.21 |

## Raw API Response

```json
{
  "address": "0x839395e20bbb182fa440d08f850e6c7a8f6f0780",
  "score": "54.33400",
  "passing_score": true,
  "last_score_timestamp": "2025-12-30T15:13:22.540039+00:00",
  "expiration_timestamp": "2026-01-25T14:39:54.119000+00:00",
  "threshold": "20.00000",
  "error": null,
  "stamps": {
    "ExperiencedCommunityStaker": {"score": "2.16100", "dedup": false},
    "BeginnerCommunityStaker": {"score": "0.67300", "dedup": false},
    "ETHDaysActive#50": {"score": "0.20700", "dedup": false},
    "ETHnumTransactions#100": {"score": "0.21000", "dedup": false},
    "ETHGasSpent#0.25": {"score": "0.77800", "dedup": false},
    "ETHScore#90": {"score": "2.92600", "dedup": false},
    "ETHScore#75": {"score": "2.39900", "dedup": false},
    "ETHScore#50": {"score": "16.02100", "dedup": false},
    "GnosisSafe": {"score": "0.22200", "dedup": false},
    "SnapshotProposalsProvider": {"score": "0.23900", "dedup": false},
    "GitcoinContributorStatistics#totalContributionAmountGte#1000": {"score": "4.99700", "dedup": false},
    "GitcoinContributorStatistics#totalContributionAmountGte#100": {"score": "1.01700", "dedup": false},
    "GitcoinContributorStatistics#totalContributionAmountGte#10": {"score": "0.22300", "dedup": false},
    "NFT": {"score": "1.03200", "dedup": false},
    "NFTScore#90": {"score": "2.41300", "dedup": false},
    "NFTScore#75": {"score": "2.36200", "dedup": false},
    "NFTScore#50": {"score": "16.24600", "dedup": false},
    "Ens": {"score": "0.20800", "dedup": false}
  }
}
```

## Verification Command

```bash
curl -s "https://api.passport.xyz/v2/stamps/11894/score/0x839395e20bbB182fa440d08F850E6c7A8f6F0780" \
  -H "X-API-KEY: <API_KEY>" \
  -H "Content-Type: application/json"
```

## Conclusion

The Gitcoin Passport API v2 integration is verified and working correctly. The test address achieved a HIGH_TRUST verification level with a score of 54.33, well above the threshold of 20.00.
