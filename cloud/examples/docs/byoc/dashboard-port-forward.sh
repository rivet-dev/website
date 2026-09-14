kubectl --context "<cluster-context>" -n rivet \
  port-forward --address 127.0.0.1 service/rivet-engine 6420:6420
# Expected: Forwarding from 127.0.0.1:6420 -> 6420
