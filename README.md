# active-forks

Sort project forks by stars, watchers, last update, etc.

[Website](https://techgaun.github.io/active-forks/index.html)

## features/CommitCount

Goal: Add commit frequency to DataTable

### stats/commit_activity

API requests for [Main](https://api.github.com/repos/techgaun/active-forks/stats/commit_activity) and [this fork](https://api.github.com/repos/kyleking/active-forks/stats/commit_activity)

FYI: Week is in unix timestamp

### stats/participation (N/A)

This won't work and only returns the data for the main repository. API requests for [Main](https://api.github.com/repos/techgaun/active-forks/stats/participation) and [this fork](https://api.github.com/repos/kyleking/active-forks/stats/participation)

At the time (16Sep2018), there were 3 commits in the last year [2 by techgaun] on the upstream and on this branch, 9 [6 by KyleKing and 3 from upstream]. However, for the fork, the API returned only the 3 commits from the upstream and 0 commits for the owner (KyleKing).
