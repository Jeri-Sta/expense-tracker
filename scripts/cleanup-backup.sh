#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-06-23T23-24-18-474Z 2>/dev/null || true
echo "Backup branch backup/release-2026-06-23T23-24-18-474Z removed after 24h retention period"
