curl -X POST "$RIVET_ENDPOINT/acl/manifest" \
  -H "Authorization: Bearer $RIVET_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rules":    { "pub-actor":  { "namespace": { "id": "ns_abc123" }, "resource": "actor", "target": "any", "operations": ["read"] } },
    "policies": { "pub-policy": { "rules": ["pub-actor"] } },
    "roles":    { "pub-role":   { "policies": ["pub-policy"] } }
  }'
# Expected: JSON containing the upserted rules, policies, and roles
