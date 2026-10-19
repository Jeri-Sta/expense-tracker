#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-10-19T01-17-56-744Z 2>/dev/null || true
echo "Backup branch backup/release-2026-10-19T01-17-56-744Z removed after 24h retention period"
