#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-11-16T14-12-01-029Z 2>/dev/null || true
echo "Backup branch backup/release-2026-11-16T14-12-01-029Z removed after 24h retention period"
