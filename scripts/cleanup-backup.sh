#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-04-03T19-33-45-194Z 2>/dev/null || true
echo "Backup branch backup/release-2026-04-03T19-33-45-194Z removed after 24h retention period"
