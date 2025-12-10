#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2025-12-10T11-57-17-345Z 2>/dev/null || true
echo "Backup branch backup/release-2025-12-10T11-57-17-345Z removed after 24h retention period"
