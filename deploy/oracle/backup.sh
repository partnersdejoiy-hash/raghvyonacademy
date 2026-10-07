#!/usr/bin/env bash
set -euo pipefail
umask 077
destination=/var/backups/raghvyonacademy
install -d -m 700 "$destination"
snapshot="$destination/academy-$(date -u +%Y%m%dT%H%M%SZ).db"
# SQLite online backup includes committed WAL records without stopping the app.
sqlite3 /var/lib/raghvyonacademy/raghvyon.db ".backup '$snapshot'"
test "$(sqlite3 "$snapshot" 'PRAGMA integrity_check;')" = ok
find "$destination" -type f -name 'academy-*.db' -mtime +14 -delete
