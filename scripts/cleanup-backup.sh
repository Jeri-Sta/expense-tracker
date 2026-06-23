#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-06-23T11-07-50-860Z 2>/dev/null || true
echo "Backup branch backup/release-2026-06-23T11-07-50-860Z removed after 24h retention period"
