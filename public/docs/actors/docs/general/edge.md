# Regions & Multi-Region

Actors run near your users, in a region you can choose.

An actor lives in one region. Which region it lands in, and how a client reaches it, is the same model whether you run on Rivet Cloud or your own multi-region deployment.

## Region selection

### Automatic

By default, an actor is created in the region nearest the client. Rivet uses [Anycast routing](https://en.wikipedia.org/wiki/Anycast) to find the closest point of presence without a slow manual pinging round.

### Manual

Override the region with region options at create time:

See [Actor-Actor Communication](/actors/docs/communicating-between-actors) for the full set of create options.

## Where the actor stays

An actor does not migrate between regions. It is created in one region and stays there for its lifetime, so its state is always local to the compute running it. That locality is the point: reads and writes never cross a region boundary.

Communication between actors in different regions goes over the network, so treat a cross-region actor call the same way you would treat any other remote call.

## Multi-region when self-hosting

Edge networking with automatic region selection is available on Rivet Cloud and Cloudflare Workers. Self-hosted deployments can run multiple regions, but you configure the topology and hostnames yourself.

A self-hosted multi-region deployment runs a control plane in each region, all sharing one database and pub/sub layer, with each region reachable at its own hostname. See [Multi-Region](/actors/self-host/control-plane/multi-region) in the self-host docs for the topology configuration.

The rule that matters most: each region needs its **own** hostname. Pointing a shared, load-balanced origin at several regions makes it impossible to address a specific one.