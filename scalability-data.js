// Deep-dive data for every scalability component.
// Structure per component:
//   name, bottleneck, pattern, failure  -> used on the scalability.html card list
//   deep   -> Capacity / Bottleneck / Scaling pattern / Failure under scale / Trade-offs / Metrics
//   scale  -> issues[] (general scalability issues) + bottlenecks[] each with x10/x100/x1000 resolution
const COMPONENTS = [
  {
    name: "Client", bottleneck: "Excess requests", pattern: "Cache, batching", failure: "Retry storm",
    deep: {
      capacity: "Bounded by browser connection concurrency (~6 per domain), device CPU for rendering, and local storage/cache size.",
      bottleneck: "Duplicate or naive retry-without-backoff logic amplifies backend load far beyond real user demand.",
      scaling: "HTTP caching headers (ETag, Cache-Control), request batching/debouncing, client-side caching (localStorage/IndexedDB), exponential backoff with jitter.",
      failureUnderScale: "A small backend blip triggers thousands of clients retrying at the exact same moment — a synchronized retry storm that turns a minor incident into a full outage.",
      tradeoffs: [
        "Aggressive client caching improves perceived speed but risks serving stale data.",
        "Exponential backoff reduces server load but increases perceived latency for the user.",
        "Batching cuts server calls but adds complexity and delays the first item in a batch."
      ],
      metrics: ["Client error rate", "Retry rate", "Requests per client/IP", "Client-side cache hit ratio"]
    },
    scale: {
      issues: [
        "No caching strategy means every navigation re-fetches identical data",
        "Uncoordinated retries turn a minor blip into a coordinated retry storm",
        "Aggressive client polling looks identical to real attack traffic on the server",
        "Inconsistent retry/backoff logic across app versions creates unpredictable load patterns"
      ],
      bottlenecks: [
        { title: "Retry amplification", x10: "Add exponential backoff with jitter; basic client caching absorbs most of the extra load.", x100: "Introduce request coalescing/de-duplication on the client and circuit breakers so a failing endpoint stops being hammered.", x1000: "Push retry/throttle logic server-side via a BFF/edge layer so millions of heterogeneous client versions can't each implement it differently." },
        { title: "Stale/duplicate fetches", x10: "Add a simple in-memory cache with short TTL per screen.", x100: "Move to a shared client cache (service worker) with invalidation via versioned APIs.", x1000: "Push personalization/aggregation to the edge/CDN so clients fetch pre-computed views instead of raw data." }
      ]
    }
  },
  {
    name: "DNS", bottleneck: "Global traffic", pattern: "Geo/latency routing", failure: "Bad failover",
    deep: {
      capacity: "Bounded by TTL-driven query volume and authoritative nameserver throughput; most headroom comes from resolver caching, not the authoritative servers.",
      bottleneck: "Low TTLs raise load on authoritative DNS and query cost; high TTLs make bad routing decisions sticky for a long time.",
      scaling: "Anycast routing, geo/latency-based DNS, multiple redundant authoritative providers, short-but-sane TTLs (30-60s) on failover-critical records.",
      failureUnderScale: "A resolver caches a stale record right before a failover, sending traffic into a black hole for the full TTL window with no fast way to force re-resolution.",
      tradeoffs: [
        "Lower TTL means faster failover but much higher query volume and cost.",
        "Multi-provider DNS improves resilience but adds propagation-consistency complexity."
      ],
      metrics: ["DNS resolution latency", "Resolution failure rate", "TTL vs actual failover time", "Query volume per record"]
    },
    scale: {
      issues: [
        "Low TTL creates massive authoritative query volume",
        "High TTL delays failover for minutes after an incident starts",
        "Single DNS provider is a silent single point of failure",
        "GeoDNS misconfiguration silently routes users to the wrong region"
      ],
      bottlenecks: [
        { title: "Authoritative query volume", x10: "Add secondary caching resolvers and increase TTL slightly where safe.", x100: "Move to Anycast-based authoritative providers (Route53, Cloudflare) that scale globally by design.", x1000: "Run multiple redundant DNS providers with health-check-based failover, pre-warmed ahead of major traffic events." },
        { title: "Failover propagation delay", x10: "Reduce TTL on failover-critical records to 30-60s.", x100: "Add active health checks with automatic DNS failover instead of manual updates.", x1000: "Use global server load balancing (GSLB) with real-time health signals that bypass DNS TTL entirely for failover speed." }
      ]
    }
  },
  {
    name: "CDN", bottleneck: "Origin load on cache miss", pattern: "Edge caching, geo-distribution", failure: "Cache poisoning / miss storm",
    deep: {
      capacity: "Determined by edge PoP capacity, origin shield bandwidth, and cache hit ratio — real capacity is how much traffic you keep away from origin.",
      bottleneck: "Cache miss storms: when a popular object expires or is purged, thousands of edge nodes request it from origin at the same instant.",
      scaling: "Origin shielding (single mid-tier cache in front of origin), long TTLs with stale-while-revalidate, more edge PoPs, normalized cache keys to lift hit ratio.",
      failureUnderScale: "A viral asset with poor cache headers causes a miss stampede back to origin — your own CDN ends up DDoSing your backend.",
      tradeoffs: [
        "Longer TTLs raise hit ratio but widen the staleness window after updates.",
        "Origin shielding cuts origin load but adds a hop and a new failure point.",
        "Aggressive purging for freshness increases origin load."
      ],
      metrics: ["Cache hit ratio", "Origin request rate", "Edge latency p50/p99", "Purge frequency"]
    },
    scale: {
      issues: [
        "Origin gets hammered on every cache miss",
        "Global purge operations are slow and expensive at scale",
        "Cache key normalization mistakes silently fragment the cache",
        "Long-tail content has poor hit ratios and rarely benefits from caching"
      ],
      bottlenecks: [
        { title: "Origin load on miss", x10: "Set long, sane TTLs with stale-while-revalidate for most content.", x100: "Add an origin shield layer so only one request per edge miss ever reaches origin.", x1000: "Pre-warm caches ahead of predictable spikes (releases, sales) and shard origin across regions behind the shield." },
        { title: "Cache miss storm on popular content", x10: "Use per-object request coalescing at the edge to avoid duplicate origin fetches.", x100: "Add negative caching and request collapsing across all PoPs.", x1000: "Pre-compute and push content to edge proactively instead of pulling it on demand." }
      ]
    }
  },
  {
    name: "LB", bottleneck: "Connection/throughput saturation", pattern: "Horizontal LB tiers, consistent hashing", failure: "LB becomes single point of failure",
    deep: {
      capacity: "Bounded by connections-per-second, concurrent connection table size, and TLS termination CPU cost per node.",
      bottleneck: "TLS handshake CPU and connection-table size on a single LB instance; L7 header inspection costs more per request than L4.",
      scaling: "Horizontal LB tiers behind DNS/anycast, consistent hashing for backend selection, offloaded TLS termination, health-check-aware routing.",
      failureUnderScale: "A misconfigured health check marks every healthy backend down at once (flapping), or the LB itself saturates and quietly becomes the real bottleneck.",
      tradeoffs: [
        "L7 LB enables smarter routing but costs more CPU per request than L4.",
        "Sticky sessions simplify state but skew load distribution and complicate scale-in."
      ],
      metrics: ["Requests/sec per LB node", "Backend health-check failure rate", "Connection queue depth", "LB-added p99 latency"]
    },
    scale: {
      issues: [
        "A single LB node becomes a hard throughput ceiling",
        "TLS termination is CPU-expensive at high connection rates",
        "Health check flapping can mass-drain healthy backends at once",
        "Sticky sessions block clean, fast scale-in during traffic drops"
      ],
      bottlenecks: [
        { title: "Connection throughput", x10: "Vertically scale the LB and tune keepalive/connection settings.", x100: "Add a horizontal LB tier behind DNS round robin or anycast.", x1000: "Move to a multi-layer LB architecture: global LB (GSLB) \u2192 regional LB tier \u2192 service mesh sidecars, each scaling independently." },
        { title: "TLS termination CPU cost", x10: "Enable session resumption/TLS tickets to cut handshake cost.", x100: "Offload TLS to dedicated hardware accelerators or a CDN edge layer.", x1000: "Terminate TLS globally at the edge (CDN/PoP) so origin LBs only ever handle already-decrypted internal traffic." }
      ]
    }
  },
  {
    name: "API Gateway", bottleneck: "Centralized auth/routing checks", pattern: "Distributed rate limiting, edge auth", failure: "Gateway overload cascades everywhere",
    deep: {
      capacity: "Bounded by per-request overhead of auth, rate limiting, and routing — every added policy taxes gateway throughput.",
      bottleneck: "Centralized token/auth validation becomes a serial dependency sitting in front of every single request.",
      scaling: "Horizontally scaled stateless gateway instances, distributed rate limiting (Redis-backed token bucket), local JWT validation, edge-deployed gateways.",
      failureUnderScale: "The gateway becomes a single funnel — one slow downstream auth call blocks the connection/thread pool for every request passing through.",
      tradeoffs: [
        "Centralizing cross-cutting concerns simplifies services but creates a shared blast radius.",
        "Cached/local auth validation improves latency but risks using stale permissions."
      ],
      metrics: ["Gateway p99 latency", "Auth call latency/error rate", "Rate-limit rejection rate", "Requests/sec"]
    },
    scale: {
      issues: [
        "Centralized auth becomes a serial dependency for every single request",
        "Policy sprawl (rate limits, transforms) adds latency per hop",
        "Gateway config changes risk a global outage in one bad push",
        "Poor tenant isolation lets one noisy customer degrade everyone"
      ],
      bottlenecks: [
        { title: "Auth validation per request", x10: "Cache validated tokens for their TTL to skip repeated auth calls.", x100: "Move to local, stateless JWT validation (public key) instead of a network call per request.", x1000: "Push auth validation to the edge/CDN layer so it never reaches your core gateway fleet at all." },
        { title: "Rate limiting coordination", x10: "Use per-instance in-memory limits as an approximation.", x100: "Move to a centralized, Redis-backed distributed rate limiter.", x1000: "Shard rate-limit state by tenant/key and enforce it at the edge to avoid a central hot store." }
      ]
    }
  },
  {
    name: "Service", bottleneck: "CPU/thread saturation per instance", pattern: "Horizontal pod scaling, stateless design", failure: "Cascading failure to downstream deps",
    deep: {
      capacity: "Bounded by CPU, thread pool size, memory, and how long threads block on slow downstream calls.",
      bottleneck: "Thread pool exhaustion — one slow dependency starves capacity for every other, otherwise-healthy request.",
      scaling: "Stateless horizontal pod scaling (K8s HPA), async/non-blocking I/O, bulkhead isolation per dependency, circuit breakers to fail fast.",
      failureUnderScale: "Cascading failure: one dependency slows down, threads pile up waiting, the service exhausts capacity, and the failure spreads upstream.",
      tradeoffs: [
        "Async/non-blocking models scale better but are harder to reason about and debug.",
        "More replicas add resilience but multiply operational overhead — config drift, rolling deploys, coordination."
      ],
      metrics: ["CPU/memory utilization", "Thread pool saturation", "p99 latency", "Error rate", "Dependency call latency"]
    },
    scale: {
      issues: [
        "Thread pool exhaustion from one slow dependency starves all requests",
        "No bulkhead isolation lets one failing dependency take down the whole service",
        "Stateful design blocks clean horizontal scaling",
        "Slow startup (config/secret loading) delays scale-out exactly when it's needed most"
      ],
      bottlenecks: [
        { title: "Thread/connection pool exhaustion", x10: "Add timeouts on all downstream calls and size pools appropriately.", x100: "Move to async/non-blocking I/O and add circuit breakers per dependency.", x1000: "Adopt bulkhead isolation (separate pools per dependency) plus autoscaling on latency-based metrics, not just CPU." },
        { title: "Cold start / scale-out lag", x10: "Keep a small buffer of idle replicas.", x100: "Use predictive autoscaling based on traffic patterns, not just reactive CPU thresholds.", x1000: "Pre-warm large fleets ahead of known events and use lightweight runtimes/checkpointing to cut cold-start time." }
      ]
    }
  },
  {
    name: "Cache", bottleneck: "Hot-key contention, memory limits", pattern: "Sharded/distributed cache, tiered layers", failure: "Cache stampede / thundering herd",
    deep: {
      capacity: "Bounded by memory size, network throughput to cache nodes, and per-key/per-node request-rate limits.",
      bottleneck: "A single hot key gets read millions of times per second and saturates the one node hosting it, regardless of total cluster capacity.",
      scaling: "Consistent hashing with virtual nodes, client-side local caching for ultra-hot keys, per-shard read replicas, tiered caching (local L1 + distributed L2).",
      failureUnderScale: "A hot key expires and thousands of concurrent requests miss at once, all hammering the database simultaneously trying to repopulate it.",
      tradeoffs: [
        "Simple TTL expiry causes synchronized stampedes; jittered TTLs fix it but add complexity.",
        "More cache layers cut latency but multiply invalidation/consistency complexity."
      ],
      metrics: ["Cache hit/miss ratio", "Eviction rate", "Hot key request rate", "p99 latency", "Memory utilization"]
    },
    scale: {
      issues: [
        "A hot key overwhelms a single shard regardless of total cluster size",
        "Cache stampedes on expiry of popular keys hammer the DB simultaneously",
        "Invalidation correctness gets harder as write volume grows",
        "Memory fragmentation quietly reduces effective cluster capacity over time"
      ],
      bottlenecks: [
        { title: "Hot key contention", x10: "Add short local (in-process) caching in front of the distributed cache for the hottest keys.", x100: "Replicate hot keys across multiple cache nodes and randomly pick a replica per request.", x1000: "Use a multi-tier cache hierarchy (edge \u2192 regional \u2192 global) so hot keys are absorbed before ever reaching one backend shard." },
        { title: "Stampede on expiry", x10: "Add jitter to TTLs so keys don't expire in lockstep.", x100: "Use a locking/single-flight pattern so only one request repopulates a missing key while others wait.", x1000: "Proactively refresh hot keys in the background before they expire (refresh-ahead) so they never go fully cold." }
      ]
    }
  },
  {
    name: "DB reads", bottleneck: "Read query throughput on primary", pattern: "Read replicas, read-through caching", failure: "Replication lag → stale reads",
    deep: {
      capacity: "Bounded by primary/replica I/O throughput, query complexity, and connection concurrency.",
      bottleneck: "Replica lag under high write volume, or unindexed/expensive queries that replicas can't absorb fast enough.",
      scaling: "Read replicas, read-through caching, materialized views, CQRS to separate read models from write models.",
      failureUnderScale: "One expensive unindexed query saturates a replica's CPU/IO — a noisy-neighbor query slows down or times out every other read on that node.",
      tradeoffs: [
        "More read replicas improve read scale but increase replication-lag variance and cost.",
        "Caching reads cuts DB load but reintroduces staleness/invalidation problems."
      ],
      metrics: ["Replica lag", "Query latency p50/p99", "Read QPS", "Slow query count", "Connection pool usage"]
    },
    scale: {
      issues: [
        "Read replicas lag further behind under heavy write load",
        "One expensive query creates a noisy-neighbor effect on shared replicas",
        "Connection limits cap total concurrent readers",
        "Cache invalidation drift causes stale results to leak through"
      ],
      bottlenecks: [
        { title: "Replica read throughput", x10: "Add 1-2 read replicas and route reporting queries to them.", x100: "Introduce read-through caching in front of replicas for hot queries.", x1000: "Move to CQRS with dedicated read-optimized stores (denormalized, search-indexed) fully decoupled from the write path." },
        { title: "Replication lag", x10: "Monitor lag and route read-your-writes traffic back to primary when needed.", x100: "Use semi-synchronous replication for critical paths to bound lag.", x1000: "Adopt causal consistency tracking (session tokens) so clients only read from replicas caught up to their own last write." }
      ]
    }
  },
  {
    name: "DB writes", bottleneck: "Single-writer throughput, lock contention", pattern: "Write sharding, partitioning, async writes", failure: "Lock contention → deadlocks",
    deep: {
      capacity: "Bounded by the single writer's disk IOPS, WAL/commit throughput, and lock contention on hot rows.",
      bottleneck: "Row-level lock contention on hot rows/counters serializes work that should run in parallel.",
      scaling: "Write sharding/partitioning by key, async or batched writes, event sourcing (append-only logs), optimistic concurrency instead of locks.",
      failureUnderScale: "Lock contention escalates into deadlocks under concurrency; transactions queue up, write latency spikes, and connection pools exhaust upstream.",
      tradeoffs: [
        "Sharding boosts write throughput but breaks cross-shard transactions and joins.",
        "Async writes improve throughput but weaken durability — risk of loss on crash."
      ],
      metrics: ["Write latency p99", "Lock wait time", "Deadlock rate", "WAL/commit throughput", "Write QPS"]
    },
    scale: {
      issues: [
        "Single-writer throughput hard-caps overall write capacity",
        "Hot row/counter contention serializes writes that should be parallel",
        "Cross-shard transactions become very expensive once sharded",
        "Write amplification from secondary indexes slows every commit"
      ],
      bottlenecks: [
        { title: "Single-writer throughput", x10: "Batch writes and use bulk insert APIs where possible.", x100: "Shard writes by key (hash/range) across multiple writable partitions.", x1000: "Move to an event-sourced, append-only write model with async projections, removing the single-writer bottleneck entirely." },
        { title: "Hot row/counter contention", x10: "Reduce transaction scope and use optimistic concurrency.", x100: "Shard hot counters into N sub-counters merged on read.", x1000: "Move hot counters to a dedicated eventually-consistent counting service (CRDT-based) decoupled from the main DB." }
      ]
    }
  },
  {
    name: "DB storage", bottleneck: "Disk capacity & I/O limits", pattern: "Storage tiering, compression, archiving", failure: "Disk full → write failures",
    deep: {
      capacity: "Bounded by disk capacity, and I/O throughput which degrades non-linearly as disks fill (fragmentation, SSD GC pressure).",
      bottleneck: "Storage growth silently outpaces provisioning — table/index bloat and unarchived history eat capacity until a write fails.",
      scaling: "Storage tiering (hot/warm/cold), compression, TTL-based archiving to cheaper storage, partition pruning.",
      failureUnderScale: "Disk hits 100% and writes fail outright, or the filesystem stalls reclaiming space — usually discovered in production because monitoring watched CPU/latency, not disk headroom.",
      tradeoffs: [
        "Compression saves space but costs CPU on every read/write.",
        "Archiving to cold storage saves cost but adds retrieval latency for rare historical queries."
      ],
      metrics: ["Disk utilization %", "IOPS", "Table/index growth rate", "Time-to-full projection"]
    },
    scale: {
      issues: [
        "Storage growth is silent until disks are suddenly full",
        "I/O throughput degrades non-linearly as disks near capacity",
        "Index bloat slows both reads and writes over time",
        "Backup/restore windows grow linearly (or worse) with data size"
      ],
      bottlenecks: [
        { title: "Disk capacity growth", x10: "Add monitoring/alerting on disk headroom and archive old data manually.", x100: "Automate TTL-based archiving to cold storage and enable compression.", x1000: "Adopt storage tiering with automatic hot/warm/cold movement and partition pruning built into the data model." },
        { title: "I/O throughput degradation", x10: "Move hot partitions to faster disks (SSD/NVMe).", x100: "Separate hot and cold data onto different storage classes entirely.", x1000: "Redesign the schema for partition-aware access so most I/O only ever touches a small, fast working set." }
      ]
    }
  },
  {
    name: "DB connections", bottleneck: "Connection pool exhaustion", pattern: "Connection pooling / proxy (PgBouncer)", failure: "Pool exhaustion cascades to app errors",
    deep: {
      capacity: "Bounded by the database's max_connections setting and per-connection memory overhead on the DB server.",
      bottleneck: "Every service replica opens its own pool — total connections grow faster than the DB can handle as you scale out horizontally.",
      scaling: "Connection pooling/proxying (PgBouncer, ProxySQL) to multiplex many app connections onto fewer DB connections; right-sized pools per replica.",
      failureUnderScale: "A traffic spike triggers autoscaling, new pods each open fresh pools, and the DB hits max_connections — new connections get rejected fleet-wide, simultaneously.",
      tradeoffs: [
        "Pooling/proxies cut DB load but add a hop and a new potential single point of failure.",
        "Larger per-service pools reduce local contention but shrink the DB's total connection budget for everyone else."
      ],
      metrics: ["Active/idle connections", "Connection wait time", "Pool exhaustion rate", "max_connections headroom"]
    },
    scale: {
      issues: [
        "Every new service replica multiplies total open connections",
        "Autoscaling events can trigger sudden connection storms",
        "Idle connections waste DB memory that could serve active queries",
        "Pool misconfiguration causes silent request queuing that looks like DB slowness"
      ],
      bottlenecks: [
        { title: "Total connections vs max_connections", x10: "Right-size per-replica pool sizes conservatively.", x100: "Introduce a connection pooling proxy (PgBouncer/ProxySQL) between services and the DB.", x1000: "Run multiple pooling proxy tiers plus read/write splitting so the DB itself only ever sees a small, stable connection count regardless of fleet size." }
      ]
    }
  },
  {
    name: "Kafka", bottleneck: "Broker/partition throughput", pattern: "Topic partitioning, broker scaling", failure: "Partition hot-spotting",
    deep: {
      capacity: "Bounded by broker disk throughput, network bandwidth, and partition count per broker (each adds file-handle/replication overhead).",
      bottleneck: "A poorly chosen partition key sends most traffic to one partition — adding brokers doesn't help because that partition can't be split.",
      scaling: "More partitions with a well-distributed key, more brokers, tuned replication factor, rack-awareness for durability without over-replicating.",
      failureUnderScale: "An under-partitioned or hot-keyed topic means one broker/partition caps the entire topic's throughput no matter how big the cluster is.",
      tradeoffs: [
        "More partitions increase parallelism but slow rebalances and raise per-broker overhead.",
        "Higher replication factor improves durability but multiplies network/disk cost."
      ],
      metrics: ["Partition throughput skew", "Broker disk/network utilization", "Under-replicated partitions", "Producer/consumer lag"]
    },
    scale: {
      issues: [
        "Poor partition key choice creates permanent hot partitions",
        "Under-provisioned partition count caps throughput regardless of broker count",
        "Rebalances pause consumption cluster-wide",
        "Retention settings vs disk capacity is a constant tension"
      ],
      bottlenecks: [
        { title: "Partition hot-spotting", x10: "Pick a higher-cardinality partition key.", x100: "Increase partition count and rebalance existing topic data.", x1000: "Redesign the key strategy (composite keys, key salting) plus horizontal broker scaling with rack-awareness for very high-throughput topics." },
        { title: "Broker throughput ceiling", x10: "Add brokers and set replication factor appropriately.", x100: "Separate high-throughput topics onto dedicated broker pools.", x1000: "Adopt tiered storage (hot local disk + cold object storage) so brokers aren't bottlenecked by local disk at massive retention volumes." }
      ]
    }
  },
  {
    name: "Consumers", bottleneck: "Per-consumer processing throughput", pattern: "Consumer group scaling, rebalancing", failure: "Consumer lag / rebalance storms",
    deep: {
      capacity: "Bounded by consumer group size — max useful consumers equals partition count — and per-message processing time.",
      bottleneck: "Slow per-message processing on one consumer stalls its partition; extra consumers beyond the partition count just sit idle.",
      scaling: "More partitions to allow more parallel consumers, batch processing, async/parallel work within a consumer, dedicated groups per workload.",
      failureUnderScale: "A rebalance storm: one consumer restarts, triggers a group rebalance that pauses every consumer mid-processing, and repeated crashes can leave a group spending more time rebalancing than consuming.",
      tradeoffs: [
        "More partitions enable more parallel consumers but make each rebalance slower and more disruptive.",
        "Larger batches improve throughput but increase latency and reprocessing cost on failure."
      ],
      metrics: ["Consumer lag", "Rebalance frequency/duration", "Processing time per message", "Partition assignment skew"]
    },
    scale: {
      issues: [
        "Consumer parallelism is capped at partition count no matter how many instances you add",
        "Slow processing on one partition stalls only that partition, hiding the real bottleneck",
        "Frequent restarts (deploys) trigger disruptive rebalance storms",
        "A single poison message can block a partition indefinitely"
      ],
      bottlenecks: [
        { title: "Consumer parallelism ceiling", x10: "Add more consumers up to the partition count.", x100: "Increase partition count and use batched/async processing within each consumer.", x1000: "Fan out to per-worker queues so processing parallelism is decoupled entirely from partition-level parallelism." },
        { title: "Rebalance storms", x10: "Tune session/heartbeat timeouts to reduce spurious rebalances.", x100: "Adopt cooperative sticky rebalancing instead of stop-the-world rebalances.", x1000: "Use static group membership so planned restarts (deploys) don't trigger rebalances at all." }
      ]
    }
  },
  {
    name: "Object storage", bottleneck: "Request rate per key prefix", pattern: "Key prefix sharding, CDN in front", failure: "Throttling on hot prefixes",
    deep: {
      capacity: "Effectively unlimited total capacity, but per-prefix/per-key request rate is capped by internal partitioning limits.",
      bottleneck: "Sequential, predictable key naming (e.g. timestamp prefixes) concentrates requests on a few internal partitions.",
      scaling: "Randomized/hashed key prefixes to spread load, CDN in front of read-heavy objects, multipart uploads for large objects.",
      failureUnderScale: "A bulk job writes millions of sequentially-named objects; the backend can't split the hot prefix fast enough and every request in that range gets throttled (503 SlowDown) at once.",
      tradeoffs: [
        "Randomized keys fix hot-prefix throttling but make prefix-based listing/browsing harder.",
        "CDN caching cuts read load but risks staleness on frequently-updated objects."
      ],
      metrics: ["Requests/sec per prefix", "Throttle/error rate (503s)", "Latency per operation type", "Storage growth rate"]
    },
    scale: {
      issues: [
        "Sequential key naming creates unavoidable hot internal partitions",
        "Listing large buckets by prefix gets slower as object count grows",
        "Failed multipart uploads leave orphaned, cost-incurring parts",
        "Egress cost grows fast with hot-read traffic if nothing sits in front"
      ],
      bottlenecks: [
        { title: "Hot prefix throttling", x10: "Add random suffixes/hashes to keys for high-write workloads.", x100: "Fully randomize/hash key prefixes and let the storage layer auto-shard.", x1000: "Route all reads through a CDN so object storage itself only serves cold/cache-miss traffic at a much lower rate." }
      ]
    }
  },
  {
    name: "Search", bottleneck: "Index size, query fan-out cost", pattern: "Sharded indices, replica shards", failure: "Shard imbalance / query timeouts",
    deep: {
      capacity: "Bounded by index size per shard, and query cost scales with how many shards a single query must fan out to.",
      bottleneck: "Shard skew — uneven shard sizing means the slowest shard dictates the whole query's latency.",
      scaling: "Horizontal index sharding, replica shards for read scaling, query routing to minimize fan-out, reindexing to rebalance skew.",
      failureUnderScale: "One oversized or hot shard becomes the tail-latency bottleneck for every query touching it, making a well-provisioned cluster feel slow because of one bad shard.",
      tradeoffs: [
        "More shards improve parallelism but raise per-query coordination and network overhead.",
        "More replicas improve read throughput and availability but cost storage and complicate reindex consistency."
      ],
      metrics: ["Query latency p99", "Shard size variance", "Indexing throughput", "Query fan-out count"]
    },
    scale: {
      issues: [
        "Uneven shard sizing creates tail-latency outliers that drag down every query",
        "High fan-out queries get expensive as shard count grows",
        "Reindexing large indices is slow and resource-intensive",
        "Relevance tuning gets harder to validate as data volume grows"
      ],
      bottlenecks: [
        { title: "Shard skew / tail latency", x10: "Rebalance shards manually and monitor size variance.", x100: "Move to more, smaller shards to reduce the blast radius of any one hot shard.", x1000: "Adopt dynamic shard splitting/merging with dedicated read replicas per hot shard, automated by the platform." },
        { title: "Query fan-out cost", x10: "Add caching for common queries.", x100: "Route queries to a relevant subset of shards using routing hints instead of full fan-out.", x1000: "Pre-aggregate common query results and separate real-time vs analytical search indices entirely." }
      ]
    }
  },
  {
    name: "Workers", bottleneck: "Job queue backlog", pattern: "Horizontal worker pool autoscaling", failure: "Backlog spiral / job starvation",
    deep: {
      capacity: "Throughput equals worker pool size divided by average job processing time.",
      bottleneck: "Backlog grows whenever arrival rate exceeds processing rate for even a short burst, and doesn't self-recover without added capacity.",
      scaling: "Horizontal worker autoscaling based on queue depth, priority queues, splitting long jobs into smaller chunks.",
      failureUnderScale: "A backlog spiral: queue depth grows, autoscaling lags behind the spike (cold start), jobs time out and get requeued, adding even more load to an already-backed-up queue.",
      tradeoffs: [
        "Priority queues protect critical jobs but can starve low-priority work under sustained load.",
        "Aggressive autoscaling clears backlogs fast but risks cost spikes and overloading downstream systems."
      ],
      metrics: ["Queue depth", "Job processing time p99", "Oldest-job wait time", "Worker utilization"]
    },
    scale: {
      issues: [
        "Queue backlog spirals whenever arrival rate briefly exceeds processing rate",
        "Cold-start lag on autoscaling delays the response to a spike",
        "Long-running jobs monopolize worker slots",
        "No prioritization means critical jobs starve behind bulk work during a backlog"
      ],
      bottlenecks: [
        { title: "Queue backlog under burst", x10: "Add a modest fixed buffer of extra workers.", x100: "Enable autoscaling based on queue depth rather than CPU.", x1000: "Pre-provision capacity ahead of known events and split long jobs into smaller chunks to reduce latency variance." },
        { title: "Job starvation", x10: "Add a simple priority field and process high-priority first.", x100: "Use separate queues per priority tier with dedicated worker pools.", x1000: "Build a fully isolated priority lane (separate infra) for latency-critical jobs so bulk-work backlogs never touch them." }
      ]
    }
  },
  {
    name: "External API", bottleneck: "Third-party rate limits", pattern: "Circuit breaker, caching, backoff", failure: "Vendor outage cascades inward",
    deep: {
      capacity: "Bounded entirely by the third party's rate limits — capacity you don't control and often can't see in real time.",
      bottleneck: "Shared rate limits — every internal service calling the same vendor competes for the same quota.",
      scaling: "Cache third-party responses, coalesce/batch requests, circuit breakers with exponential backoff, negotiate dedicated quotas.",
      failureUnderScale: "The vendor degrades silently, your circuit breaker doesn't trip fast enough, and threads pile up waiting on a dependency you don't control — their outage becomes yours.",
      tradeoffs: [
        "Caching cuts calls but risks serving stale third-party data.",
        "Aggressive circuit breaking protects your system but may fail requests that would have eventually succeeded."
      ],
      metrics: ["Third-party call latency/error rate", "Rate-limit rejection count", "Circuit breaker trip rate", "Cache hit ratio for external calls"]
    },
    scale: {
      issues: [
        "Shared rate limits mean one team's spike starves every other consumer",
        "No caching means repeated calls for identical, unchanging data",
        "Vendor outages propagate directly into your system with no isolation",
        "No fallback/degraded-mode path when the third party is unavailable"
      ],
      bottlenecks: [
        { title: "Third-party rate limits", x10: "Add response caching for repeated/identical requests.", x100: "Add circuit breakers with exponential backoff and request coalescing.", x1000: "Negotiate dedicated/higher quotas with the vendor and build a fallback path that doesn't depend on them for core functionality." }
      ]
    }
  },
  {
    name: "WebSocket", bottleneck: "Concurrent connections per node", pattern: "Connection sharding, pub/sub fan-out", failure: "Reconnect storm (thundering herd)",
    deep: {
      capacity: "Bounded by concurrent open-connection limits per node (memory + file descriptors), not raw message throughput.",
      bottleneck: "Every connection holds server-side state and a file descriptor — capacity is about idle-but-open connections, not data volume.",
      scaling: "Shard connections across many nodes, a pub/sub backplane (Redis/Kafka) to fan messages across nodes, sticky routing to the node holding a client's session.",
      failureUnderScale: "A deploy or network blip drops every connection on a node at once, and all those clients reconnect within seconds — a reconnect storm that looks like a self-inflicted DDoS.",
      tradeoffs: [
        "Sticky sessions simplify state but complicate scale-in and rolling deploys.",
        "A pub/sub backplane decouples nodes but adds a dependency and message-delivery latency."
      ],
      metrics: ["Concurrent connections per node", "Reconnect rate", "Message delivery latency", "File descriptor usage"]
    },
    scale: {
      issues: [
        "Open connections consume memory/file descriptors even while idle",
        "Deploys and network blips cause mass reconnects instantly",
        "Broadcasting to many clients from a single node doesn't scale",
        "Pinning state to one node complicates failover and rolling deploys"
      ],
      bottlenecks: [
        { title: "Concurrent connections per node", x10: "Tune OS limits (file descriptors) and connection timeouts.", x100: "Shard connections across many nodes with sticky routing.", x1000: "Adopt a pub/sub backplane (Redis/Kafka) so any node can deliver to any client, decoupling connection count from message fan-out entirely." },
        { title: "Reconnect storms", x10: "Add jittered reconnect delays on the client.", x100: "Stagger deploys/restarts across nodes to avoid mass disconnects.", x1000: "Use connection draining with gradual client migration during deploys so reconnects never spike all at once." }
      ]
    }
  },
  {
    name: "Notification", bottleneck: "Fan-out volume (push/email/SMS)", pattern: "Async queue + batching, provider sharding", failure: "Notification storm / provider throttling",
    deep: {
      capacity: "Bounded by downstream provider throughput (APNs, FCM, SMTP, SMS gateways) — you can generate messages faster than any provider will accept them.",
      bottleneck: "Fan-out amplification — one triggering event can generate millions of individual sends nearly instantly.",
      scaling: "Async queue-based dispatch with batching, per-provider rate limiting/sharding, dedup before send, prioritize transactional over marketing.",
      failureUnderScale: "A bulk trigger fans out to millions of sends at once, providers throttle/reject, retries pile up, and even time-sensitive transactional alerts (like OTPs) get delayed.",
      tradeoffs: [
        "Batching improves provider efficiency but adds latency for individual notifications.",
        "Prioritizing transactional messages protects critical flows but needs dedicated infra to enforce."
      ],
      metrics: ["Send throughput per provider", "Delivery success/failure rate", "Queue backlog", "p99 delivery latency"]
    },
    scale: {
      issues: [
        "A single trigger event can fan out to millions of sends almost instantly",
        "Provider throttling during bulk sends delays everything behind it",
        "No dedup logic leads to duplicate notifications reaching users",
        "No priority separation delays critical transactional messages behind bulk marketing"
      ],
      bottlenecks: [
        { title: "Provider throughput", x10: "Add basic queuing and rate limiting per provider.", x100: "Batch sends and shard traffic across multiple provider accounts/keys.", x1000: "Build a dedicated dispatch layer with adaptive per-provider rate control, dedup, and priority lanes so bulk sends never delay transactional alerts." }
      ]
    }
  },
  {
    name: "Logs", bottleneck: "Ingestion volume, disk I/O", pattern: "Sampling, batching, tiered log storage", failure: "Backpressure drops log data",
    deep: {
      capacity: "Bounded by ingestion pipeline throughput and disk I/O on the storage/indexing tier.",
      bottleneck: "Verbose/unstructured logging under high traffic generates data faster than the pipeline can ingest, index, or ship.",
      scaling: "Sample routine events, batch/buffer before shipping, tier storage (hot searchable / cold archive), structured logging to cut parsing cost.",
      failureUnderScale: "During an incident — exactly when logs matter most — error volume spikes, the pipeline falls behind under backpressure and drops data, leaving you debugging blind.",
      tradeoffs: [
        "Sampling cuts cost and load but risks missing the exact line you need during an incident.",
        "Local buffering smooths spikes but risks loss if the host crashes before flushing."
      ],
      metrics: ["Ingestion rate vs pipeline throughput", "Drop/backpressure rate", "Indexing lag", "Disk utilization on log tier"]
    },
    scale: {
      issues: [
        "Verbose logging outpaces ingestion exactly during incidents",
        "Backpressure silently drops the data you need most to debug",
        "Unstructured logs are expensive to parse, index, and query",
        "Retention costs grow unbounded without a tiering strategy"
      ],
      bottlenecks: [
        { title: "Ingestion throughput", x10: "Add local buffering and basic sampling of noisy/routine logs.", x100: "Move to structured logging and batch shipping to reduce parsing/indexing cost.", x1000: "Adopt tiered storage (hot searchable index + cold cheap archive) with adaptive sampling that increases fidelity automatically during anomalies." }
      ]
    }
  },
  {
    name: "Metrics", bottleneck: "Cardinality & ingestion rate", pattern: "Aggregation, downsampling, sharded TSDB", failure: "Cardinality explosion crashes monitoring",
    deep: {
      capacity: "Bounded by time-series ingestion rate and, critically, cardinality (unique label combinations), not raw data volume.",
      bottleneck: "Adding a high-cardinality label (user ID, request ID) to a metric multiplies unique time series by orders of magnitude.",
      scaling: "Aggregation and downsampling, sharded/hierarchical TSDBs, strict label-cardinality budgets, push high-cardinality data to tracing/logs instead.",
      failureUnderScale: "A bad deploy adds a high-cardinality label to a hot-path metric, the TSDB's memory/index blows up, and the monitoring system itself falls over — right when everyone needs it most.",
      tradeoffs: [
        "Fine-grained labels improve debuggability but risk cardinality blowups.",
        "Downsampling keeps costs sane but loses granularity for retrospective analysis."
      ],
      metrics: ["Active time series count (cardinality)", "Ingestion rate", "Dashboard query latency", "TSDB memory utilization"]
    },
    scale: {
      issues: [
        "High-cardinality labels cause exponential time-series growth",
        "Dashboards get progressively slower as series count grows",
        "No governance lets any team accidentally blow up cardinality",
        "Long full-resolution retention is expensive at scale"
      ],
      bottlenecks: [
        { title: "Cardinality explosion", x10: "Add basic label-usage review before shipping new metrics.", x100: "Enforce cardinality budgets/limits per team with automated alerts on violations.", x1000: "Push high-cardinality data (user IDs, request IDs) to tracing/logs instead, keeping metrics low-cardinality and aggregate by design." }
      ]
    }
  },
  {
    name: "Kubernetes", bottleneck: "Control-plane API throughput / etcd", pattern: "Node pools, cluster federation", failure: "etcd overload → unresponsive control plane",
    deep: {
      capacity: "Bounded by the API server's request throughput and etcd's write throughput/disk latency — the data plane scales far beyond what the control plane can coordinate.",
      bottleneck: "etcd is a single Raft-consensus store handling every cluster state change; heavy watch/list traffic loads its write path directly.",
      scaling: "Node pools and cluster autoscaling for the data plane; for the control plane, multiple clusters (federation) instead of one giant cluster, reduced watch load, tuned etcd on fast dedicated disks.",
      failureUnderScale: "A single cluster grows too large (too many objects/watches), etcd latency creeps up, the API server starts timing out, and nothing can schedule, scale, or even be queried — one slow store freezes the whole platform.",
      tradeoffs: [
        "One large cluster is operationally simpler but has a much bigger blast radius than several smaller ones.",
        "Cluster federation improves isolation but multiplies operational complexity — cross-cluster networking and config sync."
      ],
      metrics: ["etcd write latency", "API server latency/error rate", "Object/watch count", "Node/pod scaling lag"]
    },
    scale: {
      issues: [
        "etcd write throughput caps overall cluster scale, not compute capacity",
        "One oversized cluster carries a huge blast radius for any incident",
        "Heavy watch traffic from controllers loads the API server directly",
        "Node/pod autoscaling lags behind sudden traffic spikes"
      ],
      bottlenecks: [
        { title: "etcd/control-plane throughput", x10: "Tune etcd on faster dedicated disks and reduce unnecessary watches.", x100: "Split workloads across multiple clusters instead of growing one indefinitely.", x1000: "Adopt full cluster federation with region/team-based boundaries, each with an independently scaled control plane." },
        { title: "Autoscaling lag", x10: "Set conservative HPA thresholds with headroom.", x100: "Use predictive/scheduled autoscaling ahead of known traffic patterns.", x1000: "Pre-provision warm node pools with placeholder pods so the cluster autoscaler can absorb spikes instantly." }
      ]
    }
  },
  {
    name: "Region", bottleneck: "Cross-region latency & capacity", pattern: "Multi-region active-active, geo-partitioning", failure: "Regional outage with no failover plan",
    deep: {
      capacity: "Bounded by the physical capacity of a single data center/region and its network connectivity to users in that geography.",
      bottleneck: "Cross-region latency for anything requiring strong consistency — the speed of light sets a hard floor you can't engineer around.",
      scaling: "Multi-region active-active deployments, geo-partitioned data by locality, async cross-region replication for non-critical consistency, GSLB failover routing.",
      failureUnderScale: "A region-wide outage with no tested failover plan takes down 100% of that region's users at once, and a rushed failover under pressure often causes a second, self-inflicted outage (thundering herd on the failover region).",
      tradeoffs: [
        "Active-active multi-region gives the best availability but forces you to confront eventual consistency and conflict resolution head-on.",
        "Active-passive is simpler to reason about but wastes standby capacity and has slower, riskier failover."
      ],
      metrics: ["Cross-region replication lag", "Regional error rate/latency", "Failover time (RTO)", "Data-loss window (RPO)"]
    },
    scale: {
      issues: [
        "Single-region deployments have zero geographic redundancy",
        "Cross-region strong consistency forces hard latency trade-offs",
        "Failover plans are often untested until a real outage happens",
        "Data residency/compliance constraints limit where data can legally live"
      ],
      bottlenecks: [
        { title: "Single point of regional failure", x10: "Stand up a passive DR region with periodic backups.", x100: "Move to active-passive with tested, automated failover instead of manual runbooks.", x1000: "Adopt active-active multi-region with geo-partitioned data and conflict resolution (CRDTs/last-write-wins) so one region's outage only affects its own slice of traffic." }
      ]
    }
  }
];
