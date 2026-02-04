#!/bin/bash

# Loading & Error States Verification Script
# Run this to verify all files are in place

echo "======================================================================"
echo "Loading States & Error Boundaries - Verification Check"
echo "======================================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for passed checks
PASSED=0
TOTAL=0

# Function to check file existence
check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        echo -e "${YELLOW}   Missing: $1${NC}"
        return 1
    fi
}

# Function to check directory
check_dir() {
    TOTAL=$((TOTAL + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $2${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        echo -e "${YELLOW}   Missing: $1${NC}"
        return 1
    fi
}

echo "📁 Checking Loading Skeleton Files..."
echo "----------------------------------------------------------------------"
check_file "src/app/dashboard/loading.tsx" "Dashboard loading.tsx"
check_file "src/app/requests/loading.tsx" "Requests loading.tsx"
check_file "src/app/requests/[id]/loading.tsx" "Request Detail loading.tsx"
check_file "src/app/users/loading.tsx" "Users loading.tsx"
echo ""

echo "🛡️  Checking Error Boundary Files..."
echo "----------------------------------------------------------------------"
check_file "src/app/dashboard/error.tsx" "Dashboard error.tsx"
check_file "src/app/requests/error.tsx" "Requests error.tsx"
check_file "src/app/requests/[id]/error.tsx" "Request Detail error.tsx"
check_file "src/app/users/error.tsx" "Users error.tsx"
echo ""

echo "🧪 Checking Testing Utilities..."
echo "----------------------------------------------------------------------"
check_file "src/lib/testingUtils.ts" "Testing utilities"
echo ""

echo "📚 Checking Documentation Files..."
echo "----------------------------------------------------------------------"
check_file "docs/LOADING_ERROR_TESTING.md" "Testing guide"
check_file "docs/LOADING_ERROR_QUICK_REFERENCE.md" "Quick reference"
check_file "docs/LOADING_ERROR_SUBMISSION.md" "Submission guide"
check_file "LOADING_ERROR_IMPLEMENTATION.md" "Implementation summary"
check_dir "docs/screenshots/loading-error" "Screenshots directory"
check_file "docs/screenshots/loading-error/README.md" "Screenshots README"
echo ""

echo "📝 Checking README Updates..."
echo "----------------------------------------------------------------------"
if grep -q "Loading States & Error Boundaries" README.md 2>/dev/null; then
    echo -e "${GREEN}✅ README contains Loading States section${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ README missing Loading States section${NC}"
fi
TOTAL=$((TOTAL + 1))
echo ""

# Check for animate-pulse in loading files
echo "🎨 Checking Design Patterns..."
echo "----------------------------------------------------------------------"
PULSE_COUNT=$(grep -r "animate-pulse" src/app/*/loading.tsx src/app/*/*/loading.tsx 2>/dev/null | wc -l)
if [ "$PULSE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found animate-pulse in $PULSE_COUNT loading files${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ No animate-pulse found in loading files${NC}"
fi
TOTAL=$((TOTAL + 1))

# Check for reset function in error files
RESET_COUNT=$(grep -r "onClick={reset}" src/app/*/error.tsx src/app/*/*/error.tsx 2>/dev/null | wc -l)
if [ "$RESET_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found reset() in $RESET_COUNT error files${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ No reset() function found in error files${NC}"
fi
TOTAL=$((TOTAL + 1))

# Check for 'use client' in error files
CLIENT_COUNT=$(grep -r "'use client'" src/app/*/error.tsx src/app/*/*/error.tsx 2>/dev/null | wc -l)
if [ "$CLIENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found 'use client' in $CLIENT_COUNT error files${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ Missing 'use client' directive in error files${NC}"
fi
TOTAL=$((TOTAL + 1))
echo ""

# Summary
echo "======================================================================"
echo "Summary"
echo "======================================================================"
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 Perfect! All checks passed ($PASSED/$TOTAL - 100%)${NC}"
    echo ""
    echo -e "${BLUE}✅ Ready for testing and submission!${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Good progress: $PASSED/$TOTAL checks passed ($PERCENTAGE%)${NC}"
    echo ""
    echo "Some files may be missing. Review the output above."
else
    echo -e "${RED}❌ Implementation incomplete: $PASSED/$TOTAL checks passed ($PERCENTAGE%)${NC}"
    echo ""
    echo "Please review the missing files above."
fi

echo ""
echo "======================================================================"
echo "Next Steps"
echo "======================================================================"
echo ""

if [ $PASSED -eq $TOTAL ]; then
    echo "1. ✅ All files verified - implementation complete!"
    echo "2. 🧪 Test the implementation:"
    echo "   npm run dev"
    echo "   Open DevTools → Network → 'Slow 3G'"
    echo "   Navigate to routes to see loading states"
    echo ""
    echo "3. 📸 Capture screenshots:"
    echo "   - Loading states (dashboard, requests, users)"
    echo "   - Error states (use offline mode)"
    echo "   - Retry sequence (GIF or screenshots)"
    echo ""
    echo "4. 📝 Review documentation:"
    echo "   - README.md (Loading States section)"
    echo "   - docs/LOADING_ERROR_SUBMISSION.md"
    echo ""
    echo "5. 🚀 Submit your work!"
else
    echo "1. Review the failed checks above"
    echo "2. Create any missing files"
    echo "3. Run this script again to verify"
fi

echo ""
echo "======================================================================"
echo "Documentation References"
echo "======================================================================"
echo ""
echo "📖 Full guides available:"
echo "  - Testing: docs/LOADING_ERROR_TESTING.md"
echo "  - Quick Reference: docs/LOADING_ERROR_QUICK_REFERENCE.md"
echo "  - Submission: docs/LOADING_ERROR_SUBMISSION.md"
echo "  - Summary: LOADING_ERROR_IMPLEMENTATION.md"
echo ""
echo "======================================================================"

exit 0
