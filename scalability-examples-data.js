// Worked examples for the "Full breakdown" (deep dive) and "Bottlenecks at scale"
// sections on component.html. Keyed by slug (same as scalability-interview-data.js).
// `deep` = one example illustrating the whole Capacity->Failure chain for that component.
// `bottlenecks[]` = parallel array matching the order of scale.bottlenecks in scalability-data.js.
const EXAMPLES = {
  "client": {
    deep: "A news app polls /feed every 15s per active user. At 5M concurrent users that's ~333K RPS of pure polling before a single human action happens — switching to a 60s poll plus push-based invalidation cuts steady-state load by roughly 75%.",
    bottlenecks: [
      "A 30-second backend blip causes 2M clients to retry within the same 1-second window (no jitter) — the resulting spike is 10x normal traffic and takes down a service that would otherwise have recovered on its own.",
      "Five different screens in the same app each independently fetch the same /config endpoint on load, so one app launch generates 5 backend calls for identical data that doesn't change for hours."
    ]
  },
  "dns": {
    deep: "A checkout API's DNS record has a 24h TTL. When the API is migrated to a new IP during an incident, roughly 40% of resolvers are still serving the old IP a full day later, so a chunk of users simply can't check out.",
    bottlenecks: [
      "Dropping TTL from 3600s to 30s to enable faster failover increases authoritative query volume roughly 120x — from ~50K queries/day to ~6M queries/day.",
      "A 300-second TTL means even a perfectly executed failover can take up to 5 minutes to reach every client, during which some fraction of users are still hitting the dead endpoint."
    ]
  },
  "cdn": {
    deep: "A product-launch image is fetched 2M times in the first minute. Without an origin shield, each of 150 edge PoPs independently misses at least once, sending ~150 near-simultaneous requests to origin for the exact same file.",
    bottlenecks: [
      "Setting Cache-Control: no-cache on a frequently-requested static asset by mistake turns every single edge hit into an origin request — origin traffic for that one asset jumps roughly 100x overnight.",
      "A cache purge during a flash sale forces all 150 PoPs to miss on the hero banner image at the same moment, producing an origin spike that looks identical to a DDoS."
    ]
  },
  "lb": {
    deep: "A single LB node handling 40K concurrent TLS connections hits its connection-table ceiling; the 40,001st connection gets dropped even though every backend behind it is still healthy and idle.",
    bottlenecks: [
      "One LB node capped at ~50K concurrent connections gets pinned at 100% during a spike to 80K concurrent users — half of new connection attempts are refused even though backend capacity is fine.",
      "A single LB node terminating 10K new TLS handshakes/sec spends roughly 70% of its CPU on the cryptographic handshake alone, leaving little headroom for actual request routing."
    ]
  },
  "api-gateway": {
    deep: "A gateway with no cached auth calls an identity service on every request. At 50K RPS that's 50K auth calls/sec — when the identity service's own latency creeps from 5ms to 200ms, the gateway's total throughput drops by more than half.",
    bottlenecks: [
      "50K RPS x 1 auth call each means the identity provider alone needs to sustain 50K RPS just to keep the gateway from queuing — local JWT validation removes that dependency entirely.",
      "Ten gateway instances each enforcing 'max 100 req/min per user' independently actually allows 1,000 req/min per user in aggregate — a 10x leak versus the intended limit."
    ]
  },
  "service": {
    deep: "A payment service configured with a 200-thread pool calls a fraud-check dependency that slows from 20ms to 2s. Within seconds all 200 threads are blocked waiting on fraud-check, and the payment service — otherwise perfectly healthy — stops accepting any new requests at all.",
    bottlenecks: [
      "A service with a 200-thread pool and a downstream call that slows from 20ms to 2s only needs ~2,000 concurrent requests to fully exhaust the pool — at which point every request, even ones unrelated to the slow dependency, starts queuing.",
      "A JVM service takes 45 seconds to become ready after a scale-out event; if traffic doubles in under 30 seconds, the new replicas arrive too late to help with the actual spike."
    ]
  },
  "cache": {
    deep: "A product cache with a flat 60-minute TTL on all keys re-populates thousands of keys simultaneously every hour on the hour, producing a visible, recurring database CPU spike like clockwork.",
    bottlenecks: [
      "One trending product page is viewed 800K times/minute; consistent hashing sends every one of those reads to the same cache shard, which maxes out while every other shard in the cluster sits under 5% utilized.",
      "A homepage cache key expires at exactly 12:00:00 during a marketing push; 40,000 requests miss in the same 100ms window and all hit the database simultaneously trying to repopulate it."
    ]
  },
  "db-reads": {
    deep: "An e-commerce site adds 3 read replicas to handle Black Friday read traffic but doesn't account for replication lag — users who just placed an order briefly see 'order not found' because their read hits a replica that hasn't caught up yet.",
    bottlenecks: [
      "A single unindexed reporting query run against a read replica pins that replica's CPU at 100% for 40 seconds, causing every other read on that replica to slow down or time out during the window.",
      "Under a 5x write spike, replication lag grows from 50ms to 8 seconds; a user who updates their profile and immediately reloads the page sees their old data because the read hit a lagging replica."
    ]
  },
  "db-writes": {
    deep: "A social app's 'like' counter on a viral post gets hammered by 50K increment writes/sec, all against the same row — the database spends most of its time on lock contention instead of actual work, and unrelated writes to other rows start queuing too.",
    bottlenecks: [
      "A single primary sustains 20K writes/sec; a viral feature that needs 200K writes/sec simply cannot be served no matter how the single primary is tuned — only sharding actually fixes this.",
      "A 'total views' counter on a viral video, updated by 50K concurrent writers, turns into a lock-contention pileup — sharding the counter into 100 sub-counters merged on read removes the bottleneck entirely."
    ]
  },
  "db-storage": {
    deep: "An events table growing 80GB/month with no archiving plan quietly fills a 3TB volume in about 3 years — but query latency on that table starts degrading in year one as indexes bloat past what fits comfortably in memory.",
    bottlenecks: [
      "A logging table growing unmonitored at 50GB/month fills a 2TB volume in just over 3 years — but nobody notices until an automated alert fires at 90% capacity, with only weeks of runway left.",
      "An SSD-backed volume at 95% capacity shows roughly 3x higher write latency than the same volume at 60% capacity, purely from garbage-collection overhead — the disk isn't full, but it might as well be."
    ]
  },
  "db-connections": {
    deep: "An autoscaling event during a sale takes a fleet from 50 to 200 instances in 2 minutes; each instance's connection pool opens 50 connections on startup, adding 7,500 new DB connections almost instantly and tripping max_connections for the whole fleet — old and new instances alike get rejected.",
    bottlenecks: [
      "A database configured for max_connections=2000 gets hit by 40 service replicas x 60 connections each = 2,400 total — 400 over the limit, and the errors show up as random, hard-to-reproduce connection failures."
    ]
  },
  "kafka": {
    deep: "An order-events topic with 8 partitions gets a badly chosen composite partition key that accidentally routes one giant retailer's orders to a single partition — that one partition processes 85% of all volume while the other 7 sit nearly idle.",
    bottlenecks: [
      "A topic partitioned by celebrity_user_id sends one celebrity's 2M followers' activity to a single partition, which then caps the entire topic's throughput at whatever that one partition/broker can sustain.",
      "A broker handling 3 high-throughput topics on the same disk hits its I/O ceiling; separating the loudest topic onto its own dedicated broker pool restores throughput for the other two immediately."
    ]
  },
  "consumers": {
    deep: "A payments-processing consumer group with 4 partitions and a slow downstream call (300ms per event) can sustain at most ~13 events/sec per partition; when order volume spikes to 100 events/sec, consumer lag grows by roughly 87 events every second, compounding fast.",
    bottlenecks: [
      "A topic with 6 partitions and 30 consumer instances only ever has 6 active consumers — the other 24 are provisioned, billed, and completely idle.",
      "A rolling deploy that restarts 20 consumers one at a time triggers 20 separate rebalances in quick succession; the group spends more wall-clock time rebalancing than actually consuming during the deploy window."
    ]
  },
  "object-storage": {
    deep: "A data pipeline writes hourly export files named export-2024-01-15-00.csv, -01.csv, etc. All of January's exports land in the same narrow key range and start getting 503 SlowDown responses well before the bucket is anywhere near its total storage limit.",
    bottlenecks: [
      "A logging pipeline writing sequential timestamp-prefixed keys at 5,000 writes/sec starts seeing throttling errors at a fraction of that rate; randomizing the prefix hash lets the same workload run without a single throttle."
    ]
  },
  "search": {
    deep: "A 10-shard product index has one shard holding 35% of all documents because it's routed by a low-cardinality category field; every query touching electronics (the biggest category) runs 3x slower than a query touching a smaller category, even on an otherwise idle cluster.",
    bottlenecks: [
      "One oversized shard out of 20 takes 400ms to respond while the other 19 average 60ms; because search fans out and waits for the slowest shard, every query's p99 is dictated entirely by that one shard.",
      "A query that must fan out to all 50 shards to check for any match costs roughly 50x more cluster resources than a query that can be routed to the 2 relevant shards via a routing key."
    ]
  },
  "workers": {
    deep: "A CSV export worker pool sized for 200 jobs/hour suddenly receives 40,000 export requests after a marketing email goes out. At the pool's steady processing rate, the last job in that queue wouldn't complete for over 8 days without emergency scaling.",
    bottlenecks: [
      "A queue processing 500 jobs/sec steadily receives a burst of 50,000 jobs; if autoscaling takes 90 seconds to react, roughly 45,000 jobs have already piled up before extra capacity arrives.",
      "10,000 low-priority bulk-export jobs queued ahead of a handful of time-sensitive password-reset emails means those emails wait behind hours of bulk work with no priority lane to skip it."
    ]
  },
  "external-api": {
    deep: "A checkout flow calls a tax-calculation API rate-limited to 2K RPS. During a flash sale generating 20K checkout RPS, 90% of tax calls get rejected — and without a fallback, 90% of checkouts fail even though every part of your own system is healthy.",
    bottlenecks: [
      "Three internal teams each independently integrate with the same mapping API, unknowingly sharing one 10K RPS quota; one team's batch job alone can consume the entire quota and starve the other two without anyone realizing why."
    ]
  },
  "websocket": {
    deep: "A trading app with 3M concurrent WebSocket connections spread across 30 nodes (100K each) loses 5 nodes to a bad deploy; the 500K displaced clients all reconnect within the same 10-second window, and the reconnect spike briefly exceeds the platform's normal peak connection rate.",
    bottlenecks: [
      "A node configured with the OS default of 65,536 file descriptors can hold at most ~65K WebSocket connections regardless of available memory — hitting that ceiling looks like random connection failures until someone checks ulimit -n.",
      "A single node restart during a rolling deploy drops 100K connections at once; without jittered client-side reconnect logic, all 100K clients retry within the same 2-second window and the spike looks like an attack."
    ]
  },
  "notification": {
    deep: "A 'flash sale starts now' push notification triggers for 5M subscribed users simultaneously. At the push provider's real-world throttle of ~50K/sec, delivering to all 5M takes over 100 seconds — and if a password-reset email queues behind that same worker pool, it gets delayed too.",
    bottlenecks: [
      "A push provider rate-limits at 50K notifications/sec; a marketing campaign targeting 5M users takes at least 100 seconds to fully deliver no matter how many workers you add on your own side."
    ]
  },
  "logs": {
    deep: "During a 10-minute incident, error log volume jumps from a steady 2MB/sec to 45MB/sec as every retry and failure gets logged verbosely. The pipeline, sized for the steady-state rate, starts dropping lines under backpressure — precisely the ten minutes when the team needs those logs most.",
    bottlenecks: [
      "A pipeline provisioned for a steady 100K log lines/sec starts dropping lines the moment an incident pushes volume to 500K lines/sec — the exact moment full log fidelity matters most."
    ]
  },
  "metrics": {
    deep: "An engineer adds a request_id label to a hot-path latency histogram to help debug one issue. Within a day, that single metric has generated over 10 million unique time series, and the monitoring backend starts rejecting writes for every team, not just the one that made the change.",
    bottlenecks: [
      "Adding a user_id label to one counter with 20M active users turns 1 time series into 20M overnight — most metrics backends exhaust memory or hit their series-count quota well before ingestion even finishes for that one bad deploy."
    ]
  },
  "kubernetes": {
    deep: "A single cluster grows to 5,000 nodes and 200,000 pods over two years of organic growth. etcd write latency creeps from 5ms to 300ms as object/watch count grows, and one bad controller flooding the API server with watches is now enough to make kubectl commands across the entire company time out.",
    bottlenecks: [
      "A cluster with 150,000 objects and heavy controller watch traffic sees etcd write latency climb past 200ms; every operation depending on the control plane — scheduling, scaling, even reading pod status — slows down in lockstep.",
      "A traffic spike triples RPS in 20 seconds, but new pods take 90 seconds to become ready; by the time HPA-provisioned capacity is actually serving traffic, the spike has already caused a wave of 5xx errors."
    ]
  },
  "region": {
    deep: "Region A serves 100K RPS with no tested automated failover. When it goes down during a holiday sale, the on-call team manually reroutes DNS over 25 minutes — but Region B, provisioned for its own 50K RPS, immediately buckles under the full 100K RPS redirected to it, turning a single-region outage into a two-region outage.",
    bottlenecks: [
      "A company runs 100% of production traffic out of one region with backups but no tested failover runbook. When that region has a multi-hour outage, recovery time is measured in hours, not minutes, because the failover process is being improvised live for the first time during the incident."
    ]
  }
};
