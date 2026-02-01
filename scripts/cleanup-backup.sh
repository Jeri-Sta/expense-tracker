#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-02-01T14-22-57-859Z 2>/dev/null || true
echo "Backup branch backup/release-2026-02-01T14-22-57-859Z removed after 24h retention period"
