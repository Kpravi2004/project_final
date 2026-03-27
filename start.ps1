Write-Host "Installing backend dependencies..."
Set-Location "d:\project\backend"
npm install

Write-Host "Installing frontend dependencies..."
Set-Location "d:\project\frontend"
npm install

Write-Host "Initializing database..."
try {
    & psql -U postgres -d postgres -c "CREATE DATABASE realestate_tn;"
    & psql -U postgres -d realestate_tn -f "d:\project\backend\database\init.sql"
} catch {
    Write-Host "Could not initialize Postgres DB. (Make sure postgres is running and accessible)"
}

Write-Host "Starting API & React Servers in new windows..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd d:\project\backend; npm run dev`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd d:\project\frontend; npm run dev`""

Write-Host "Done! The backend runs on port 5000 and the frontend typically on 5173. Check the new windows."
