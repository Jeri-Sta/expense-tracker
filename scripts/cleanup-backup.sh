#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-04-03T21-31-07-092Z 2>/dev/null || true
echo "Backup branch backup/release-2026-04-03T21-31-07-092Z removed after 24h retention period"
