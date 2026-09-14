cat > dash-manifest.json <<EOF
{
  "rules": {
    "dash-namespace":     { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "namespace",      "target": { "id": "$RIVET_NAMESPACE" }, "operations": ["read"] },
    "dash-actor":         { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor",          "target": "any", "operations": ["create", "read", "update", "delete", "list"] },
    "dash-actor-kv":      { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor_kv",       "target": "any", "operations": ["read"] },
    "dash-actor-gateway": { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "actor_gateway",  "target": "any", "operations": ["create", "read", "update", "delete", "list"] },
    "dash-runner":        { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "runner",         "target": "any", "operations": ["create", "read", "update", "delete", "list"] },
    "dash-runner-config": { "namespace": { "id": "$RIVET_NAMESPACE" }, "resource": "runner_config",  "target": "any", "operations": ["create", "read", "update", "delete", "list"] },
    "dash-datacenter":    { "namespace": "any",                          "resource": "datacenter",     "target": "any", "operations": ["read", "list"] }
  },
  "policies": { "dash-policy": { "rules": ["dash-namespace", "dash-actor", "dash-actor-kv", "dash-actor-gateway", "dash-runner", "dash-runner-config", "dash-datacenter"] } },
  "roles":    { "dash-role":   { "policies": ["dash-policy"] } }
}
EOF

curl -X POST "$RIVET_ENDPOINT/acl/manifest" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @dash-manifest.json

curl -X POST "$RIVET_ENDPOINT/acl/tokens" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["dash-role"] }'
# Expected: token metadata and a token value; keep the token private
