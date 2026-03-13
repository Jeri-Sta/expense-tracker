#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-03-13T11-01-29-632Z 2>/dev/null || true
echo "Backup branch backup/release-2026-03-13T11-01-29-632Z removed after 24h retention period"
