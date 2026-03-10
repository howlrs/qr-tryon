#!/bin/bash
set -euo pipefail

PROJECT_ID="anyway-432813"
ZONE="us-central1-a"
VM_NAME="portfolio-vm"
REMOTE_DIR="/home/o9oem/projects/qr-tryon"
DOMAIN="stores-qr.howlrs.net"

echo "=== QR-TryOn Deploy ==="

# 1. Build locally and push to VM via rsync
echo "[1/4] Syncing files to VM..."
gcloud compute scp --recurse --project="$PROJECT_ID" --zone="$ZONE" \
  --exclude='node_modules|.next|.git' \
  . "${VM_NAME}:${REMOTE_DIR}"

# 2. Build and start container on VM
echo "[2/4] Building and starting container..."
gcloud compute ssh "$VM_NAME" --project="$PROJECT_ID" --zone="$ZONE" --command="
  cd ${REMOTE_DIR} && \
  docker compose down --remove-orphans 2>/dev/null || true && \
  docker compose up -d --build
"

# 3. Update Caddy config
echo "[3/4] Updating Caddy config..."
gcloud compute ssh "$VM_NAME" --project="$PROJECT_ID" --zone="$ZONE" --command="
  if ! grep -q '${DOMAIN}' /etc/caddy/Caddyfile; then
    echo '
${DOMAIN} {
    reverse_proxy localhost:3002
}' | sudo tee -a /etc/caddy/Caddyfile > /dev/null
    sudo systemctl reload caddy
    echo 'Caddy config updated and reloaded'
  else
    echo 'Caddy config already contains ${DOMAIN}'
    sudo systemctl reload caddy
  fi
"

# 4. Verify
echo "[4/4] Verifying deployment..."
gcloud compute ssh "$VM_NAME" --project="$PROJECT_ID" --zone="$ZONE" --command="
  docker ps --filter name=qr-tryon --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
"

echo ""
echo "=== Deploy complete ==="
echo "URL: https://${DOMAIN}"
