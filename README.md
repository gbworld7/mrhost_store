# Store Mini App (React)

Общий стандартный маркет для любого продавца. Чёрный/белый/золото, Syne+DM Sans,
табы с синим подчёркиванием. Весь функционал мини-стора (паблик + админка),
без игровых элементов. Один React-проект, ляжет в Telegram Mini App и на сайт.

## Структура
- `src/theme/tokens.js` — стиль (цвета/шрифты).
- `src/api/client.js` — обёртка над gateway `/miniapi/store/*` (no-store только на мутациях).
- `src/components/ui.jsx` — примитивы (Tabs, Chip, Stars, Field, Toggle, Section…).
- `src/screens/public.jsx` — Catalog, Item (галерея/отзывы/бронь/файлы), Cart,
  Categories, Rating, Purchases, PartnerApply, Cabinet, PaySheet.
- `src/screens/admin.jsx` — Cards, CardEditor (медиа/AI/бронь/видимость), Categories,
  Orders, ReviewsAdmin (reply/hide), Partners, PrintDesigns, Analytics, Team.
- `src/App.jsx` — shell: читает `?agent_id=…&mode=…`, грузит данные из API
  (демо-фолбэк если API недоступен), роутит паблик/админ.

## Запуск
```bash
npm install
GATEWAY=http://127.0.0.1:8090 npm run dev      # dev на vite, /miniapi проксируется на gateway
npm run build                                  # сборка в dist/
```

## Деплой
- **Telegram Mini App:** собрать `dist/` и отдавать с того же origin, что и gateway
  (`MINIAPP_BASE_URL`, напр. https://mini.hff.app). Открывается как
  `/?app=store&agent_id=<id>&mode=<owner|customer>` — `agent_id` и `mode` читаются из URL.
- **Мост на сайт:** тот же `dist/` встроить во фрейм/маршрут на основном сайте,
  передав `agent_id` владельца — рендерится тот же стор.

## Подключение к бэкенду
Все вызовы идут в `/miniapi/store/*` (см. `src/api/client.js`). Эндпоинты совпадают
с текущим мини-стором: list, categories(+delete), save, delete, visibility, upload,
upload_file, ai_generate(+_image), reviews(+add), booking/order/create, purchases,
admin/orders(+compose-print-package), admin/reviews(+reply,+visibility),
admin/partners(+save,+delete), admin/print-designs(+save,delete,upload,bulk-upload).
