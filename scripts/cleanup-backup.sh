#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-10-06T13-03-25-828Z 2>/dev/null || true
echo "Backup branch backup/release-2026-10-06T13-03-25-828Z removed after 24h retention period"
