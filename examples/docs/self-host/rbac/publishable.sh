cat > pk-manifest.json <<EOF
{
  "rules": {
    "pub-actor":   { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor",         "target": "any", "operations": ["create", "read", "update"] },
    "pub-gateway": { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor_gateway", "target": "any", "operations": ["create", "read", "update", "delete", "list"] }
  },
  "policies": { "pub-policy": { "rules": ["pub-actor", "pub-gateway"] } },
  "roles":    { "pub-role":   { "policies": ["pub-policy"] } }
}
EOF

curl -X POST "$RIVET_ENDPOINT/acl/manifest" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @pk-manifest.json

curl -X POST "$RIVET_ENDPOINT/acl/tokens" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["pub-role"], "prefix": "pk" }'
# { "token": "pk_...", ... }
