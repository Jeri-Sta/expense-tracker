#!/bin/bash
sleep 86400 # 24 hours
git branch -D backup/release-2025-12-10T12-12-49-213Z 2>/dev/null || true
echo "Backup branch backup/release-2025-12-10T12-12-49-213Z removed after 24h retention period"
