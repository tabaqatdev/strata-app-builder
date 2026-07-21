#!/usr/bin/env bash
# restart_server.sh — restart the Strata Serve server (wt-server). No hot reload; a restart applies
# config/datasource/metadata changes. Provide the config path the server was started with.
# Usage: restart_server.sh <server_config.toml> [wt-server-binary]
set -euo pipefail

CONFIG="${1:?server_config.toml path required}"
BIN="${2:-wt-server}"
PORT_HINT="$(grep -Eo 'bind *= *"[^"]+"' "$CONFIG" | grep -Eo '[0-9]+' | tail -1 || true)"

if [[ -n "${PORT_HINT:-}" ]]; then
  echo ">> freeing port ${PORT_HINT}"
  lsof -ti "tcp:${PORT_HINT}" 2>/dev/null | xargs -r kill 2>/dev/null || true
  sleep 1
fi

echo ">> starting: $BIN $CONFIG"
# Run in the background; adapt to your process manager as needed.
nohup "$BIN" "$CONFIG" >/tmp/wt-server.out 2>&1 &
sleep 2
echo ">> restarted. Validate: curl \"http://127.0.0.1:${PORT_HINT:-8765}/rest/services?f=json\""
