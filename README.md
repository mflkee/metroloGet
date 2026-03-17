# metrologet

Запуск в текущем состоянии:

```sh
./run-metrologet.sh
```

Что поднимется:

- backend: `http://127.0.0.1:8000`
- frontend: `http://127.0.0.1:3000`

По умолчанию приложение использует локальную SQLite-базу `metrologet.db`, если PostgreSQL из `DATABASE_URL` недоступен.
