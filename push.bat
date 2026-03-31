@echo off
git config user.email "pparsoya@gmail.com"
git config user.name "pprasoya-source"
git add .
git commit -m "Initial commit with Supabase integration and responsive UI"
git branch -M main
git remote add origin https://github.com/sawanpar27/Demo-Easy-Trade.git
git push origin main
