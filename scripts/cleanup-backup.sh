#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2026-06-23T21-33-51-734Z 2>/dev/null || true
echo "Backup branch backup/release-2026-06-23T21-33-51-734Z removed after 24h retention period"
