#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-03-08T19-42-51-605Z 2>/dev/null || true
echo "Backup branch backup/release-2026-03-08T19-42-51-605Z removed after 24h retention period"
