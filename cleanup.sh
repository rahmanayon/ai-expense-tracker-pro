#!/bin/bash

# Fix Database path
if [ -d "-- database" ]; then
    mkdir -p database/optimizations
    mv "-- database/optimizations/final-performance-schema.sql" database/optimizations/
    rm -rf "-- database"
    echo "Moved database optimizations"
fi

# Fix Mobile path
mkdir -p mobile
if [ -d "app" ]; then
    mv app mobile/
    echo "Moved app to mobile/"
fi

# Fix Backend Src path
mkdir -p backend/src
if [ -d "src" ]; then
    cp -r src/* backend/src/
    rm -rf src
    echo "Merged src into backend/src/"
fi

# Fix Backend Middleware/Routes/Utils (if they are at backend/ directly)
if [ -d "backend/middleware" ]; then
    mkdir -p backend/src/middleware
    cp -r backend/middleware/* backend/src/middleware/
    rm -rf backend/middleware
    echo "Moved backend/middleware to backend/src/middleware"
fi

if [ -d "backend/routes" ]; then
    mkdir -p backend/src/routes
    cp -r backend/routes/* backend/src/routes/
    rm -rf backend/routes
    echo "Moved backend/routes to backend/src/routes"
fi

if [ -d "backend/utils" ]; then
    mkdir -p backend/src/utils
    cp -r backend/utils/* backend/src/utils/
    rm -rf backend/utils
    echo "Moved backend/utils to backend/src/utils"
fi

# Fix Frontend Components
mkdir -p frontend
if [ -d "components" ]; then
    mkdir -p frontend/components
    cp -r components/* frontend/components/
    rm -rf components
    echo "Moved components to frontend/components"
fi

# Fix Frontend Tests
if [ -d "__tests__" ]; then
    mkdir -p frontend/__tests__
    cp -r __tests__/* frontend/__tests__/
    rm -rf __tests__
    echo "Moved __tests__ to frontend/__tests__"
fi

# Fix UI Mockups
mkdir -p ui_mockups
mv *.html ui_mockups/ 2>/dev/null
echo "Moved HTML files to ui_mockups/"

# Fix specific file (ExportDialog/History were already in frontend/components per output, checking...)
# Output said: Wrote frontend/components/Export/ExportDialog.tsx. So those are likely fine.

echo "Cleanup complete."
