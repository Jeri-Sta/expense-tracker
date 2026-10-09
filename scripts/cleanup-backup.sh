#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-10-09T15-43-07-659Z 2>/dev/null || true
echo "Backup branch backup/release-2026-10-09T15-43-07-659Z removed after 24h retention period"
