# Backend — thiết kế cơ sở dữ liệu (MongoDB / Mongoose)

Thư mục này chỉ chứa **schema**, **seed** và **`withDefaultDb`**. API HTTP nằm ở `server/`.

## Cấu trúc

| Đường dẫn   | Mô tả |
| ----------- | ----- |
| `models/`   | Collection Mongoose (kèm `user_board_stars`, `user_board_recents` cho sao / đã xem) |
| `db.js`     | `withDefaultDb(uri)` — mặc định DB `trello_boards` |
| `seed.js`   | Dữ liệu mẫu; export `seedIfEmpty` cho `server`; chạy tay: `npm run db:seed` |

## MongoDB Compass

URI trong `.env` (`MONGODB_URI`), ví dụ `mongodb://localhost:27017/trello_boards`. Chi tiết quan hệ: `docs/schema.dbml`.

## API

```bash
npm run server
```

(`server/index.js`, cổng mặc định 3000.)
