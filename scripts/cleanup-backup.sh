#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2025-12-08T12-26-16-926Z 2>/dev/null || true
echo "Backup branch backup/release-2025-12-08T12-26-16-926Z removed after 24h retention period"
