---
description: Push changes and rebuild Docker containers
---

1. Stage all changes
// turbo
```bash
git add .
```
2. Commit with a descriptive message
// turbo
```bash
git commit -m "Update theme colors and hero component"
```
3. Push to remote repository
// turbo
```bash
git push origin main
```
4. Rebuild Docker containers cleanly
// turbo-all
```bash
docker compose down -v

docker compose up -d --build
```
