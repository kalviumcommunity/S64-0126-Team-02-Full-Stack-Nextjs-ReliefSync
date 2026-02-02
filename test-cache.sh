#!/bin/bash

# Redis Caching Test Suite
# Run these commands to verify caching implementation

echo "🧪 Redis Caching Test Suite"
echo "================================"
echo ""

# Check if Redis is running
echo "📍 Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Start it with: redis-server"
    exit 1
fi

echo ""
echo "🧹 Clearing cache before tests..."
redis-cli FLUSHDB > /dev/null
echo "✅ Cache cleared"

echo ""
echo "================================"
echo "TEST 1: Cold Start (Cache Miss)"
echo "================================"
echo "Making first request to /api/users..."
echo ""

RESPONSE1=$(curl -s -w "\nTime: %{time_total}s" http://localhost:3000/api/users?page=1\&limit=10)
echo "Response (first 200 chars):"
echo "$RESPONSE1" | head -c 200
echo "..."
echo ""

echo ""
echo "================================"
echo "TEST 2: Warm Cache (Cache Hit)"
echo "================================"
echo "Making same request again (should be much faster)..."
echo ""

RESPONSE2=$(curl -s -w "\nTime: %{time_total}s" http://localhost:3000/api/users?page=1\&limit=10)
echo "Response (first 200 chars):"
echo "$RESPONSE2" | head -c 200
echo "..."
echo ""

echo ""
echo "================================"
echo "TEST 3: Cache Inspection"
echo "================================"
echo "Checking cached keys in Redis..."
echo ""
redis-cli KEYS "users:*" | head -10

echo ""
echo "================================"
echo "All tests completed! ✅"
echo "================================"
echo ""
echo "📊 Observations:"
echo "- First request should show: ⚠️ Cache Miss"
echo "- Second request should show: ✅ Cache Hit"
echo "- Time comparison shows performance improvement"
echo ""
echo "💡 Pro Tips:"
echo "1. Check logs: tail -f [app logs] | grep Cache"
echo "2. Monitor Redis: redis-cli monitor"
echo "3. View all caches: redis-cli KEYS *"
echo "4. Clear cache: redis-cli FLUSHDB"
