#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-01-27T00-57-28-567Z 2>/dev/null || true
echo "Backup branch backup/release-2026-01-27T00-57-28-567Z removed after 24h retention period"
