cat > sk-manifest.json <<EOF
{
  "rules": {
    "sec-runner":  { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "runner",        "target": "any", "operations": ["create"] },
    "sec-actor":   { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor",         "target": "any", "operations": ["create", "read", "update", "delete", "list"] },
    "sec-gateway": { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor_gateway", "target": "any", "operations": ["create", "read", "update", "delete", "list"] }
  },
  "policies": { "sec-policy": { "rules": ["sec-runner", "sec-actor", "sec-gateway"] } },
  "roles":    { "sec-role":   { "policies": ["sec-policy"] } }
}
EOF

curl -X POST "$RIVET_ENDPOINT/acl/manifest" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @sk-manifest.json

curl -X POST "$RIVET_ENDPOINT/acl/tokens" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["sec-role"], "prefix": "sk" }'
# { "token": "sk_...", ... }
