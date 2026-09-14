cat > insp-manifest.json <<EOF
{
  "rules": {
    "insp-actor":   { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor",         "target": "any", "operations": ["create", "read", "update"] },
    "insp-gateway": { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor_gateway", "target": "any", "operations": ["create", "read", "update", "delete", "list"] },
    "insp-kv":      { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor_kv",      "target": "any", "operations": ["read"] }
  },
  "policies": { "insp-policy": { "rules": ["insp-actor", "insp-gateway", "insp-kv"] } },
  "roles":    { "insp-role":   { "policies": ["insp-policy"] } }
}
EOF

curl -X POST "$RIVET_ENDPOINT/acl/manifest" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @insp-manifest.json

curl -X POST "$RIVET_ENDPOINT/acl/tokens" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["insp-role"] }'
# Expected: token metadata and a token value; keep the token private
