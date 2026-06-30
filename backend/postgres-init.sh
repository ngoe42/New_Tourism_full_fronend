#!/bin/bash
# PostgreSQL production tuning — applied at container start via
# docker-compose.yml `command` override.
#
# PostgreSQL tuning rationale for 3 api containers × 8 workers each:
#   Total pool connections:  24 workers × (5 pool + 3 overflow) = 192
#   Reserved for admin/etc:  8
#   max_connections:         200
#   shared_buffers:          2GB  (25% of 8GB host RAM for DB)
#   effective_cache_size:    6GB  (75% of 8GB)
#   work_mem:                32MB × 200 connections = 6.4GB peak — safe for 8GB host
#   maintenance_work_mem:    256MB (for VACUUM, CREATE INDEX)
set -e
echo "shared_buffers = '2GB'" >> /var/lib/postgresql/data/postgresql.conf
echo "effective_cache_size = '6GB'" >> /var/lib/postgresql/data/postgresql.conf
echo "work_mem = '32MB'" >> /var/lib/postgresql/data/postgresql.conf
echo "maintenance_work_mem = '256MB'" >> /var/lib/postgresql/data/postgresql.conf
echo "random_page_cost = 1.1" >> /var/lib/postgresql/data/postgresql.conf  # SSD
echo "effective_io_concurrency = 200" >> /var/lib/postgresql/data/postgresql.conf  # SSD
echo "wal_buffers = '16MB'" >> /var/lib/postgresql/data/postgresql.conf
echo "max_worker_processes = 8" >> /var/lib/postgresql/data/postgresql.conf
echo "max_parallel_workers_per_gather = 4" >> /var/lib/postgresql/data/postgresql.conf
echo "max_parallel_workers = 8" >> /var/lib/postgresql/data/postgresql.conf
echo "max_parallel_maintenance_workers = 4" >> /var/lib/postgresql/data/postgresql.conf
echo "statement_timeout = '30s'" >> /var/lib/postgresql/data/postgresql.conf
echo "idle_in_transaction_session_timeout = '30s'" >> /var/lib/postgresql/data/postgresql.conf
