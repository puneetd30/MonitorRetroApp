# MonitorRetroApp

This is a cron app runs nightly at 1am and builds knowledge from ping response to registered apps.

Every Registered app has app_retro collection to store info.

## Run local
In config.js, uncomment the localhost one for running locally
Use npm install to download all dependencies
Use npm start for local run

Please ensure mongodb is installed for local run

## For docker image

docker build -t monitor-retro-app .
