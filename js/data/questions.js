/*
 * FACE VALUE — база вопросов (сгенерирована из проверенных данных).
 *
 * Первые 100 товаров — официальные цены в США (USD) на сайтах производителей или их
 * официальных магазинов, проверены 11.10.2026. Товары со скидкой в базу не попадали.
 *
 * Поля вопроса:
 *   id, category, brand, model, title, subtitle — что за товар
 *   price, currency, region                   — цена, валюта (USD), регион (US)
 *   note                                      — пояснение к цене (показывается после ответа)
 *   source { label, url }, checkedAt          — откуда цена и когда проверена
 *   status                                    — "verified" или "test"
 *   rarity                                    — COMMON | RARE | EPIC | LEGENDARY (задаётся вручную;
 *                                               шансы выпадения — в js/rarity-config.js)
 *   image { remote, pageUrl, credit }         — официальное фото товара (ссылка)
 *     Локальные копии фото скачиваются командой `node tools/download-images.mjs`
 *     в папку assets/products/ и подключаются автоматически через manifest.js.
 *
 * Новые объекты (добавлены 16.10.2026: машины, транспорт, недвижимость, часы и драгоценности,
 * искусство, коллекционные предметы, профессиональная техника) имеют дополнительные поля:
 *   priceType   — что это за цена: new_msrp (новый, цена производителя), used_market (рыночная цена),
 *                 auction (аукцион, с комиссией если указано), private_sale (частная сделка),
 *                 unit_cost (цена единицы), construction_cost (стоимость постройки) и т.п.
 *   priceDate   — когда была эта цена/сделка (цена номинальная, без пересчёта на инфляцию)
 *   rarityReason — почему выбрана такая редкость
 *   image.match — "exact" (тот самый объект) или "same-model" (та же модель, другой экземпляр);
 *   image.license — "free" | "unknown" (лицензия не проверена) | "non-free"
 *   status "needs-image" — цена проверена, но подходящего фото ещё нет: в игре НЕ участвует
 *                 (клиент и сервер берут только status "verified"). image у таких объектов = null.
 *   nameRu, aliases — другие названия (для проверки дублей)
 *   region "WORLD" — цена не привязана к рынку США (аукцион, сделка, постройка).
 *
 * PENDING — товары с проверенной ценой, для которых не нашлось подходящего фото.
 * В игре они НЕ участвуют, пока не будет добавлено фото.
 */
(function (root) {
  var CATEGORIES = {
    "tech": "Смартфоны и электроника",
    "fashion": "Одежда и обувь",
    "accessories": "Брендовые аксессуары",
    "beauty": "Косметика и уход",
    "gaming": "Игровые устройства",
    "home": "Бытовая техника",
    "food": "Еда и напитки",
    "everyday": "Популярные товары",
    "cars": "Автомобили",
    "transport": "Мотоциклы, самолёты и яхты",
    "realestate": "Недвижимость и архитектура",
    "jewelry": "Часы и драгоценности",
    "art": "Искусство",
    "collectibles": "Коллекционные предметы",
    "protech": "Профессиональная техника"
  };

  var REGIONS = { US: "США", WORLD: "Мир" };

  var QUESTIONS = [
    {
      "id": "iphone-18-pro",
      "category": "tech",
      "brand": "Apple",
      "model": "iPhone 18 Pro",
      "title": "Apple iPhone 18 Pro",
      "subtitle": "256 ГБ, без привязки к оператору",
      "price": 1199,
      "currency": "USD",
      "region": "US",
      "note": "Цена версии без привязки к оператору",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-iphone/iphone-18-pro"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-18-pro-model-unselect-gallery-1-202609?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1786041739689",
        "pageUrl": "https://www.apple.com/shop/buy-iphone/iphone-18-pro",
        "credit": "© Apple"
      }
    },
    {
      "id": "iphone-air",
      "category": "tech",
      "brand": "Apple",
      "model": "iPhone Air",
      "title": "Apple iPhone Air",
      "subtitle": "256 ГБ, без привязки к оператору",
      "price": 1099,
      "currency": "USD",
      "region": "US",
      "note": "Цена версии без привязки к оператору",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-iphone/iphone-air"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-air-finish-unselect-gallery-1-202509?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1757665392198",
        "pageUrl": "https://www.apple.com/shop/buy-iphone/iphone-air",
        "credit": "© Apple"
      }
    },
    {
      "id": "iphone-17e",
      "category": "tech",
      "brand": "Apple",
      "model": "iPhone 17e",
      "title": "Apple iPhone 17e",
      "subtitle": "256 ГБ, без привязки к оператору",
      "price": 699,
      "currency": "USD",
      "region": "US",
      "note": "Самый доступный iPhone в линейке Apple на дату проверки",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-iphone/iphone-17e"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17e-finish-unselect-gallery-1-202603_GEO_US?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1770766619353",
        "pageUrl": "https://www.apple.com/shop/buy-iphone/iphone-17e",
        "credit": "© Apple"
      }
    },
    {
      "id": "iphone-duo",
      "category": "tech",
      "brand": "Apple",
      "model": "iPhone Duo",
      "title": "Apple iPhone Duo",
      "subtitle": "Складной iPhone, 256 ГБ",
      "price": 1999,
      "currency": "USD",
      "region": "US",
      "note": "Цена объявлена Apple до старта продаж (предзаказ с 16.10.2026)",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-iphone/iphone-duo"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-duo-finish-unselect-gallery-2-202609?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1788026660137",
        "pageUrl": "https://www.apple.com/shop/buy-iphone/iphone-duo",
        "credit": "© Apple"
      }
    },
    {
      "id": "airpods-pro-3",
      "category": "tech",
      "brand": "Apple",
      "model": "AirPods Pro 3",
      "title": "Apple AirPods Pro 3",
      "subtitle": "Наушники с шумоподавлением",
      "price": 249,
      "currency": "USD",
      "region": "US",
      "note": "",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-airpods/airpods-pro-3"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-pro-3-hero-select-202509?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1758077264484",
        "pageUrl": "https://www.apple.com/shop/buy-airpods/airpods-pro-3",
        "credit": "© Apple"
      }
    },
    {
      "id": "airpods-4",
      "category": "tech",
      "brand": "Apple",
      "model": "AirPods 4",
      "title": "Apple AirPods 4",
      "subtitle": "Базовая версия без шумоподавления",
      "price": 129,
      "currency": "USD",
      "region": "US",
      "note": "Версия с шумоподавлением стоит $179",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-airpods/airpods-4"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/og-airpods-4-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1724144134014",
        "pageUrl": "https://www.apple.com/shop/buy-airpods/airpods-4",
        "credit": "© Apple"
      }
    },
    {
      "id": "airtag",
      "category": "everyday",
      "brand": "Apple",
      "model": "AirTag",
      "title": "Apple AirTag",
      "subtitle": "1 штука",
      "price": 29,
      "currency": "USD",
      "region": "US",
      "note": "Набор из 4 штук стоит $99",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-airtag/airtag"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airtag-og-202601?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1767659928805",
        "pageUrl": "https://www.apple.com/shop/buy-airtag/airtag",
        "credit": "© Apple"
      }
    },
    {
      "id": "apple-watch-s12",
      "category": "tech",
      "brand": "Apple",
      "model": "Apple Watch Series 12",
      "title": "Apple Watch Series 12",
      "subtitle": "Корпус 42 мм, базовая версия",
      "price": 399,
      "currency": "USD",
      "region": "US",
      "note": "",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-watch/apple-watch"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/s12-case-unselect-gallery-1-202609?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1788867936144",
        "pageUrl": "https://www.apple.com/shop/buy-watch/apple-watch",
        "credit": "© Apple"
      }
    },
    {
      "id": "apple-watch-ultra-4",
      "category": "accessories",
      "brand": "Apple",
      "model": "Apple Watch Ultra 4",
      "title": "Apple Watch Ultra 4",
      "subtitle": "Базовая версия",
      "price": 799,
      "currency": "USD",
      "region": "US",
      "note": "",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-watch/apple-watch-ultra"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ultra-case-unselect-gallery-1-202609?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1787876542337",
        "pageUrl": "https://www.apple.com/shop/buy-watch/apple-watch-ultra",
        "credit": "© Apple"
      }
    },
    {
      "id": "apple-pencil-pro",
      "category": "tech",
      "brand": "Apple",
      "model": "Apple Pencil Pro",
      "title": "Apple Pencil Pro",
      "subtitle": "Стилус для iPad",
      "price": 129,
      "currency": "USD",
      "region": "US",
      "note": "",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/product/MX2D3AM/A/apple-pencil-pro"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MX2D3?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1713841707336",
        "pageUrl": "https://www.apple.com/shop/product/MX2D3AM/A/apple-pencil-pro",
        "credit": "© Apple"
      }
    },
    {
      "id": "ipad-a16",
      "category": "tech",
      "brand": "Apple",
      "model": "iPad (A16)",
      "title": "Apple iPad (A16)",
      "subtitle": "11 дюймов, 128 ГБ, Wi‑Fi",
      "price": 449,
      "currency": "USD",
      "region": "US",
      "note": "",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-ipad/ipad"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-model-unselect-gallery-1-202503?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1739318772336",
        "pageUrl": "https://www.apple.com/shop/buy-ipad/ipad",
        "credit": "© Apple"
      }
    },
    {
      "id": "beats-studio-pro",
      "category": "tech",
      "brand": "Beats",
      "model": "Beats Studio Pro",
      "title": "Beats Studio Pro",
      "subtitle": "Беспроводные наушники, чёрные",
      "price": 299.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в магазине Apple",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/product/MQTP3LL/A/beats-studio-pro-wireless-headphones-black"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQTP3?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1741643688117",
        "pageUrl": "https://www.apple.com/shop/product/MQTP3LL/A/beats-studio-pro-wireless-headphones-black",
        "credit": "© Beats"
      }
    },
    {
      "id": "lego-rivendell",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10316 Rivendell",
      "title": "LEGO Icons 10316 Rivendell",
      "subtitle": "The Lord of the Rings, 6 167 деталей",
      "price": 499.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/the-lord-of-the-rings-rivendell-10316"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/bltec012c948c003fba/10316_alt16.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/the-lord-of-the-rings-rivendell-10316",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-bonsai",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10281 Bonsai Tree",
      "title": "LEGO Icons 10281 Bonsai Tree",
      "subtitle": "878 деталей",
      "price": 49.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/bonsai-tree-10281"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt4fa1e0206e541309/10281_Prod.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/bonsai-tree-10281",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-porsche-911",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10295 Porsche 911",
      "title": "LEGO Icons 10295 Porsche 911",
      "subtitle": "1 458 деталей",
      "price": 169.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/porsche-911-10295"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt2145af639db324fc/10295_prod.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/porsche-911-10295",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-enterprise",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10356 U.S.S. Enterprise NCC-1701-D",
      "title": "LEGO Icons 10356 U.S.S. Enterprise NCC-1701-D",
      "subtitle": "Star Trek, 3 600 деталей",
      "price": 399.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/star-trek-u-s-s-enterprise-ncc-1701-d-10356"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt062f49aeb5924ace/10356_Prod_en-gb.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/star-trek-u-s-s-enterprise-ncc-1701-d-10356",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-orchid",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10311 Orchid",
      "title": "LEGO Icons 10311 Orchid",
      "subtitle": "608 деталей",
      "price": 49.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/orchid-10311"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt08ea230311e717b8/10311.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/orchid-10311",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-millennium-falcon",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Star Wars 75192 Millennium Falcon",
      "title": "LEGO Star Wars 75192 Millennium Falcon",
      "subtitle": "7 541 деталь",
      "price": 849.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/millennium-falcon-75192"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt3349f56c6f192e18/75192_Prod.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/millennium-falcon-75192",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-eiffel-tower",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10307 Eiffel Tower",
      "title": "LEGO Icons 10307 Eiffel Tower",
      "subtitle": "10 001 деталь, высота 149 см",
      "price": 629.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/eiffel-tower-10307"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt0e2b04c977a2dc2a/10307.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/eiffel-tower-10307",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-titanic",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10294 Titanic",
      "title": "LEGO Icons 10294 Titanic",
      "subtitle": "9 090 деталей",
      "price": 679.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/titanic-10294"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt6cdf0b53146b5519/10294_Prod.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/titanic-10294",
        "credit": "© LEGO"
      }
    },
    {
      "id": "nike-dunk-low",
      "category": "fashion",
      "brand": "Nike",
      "model": "Dunk Low Retro",
      "title": "Nike Dunk Low Retro",
      "subtitle": "Мужские, Shadow Brown, IM4415-201",
      "price": 120,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "nike.com",
        "url": "https://www.nike.com/t/dunk-low-retro-mens-shoes-5FQWGR"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/39b10e4d-d34d-48a8-a522-e7cf58ba8b47/NIKE+DUNK+LOW+RETRO.png",
        "pageUrl": "https://www.nike.com/t/dunk-low-retro-mens-shoes-5FQWGR",
        "credit": "© Nike"
      }
    },
    {
      "id": "air-jordan-1-high",
      "category": "fashion",
      "brand": "Jordan",
      "model": "Air Jordan 1 Retro High OG",
      "title": "Jordan Air Jordan 1 Retro High OG",
      "subtitle": "«Love Letter», DZ5485-201",
      "price": 185,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "nike.com",
        "url": "https://www.nike.com/t/air-jordan-1-retro-high-og-love-letter-mens-shoes-KVpEM9a8/DZ5485-201"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ba9f162a-46d1-4ba9-a321-3c267773fb51/AIR+JORDAN+1+RETRO+HIGH+OG.png",
        "pageUrl": "https://www.nike.com/t/air-jordan-1-retro-high-og-love-letter-mens-shoes-KVpEM9a8/DZ5485-201",
        "credit": "© Jordan"
      }
    },
    {
      "id": "adidas-gazelle",
      "category": "fashion",
      "brand": "adidas",
      "model": "Gazelle",
      "title": "adidas Gazelle",
      "subtitle": "Core Black, CQ2809",
      "price": 110,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "adidas.com",
        "url": "https://www.adidas.com/us/gazelle-shoes/CQ2809.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://assets.adidas.com/images/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/w_500,f_auto,q_auto/97f86eede1374615a058a81700a27444_9366/Gazelle_Shoes_Black_CQ2809_01_standard.jpg",
        "pageUrl": "https://www.adidas.com/us/gazelle-shoes/CQ2809.html",
        "credit": "© adidas"
      }
    },
    {
      "id": "adidas-samba-og",
      "category": "fashion",
      "brand": "adidas",
      "model": "Samba OG",
      "title": "adidas Samba OG",
      "subtitle": "Cloud White / Core Black / Gum, B75806",
      "price": 100,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "adidas.com",
        "url": "https://www.adidas.com/us/samba-og-shoes/B75806.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://assets.adidas.com/images/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/w_500,f_auto,q_auto/3bbecbdf584e40398446a8bf0117cf62_9366/Samba_OG_Shoes_White_B75806_01_00_standard.jpg",
        "pageUrl": "https://www.adidas.com/us/samba-og-shoes/B75806.html",
        "credit": "© adidas"
      }
    },
    {
      "id": "crocs-classic-clog",
      "category": "fashion",
      "brand": "Crocs",
      "model": "Classic Clog",
      "title": "Crocs Classic Clog",
      "subtitle": "Цвет Slate Grey",
      "price": 49.99,
      "currency": "USD",
      "region": "US",
      "note": "Полная цена без скидки; отдельные цвета иногда продаются со скидкой",
      "source": {
        "label": "crocs.com",
        "url": "https://www.crocs.com/p/classic-clog/10001.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.crocs.com/images/f_auto%2Cq_auto%2Cw_900%2Ch_900%2Cc_pad%2Cb_transparent/products/10001_0DA_ALT100/crocs",
        "pageUrl": "https://www.crocs.com/p/classic-clog/10001.html",
        "credit": "© Crocs"
      }
    },
    {
      "id": "ugg-classic-mini",
      "category": "fashion",
      "brand": "UGG",
      "model": "Classic Mini",
      "title": "UGG Classic Mini",
      "subtitle": "Мужские, цвет Chestnut",
      "price": 175,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "ugg.com",
        "url": "https://www.ugg.com/men-boots-classic-boots/classic-mini/1002072.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://dms.deckers.com/ugg/image/upload/t_product-xlarge-wp/v1770062160/1002072-CHE_1.png?_s=RAABAB0",
        "pageUrl": "https://www.ugg.com/men-boots-classic-boots/classic-mini/1002072.html",
        "credit": "© UGG"
      }
    },
    {
      "id": "birkenstock-arizona",
      "category": "fashion",
      "brand": "Birkenstock",
      "model": "Arizona",
      "title": "Birkenstock Arizona",
      "subtitle": "Замша, цвет Taupe",
      "price": 139.95,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "birkenstock.com",
        "url": "https://www.birkenstock.com/us/arizona-suede-leather-taupe/arizona-core-suedeleather-0-eva-u_46.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.birkenstock.com/on/demandware.static/-/Sites-master-catalog-amer/default/dw645eff56/51461/51461.jpg",
        "pageUrl": "https://www.birkenstock.com/us/arizona-suede-leather-taupe/arizona-core-suedeleather-0-eva-u_46.html",
        "credit": "© Birkenstock"
      }
    },
    {
      "id": "on-cloud-6",
      "category": "fashion",
      "brand": "On",
      "model": "Cloud 6",
      "title": "On Cloud 6",
      "subtitle": "Мужские, Black | Black",
      "price": 160,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "on.com",
        "url": "https://www.on.com/en-us/products/cloud-6-m-3mf1007/mens/black-black-shoes-3MF10071043"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://images.ctfassets.net/hnk2vsx53n6l/f7V7aAtfOkd7MCiBHrA0W/f5ef5785238a97fb96c74d79a5417b2b/5fe4b760f2b91d354cdb2cb0624a6902a3e6c77c.png?w=1200&h=630&fit=pad&bg=rgb:ffffff&q=85&fm=webp",
        "pageUrl": "https://www.on.com/en-us/products/cloud-6-m-3mf1007/mens/black-black-shoes-3MF10071043",
        "credit": "© On"
      }
    },
    {
      "id": "converse-chuck-70",
      "category": "fashion",
      "brand": "Converse",
      "model": "Chuck 70 Canvas High Top",
      "title": "Converse Chuck 70 Canvas High Top",
      "subtitle": "Black/Black/Egret",
      "price": 95,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "converse.com",
        "url": "https://www.converse.com/shop/p/chuck-70-canvas-unisex-high-top-shoe/162056MP.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw10f77af3/images/a_107/162050C_A_107X1.jpg?sw=406&strip=false",
        "pageUrl": "https://www.converse.com/shop/p/chuck-70-canvas-unisex-high-top-shoe/162056MP.html",
        "credit": "© Converse"
      }
    },
    {
      "id": "vans-old-skool-gtx",
      "category": "fashion",
      "brand": "Vans",
      "model": "Premium Old Skool GORE-TEX",
      "title": "Vans Premium Old Skool GORE-TEX",
      "subtitle": "Чёрные, VN000Z3DBLA",
      "price": 130,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "vans.com",
        "url": "https://www.vans.com/en-us/p/shoes/icons/old-skool-5205/premium-old-skool-gore-tex-shoe-VN000Z3DBLA"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://assets.vans.com/images/t_Thumbnail/v1790196351/VN000Z3DBLA-HERO/Premium-Old-Skool-GORETEX-Shoe-VANS-HERO.jpg",
        "pageUrl": "https://www.vans.com/en-us/p/shoes/icons/old-skool-5205/premium-old-skool-gore-tex-shoe-VN000Z3DBLA",
        "credit": "© Vans"
      }
    },
    {
      "id": "patagonia-better-sweater",
      "category": "fashion",
      "brand": "Patagonia",
      "model": "Better Sweater Fleece Jacket",
      "title": "Patagonia Better Sweater Fleece Jacket",
      "subtitle": "Мужская, Old Growth Green, 25528",
      "price": 169,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "patagonia.com",
        "url": "https://patagonia.com/product/mens-better-sweater-fleece-jacket/191743873539.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://dis.patagonia.com/dw/image/v2/BDJB_PRD/on/demandware.static/-/Sites-patagonia-master/default/dweb9712df/images/hi-res/25528_OLGG.jpg?sw=256&sh=256&sfrm=png&q=95&bgcolor=f3f4ef",
        "pageUrl": "https://patagonia.com/product/mens-better-sweater-fleece-jacket/191743873539.html",
        "credit": "© Patagonia"
      }
    },
    {
      "id": "arcteryx-beta-jacket",
      "category": "fashion",
      "brand": "Arc'teryx",
      "model": "Beta Jacket",
      "title": "Arc'teryx Beta Jacket",
      "subtitle": "Мужская мембранная куртка, Black Sapphire",
      "price": 400,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "arcteryx.com",
        "url": "https://arcteryx.com/us/en/shop/mens/beta-jacket-0868"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://images-dynamic-arcteryx.imgix.net/details/1350x1710/F26-X000010878-Beta-Jacket-Black-Sapphire-Front-View.jpg",
        "pageUrl": "https://arcteryx.com/us/en/shop/mens/beta-jacket-0868",
        "credit": "© Arc'teryx"
      }
    },
    {
      "id": "ralph-lauren-mesh-polo",
      "category": "fashion",
      "brand": "Polo Ralph Lauren",
      "model": "Custom Slim Fit Mesh Polo",
      "title": "Polo Ralph Lauren Custom Slim Fit Mesh Polo",
      "subtitle": "Мужское поло, Canary Yellow Multi",
      "price": 148,
      "currency": "USD",
      "region": "US",
      "note": "Официальная розничная цена в США",
      "source": {
        "label": "ralphlauren.com",
        "url": "https://www.ralphlauren.com/men-clothing-polo-shirts/custom-slim-fit-mesh-polo/0041899386.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-1329947_alternate10?$rl_4x5_zoom$",
        "pageUrl": "https://www.ralphlauren.com/men-clothing-polo-shirts/custom-slim-fit-mesh-polo/0041899386.html",
        "credit": "© Polo Ralph Lauren"
      }
    },
    {
      "id": "rolex-submariner-steel",
      "category": "accessories",
      "brand": "Rolex",
      "model": "Submariner Date 126610LN",
      "title": "Rolex Submariner Date 126610LN",
      "subtitle": "41 мм, сталь Oystersteel",
      "price": 11350,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная розничная цена Rolex в США",
      "source": {
        "label": "rolex.com",
        "url": "https://www.rolex.com/en-us/watches/submariner/m126610ln-0001"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://media.rolex.com/image/upload/q_auto/f_auto/t_v7-cover-majesty-landscape/c_limit,w_1920/v1/a677b2c664f6/catalogue/2026/upright-c/m126610ln-0001",
        "pageUrl": "https://www.rolex.com/en-us/watches/submariner/m126610ln-0001",
        "credit": "© Rolex"
      }
    },
    {
      "id": "rolex-submariner-gold",
      "category": "accessories",
      "brand": "Rolex",
      "model": "Submariner Date 126618LN",
      "title": "Rolex Submariner Date 126618LN",
      "subtitle": "41 мм, жёлтое золото 18 карат",
      "price": 50900,
      "currency": "USD",
      "region": "US",
      "note": "Та же модель Submariner Date, но корпус и браслет из жёлтого золота 18 карат",
      "source": {
        "label": "rolex.com",
        "url": "https://www.rolex.com/en-us/watches/submariner/m126618ln-0002"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://media.rolex.com/image/upload/q_auto/f_auto/t_v7-cover-majesty-landscape/c_limit,w_1920/v1/a677b2c664f6/catalogue/2026/upright-c/m126618ln-0002",
        "pageUrl": "https://www.rolex.com/en-us/watches/submariner/m126618ln-0002",
        "credit": "© Rolex"
      }
    },
    {
      "id": "omega-speedmaster",
      "category": "accessories",
      "brand": "Omega",
      "model": "Speedmaster Moonwatch Professional",
      "title": "Omega Speedmaster Moonwatch Professional",
      "subtitle": "42 мм, сталь на браслете, 310.30.42.50.01.002",
      "price": 9000,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная розничная цена Omega в США",
      "source": {
        "label": "omegawatches.com",
        "url": "https://www.omegawatches.com/en-us/watch-omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001002"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.omegawatches.com/media/catalog/product/o/m/omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001002-198df2.png?w=1024",
        "pageUrl": "https://www.omegawatches.com/en-us/watch-omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001002",
        "credit": "© Omega"
      }
    },
    {
      "id": "tissot-prx-40",
      "category": "accessories",
      "brand": "Tissot",
      "model": "PRX Powermatic 80, 40 мм",
      "title": "Tissot PRX Powermatic 80, 40 мм",
      "subtitle": "Синий циферблат, T137.407.11.041.00",
      "price": 850,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная цена Tissot в США",
      "source": {
        "label": "tissotwatches.com",
        "url": "https://www.tissotwatches.com/en-us/T1374071104100.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.tissotwatches.com/on/demandware.static/-/Sites-Tissot-Catalogue/default/dw95c4331d/product-pictures/63f42767-a9f5-4cdd-b952-8ea7b82b7e0c_T137-407-11-041-00_shadow.png",
        "pageUrl": "https://www.tissotwatches.com/en-us/T1374071104100.html",
        "credit": "© Tissot"
      }
    },
    {
      "id": "montblanc-149",
      "category": "accessories",
      "brand": "Montblanc",
      "model": "Meisterstück 149",
      "title": "Montblanc Meisterstück 149",
      "subtitle": "Перьевая ручка, позолота, перо M",
      "price": 1380,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Montblanc (США)",
      "source": {
        "label": "montblanc.com",
        "url": "https://www.montblanc.com/en-us/meisterstuck-gold-coated-149-fountain-pen-(m)-MB132113.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.montblanc.com/dw/image/v2/bhdb_prd/on/demandware.static/-/Sites-montblanc-master/default/dwe52dee7f/images/all-images/MB132113/2414500_8bf75ff0.png?sw=960&q=90",
        "pageUrl": "https://www.montblanc.com/en-us/meisterstuck-gold-coated-149-fountain-pen-(m)-MB132113.html",
        "credit": "© Montblanc"
      }
    },
    {
      "id": "tiffany-heart-tag",
      "category": "accessories",
      "brand": "Tiffany & Co.",
      "model": "Return to Tiffany Heart Tag Pendant",
      "title": "Tiffany & Co. Return to Tiffany Heart Tag Pendant",
      "subtitle": "Серебро, размер Medium",
      "price": 350,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Tiffany (США)",
      "source": {
        "label": "tiffany.com",
        "url": "https://www.tiffany.com/jewelry/necklaces-pendants/return-to-tiffany-sterling-silver-necklaces-pendants-1154167408.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.tiffany.com/is/image/tco/60014183_PDT_MAIN1X1",
        "pageUrl": "https://www.tiffany.com/jewelry/necklaces-pendants/return-to-tiffany-sterling-silver-necklaces-pendants-1154167408.html",
        "credit": "© Tiffany & Co."
      }
    },
    {
      "id": "seiko-5-srpd55",
      "category": "accessories",
      "brand": "Seiko",
      "model": "5 Sports SRPD55",
      "title": "Seiko 5 Sports SRPD55",
      "subtitle": "Автоматические часы",
      "price": 350,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная цена Seiko в США",
      "source": {
        "label": "seikowatches.com",
        "url": "https://www.seikowatches.com/us-en/products/5sports/srpd55"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.seikowatches.com/us-en/-/media/Images/Product--Image/All/Seiko/2022/02/20/02/14/SRPD55K1/SRPD55K1.png",
        "pageUrl": "https://www.seikowatches.com/us-en/products/5sports/srpd55",
        "credit": "© Seiko"
      }
    },
    {
      "id": "dior-sauvage-edt",
      "category": "beauty",
      "brand": "Dior",
      "model": "Sauvage Eau de Toilette",
      "title": "Dior Sauvage Eau de Toilette",
      "subtitle": "Мужской аромат, 30 мл (1 fl oz)",
      "price": 75,
      "currency": "USD",
      "region": "US",
      "note": "Цена самого маленького флакона в официальном магазине Dior (США)",
      "source": {
        "label": "dior.com",
        "url": "https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-Y0685240.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/default/dw9507a7bb/Y0685240/Y0685240_F068524009_E01_GHC.jpg?sw=800",
        "pageUrl": "https://www.dior.com/en_us/beauty/products/sauvage-eau-de-toilette-Y0685240.html",
        "credit": "© Dior"
      }
    },
    {
      "id": "la-mer-creme",
      "category": "beauty",
      "brand": "La Mer",
      "model": "Crème de la Mer",
      "title": "La Mer Crème de la Mer",
      "subtitle": "Увлажняющий крем, 30 мл (1 oz)",
      "price": 200,
      "currency": "USD",
      "region": "US",
      "note": "Банка 8,4 oz того же крема стоит $1540",
      "source": {
        "label": "cremedelamer.com",
        "url": "https://www.cremedelamer.com/product/5834/12343/face/moisturizers/creme-de-la-mer"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.cremedelamer.com/media/export/cms/products/340x340/LM_SKU_332002_26766_340x340_0.png",
        "pageUrl": "https://www.cremedelamer.com/product/5834/12343/face/moisturizers/creme-de-la-mer",
        "credit": "© La Mer"
      }
    },
    {
      "id": "sol-de-janeiro-bum-bum",
      "category": "beauty",
      "brand": "Sol de Janeiro",
      "model": "Brazilian Bum Bum Cream",
      "title": "Sol de Janeiro Brazilian Bum Bum Cream",
      "subtitle": "Крем для тела, 240 мл",
      "price": 48,
      "currency": "USD",
      "region": "US",
      "note": "Цена без подписки в официальном магазине бренда (США)",
      "source": {
        "label": "soldejaneiro.com",
        "url": "https://soldejaneiro.com/products/brazilian-bum-bum-cream"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://soldejaneiro.com/cdn/shop/files/01_SDJ_PPage_DTC_BB_BC_240ML_OVERHEAD_RGB_1452X1452_cb5b3d96-578a-4163-8c34-8c815fc465eb.jpg?v=1788873312",
        "pageUrl": "https://soldejaneiro.com/products/brazilian-bum-bum-cream",
        "credit": "© Sol de Janeiro"
      }
    },
    {
      "id": "kiehls-ultra-facial-250",
      "category": "beauty",
      "brand": "Kiehl's",
      "model": "Ultra Facial Cream",
      "title": "Kiehl's Ultra Facial Cream",
      "subtitle": "Увлажняющий крем, 250 мл",
      "price": 115,
      "currency": "USD",
      "region": "US",
      "note": "Маленькая баночка 28 мл того же крема стоит больше чем в 4 раза дешевле",
      "source": {
        "label": "kiehls.com",
        "url": "https://www.kiehls.com/skincare/face-moisturizers/ultra-facial-cream-with-squalane/622.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.kiehls.com/dw/image/v2/AAFM_PRD/on/demandware.static/-/Sites-kiehls-master-catalog/default/dw88a3e0c5/nextgen/skin-care/face-moisturizers/ultra-facial/ultra-facial-cream/2024/D0711324%20-%20KHLS%20-%202.7.24%20-%20Packshot%20Seal%20UFC,%20Better%20Screen,%20and%20Barrier%20Balm%20-%20UFC%20-%20250ml%20-%202400x2400.png",
        "pageUrl": "https://www.kiehls.com/skincare/face-moisturizers/ultra-facial-cream-with-squalane/622.html",
        "credit": "© Kiehl's"
      }
    },
    {
      "id": "charlotte-tilbury-pillow-talk",
      "category": "beauty",
      "brand": "Charlotte Tilbury",
      "model": "Matte Revolution Lipstick",
      "title": "Charlotte Tilbury Matte Revolution Lipstick",
      "subtitle": "Оттенок Pillow Talk Medium",
      "price": 37,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине бренда (США)",
      "source": {
        "label": "charlottetilbury.com",
        "url": "https://www.charlottetilbury.com/us/product/matte-revolution-lipstick-pillow-talk-medium"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://images.ctfassets.net/wlke2cbybljx/yzPiKmO3rZrRUPhTlxJlm/eeaab999f808fc600073d361c74da60a/039_220107_PILLOW_TALK_PLUMP_P_MATTE_REV_MEDIUM_OPEN_RJ_2402.png?bg=rgb%3Affffff&fm=png",
        "pageUrl": "https://www.charlottetilbury.com/us/product/matte-revolution-lipstick-pillow-talk-medium",
        "credit": "© Charlotte Tilbury"
      }
    },
    {
      "id": "estee-lauder-anr",
      "category": "beauty",
      "brand": "Estée Lauder",
      "model": "Advanced Night Repair Serum",
      "title": "Estée Lauder Advanced Night Repair Serum",
      "subtitle": "Сыворотка, 50 мл (1.7 oz)",
      "price": 135,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Estée Lauder (США)",
      "source": {
        "label": "esteelauder.com",
        "url": "https://www.esteelauder.com/product/689/77491/product-catalog/skincare/repair-serum/advanced-night-repair-serum/synchronized-multi-recovery-complex"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.esteelauder.com/media/export/cms/products/308x424/el_sku_PG5001_308x424_0.jpg",
        "pageUrl": "https://www.esteelauder.com/product/689/77491/product-catalog/skincare/repair-serum/advanced-night-repair-serum/synchronized-multi-recovery-complex",
        "credit": "© Estée Lauder"
      }
    },
    {
      "id": "clinique-moisture-surge",
      "category": "beauty",
      "brand": "Clinique",
      "model": "Moisture Surge 100H",
      "title": "Clinique Moisture Surge 100H",
      "subtitle": "Гель-крем, 30 мл (1 oz)",
      "price": 31,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Clinique (США)",
      "source": {
        "label": "clinique.com",
        "url": "https://www.clinique.com/products/moisture-surge-100h-auto-replenishing-hydrator"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.clinique.com/cdn/shop/files/cl_prod_83690_NA_3000x3000_0.jpg?v=1791641736",
        "pageUrl": "https://www.clinique.com/products/moisture-surge-100h-auto-replenishing-hydrator",
        "credit": "© Clinique"
      }
    },
    {
      "id": "fenty-gloss-bomb",
      "category": "beauty",
      "brand": "Fenty Beauty",
      "model": "Gloss Bomb Universal Lip Luminizer",
      "title": "Fenty Beauty Gloss Bomb Universal Lip Luminizer",
      "subtitle": "Оттенок Fenty Glow, 9 мл",
      "price": 23,
      "currency": "USD",
      "region": "US",
      "note": "Есть мини-версия 5,5 мл — она дешевле примерно на треть",
      "source": {
        "label": "fentybeauty.com",
        "url": "https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-fenty-glow"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://fentybeauty.com/cdn/shop/files/FB789762_GLOBAL_LIP_INFOGRAPHICS_GLOSS-BOMB-OG_1200x1500_B_A_Fenty_Glow_Light.jpg?v=1734648004&width=1200",
        "pageUrl": "https://fentybeauty.com/products/gloss-bomb-universal-lip-luminizer-fenty-glow",
        "credit": "© Fenty Beauty"
      }
    },
    {
      "id": "summer-fridays-lip-balm",
      "category": "beauty",
      "brand": "Summer Fridays",
      "model": "Lip Butter Balm",
      "title": "Summer Fridays Lip Butter Balm",
      "subtitle": "Вкус Vanilla, 15 г",
      "price": 24,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине бренда (США)",
      "source": {
        "label": "summerfridays.com",
        "url": "https://summerfridays.com/products/lip-butter-balm"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://summerfridays.com/cdn/shop/files/PDP_LBB-Vanilla-1.jpg?crop=center&height=1024&v=1760724150&width=1024",
        "pageUrl": "https://summerfridays.com/products/lip-butter-balm",
        "credit": "© Summer Fridays"
      }
    },
    {
      "id": "dyson-v15-detect",
      "category": "home",
      "brand": "Dyson",
      "model": "V15 Detect",
      "title": "Dyson V15 Detect",
      "subtitle": "Беспроводной пылесос, Yellow/Iron",
      "price": 849.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Dyson (США)",
      "source": {
        "label": "dyson.com",
        "url": "https://www.dyson.com/vacuum-cleaners/cordless/v15/detect-yellow"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/lifestyle/626417-01.jpg?$responsive$&wid=400",
        "pageUrl": "https://www.dyson.com/vacuum-cleaners/cordless/v15/detect-yellow",
        "credit": "© Dyson"
      }
    },
    {
      "id": "smeg-mini-kettle",
      "category": "home",
      "brand": "Smeg",
      "model": "Mini Electric Kettle KLF05",
      "title": "Smeg Mini Electric Kettle KLF05",
      "subtitle": "Мини-чайник 0,8 л, белый",
      "price": 200,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Smeg (США)",
      "source": {
        "label": "smeg.com",
        "url": "https://www.smeg.com/us/products/KLF05WHUS"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://assets.4flow.cloud/THUMB_KLF05WHUS.jpg.jpg?pEFs=cVY2M1MyN1ZOMFFadEQ5ZlVOMzhVeTdHeWpZMDBuNTNiakFwL3lMQ1RUajBTQ1BjcE5PczF1dVpNWUFxUWY5bk1KMHR3THExZzRBVGpPWmFEQ200RFc3ZnZmZXVRYVg1OFptb1EvYnM4OVFSK3FseUFFNXVSeWxZNGJJTXdqcmx2QTYxbjRHNjJtall4STlBQ21qQXhYamN3TVQzYk45bEp6K1ZFcVJ5eVVrPQ",
        "pageUrl": "https://www.smeg.com/us/products/KLF05WHUS",
        "credit": "© Smeg"
      }
    },
    {
      "id": "ps5-pro",
      "category": "gaming",
      "brand": "Sony",
      "model": "PlayStation 5 Pro",
      "title": "Sony PlayStation 5 Pro",
      "subtitle": "Игровая консоль, 2 ТБ",
      "price": 899,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/buy-consoles/playstation5-pro-console-2-tb"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/PS5PRO-hero-Packshot-US-2025",
        "pageUrl": "https://direct.playstation.com/en-us/buy-consoles/playstation5-pro-console-2-tb",
        "credit": "© Sony"
      }
    },
    {
      "id": "ps5-digital",
      "category": "gaming",
      "brand": "Sony",
      "model": "PlayStation 5 Digital Edition",
      "title": "Sony PlayStation 5 Digital Edition",
      "subtitle": "Игровая консоль без дисковода, 825 ГБ",
      "price": 599,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/buy-consoles/playstation5-digital-edition-console-825-gb"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/2025-PS5-Digital-hero-3-packaging-US",
        "pageUrl": "https://direct.playstation.com/en-us/buy-consoles/playstation5-digital-edition-console-825-gb",
        "credit": "© Sony"
      }
    },
    {
      "id": "dualsense-black",
      "category": "gaming",
      "brand": "Sony",
      "model": "DualSense Wireless Controller",
      "title": "Sony DualSense Wireless Controller",
      "subtitle": "Геймпад PS5, Midnight Black",
      "price": 74,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/2025-dualsense-ps5-controller-midnight-black-accessory-front",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "ps-portal",
      "category": "gaming",
      "brand": "Sony",
      "model": "PlayStation Portal",
      "title": "Sony PlayStation Portal",
      "subtitle": "Устройство для удалённой игры с PS5",
      "price": 249,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/ps-portal-remoteplayer-hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "pulse-elite",
      "category": "gaming",
      "brand": "Sony",
      "model": "PULSE Elite",
      "title": "Sony PULSE Elite",
      "subtitle": "Беспроводная гарнитура для PS5",
      "price": 149,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/2025-Elite-Hero-1-new",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "logitech-g923",
      "category": "gaming",
      "brand": "Logitech",
      "model": "G923 TRUEFORCE",
      "title": "Logitech G923 TRUEFORCE",
      "subtitle": "Игровой руль с педалями для PS5",
      "price": 349.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Logitech-G923-Hero-1v2",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Logitech"
      }
    },
    {
      "id": "sandisk-8tb-ps5",
      "category": "gaming",
      "brand": "SanDisk",
      "model": "Optimus GX PRO 850P 8 ТБ",
      "title": "SanDisk Optimus GX PRO 850P 8 ТБ",
      "subtitle": "SSD-накопитель для PS5",
      "price": 2249.99,
      "currency": "USD",
      "region": "US",
      "note": "Да, это просто SSD-диск для приставки",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Sandisk-optimus-hero-2-8tb-v2",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© SanDisk"
      }
    },
    {
      "id": "lego-playstation",
      "category": "gaming",
      "brand": "LEGO",
      "model": "LEGO PlayStation",
      "title": "LEGO PlayStation",
      "subtitle": "Конструктор в виде первой PlayStation",
      "price": 179.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Lego-PlayStation-Hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© LEGO"
      }
    },
    {
      "id": "pulse-elevate",
      "category": "gaming",
      "brand": "Sony",
      "model": "PULSE Elevate",
      "title": "Sony PULSE Elevate",
      "subtitle": "Беспроводные колонки, белые",
      "price": 219,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Elevate-speakers-white-hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "audeze-maxwell-2",
      "category": "gaming",
      "brand": "Audeze",
      "model": "Maxwell 2",
      "title": "Audeze Maxwell 2",
      "subtitle": "Игровая гарнитура для PlayStation",
      "price": 329,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Audeze-2-Headset-main-facing-left-mic-extended-hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Audeze"
      }
    },
    {
      "id": "sony-inzone-m10s",
      "category": "gaming",
      "brand": "Sony",
      "model": "INZONE M10S",
      "title": "Sony INZONE M10S",
      "subtitle": "Игровой OLED-монитор 27\", 480 Гц",
      "price": 899.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/SONYINZONE-M10S-Hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "ninja-creami",
      "category": "home",
      "brand": "Ninja",
      "model": "CREAMi NC301",
      "title": "Ninja CREAMi NC301",
      "subtitle": "Мороженица 7-в-1, Cloud Silver",
      "price": 229.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине SharkNinja (США)",
      "source": {
        "label": "sharkninja.com",
        "url": "https://www.sharkninja.com/ninja-creami-7-in-1-ice-cream-maker/NC301.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://assets.sharkninja.com/image/upload/f_auto/q_auto/SharkNinja-NA/NC301_01.jpg",
        "pageUrl": "https://www.sharkninja.com/ninja-creami-7-in-1-ice-cream-maker/NC301.html",
        "credit": "© Ninja"
      }
    },
    {
      "id": "weber-spirit-e325",
      "category": "home",
      "brand": "Weber",
      "model": "Spirit E-325",
      "title": "Weber Spirit E-325",
      "subtitle": "Газовый гриль (пропан), чёрный",
      "price": 549,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Weber (США)",
      "source": {
        "label": "amer.weber.com",
        "url": "https://amer.weber.com/en-us/products/spirit-e-325-gas-grill-liquid-propane-black-1500789"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://amer.weber.com/cdn/shop/files/1500789_B_rgb-1800x1800-3ffe0d2_sync.png?crop=center&height=630&v=1783623475&width=1200",
        "pageUrl": "https://amer.weber.com/en-us/products/spirit-e-325-gas-grill-liquid-propane-black-1500789",
        "credit": "© Weber"
      }
    },
    {
      "id": "olipop-variety-12",
      "category": "food",
      "brand": "OLIPOP",
      "model": "Favorites Variety Pack",
      "title": "OLIPOP Favorites Variety Pack",
      "subtitle": "Пребиотическая газировка, 12 банок",
      "price": 35.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена разовой покупки в официальном магазине бренда (США), без подписки",
      "source": {
        "label": "drinkolipop.com",
        "url": "https://drinkolipop.com/products/favorites-variety-pack"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://drinkolipop.com/cdn/shop/files/FVP-PDP-Square1_new_asset_1200x1200.webp?v=1779208107",
        "pageUrl": "https://drinkolipop.com/products/favorites-variety-pack",
        "credit": "© OLIPOP"
      }
    },
    {
      "id": "graza-sizzle",
      "category": "food",
      "brand": "Graza",
      "model": "\"Sizzle\" Extra Virgin Olive Oil",
      "title": "Graza \"Sizzle\" Extra Virgin Olive Oil",
      "subtitle": "Оливковое масло, 750 мл",
      "price": 16,
      "currency": "USD",
      "region": "US",
      "note": "Цена разовой покупки в официальном магазине бренда (США), без подписки",
      "source": {
        "label": "graza.co",
        "url": "https://www.graza.co/products/sizzle"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://cdn.shopify.com/s/files/1/0550/0003/9638/files/30_product_sizzle750ml_0002_fe965569-a5c7-45ca-8809-47da9aba1e32.jpg?v=1762198144",
        "pageUrl": "https://www.graza.co/products/sizzle",
        "credit": "© Graza"
      }
    },
    {
      "id": "fishwife-salmon-3",
      "category": "food",
      "brand": "Fishwife",
      "model": "Gold Label Smoked Salmon",
      "title": "Fishwife Gold Label Smoked Salmon",
      "subtitle": "Копчёный лосось, 3 банки",
      "price": 36,
      "currency": "USD",
      "region": "US",
      "note": "Получается $12 за одну банку рыбы",
      "source": {
        "label": "eatfishwife.com",
        "url": "https://eatfishwife.com/products/smoked-atlantic-salmon"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://eatfishwife.com/cdn/shop/files/GoldLabelSalmonTrio_1200x.png?v=1770694141",
        "pageUrl": "https://eatfishwife.com/products/smoked-atlantic-salmon",
        "credit": "© Fishwife"
      }
    },
    {
      "id": "death-wish-coffee",
      "category": "food",
      "brand": "Death Wish Coffee",
      "model": "Dark Roast",
      "title": "Death Wish Coffee Dark Roast",
      "subtitle": "Молотый кофе, 453 г (16 oz)",
      "price": 19.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена разовой покупки в официальном магазине бренда (США), без подписки",
      "source": {
        "label": "deathwishcoffee.com",
        "url": "https://www.deathwishcoffee.com/products/death-wish-coffee"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.deathwishcoffee.com/cdn/shop/files/Dark_Roast_16oz_Ground_Angle_DTC_A4_2.jpg?v=1726752263",
        "pageUrl": "https://www.deathwishcoffee.com/products/death-wish-coffee",
        "credit": "© Death Wish Coffee"
      }
    },
    {
      "id": "lindt-lindor-75",
      "category": "food",
      "brand": "Lindt",
      "model": "LINDOR Milk Chocolate Truffles",
      "title": "Lindt LINDOR Milk Chocolate Truffles",
      "subtitle": "Пакет 75 конфет, 900 г (31.7 oz)",
      "price": 42,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Lindt (США)",
      "source": {
        "label": "lindtusa.com",
        "url": "https://www.lindtusa.com/milk-chocolate-lindor-truffles-75-pc-bag-44989l"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lindtusa.com/media/catalog/product/8/7/878768c37ccc56e074744746bf8f123e316dd00e86f2905e0caa09fb6b6ec3ea.jpeg?quality=80&fit=bounds&height=310&width=310&canvas=310:310",
        "pageUrl": "https://www.lindtusa.com/milk-chocolate-lindor-truffles-75-pc-bag-44989l",
        "credit": "© Lindt"
      }
    },
    {
      "id": "magic-spoon-variety",
      "category": "food",
      "brand": "Magic Spoon",
      "model": "Protein Cereal Variety 4",
      "title": "Magic Spoon Protein Cereal Variety 4",
      "subtitle": "Протеиновые хлопья, 4 коробки",
      "price": 39,
      "currency": "USD",
      "region": "US",
      "note": "Цена разовой покупки в официальном магазине бренда (США), без подписки",
      "source": {
        "label": "magicspoon.com",
        "url": "https://magicspoon.com/products/variety-pack-cereal-case"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://magicspoon.com/cdn/shop/products/MS_VARIETY_4PACK-434857_2048x2048.png?v=1667355831",
        "pageUrl": "https://magicspoon.com/products/variety-pack-cereal-case",
        "credit": "© Magic Spoon"
      }
    },
    {
      "id": "brightland-awake",
      "category": "food",
      "brand": "Brightland",
      "model": "Awake Extra Virgin Olive Oil",
      "title": "Brightland Awake Extra Virgin Olive Oil",
      "subtitle": "Оливковое масло, 375 мл",
      "price": 38,
      "currency": "USD",
      "region": "US",
      "note": "Цена разовой покупки в официальном магазине бренда (США), без подписки",
      "source": {
        "label": "brightland.co",
        "url": "https://brightland.co/products/awake"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://brightland.co/cdn/shop/files/Awake-1150x1400-1_3a3c1149-89d0-4f90-b575-26414277ba3f.jpg?v=1776359552&width=2048",
        "pageUrl": "https://brightland.co/products/awake",
        "credit": "© Brightland"
      }
    },
    {
      "id": "tonys-milk-32",
      "category": "food",
      "brand": "Tony's Chocolonely",
      "model": "Milk Chocolate 32%",
      "title": "Tony's Chocolonely Milk Chocolate 32%",
      "subtitle": "Большая плитка, 180 г",
      "price": 6.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине бренда (США)",
      "source": {
        "label": "us.tonyschocolonely.com",
        "url": "https://us.tonyschocolonely.com/products/milk-chocolate-32"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://us.tonyschocolonely.com/cdn/shop/files/USBM180_M_01_front.png?crop=center&height=600&v=1723727330&width=1080",
        "pageUrl": "https://us.tonyschocolonely.com/products/milk-chocolate-32",
        "credit": "© Tony's Chocolonely"
      }
    },
    {
      "id": "yeti-rambler-20",
      "category": "everyday",
      "brand": "YETI",
      "model": "Rambler 20 oz Tumbler",
      "title": "YETI Rambler 20 oz Tumbler",
      "subtitle": "Термостакан 591 мл, Riverhead Red",
      "price": 40,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине YETI (США)",
      "source": {
        "label": "yeti.com",
        "url": "https://www.yeti.com/drinkware/tumblers/rambler-20oz.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://yeti-webmedia.imgix.net/asset/24ca058e-8167-416b-8879-074be44fd4be/W/YETI_Rambler_Tumbler_20oz_Riverhead_Red_Front_302_B.png?bg=0fff&auto=format,compress&w=846&h=846",
        "pageUrl": "https://www.yeti.com/drinkware/tumblers/rambler-20oz.html",
        "credit": "© YETI"
      }
    },
    {
      "id": "zippo-classic-chrome",
      "category": "everyday",
      "brand": "Zippo",
      "model": "Classic Chrome Arch",
      "title": "Zippo Classic Chrome Arch",
      "subtitle": "Ветрозащитная зажигалка",
      "price": 24.95,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Zippo (США)",
      "source": {
        "label": "zippo.com",
        "url": "https://zippo.com/products/classic-chrome-arch"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://zippo.com/cdn/shop/products/308e97da7aece93efe3d550635cedd54cd3c3c2f.jpg?v=1742320150",
        "pageUrl": "https://zippo.com/products/classic-chrome-arch",
        "credit": "© Zippo"
      }
    },
    {
      "id": "victorinox-classic-sd",
      "category": "everyday",
      "brand": "Victorinox",
      "model": "Classic SD",
      "title": "Victorinox Classic SD",
      "subtitle": "Швейцарский нож, 7 функций, Falling Snow",
      "price": 24,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Victorinox (США)",
      "source": {
        "label": "victorinox.com",
        "url": "https://www.victorinox.com/en-US/Products/Swiss-Army-Knife%E2%84%A2-and-Tools/Essentials/Classic-SD-Classic-Colors/p/0.6223.7G"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://imageengine.victorinox.com/transform/ebf57c9f-f0c0-41e8-b134-47f35c24a404/SAK_0-6223-7_S1",
        "pageUrl": "https://www.victorinox.com/en-US/Products/Swiss-Army-Knife%E2%84%A2-and-Tools/Essentials/Classic-SD-Classic-Colors/p/0.6223.7G",
        "credit": "© Victorinox"
      }
    },
    {
      "id": "moleskine-classic-large",
      "category": "everyday",
      "brand": "Moleskine",
      "model": "Classic Notebook Large",
      "title": "Moleskine Classic Notebook Large",
      "subtitle": "Блокнот в твёрдой обложке, 13×21 см, чёрный",
      "price": 26,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Moleskine (США)",
      "source": {
        "label": "moleskine.com",
        "url": "https://www.moleskine.com/en-us/shop/notebooks/the-original-notebook/classic-notebook-black-9788883701122.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.moleskine.com/on/demandware.static/-/Sites-masterCatalog_Moleskine/default/dwf733f95b/images/large/gtin_9788883701122_01.jpg",
        "pageUrl": "https://www.moleskine.com/en-us/shop/notebooks/the-original-notebook/classic-notebook-black-9788883701122.html",
        "credit": "© Moleskine"
      }
    },
    {
      "id": "sonos-era-100",
      "category": "tech",
      "brand": "Sonos",
      "model": "Era 100",
      "title": "Sonos Era 100",
      "subtitle": "Умная колонка",
      "price": 219,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Sonos (США)",
      "source": {
        "label": "sonos.com",
        "url": "https://www.sonos.com/en-us/shop/era-100"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.sonos.com/images/znqtjj88/production/c730c924a2d9fe4d3a3b9b9cb7432b7afd0ab392-2000x2000.png",
        "pageUrl": "https://www.sonos.com/en-us/shop/era-100",
        "credit": "© Sonos"
      }
    },
    {
      "id": "dji-mini-4-pro",
      "category": "tech",
      "brand": "DJI",
      "model": "Mini 4 Pro",
      "title": "DJI Mini 4 Pro",
      "subtitle": "Дрон с пультом DJI RC-N2",
      "price": 759,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине DJI (США)",
      "source": {
        "label": "store.dji.com",
        "url": "https://store.dji.com/product/dji-mini-4-pro"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://se-cdn.djiits.com/tpc/uploads/spu/cover/4ea419b081f38056785ae8665d473190@ultra.png",
        "pageUrl": "https://store.dji.com/product/dji-mini-4-pro",
        "credit": "© DJI"
      }
    },
    {
      "id": "macbook-neo",
      "category": "tech",
      "brand": "Apple",
      "model": "MacBook Neo",
      "title": "Apple MacBook Neo",
      "subtitle": "Самый доступный Mac, базовая версия",
      "price": 699,
      "currency": "USD",
      "region": "US",
      "note": "Стартовая цена Apple (США); цена подтверждена списком моделей и помесячной оплатой ×12",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-mac"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-neo-color-unselect-202603-gallery-1?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1771560008657",
        "pageUrl": "https://www.apple.com/shop/buy-mac",
        "credit": "© Apple"
      }
    },
    {
      "id": "macbook-air-m5",
      "category": "tech",
      "brand": "Apple",
      "model": "MacBook Air 13\" (M5)",
      "title": "Apple MacBook Air 13\" (M5)",
      "subtitle": "16 ГБ / 512 ГБ, базовая версия",
      "price": 1299,
      "currency": "USD",
      "region": "US",
      "note": "Стартовая цена Apple (США); цена подтверждена списком моделей и помесячной оплатой ×12",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-mac/macbook-air"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-size-unselect-202601-gallery-1?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1767638925491",
        "pageUrl": "https://www.apple.com/shop/buy-mac/macbook-air",
        "credit": "© Apple"
      }
    },
    {
      "id": "macbook-pro-14",
      "category": "tech",
      "brand": "Apple",
      "model": "MacBook Pro 14\"",
      "title": "Apple MacBook Pro 14\"",
      "subtitle": "Базовая версия, 16 ГБ",
      "price": 1999,
      "currency": "USD",
      "region": "US",
      "note": "Стартовая цена Apple (США); цена подтверждена списком моделей и помесячной оплатой ×12",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-mac"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mac-macbook-pro-size-unselect-202601-gallery-1?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1767812220981",
        "pageUrl": "https://www.apple.com/shop/buy-mac",
        "credit": "© Apple"
      }
    },
    {
      "id": "imac-24",
      "category": "tech",
      "brand": "Apple",
      "model": "iMac 24\"",
      "title": "Apple iMac 24\"",
      "subtitle": "Моноблок, базовая версия",
      "price": 1499,
      "currency": "USD",
      "region": "US",
      "note": "Стартовая цена Apple (США)",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-mac"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/imac-color-unselect-202601-gallery-1?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1767917121718",
        "pageUrl": "https://www.apple.com/shop/buy-mac",
        "credit": "© Apple"
      }
    },
    {
      "id": "mac-mini",
      "category": "tech",
      "brand": "Apple",
      "model": "Mac mini",
      "title": "Apple Mac mini",
      "subtitle": "Базовая версия",
      "price": 899,
      "currency": "USD",
      "region": "US",
      "note": "Стартовая цена Apple (США); цена подтверждена списком моделей и помесячной оплатой ×12",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-mac"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mac-mini-chip-unselect-202608-gallery-1?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1785998455498",
        "pageUrl": "https://www.apple.com/shop/buy-mac",
        "credit": "© Apple"
      }
    },
    {
      "id": "mac-studio",
      "category": "tech",
      "brand": "Apple",
      "model": "Mac Studio",
      "title": "Apple Mac Studio",
      "subtitle": "Базовая версия",
      "price": 2499,
      "currency": "USD",
      "region": "US",
      "note": "Стартовая цена Apple (США); цена подтверждена списком моделей и помесячной оплатой ×12",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-mac"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mac-studio-chip-unselect-202608-gallery-1?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1786042910172",
        "pageUrl": "https://www.apple.com/shop/buy-mac",
        "credit": "© Apple"
      }
    },
    {
      "id": "weber-original-kettle",
      "category": "home",
      "brand": "Weber",
      "model": "Original Kettle 22\"",
      "title": "Weber Original Kettle 22\"",
      "subtitle": "Угольный гриль, чёрный",
      "price": 149,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Weber (США)",
      "source": {
        "label": "amer.weber.com",
        "url": "https://amer.weber.com/en-us/products/original-kettle-charcoal-grill-22-black-741001"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://amer.weber.com/cdn/shop/files/741043_charcoal_22in-ORIGINAL-KETTLE_b_sync.5458_rgb-1800x1800-36be017-1_sync_4d41f80a-cdec-4dd1-8892-8b7b228aa918.png?crop=center&height=630&v=1783624024&width=1200",
        "pageUrl": "https://amer.weber.com/en-us/products/original-kettle-charcoal-grill-22-black-741001",
        "credit": "© Weber"
      }
    },
    {
      "id": "oakley-holbrook",
      "category": "accessories",
      "brand": "Oakley",
      "model": "Holbrook",
      "title": "Oakley Holbrook",
      "subtitle": "Солнцезащитные очки, Prizm Sapphire Polarized",
      "price": 237,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Oakley (США)",
      "source": {
        "label": "oakley.com",
        "url": "https://www.oakley.com/en-us/product/W0OO9102?variant=888392327031"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://assets2.oakley.com/prod-onecp-record-files/pieyewear/ec63fb4b-63d9-4281-9cb5-b35f00c85274/0OO9102__9102F0__P21__shad__qt.png",
        "pageUrl": "https://www.oakley.com/en-us/product/W0OO9102?variant=888392327031",
        "credit": "© Oakley"
      }
    },
    {
      "id": "rolex-daytona-steel",
      "category": "accessories",
      "brand": "Rolex",
      "model": "Cosmograph Daytona 126500LN",
      "title": "Rolex Cosmograph Daytona 126500LN",
      "subtitle": "40 мм, сталь Oystersteel",
      "price": 16900,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная розничная цена Rolex в США",
      "source": {
        "label": "rolex.com",
        "url": "https://www.rolex.com/en-us/watches/cosmograph-daytona/m126500ln-0001"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "EPIC",
      "image": {
        "remote": "https://media.rolex.com/image/upload/q_auto/f_auto/t_v7-cover-majesty-landscape/c_limit,w_1920/v1/a677b2c664f6/catalogue/2026/upright-c/m126500ln-0001",
        "pageUrl": "https://www.rolex.com/en-us/watches/cosmograph-daytona/m126500ln-0001",
        "credit": "© Rolex"
      }
    },
    {
      "id": "rolex-oyster-perpetual-41",
      "category": "accessories",
      "brand": "Rolex",
      "model": "Oyster Perpetual 41",
      "title": "Rolex Oyster Perpetual 41",
      "subtitle": "41 мм, сталь, серебристый циферблат",
      "price": 7050,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная розничная цена Rolex в США",
      "source": {
        "label": "rolex.com",
        "url": "https://www.rolex.com/en-us/watches/oyster-perpetual/m134300-0001"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://media.rolex.com/image/upload/q_auto/f_auto/t_v7-cover-majesty-landscape/c_limit,w_1920/v1/a677b2c664f6/catalogue/2026/upright-c/m134300-0001",
        "pageUrl": "https://www.rolex.com/en-us/watches/oyster-perpetual/m134300-0001",
        "credit": "© Rolex"
      }
    },
    {
      "id": "omega-seamaster-bond",
      "category": "accessories",
      "brand": "Omega",
      "model": "Seamaster Diver 300M",
      "title": "Omega Seamaster Diver 300M",
      "subtitle": "James Bond 60th Anniversary, 42 мм, сталь",
      "price": 9400,
      "currency": "USD",
      "region": "US",
      "note": "Рекомендованная розничная цена Omega в США",
      "source": {
        "label": "omegawatches.com",
        "url": "https://www.omegawatches.com/en-us/watch-omega-seamaster-diver-300m-co-axial-master-chronometer-42-mm-21030422003002"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "RARE",
      "image": {
        "remote": "https://www.omegawatches.com/media/catalog/product/o/m/omega-seamaster-diver-300m-co-axial-master-chronometer-42-mm-21030422003002-413ac2.png?w=1024",
        "pageUrl": "https://www.omegawatches.com/en-us/watch-omega-seamaster-diver-300m-co-axial-master-chronometer-42-mm-21030422003002",
        "credit": "© Omega"
      }
    },
    {
      "id": "tiffany-t-narrow-ring",
      "category": "accessories",
      "brand": "Tiffany & Co.",
      "model": "Tiffany T Narrow Ring",
      "title": "Tiffany & Co. Tiffany T Narrow Ring",
      "subtitle": "Кольцо, жёлтое золото 18 карат",
      "price": 2500,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Tiffany (США)",
      "source": {
        "label": "tiffany.com",
        "url": "https://www.tiffany.com/jewelry/rings/tiffany-t-18k-yellow-gold-rings-1362374234.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.tiffany.com/is/image/tco/60151299_RG_MAIN1X1",
        "pageUrl": "https://www.tiffany.com/jewelry/rings/tiffany-t-18k-yellow-gold-rings-1362374234.html",
        "credit": "© Tiffany & Co."
      }
    },
    {
      "id": "dior-lip-glow",
      "category": "beauty",
      "brand": "Dior",
      "model": "Dior Addict Lip Glow",
      "title": "Dior Addict Lip Glow",
      "subtitle": "Бальзам для губ",
      "price": 42,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине Dior (США)",
      "source": {
        "label": "dior.com",
        "url": "https://www.dior.com/en_us/beauty/products/dior-addict-lip-glow-Y0457000.html"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwa7dc7034/Y0457000/Y0457000_E000000670_E01_GHC.jpg",
        "pageUrl": "https://www.dior.com/en_us/beauty/products/dior-addict-lip-glow-Y0457000.html",
        "credit": "© Dior"
      }
    },
    {
      "id": "airpods-max-2",
      "category": "tech",
      "brand": "Apple",
      "model": "AirPods Max 2",
      "title": "Apple AirPods Max 2",
      "subtitle": "Полноразмерные наушники",
      "price": 549,
      "currency": "USD",
      "region": "US",
      "note": "Фото — официальное изображение Apple со страницы AirPods Max 2",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/buy-airpods/airpods-max-2"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/og-airpods-max-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1724144125817",
        "pageUrl": "https://www.apple.com/shop/buy-airpods/airpods-max-2",
        "credit": "© Apple"
      }
    },
    {
      "id": "lego-back-to-the-future",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10300 Back to the Future Time Machine",
      "title": "LEGO Icons 10300 Back to the Future Time Machine",
      "subtitle": "Машина времени DeLorean, 1 872 детали",
      "price": 199.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/back-to-the-future-time-machine-10300"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt55fbccadb7d66885/10300.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/back-to-the-future-time-machine-10300",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-barad-dur",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10333 Barad-dûr",
      "title": "LEGO Icons 10333 Barad-dûr",
      "subtitle": "The Lord of the Rings, 5 471 деталь",
      "price": 459.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/the-lord-of-the-rings-barad-dur-10333"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt370b7e8cc1fcceb2/10333.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/the-lord-of-the-rings-barad-dur-10333",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-golden-retriever",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 11384 Golden Retriever Puppy",
      "title": "LEGO Icons 11384 Golden Retriever Puppy",
      "subtitle": "2 102 детали",
      "price": 139.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/golden-retriever-puppy-11384"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/blt22ef7be6fa023f34/blt00e69bfd89abdb56-11384_Prod_en-gb.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/golden-retriever-puppy-11384",
        "credit": "© LEGO"
      }
    },
    {
      "id": "lego-mclaren-senna",
      "category": "everyday",
      "brand": "LEGO",
      "model": "Icons 10330 McLaren MP4/4 & Ayrton Senna",
      "title": "LEGO Icons 10330 McLaren MP4/4 & Ayrton Senna",
      "subtitle": "693 детали",
      "price": 79.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине LEGO (США)",
      "source": {
        "label": "lego.com",
        "url": "https://www.lego.com/en-us/product/mclaren-mp44-ayrton-senna-10330"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://www.lego.com/cdn/cs/set/assets/bltf8476f68fa47b137/10330.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1",
        "pageUrl": "https://www.lego.com/en-us/product/mclaren-mp44-ayrton-senna-10330",
        "credit": "© LEGO"
      }
    },
    {
      "id": "ps5-disc-drive",
      "category": "gaming",
      "brand": "Sony",
      "model": "Disc Drive for PS5 Digital Edition",
      "title": "Sony Disc Drive for PS5 Digital Edition",
      "subtitle": "Съёмный дисковод",
      "price": 79,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Disc-Drive-PS5-Hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "playstation-monitor-27",
      "category": "gaming",
      "brand": "Sony",
      "model": "PlayStation 27\" Gaming Monitor",
      "title": "Sony PlayStation 27\" Gaming Monitor",
      "subtitle": "С крючком для зарядки DualSense",
      "price": 349,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/PS-Monitor-Hero-1-front-facing",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "ps-access-controller",
      "category": "gaming",
      "brand": "Sony",
      "model": "Access Controller",
      "title": "Sony Access Controller",
      "subtitle": "Адаптивный контроллер для PS5",
      "price": 89,
      "currency": "USD",
      "region": "US",
      "note": "Цена в официальном магазине PlayStation Direct (США)",
      "source": {
        "label": "direct.playstation.com",
        "url": "https://direct.playstation.com/en-us/accessories/ps5"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://media.direct.playstation.com/is/image/sierialto/Access-Controller-Front-Right-Hero-1",
        "pageUrl": "https://direct.playstation.com/en-us/accessories/ps5",
        "credit": "© Sony"
      }
    },
    {
      "id": "liquid-death-variety-12",
      "category": "food",
      "brand": "Liquid Death",
      "model": "Soda-Flavored Sparkling Water",
      "title": "Liquid Death Soda-Flavored Sparkling Water",
      "subtitle": "Вариативный набор, 12 банок по 355 мл",
      "price": 15.99,
      "currency": "USD",
      "region": "US",
      "note": "Цена разовой покупки в официальном магазине бренда (США), без подписки",
      "source": {
        "label": "liquiddeath.com",
        "url": "https://liquiddeath.com/products/soda-flavored-sparkling-water-variety-pack-12oz-12-pack"
      },
      "checkedAt": "2026-10-11",
      "status": "verified",
      "rarity": "COMMON",
      "image": {
        "remote": "https://liquiddeath.com/cdn/shop/files/LD_Flav_AmazonVarietyPack_12oz_12pkFRONT3_4FACING_1.png?v=1747166964&width=1200",
        "pageUrl": "https://liquiddeath.com/products/soda-flavored-sparkling-water-variety-pack-12oz-12-pack",
        "credit": "© Liquid Death"
      }
    },
    {
      "id": "art-salvator-mundi",
      "category": "art",
      "brand": "Леонардо да Винчи · Christie's",
      "model": "Salvator Mundi",
      "title": "Leonardo da Vinci (attributed), Salvator Mundi, c. 1500",
      "subtitle": "ок. 1500, масло на ореховой доске, 65,6×45,4 см",
      "price": 450312500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-11-15",
      "note": "Продан на торгах Christie's в Нью-Йорке 15 ноября 2017 г., цена с комиссией аукциона ($400 млн + сборы).",
      "source": {
        "label": "en.wikipedia.org — Salvator Mundi (Leonardo)",
        "url": "https://en.wikipedia.org/wiki/Salvator_Mundi_(Leonardo)"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "LEGENDARY",
      "rarityReason": "Самая дорогая картина, когда-либо проданная на аукционе; единственная работа Леонардо в частных руках.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo_da_Vinci%2C_Salvator_Mundi%2C_c.1500%2C_oil_on_walnut%2C_45.4_%C3%97_65.6_cm.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Leonardo_da_Vinci%2C_Salvator_Mundi%2C_c.1500%2C_oil_on_walnut%2C_45.4_%C3%97_65.6_cm.jpg",
        "credit": "Wikimedia Commons · Public domain (PD-Art, PD-old-100) · Leonardo da Vinci",
        "match": "exact",
        "license": "free"
      },
      "nameRu": "Леонардо да Винчи «Спаситель мира»",
      "aliases": [
        "Salvator Mundi",
        "Спаситель мира",
        "Сальватор Мунди"
      ]
    },
    {
      "id": "art-de-kooning-interchange",
      "category": "art",
      "brand": "Виллем де Кунинг · частная продажа",
      "model": "Interchange",
      "title": "Willem de Kooning, Interchange, 1955",
      "subtitle": "1955, масло на холсте, абстрактный экспрессионизм",
      "price": 300000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2015-09",
      "note": "Частная продажа в сентябре 2015 г. (Дэвид Геффен — Кеннету Гриффину), сумма около $300 млн по данным СМИ.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Одна из самых дорогих частных сделок с картиной в истории.",
      "image": null,
      "nameRu": "Виллем де Кунинг «Interchange»",
      "aliases": [
        "Interchanged",
        "Интерчейндж"
      ]
    },
    {
      "id": "art-gauguin-nafea",
      "category": "art",
      "brand": "Поль Гоген · частная продажа",
      "model": "Nafea Faa Ipoipo",
      "title": "Paul Gauguin, Nafea Faa Ipoipo (When Will You Marry?), 1892",
      "subtitle": "1892, масло на холсте, таитянский период",
      "price": 210000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2015-02",
      "note": "Частная продажа (покупатель — по данным прессы, Катар), сумма около $210 млн.",
      "source": {
        "label": "en.wikipedia.org — Nafea Faa Ipoipo",
        "url": "https://en.wikipedia.org/wiki/Nafea_Faa_Ipoipo"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Шедевр таитянского периода Гогена, одна из самых дорогих картин мира.",
      "image": null,
      "nameRu": "Поль Гоген «Когда свадьба?»",
      "aliases": [
        "When Will You Marry?",
        "Когда свадьба?",
        "Нафеа фаа ипоипо"
      ]
    },
    {
      "id": "art-klimt-elisabeth-lederer",
      "category": "art",
      "brand": "Густав Климт · Sotheby's",
      "model": "Portrait of Elisabeth Lederer",
      "title": "Gustav Klimt, Portrait of Elisabeth Lederer, 1914–1916",
      "subtitle": "1914–1916, масло на холсте, портрет в полный рост",
      "price": 236400000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-11-18",
      "note": "Продан на торгах Sotheby's в Нью-Йорке 18 ноября 2025 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Рекорд для Климта и для модернизма на аукционе; вторая по цене картина, проданная с торгов.",
      "image": null,
      "nameRu": "Густав Климт «Портрет Элизабет Ледерер»",
      "aliases": [
        "Bildnis Elisabeth Lederer",
        "Элизабет Ледерер"
      ]
    },
    {
      "id": "art-picasso-femmes-dalger",
      "category": "art",
      "brand": "Пабло Пикассо · Christie's",
      "model": "Les Femmes d'Alger (Version O)",
      "title": "Pablo Picasso, Les Femmes d'Alger (Version 'O'), 1955",
      "subtitle": "1955, масло на холсте, финальная версия серии из 15",
      "price": 179400000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2015-05-11",
      "note": "Продана на торгах Christie's в Нью-Йорке 11 мая 2015 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самая дорогая работа Пикассо, проданная на аукционе.",
      "image": null,
      "nameRu": "Пабло Пикассо «Алжирские женщины (версия O)»",
      "aliases": [
        "Women of Algiers",
        "Алжирские женщины"
      ]
    },
    {
      "id": "art-modigliani-nu-couche-2018",
      "category": "art",
      "brand": "Амедео Модильяни · Sotheby's",
      "model": "Nu couché (sur le côté gauche)",
      "title": "Amedeo Modigliani, Nu couché (sur le côté gauche), 1917",
      "subtitle": "1917, масло на холсте, 89×146 см — крупнейшая картина автора",
      "price": 157200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-05-15",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 15 мая 2018 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Крупнейшее полотно Модильяни, один из самых дорогих лотов Sotheby's.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Amedeo_Modigliani_014.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Amedeo_Modigliani_014.jpg",
        "credit": "Wikimedia Commons · Public domain (репродукция: Zenodot Verlagsgesellschaft, GFDL) · Amedeo Modigliani",
        "match": "exact",
        "license": "free"
      },
      "nameRu": "Амедео Модильяни «Лежащая обнажённая (на левом боку)»",
      "aliases": [
        "Reclining Nude (on the Left Side)",
        "Лежащая обнажённая",
        "Ню на левом боку"
      ]
    },
    {
      "id": "art-warhol-shot-sage-blue-marilyn",
      "category": "art",
      "brand": "Энди Уорхол · Christie's",
      "model": "Shot Sage Blue Marilyn",
      "title": "Andy Warhol, Shot Sage Blue Marilyn, 1964",
      "subtitle": "1964, шелкография и акрил на холсте, 101,6×101,6 см",
      "price": 195000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-05-09",
      "note": "Продана на торгах Christie's в Нью-Йорке 9 мая 2022 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самое дорогое произведение американского искусства XX века, проданное на аукционе.",
      "image": null,
      "nameRu": "Энди Уорхол «Простреленная серо-голубая Мэрилин»",
      "aliases": [
        "Shot Marilyns",
        "Мэрилин Уорхола"
      ]
    },
    {
      "id": "art-klimt-adele-bloch-bauer-i",
      "category": "art",
      "brand": "Густав Климт · частная продажа",
      "model": "Portrait of Adele Bloch-Bauer I",
      "title": "Gustav Klimt, Portrait of Adele Bloch-Bauer I, 1907",
      "subtitle": "1907, масло, золото и серебро на холсте, 138×138 см",
      "price": 135000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2006-06",
      "note": "Куплен Рональдом Лаудером в июне 2006 г. у наследников Блох-Бауэр после реституции; выставлен в Neue Galerie.",
      "source": {
        "label": "en.wikipedia.org — Portrait of Adele Bloch-Bauer I",
        "url": "https://en.wikipedia.org/wiki/Portrait_of_Adele_Bloch-Bauer_I"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "«Золотая Адель» — символ Венского модерна и громкой истории реституции.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Gustav_Klimt_046.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Gustav_Klimt_046.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "exact",
        "license": "unknown"
      },
      "nameRu": "Густав Климт «Портрет Адели Блох-Бауэр I»",
      "aliases": [
        "Golden Adele",
        "Woman in Gold",
        "Золотая Адель",
        "Дама в золоте"
      ]
    },
    {
      "id": "art-van-gogh-dr-gachet",
      "category": "art",
      "brand": "Винсент ван Гог · Christie's",
      "model": "Portrait of Dr. Gachet",
      "title": "Vincent van Gogh, Portrait of Dr. Gachet (first version), 1890",
      "subtitle": "1890, масло на холсте, первая версия, Овер-сюр-Уаз",
      "price": 82500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1990-05-15",
      "note": "Продан на торгах Christie's в Нью-Йорке 15 мая 1990 г. японцу Рёэю Сайто ($75 млн + 10% комиссии).",
      "source": {
        "label": "en.wikipedia.org — Portrait of Dr. Gachet",
        "url": "https://en.wikipedia.org/wiki/Portrait_of_Dr._Gachet"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Рекорд мирового аукционного рынка на протяжении 14 лет.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Portrait_of_Dr._Gachet.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Portrait_of_Dr._Gachet.jpg",
        "credit": "Wikimedia Commons · Public domain (PD-Art, PD-old-100) · Vincent van Gogh",
        "match": "exact",
        "license": "free"
      },
      "nameRu": "Винсент ван Гог «Портрет доктора Гаше»",
      "aliases": [
        "Dr Paul Gachet",
        "Доктор Гаше"
      ]
    },
    {
      "id": "art-munch-scream-pastel",
      "category": "art",
      "brand": "Эдвард Мунк · Sotheby's",
      "model": "The Scream (1895 pastel)",
      "title": "Edvard Munch, The Scream, 1895 pastel",
      "subtitle": "1895, пастель на картоне, единственная версия в частных руках",
      "price": 119900000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2012-05-02",
      "note": "Продан на торгах Sotheby's в Нью-Йорке 2 мая 2012 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Одна из четырёх версий «Крика» и единственная, проданная на аукционе.",
      "image": null,
      "nameRu": "Эдвард Мунк «Крик» (пастель 1895 г.)",
      "aliases": [
        "Skrik",
        "Крик"
      ]
    },
    {
      "id": "art-basquiat-untitled-1982",
      "category": "art",
      "brand": "Жан-Мишель Баския · Sotheby's",
      "model": "Untitled (Skull), 1982",
      "title": "Jean-Michel Basquiat, Untitled, 1982",
      "subtitle": "1982, акрил, баллончик, масляная пастель на холсте",
      "price": 110500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-05-18",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 18 мая 2017 г. (покупатель — Юсаку Маэдзава), цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекорд для американского художника на момент продажи.",
      "image": null,
      "nameRu": "Жан-Мишель Баския «Без названия» (череп)",
      "aliases": [
        "Basquiat skull",
        "Баския череп"
      ]
    },
    {
      "id": "art-monet-meules-1890",
      "category": "art",
      "brand": "Клод Моне · Sotheby's",
      "model": "Meules (1890)",
      "title": "Claude Monet, Meules, 1890",
      "subtitle": "1890, масло на холсте, серия «Стога»",
      "price": 110700000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-05-14",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 14 мая 2019 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекорд для Моне и импрессионизма на момент продажи.",
      "image": null,
      "nameRu": "Клод Моне «Стога»",
      "aliases": [
        "Haystacks",
        "Grainstacks",
        "Стога сена"
      ]
    },
    {
      "id": "art-klimt-lady-with-a-fan",
      "category": "art",
      "brand": "Густав Климт · Sotheby's London",
      "model": "Lady with a Fan",
      "title": "Gustav Klimt, Dame mit Fächer (Lady with a Fan), 1917–18",
      "subtitle": "1917–1918, масло на холсте, последний завершённый портрет",
      "price": 108400000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-06-27",
      "note": "Продана на торгах Sotheby's в Лондоне 27 июня 2023 г. (£85,3 млн, по данным списка Википедии — $108,4 млн).",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Поздний Климт, менее известен, чем «Поцелуй» или Адель.",
      "image": null,
      "nameRu": "Густав Климт «Дама с веером»",
      "aliases": [
        "Dame mit Fächer",
        "Дама с веером"
      ]
    },
    {
      "id": "art-hockney-portrait-of-an-artist",
      "category": "art",
      "brand": "Дэвид Хокни · Christie's",
      "model": "Portrait of an Artist (Pool…)",
      "title": "David Hockney, Portrait of an Artist (Pool with Two Figures), 1972",
      "subtitle": "1972, акрил на холсте, 214×305 см",
      "price": 90300000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-11-15",
      "note": "Продана на торгах Christie's в Нью-Йорке 15 ноября 2018 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекорд для ныне живущего художника на момент продажи.",
      "image": null,
      "nameRu": "Дэвид Хокни «Портрет художника (Бассейн с двумя фигурами)»",
      "aliases": [
        "Pool with Two Figures",
        "Бассейн с двумя фигурами"
      ]
    },
    {
      "id": "art-botticelli-young-man-roundel",
      "category": "art",
      "brand": "Сандро Боттичелли · Sotheby's",
      "model": "Young Man Holding a Roundel",
      "title": "Sandro Botticelli, Portrait of a Young Man Holding a Roundel, c. 1480",
      "subtitle": "ок. 1480, темпера на доске",
      "price": 92200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-01-21",
      "note": "Продан на торгах Sotheby's в Нью-Йорке 21 января 2021 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Редчайший портрет Боттичелли в частных руках, рекорд для старых мастеров после «Спасителя мира».",
      "image": null,
      "nameRu": "Сандро Боттичелли «Портрет юноши с медальоном»",
      "aliases": [
        "Young Man with a Roundel",
        "Юноша с медальоном"
      ]
    },
    {
      "id": "art-seurat-les-poseuses",
      "category": "art",
      "brand": "Жорж Сёра · Christie's",
      "model": "Les Poseuses, Ensemble (petite)",
      "title": "Georges Seurat, Les Poseuses, Ensemble (Petite version), 1888",
      "subtitle": "1888, масло на холсте, пуантилизм",
      "price": 149200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-11-09",
      "note": "Продана на торгах Christie's в Нью-Йорке 9 ноября 2022 г. в рамках коллекции Пола Аллена, цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекорд для Сёра; одна из главных работ распродажи коллекции Пола Аллена.",
      "image": null,
      "nameRu": "Жорж Сёра «Натурщицы» (малая версия)",
      "aliases": [
        "The Models",
        "Натурщицы"
      ]
    },
    {
      "id": "art-magritte-empire-of-light",
      "category": "art",
      "brand": "Рене Магритт · Christie's",
      "model": "L'Empire des lumières (1954)",
      "title": "René Magritte, The Empire of Light, 1954",
      "subtitle": "1954, масло на холсте, сюрреализм",
      "price": 121200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2024-11-19",
      "note": "Продана на торгах Christie's в Нью-Йорке 19 ноября 2024 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекорд для Магритта и для сюрреализма на аукционе.",
      "image": null,
      "nameRu": "Рене Магритт «Империя света»",
      "aliases": [
        "L'Empire des lumières",
        "Империя света"
      ]
    },
    {
      "id": "art-pollock-number-7a",
      "category": "art",
      "brand": "Джексон Поллок · аукцион",
      "model": "Number 7A, 1948",
      "title": "Jackson Pollock, Number 7A, 1948",
      "subtitle": "1948, дриппинг, абстрактный экспрессионизм",
      "price": 181200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2026-05-18",
      "note": "Продана на аукционе 18 мая 2026 г., цена с комиссией (по списку самых дорогих картин Википедии).",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Аукционный рекорд для Поллока.",
      "image": null,
      "nameRu": "Джексон Поллок «Номер 7A»",
      "aliases": [
        "Number 7A",
        "Номер 7А"
      ]
    },
    {
      "id": "art-malevich-suprematist-composition",
      "category": "art",
      "brand": "Казимир Малевич · Christie's",
      "model": "Suprematist Composition (1916)",
      "title": "Kazimir Malevich, Suprematist Composition, 1916",
      "subtitle": "1916, масло на холсте",
      "price": 85800000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-05-15",
      "note": "Продана на торгах Christie's в Нью-Йорке 15 мая 2018 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Важная работа, но не самая узнаваемая.",
      "image": null,
      "nameRu": "Казимир Малевич «Супрематическая композиция»",
      "aliases": [
        "Супрематизм",
        "Malevich"
      ]
    },
    {
      "id": "art-van-gogh-irises",
      "category": "art",
      "brand": "Винсент ван Гог · Sotheby's",
      "model": "Irises",
      "title": "Vincent van Gogh, Irises, 1889",
      "subtitle": "1889, масло на холсте, лечебница Сен-Реми",
      "price": 53900000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1987-11-11",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 11 ноября 1987 г., цена с комиссией; ныне в музее Гетти.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Мировой аукционный рекорд конца 1980-х годов.",
      "image": null,
      "nameRu": "Винсент ван Гог «Ирисы»",
      "aliases": [
        "Irises",
        "Ирисы"
      ]
    },
    {
      "id": "art-bacon-three-studies-freud",
      "category": "art",
      "brand": "Фрэнсис Бэкон · Christie's",
      "model": "Three Studies of Lucian Freud",
      "title": "Francis Bacon, Three Studies of Lucian Freud, 1969",
      "subtitle": "1969, триптих, масло на холсте",
      "price": 142400000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013-11-12",
      "note": "Продан на торгах Christie's в Нью-Йорке 12 ноября 2013 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive paintings",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_paintings"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "На момент продажи — самое дорогое произведение искусства, проданное на аукционе.",
      "image": null,
      "nameRu": "Фрэнсис Бэкон «Три этюда к портрету Люсьена Фрейда»",
      "aliases": [
        "Triptych Lucian Freud",
        "Три этюда Люсьена Фрейда"
      ]
    },
    {
      "id": "art-giacometti-lhomme-au-doigt",
      "category": "art",
      "brand": "Альберто Джакометти · Christie's",
      "model": "L'Homme au doigt",
      "title": "Alberto Giacometti, L'Homme au doigt (Pointing Man), 1947",
      "subtitle": "1947, бронза, высота ок. 180 см",
      "price": 141300000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2015-05-11",
      "note": "Продана на торгах Christie's в Нью-Йорке 11 мая 2015 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive sculptures",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_sculptures"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самая дорогая скульптура, когда-либо проданная на аукционе.",
      "image": null,
      "nameRu": "Альберто Джакометти «Указующий человек»",
      "aliases": [
        "Pointing Man",
        "Указующий человек",
        "Человек, указывающий пальцем"
      ]
    },
    {
      "id": "art-koons-rabbit",
      "category": "art",
      "brand": "Джефф Кунс · Christie's",
      "model": "Rabbit",
      "title": "Jeff Koons, Rabbit, 1986",
      "subtitle": "1986, нержавеющая сталь, высота 104 см, тираж 3 + AP",
      "price": 91100000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-05-15",
      "note": "Продана на торгах Christie's в Нью-Йорке 15 мая 2019 г., цена с комиссией (покупатель — Роберт Мнучин для Стивена Коэна).",
      "source": {
        "label": "en.wikipedia.org — List of most expensive sculptures",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_sculptures"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекорд для ныне живущего художника на аукционе.",
      "image": null,
      "nameRu": "Джефф Кунс «Кролик»",
      "aliases": [
        "Кролик Кунса"
      ]
    },
    {
      "id": "art-guennol-lioness",
      "category": "art",
      "brand": "Месопотамия · Sotheby's",
      "model": "Guennol Lioness",
      "title": "Guennol Lioness, Elamite limestone figure, c. 3000 BC",
      "subtitle": "ок. 3000 г. до н. э., известняк, высота 8,3 см",
      "price": 57200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2007-12-05",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 5 декабря 2007 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — Guennol Lioness",
        "url": "https://en.wikipedia.org/wiki/Guennol_Lioness"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Древняя статуэтка, мало известна широкой публике.",
      "image": null,
      "nameRu": "Львица Геннола",
      "aliases": [
        "Львица Геннол"
      ]
    },
    {
      "id": "art-beeple-everydays",
      "category": "art",
      "brand": "Beeple · Christie's",
      "model": "Everydays: The First 5000 Days",
      "title": "Beeple (Mike Winkelmann), Everydays: The First 5000 Days, NFT, 2021",
      "subtitle": "2021, цифровой коллаж из 5000 изображений (NFT)",
      "price": 69300000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-03-11",
      "note": "Продан на онлайн-торгах Christie's в марте 2021 г. покупателю MetaKovan (оплата в эфире), цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — Everydays: the First 5000 Days",
        "url": "https://en.wikipedia.org/wiki/Everydays:_the_First_5000_Days"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самый дорогой NFT, проданный крупным аукционным домом.",
      "image": null,
      "nameRu": "Бипл «Каждый день: первые 5000 дней»",
      "aliases": [
        "Beeple NFT",
        "Everydays"
      ]
    },
    {
      "id": "art-banksy-love-is-in-the-bin",
      "category": "art",
      "brand": "Бэнкси · Sotheby's London",
      "model": "Love Is in the Bin",
      "title": "Banksy, Love Is in the Bin (formerly Girl with Balloon), 2018",
      "subtitle": "2006/2018, баллончик и акрил на холсте, частично разрезан шредером",
      "price": 25327452,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-10",
      "note": "Продана на торгах Sotheby's в Лондоне в октябре 2021 г. за £18 582 000 (≈ $25,3 млн по курсу на день продажи).",
      "source": {
        "label": "en.wikipedia.org — Love Is in the Bin",
        "url": "https://en.wikipedia.org/wiki/Love_Is_in_the_Bin"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Картина, самоуничтожившаяся прямо на аукционе, — рекорд для Бэнкси.",
      "image": null,
      "nameRu": "Бэнкси «Любовь в мусорном ведре»",
      "aliases": [
        "Girl with Balloon",
        "Девочка с шаром",
        "Бэнкси шредер"
      ]
    },
    {
      "id": "col-1933-double-eagle",
      "category": "collectibles",
      "brand": "США · Sotheby's",
      "model": "1933 Double Eagle",
      "title": "1933 Saint-Gaudens $20 Double Eagle gold coin",
      "subtitle": "1933, золотая монета $20, единственный легальный экземпляр",
      "price": 18872250,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-06-08",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 8 июня 2021 г.",
      "source": {
        "label": "en.wikipedia.org — 1933 double eagle",
        "url": "https://en.wikipedia.org/wiki/1933_double_eagle"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самая дорогая монета в мире, единственный экземпляр, разрешённый к частному владению.",
      "image": null,
      "nameRu": "Двойной орёл 1933 года",
      "aliases": [
        "Double Eagle 1933",
        "Двойной орёл"
      ]
    },
    {
      "id": "col-1794-flowing-hair-dollar",
      "category": "collectibles",
      "brand": "США · Stack's Bowers",
      "model": "1794 Flowing Hair Dollar",
      "title": "1794 Flowing Hair silver dollar (finest known)",
      "subtitle": "1794, серебро, лучший известный экземпляр",
      "price": 10016875,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013-01",
      "note": "Продан на публичных торгах Stack's Bowers Galleries в январе 2013 г.",
      "source": {
        "label": "en.wikipedia.org — Flowing Hair dollar",
        "url": "https://en.wikipedia.org/wiki/Flowing_Hair_dollar"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Возможно, первый отчеканенный серебряный доллар США.",
      "image": null,
      "nameRu": "Доллар «Струящиеся волосы» 1794 года",
      "aliases": [
        "Flowing Hair dollar",
        "Первый доллар США"
      ]
    },
    {
      "id": "col-brasher-doubloon",
      "category": "collectibles",
      "brand": "США · Heritage Auctions",
      "model": "Brasher Doubloon",
      "title": "1787 Brasher Doubloon, gold",
      "subtitle": "1787, золото, частная чеканка Эфраима Брашера",
      "price": 9360000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-01",
      "note": "Продан на торгах Heritage Auctions в январе 2021 г. (около $9,36 млн).",
      "source": {
        "label": "en.wikipedia.org — Brasher Doubloon",
        "url": "https://en.wikipedia.org/wiki/Brasher_Doubloon"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Редкая монета, известна нумизматам.",
      "image": null,
      "nameRu": "Дублон Брашера",
      "aliases": [
        "Brasher Doubloon",
        "Дублон Брэшера"
      ]
    },
    {
      "id": "col-british-guiana-1c-magenta",
      "category": "collectibles",
      "brand": "Британская Гвиана · Sotheby's",
      "model": "British Guiana 1c Magenta",
      "title": "British Guiana 1c magenta stamp, 1856",
      "subtitle": "1856, марка номиналом 1 цент, единственный экземпляр",
      "price": 8307000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-06-08",
      "note": "Продана на торгах Sotheby's в Нью-Йорке 8 июня 2021 г. компании Stanley Gibbons, цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — British Guiana 1c magenta",
        "url": "https://en.wikipedia.org/wiki/British_Guiana_1c_magenta"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самая знаменитая и редкая марка мира, существует в единственном экземпляре.",
      "image": null,
      "nameRu": "Британская Гвиана 1 цент, пурпурная",
      "aliases": [
        "1c Magenta",
        "Британская Гвиана",
        "Розовая гвиана"
      ]
    },
    {
      "id": "col-inverted-jenny",
      "category": "collectibles",
      "brand": "США · Robert A. Siegel",
      "model": "Inverted Jenny",
      "title": "Inverted Jenny 24c airmail stamp, 1918 (single)",
      "subtitle": "1918, авиапочтовая марка 24 цента с перевёрнутым самолётом",
      "price": 2006000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-11-11",
      "note": "Одиночная марка продана на торгах Robert A. Siegel 11 ноября 2023 г. ($1,7 млн молоток + 18% комиссии) — рекорд для одной марки этого типа.",
      "source": {
        "label": "en.wikipedia.org — Inverted Jenny",
        "url": "https://en.wikipedia.org/wiki/Inverted_Jenny"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Знаменитая ошибка печати, известен всего один лист из 100 марок.",
      "image": null,
      "nameRu": "Перевёрнутая Дженни",
      "aliases": [
        "Перевернутая Дженни",
        "Inverted Jenny stamp"
      ]
    },
    {
      "id": "col-1952-topps-mantle",
      "category": "collectibles",
      "brand": "Topps · Heritage Auctions",
      "model": "1952 Topps Mickey Mantle SGC 9.5",
      "title": "1952 Topps #311 Mickey Mantle, SGC MT 9.5",
      "subtitle": "1952, бейсбольная карточка, грейд SGC 9.5",
      "price": 12600000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-08-28",
      "note": "Продана на торгах Heritage Auctions 28 августа 2022 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive sports cards",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_sports_cards"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самая дорогая спортивная карточка из когда-либо проданных на аукционе.",
      "image": null,
      "nameRu": "Карточка Микки Мэнтла Topps 1952",
      "aliases": [
        "Mickey Mantle card",
        "Микки Мэнтл"
      ]
    },
    {
      "id": "col-t206-honus-wagner",
      "category": "collectibles",
      "brand": "American Tobacco · частная продажа",
      "model": "T206 Honus Wagner SGC 2",
      "title": "1909–11 T206 Honus Wagner, SGC 2",
      "subtitle": "1909–1911, табачная бейсбольная карточка, грейд SGC 2",
      "price": 7250000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2022-08",
      "note": "Частная продажа в августе 2022 г. (при посредничестве Goldin), рекорд для этой карточки.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive sports cards",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_sports_cards"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "«Мона Лиза» коллекционных карточек: известно лишь около 60 экземпляров.",
      "image": null,
      "nameRu": "Карточка Хонуса Вагнера T206",
      "aliases": [
        "Honus Wagner",
        "Хонус Вагнер"
      ]
    },
    {
      "id": "col-action-comics-1",
      "category": "collectibles",
      "brand": "DC · частная продажа",
      "model": "Action Comics #1 CGC 9.0",
      "title": "Action Comics #1 (1938), CGC 9.0",
      "subtitle": "1938, первое появление Супермена, грейд CGC 9.0",
      "price": 15000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2026-01",
      "note": "Частная сделка, раскрытая 9 января 2026 г. (Metropolis Collectibles и ComicConnect), покупатель и продавец анонимны.",
      "source": {
        "label": "en.wikipedia.org — Action Comics 1",
        "url": "https://en.wikipedia.org/wiki/Action_Comics_1"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Первый выпуск с Суперменом — самый дорогой комикс в мире.",
      "image": null,
      "nameRu": "Action Comics №1",
      "aliases": [
        "Action Comics 1",
        "Первый Супермен"
      ]
    },
    {
      "id": "col-superman-1",
      "category": "collectibles",
      "brand": "DC · аукцион",
      "model": "Superman #1 (1939)",
      "title": "Superman #1 (1939)",
      "subtitle": "1939, первый сольный выпуск Супермена",
      "price": 9120000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-11",
      "note": "Продан на аукционе в ноябре 2025 г. (по списку самых дорогих книг и рукописей Википедии).",
      "source": {
        "label": "en.wikipedia.org — List of most expensive books and manuscripts",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_books_and_manuscripts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Редкий комикс, второй по значимости после Action Comics #1.",
      "image": null,
      "nameRu": "Superman №1",
      "aliases": [
        "Superman 1",
        "Супермен №1"
      ]
    },
    {
      "id": "col-stan-t-rex",
      "category": "collectibles",
      "brand": "Палеонтология · Christie's",
      "model": "Stan the T. rex",
      "title": "Stan (BHI 3033), Tyrannosaurus rex skeleton",
      "subtitle": "~67 млн лет, скелет T. rex, около 70% костей, Южная Дакота",
      "price": 31800000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2020-10-06",
      "note": "Продан на вечерних торгах Christie's в Нью-Йорке 6 октября 2020 г. анонимному покупателю.",
      "source": {
        "label": "en.wikipedia.org — Stan (dinosaur)",
        "url": "https://en.wikipedia.org/wiki/Stan_(dinosaur)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из самых полных скелетов тираннозавра, рекорд для окаменелостей на момент продажи.",
      "image": null,
      "nameRu": "Тираннозавр Стэн",
      "aliases": [
        "Stan",
        "BHI 3033",
        "Стэн"
      ]
    },
    {
      "id": "col-apex-stegosaurus",
      "category": "collectibles",
      "brand": "Палеонтология · Sotheby's",
      "model": "Apex the Stegosaurus",
      "title": "Apex, Stegosaurus skeleton",
      "subtitle": "~150 млн лет, скелет стегозавра, 254 кости, Колорадо",
      "price": 44600000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2024-07-17",
      "note": "Продан на торгах Sotheby's в Нью-Йорке 17 июля 2024 г. Кеннету Гриффину.",
      "source": {
        "label": "en.wikipedia.org — Apex (dinosaur)",
        "url": "https://en.wikipedia.org/wiki/Apex_(dinosaur)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самая дорогая окаменелость, когда-либо проданная на аукционе.",
      "image": null,
      "nameRu": "Стегозавр Апекс",
      "aliases": [
        "Apex",
        "Апекс",
        "Stegosaurus Apex"
      ]
    },
    {
      "id": "col-sue-t-rex",
      "category": "collectibles",
      "brand": "Палеонтология · Sotheby's",
      "model": "Sue the T. rex",
      "title": "Sue (FMNH PR 2081), Tyrannosaurus rex skeleton",
      "subtitle": "~67 млн лет, ~90% скелета, крупнейший T. rex",
      "price": 8362500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1997-10-04",
      "note": "Продан на торгах Sotheby's 4 октября 1997 г. Филдовскому музею в Чикаго.",
      "source": {
        "label": "en.wikipedia.org — Sue (dinosaur)",
        "url": "https://en.wikipedia.org/wiki/Sue_(dinosaur)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самый полный и крупный найденный скелет тираннозавра.",
      "image": null,
      "nameRu": "Тираннозавр Сью",
      "aliases": [
        "Sue",
        "FMNH PR 2081",
        "Сью"
      ]
    },
    {
      "id": "col-codex-leicester",
      "category": "collectibles",
      "brand": "Леонардо да Винчи · Christie's",
      "model": "Codex Leicester",
      "title": "Leonardo da Vinci, Codex Leicester",
      "subtitle": "1506–1510, 72 страницы записей и рисунков",
      "price": 30802500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1994-11-11",
      "note": "Продан на торгах Christie's в Нью-Йорке 11 ноября 1994 г. Биллу Гейтсу.",
      "source": {
        "label": "en.wikipedia.org — Codex Leicester",
        "url": "https://en.wikipedia.org/wiki/Codex_Leicester"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Единственная научная рукопись Леонардо в частных руках.",
      "image": null,
      "nameRu": "Лестерский кодекс Леонардо да Винчи",
      "aliases": [
        "Codex Hammer",
        "Кодекс Хаммера",
        "Лестерский кодекс"
      ]
    },
    {
      "id": "col-us-constitution-first-printing",
      "category": "collectibles",
      "brand": "США · Sotheby's",
      "model": "US Constitution, first printing",
      "title": "US Constitution, first printing (1787)",
      "subtitle": "1787, один из немногих сохранившихся оттисков",
      "price": 43200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-11",
      "note": "Продан на торгах Sotheby's в ноябре 2021 г. Кеннету Гриффину.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive books and manuscripts",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_books_and_manuscripts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самая дорогая книга или печатный документ, когда-либо проданный на аукционе.",
      "image": null,
      "nameRu": "Конституция США, первый тираж",
      "aliases": [
        "Конституция США",
        "Constitution first printing"
      ]
    },
    {
      "id": "col-codex-sassoon",
      "category": "collectibles",
      "brand": "Еврейская Библия · Sotheby's",
      "model": "Codex Sassoon",
      "title": "Codex Sassoon 1053, Hebrew Bible",
      "subtitle": "конец IX века, древнейшая почти полная еврейская Библия",
      "price": 38100000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-05",
      "note": "Продан на торгах Sotheby's в мае 2023 г.; приобретён Альфредом Мозесом для музея ANU в Тель-Авиве.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive books and manuscripts",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_books_and_manuscripts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Древнейшая почти полная рукопись еврейской Библии.",
      "image": null,
      "nameRu": "Кодекс Сассуна",
      "aliases": [
        "Sassoon Codex",
        "Кодекс Сассун"
      ]
    },
    {
      "id": "col-magna-carta-1297",
      "category": "collectibles",
      "brand": "Англия · Sotheby's",
      "model": "Magna Carta (1297 copy)",
      "title": "Magna Carta, 1297 exemplification",
      "subtitle": "1297, пергамент, одна из оригинальных копий",
      "price": 21320000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2007-12",
      "note": "Продана на торгах Sotheby's в Нью-Йорке в декабре 2007 г. Дэвиду Рубенстайну.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive books and manuscripts",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_books_and_manuscripts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из немногих подлинных экземпляров Хартии, выставлен в Национальном архиве США.",
      "image": null,
      "nameRu": "Великая хартия вольностей, экземпляр 1297 г.",
      "aliases": [
        "Magna Carta",
        "Великая хартия вольностей"
      ]
    },
    {
      "id": "col-shakespeare-first-folio",
      "category": "collectibles",
      "brand": "Шекспир · Christie's",
      "model": "Shakespeare First Folio",
      "title": "William Shakespeare, First Folio (1623)",
      "subtitle": "1623, первое собрание пьес Шекспира",
      "price": 9980000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2020-10",
      "note": "Продано на торгах Christie's в октябре 2020 г. дилеру Стефану Лёвентайлю.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive books and manuscripts",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_books_and_manuscripts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самая дорогая литературная книга на аукционе на момент продажи.",
      "image": null,
      "nameRu": "Первое фолио Шекспира",
      "aliases": [
        "First Folio",
        "Первое фолио"
      ]
    },
    {
      "id": "col-gutenberg-bible-doheny",
      "category": "collectibles",
      "brand": "Гутенберг · Christie's",
      "model": "Gutenberg Bible (Doheny copy)",
      "title": "Gutenberg Bible, Doheny copy (vol. 1)",
      "subtitle": "1450–1455, первая книга, напечатанная подвижными литерами",
      "price": 5390000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1987-10",
      "note": "Продана в октябре 1987 г. японскому книжному дому Maruzen.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive books and manuscripts",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_books_and_manuscripts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Первая крупная печатная книга Европы, сохранилось менее 50 экземпляров.",
      "image": null,
      "nameRu": "Библия Гутенберга (экземпляр Дохени)",
      "aliases": [
        "Gutenberg Bible",
        "Библия Гутенберга"
      ]
    },
    {
      "id": "col-ruby-slippers-2024",
      "category": "collectibles",
      "brand": "«Волшебник страны Оз» · Heritage",
      "model": "Ruby Slippers (stolen pair)",
      "title": "Dorothy's ruby slippers from The Wizard of Oz (1939)",
      "subtitle": "1939, реквизит из фильма; пара, украденная в 2005 г.",
      "price": 32500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2024-12-07",
      "note": "Проданы на торгах Heritage Auctions 7 декабря 2024 г. ($28 млн молоток, $32,5 млн с комиссией).",
      "source": {
        "label": "en.wikipedia.org — Ruby slippers",
        "url": "https://en.wikipedia.org/wiki/Ruby_slippers"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самый дорогой предмет кинореквизита, проданный на аукционе.",
      "image": null,
      "nameRu": "Рубиновые туфельки Дороти",
      "aliases": [
        "Ruby slippers",
        "Рубиновые башмачки",
        "Волшебник Оз туфли"
      ]
    },
    {
      "id": "col-gilmour-black-strat",
      "category": "collectibles",
      "brand": "Fender · Christie's",
      "model": "David Gilmour's Black Strat",
      "title": "David Gilmour's 1969 Fender Stratocaster 'The Black Strat'",
      "subtitle": "1969 Fender Stratocaster, гитара Pink Floyd",
      "price": 3975000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-06",
      "note": "Продана на благотворительных торгах Christie's в июне 2019 г. Джиму Ирсею.",
      "source": {
        "label": "en.wikipedia.org — The Black Strat",
        "url": "https://en.wikipedia.org/wiki/The_Black_Strat"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Гитара знаменитости, известна фанатам.",
      "image": null,
      "nameRu": "Чёрный «Страт» Дэвида Гилмора",
      "aliases": [
        "Black Strat",
        "Гилмор Стратокастер"
      ]
    },
    {
      "id": "col-cobain-martin-d18e",
      "category": "collectibles",
      "brand": "Martin · Julien's (Беверли-Хиллз)",
      "model": "Kurt Cobain's Martin D-18E",
      "title": "Kurt Cobain's 1959 Martin D-18E acoustic-electric guitar",
      "subtitle": "1959 Martin D-18E, концерт MTV Unplugged 1993",
      "price": 6100000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2020-06",
      "note": "Продана на аукционе в Беверли-Хиллз в июне 2020 г. ($5 млн молоток, $6,1 млн с комиссией).",
      "source": {
        "label": "en.wikipedia.org — The Black Strat",
        "url": "https://en.wikipedia.org/wiki/The_Black_Strat"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Одна из самых дорогих гитар, проданных на аукционе.",
      "image": null,
      "nameRu": "Гитара Курта Кобейна Martin D-18E",
      "aliases": [
        "MTV Unplugged guitar",
        "Кобейн гитара"
      ]
    },
    {
      "id": "col-babe-ruth-called-shot-jersey",
      "category": "collectibles",
      "brand": "Бейсбол · Heritage Auctions",
      "model": "Babe Ruth 'Called Shot' Jersey",
      "title": "Babe Ruth's jersey from the 1932 World Series 'called shot' game",
      "subtitle": "1932, игровая форма New York Yankees, Мировая серия",
      "price": 24120000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2024-08-25",
      "note": "Продана через Heritage Auctions 25 августа 2024 г. (около $24,12 млн) — рекорд для спортивного предмета.",
      "source": {
        "label": "en.wikipedia.org — Babe Ruth's called shot",
        "url": "https://en.wikipedia.org/wiki/Babe_Ruth%27s_called_shot"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самый дорогой спортивный артефакт, когда-либо проданный на аукционе.",
      "image": null,
      "nameRu": "Джерси Бейба Рута из матча «заказанный хоум-ран»",
      "aliases": [
        "Called Shot jersey",
        "Бейб Рут джерси"
      ]
    },
    {
      "id": "col-maradona-hand-of-god-shirt",
      "category": "collectibles",
      "brand": "Футбол · Sotheby's",
      "model": "Maradona 'Hand of God' Shirt",
      "title": "Diego Maradona's shirt, Argentina v England, 1986 World Cup",
      "subtitle": "1986, матч Аргентина — Англия, ЧМ в Мексике",
      "price": 9200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-05-04",
      "note": "Продана на торгах Sotheby's 4 мая 2022 г. за £7 142 500 (≈ $9,2 млн).",
      "source": {
        "label": "en.wikipedia.org — Argentina v England (1986 FIFA World Cup)",
        "url": "https://en.wikipedia.org/wiki/Argentina_v_England_(1986_FIFA_World_Cup)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Рекордный лот среди футбольных реликвий.",
      "image": null,
      "nameRu": "Футболка Марадоны «Рука Бога»",
      "aliases": [
        "Hand of God shirt",
        "Рука Бога футболка"
      ]
    },
    {
      "id": "col-apple-1-bonhams-2014",
      "category": "collectibles",
      "brand": "Apple · Bonhams",
      "model": "Apple-1 (Henry Ford copy)",
      "title": "Apple-1 computer, working unit with keyboard and monitor",
      "subtitle": "1976, ручная сборка Возняка; с клавиатурой, монитором, мануалом",
      "price": 905000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2014-10",
      "note": "Продан на торгах Bonhams в октябре 2014 г.; приобретён Музеем Генри Форда.",
      "source": {
        "label": "en.wikipedia.org — Apple I",
        "url": "https://en.wikipedia.org/wiki/Apple_I"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Один из нескольких десятков сохранившихся Apple-1.",
      "image": null,
      "nameRu": "Компьютер Apple-1",
      "aliases": [
        "Apple I",
        "Эппл-1"
      ]
    },
    {
      "id": "col-jane-birkin-original-bag",
      "category": "collectibles",
      "brand": "Hermès · Sotheby's Paris",
      "model": "Jane Birkin's Original Birkin",
      "title": "The original Hermès Birkin bag made for Jane Birkin",
      "subtitle": "1985, чёрная кожа, первый прототип сумки Birkin",
      "price": 10100000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-07",
      "note": "Продана на аукционе в Париже в июле 2025 г. за €8,6 млн (≈ $10,1 млн по данным Википедии).",
      "source": {
        "label": "en.wikipedia.org — Birkin bag",
        "url": "https://en.wikipedia.org/wiki/Birkin_bag"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Первая сумка Birkin — рекорд для модного аксессуара на аукционе в Европе.",
      "image": null,
      "nameRu": "Оригинальная сумка Birkin Джейн Биркин",
      "aliases": [
        "Original Birkin",
        "Биркин Джейн Биркин"
      ]
    },
    {
      "id": "car-mercedes-300-slr-uhlenhaut",
      "category": "cars",
      "brand": "Mercedes-Benz",
      "model": "300 SLR Uhlenhaut Coupé",
      "title": "1955 Mercedes-Benz 300 SLR Uhlenhaut Coupé",
      "subtitle": "1955, рядная 8-ка 3.0 л, шасси 196.110-00008/55",
      "price": 143000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-05-05",
      "note": "Продан на аукционе RM Sotheby's (закрытый аукцион в музее Mercedes-Benz, Штутгарт); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "LEGENDARY",
      "rarityReason": "Один из двух построенных экземпляров и самая дорогая машина, когда-либо проданная на аукционе.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz_300_SLR_Uhlenhaut-Coupe_IMG_0874.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_300_SLR_Uhlenhaut-Coupe_IMG_0874.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Mercedes-Benz 300 SLR «Уленхаут-купе»",
      "aliases": [
        "300 SLR Uhlenhaut",
        "Уленхаут купе"
      ]
    },
    {
      "id": "car-mercedes-w196r-stromlinienwagen",
      "category": "cars",
      "brand": "Mercedes-Benz",
      "model": "W196 R Stromlinienwagen",
      "title": "1954 Mercedes-Benz W196 R Stromlinienwagen",
      "subtitle": "1954, гоночный болид F1 с обтекаемым кузовом, шасси 00009/54",
      "price": 53917370,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-02-01",
      "note": "Продан на аукционе RM Sotheby's в Штутгарте; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "LEGENDARY",
      "rarityReason": "Обтекаемый болид Формулы-1 эпохи Фанхио и Мосса, мировой рекорд для гоночного автомобиля.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz_W196R_streamliner_front_Mercedes-Benz_Museum.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Mercedes-Benz_W196R_streamliner_front_Mercedes-Benz_Museum.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Mercedes-Benz W196 R «Штромлиненваген»",
      "aliases": [
        "W196 Streamliner",
        "Stromlinienwagen"
      ]
    },
    {
      "id": "car-ferrari-330-lm-250-gto-3765lm",
      "category": "cars",
      "brand": "Ferrari",
      "model": "330 LM / 250 GTO #3765LM",
      "title": "1962 Ferrari 330 LM / 250 GTO, s/n 3765LM",
      "subtitle": "1962, V12 4.0 л, шасси 3765LM, заводская машина Ле-Мана",
      "price": 51705000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-11-13",
      "note": "Продан на аукционе RM Sotheby's в Нью-Йорке; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Единственный 250 GTO с 4-литровым мотором, гонявшийся за заводскую команду; рекорд для Ferrari.",
      "image": null,
      "nameRu": "Ferrari 330 LM / 250 GTO",
      "aliases": [
        "330 LM GTO",
        "Ferrari 3765LM"
      ]
    },
    {
      "id": "car-ferrari-250-gto-3413gt",
      "category": "cars",
      "brand": "Ferrari",
      "model": "250 GTO #3413GT",
      "title": "1962 Ferrari 250 GTO, s/n 3413GT",
      "subtitle": "1962, V12 3.0 л, шасси 3413GT, один из 36 экземпляров",
      "price": 48405000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-08-26",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "LEGENDARY",
      "rarityReason": "Исторический лот: на момент продажи — самая дорогая машина в истории аукционов.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Ferrari_250_GTO_3413GT_at_RM_Sothebys_Auction_Monterey_2018.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Ferrari_250_GTO_3413GT_at_RM_Sothebys_Auction_Monterey_2018.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "exact",
        "license": "unknown"
      },
      "nameRu": "Ferrari 250 GTO",
      "aliases": [
        "250 GTO 3413",
        "Феррари 250 ГТО"
      ]
    },
    {
      "id": "car-ferrari-250-lm-5893",
      "category": "cars",
      "brand": "Ferrari",
      "model": "250 LM #5893",
      "title": "1964 Ferrari 250 LM, s/n 5893",
      "subtitle": "1964, среднемоторный V12 3.3 л, шасси 5893",
      "price": 36344960,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-02-05",
      "note": "Продан на аукционе RM Sotheby's в Париже; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Одна из 32 построенных гоночных 250 LM.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Ferrari_250_LM_5893_at_RMMR_2022.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Ferrari_250_LM_5893_at_RMMR_2022.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "exact",
        "license": "unknown"
      },
      "nameRu": "Ferrari 250 LM",
      "aliases": [
        "Ferrari 250LM"
      ]
    },
    {
      "id": "car-ferrari-335-s",
      "category": "cars",
      "brand": "Ferrari",
      "model": "335 S Scaglietti",
      "title": "1957 Ferrari 335 Sport Scaglietti, s/n 0674",
      "subtitle": "1957, гоночный спайдер V12 4.0 л, шасси 0674",
      "price": 35730510,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2016-02",
      "note": "Продан на аукционе Artcurial на Rétromobile в Париже; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Важный, но малоизвестный широкой публике гоночный Ferrari 1950-х.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/1957-05-08_Modena_Ferrari_335_Enzo_Collins.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:1957-05-08_Modena_Ferrari_335_Enzo_Collins.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Ferrari 335 S",
      "aliases": [
        "335 Sport",
        "Ferrari 335S"
      ]
    },
    {
      "id": "car-ferrari-412p",
      "category": "cars",
      "brand": "Ferrari",
      "model": "412 P",
      "title": "1967 Ferrari 412 P, s/n 0854",
      "subtitle": "1967, спортпрототип V12 4.0 л, шасси 0854",
      "price": 30255000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-08-18",
      "note": "Продан на аукционе Bonhams в Кармеле (Калифорния); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Редкий гоночный прототип, известен в основном знатокам.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/1967_Ferrari_412_P_no_0850%2C_front_left.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:1967_Ferrari_412_P_no_0850%2C_front_left.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Ferrari 412 P",
      "aliases": [
        "412P",
        "330 P3/412P"
      ]
    },
    {
      "id": "car-mercedes-w196-fangio",
      "category": "cars",
      "brand": "Mercedes-Benz",
      "model": "W196 (Fangio)",
      "title": "1954 Mercedes-Benz W196, chassis 00006/54",
      "subtitle": "1954, открытый болид F1, шасси 196 010 00006/54",
      "price": 29600000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013-07-12",
      "note": "Продан на аукционе Bonhams на фестивале скорости в Гудвуде; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Болид, на котором Фанхио выиграл Гран-при и титул чемпиона мира 1954 года.",
      "image": null,
      "nameRu": "Mercedes-Benz W196 Фанхио",
      "aliases": [
        "W196 Monoposto"
      ]
    },
    {
      "id": "car-ferrari-275-gtb4-nart-spider",
      "category": "cars",
      "brand": "Ferrari",
      "model": "275 GTB/4*S NART Spider",
      "title": "1967 Ferrari 275 GTB/4*S N.A.R.T. Spider, s/n 10709",
      "subtitle": "1967, V12 3.3 л, шасси 10709",
      "price": 27500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013-08-17",
      "note": "Продан на аукционе RM Auctions в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Одна из 10 построенных машин серии NART Spider.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/1967.Ferrari.275.GTB-4.NART.Spyder.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:1967.Ferrari.275.GTB-4.NART.Spyder.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Ferrari 275 GTB/4 NART Spider",
      "aliases": [
        "NART Spyder",
        "275 GTS/4 NART"
      ]
    },
    {
      "id": "car-aston-martin-dbr1-1",
      "category": "cars",
      "brand": "Aston Martin",
      "model": "DBR1/1",
      "title": "1956 Aston Martin DBR1, chassis DBR1/1",
      "subtitle": "1956, гоночный спайдер, шасси DBR1/1",
      "price": 22550000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-08-19",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Первый из пяти DBR1 — самый дорогой британский автомобиль на аукционе на момент продажи.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Carroll_Shelby_Aston_Martin_DBR1.JPG?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Carroll_Shelby_Aston_Martin_DBR1.JPG",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "exact",
        "license": "unknown"
      },
      "nameRu": "Aston Martin DBR1",
      "aliases": [
        "DBR1"
      ]
    },
    {
      "id": "car-duesenberg-ssj",
      "category": "cars",
      "brand": "Duesenberg",
      "model": "SSJ",
      "title": "1935 Duesenberg SSJ, chassis 2594",
      "subtitle": "1935, рядная 8-ка с нагнетателем, шасси 2594",
      "price": 22000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-08-25",
      "note": "Продан на аукционе Gooding & Company в Пеббл-Бич; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Довоенный американский люкс, известен коллекционерам.",
      "image": null,
      "nameRu": "Duesenberg SSJ",
      "aliases": [
        "Duesenberg SSJ Gary Cooper"
      ]
    },
    {
      "id": "car-jaguar-d-type-xkd501",
      "category": "cars",
      "brand": "Jaguar",
      "model": "D-Type XKD 501",
      "title": "1955 Jaguar D-Type, chassis XKD 501",
      "subtitle": "1955, рядная 6-ка 3.4 л, шасси XKD 501",
      "price": 21780000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2016-08-19",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Победитель Ле-Мана, но имя шасси мало что говорит широкой публике.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/1956_JAGUAR_D-TYPE_XKD_606%2C1957_LE_MANS_WINNER_photo_4.JPG?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:1956_JAGUAR_D-TYPE_XKD_606%2C1957_LE_MANS_WINNER_photo_4.JPG",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Jaguar D-Type",
      "aliases": [
        "D-Type",
        "Ягуар Д-тайп"
      ]
    },
    {
      "id": "car-mclaren-f1-029",
      "category": "cars",
      "brand": "McLaren",
      "model": "F1 #029",
      "title": "1995 McLaren F1, chassis 029",
      "subtitle": "1995, V12 BMW 6.1 л, шасси 029",
      "price": 20465000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-08-14",
      "note": "Продан на аукционе Gooding & Company в Пеббл-Бич; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из 64 дорожных McLaren F1 с почти нулевым пробегом.",
      "image": null,
      "nameRu": "McLaren F1",
      "aliases": [
        "McLaren F1 029"
      ]
    },
    {
      "id": "car-alfa-8c-2900b-lungo-spider",
      "category": "cars",
      "brand": "Alfa Romeo",
      "model": "8C 2900B Lungo Spider",
      "title": "1939 Alfa Romeo 8C 2900B Lungo Spider by Touring",
      "subtitle": "1939, рядная 8-ка 2.9 л с двумя компрессорами, шасси 412041",
      "price": 19800000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2016-08-20",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Довоенная Alfa Romeo — сокровище для знатоков.",
      "image": null,
      "nameRu": "Alfa Romeo 8C 2900B Lungo Spider",
      "aliases": [
        "8C 2900B"
      ]
    },
    {
      "id": "car-aston-martin-db4-gt-zagato",
      "category": "cars",
      "brand": "Aston Martin",
      "model": "DB4 GT Zagato",
      "title": "1962 Aston Martin DB4 GT Zagato, DB4GT/0186/R",
      "subtitle": "1962, рядная 6-ка 3.7 л, шасси DB4GT/0186/R",
      "price": 14300000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2015-12-10",
      "note": "Продан на аукционе RM Sotheby's в Нью-Йорке; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Малосерийный Aston Martin, известен коллекционерам.",
      "image": null,
      "nameRu": "Aston Martin DB4 GT Zagato",
      "aliases": [
        "DB4GTZ"
      ]
    },
    {
      "id": "car-porsche-917k-le-mans",
      "category": "cars",
      "brand": "Porsche",
      "model": "917K (Le Mans film)",
      "title": "1970 Porsche 917K, chassis 917-024",
      "subtitle": "1970, оппозитный 12-цилиндровый, шасси 917-024",
      "price": 14080000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-08-19",
      "note": "Продан на аукционе Gooding & Company в Пеббл-Бич; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Машина снималась в фильме Стива Маккуина «Ле-Ман» (1971); рекорд для Porsche на момент продажи.",
      "image": null,
      "nameRu": "Porsche 917K из фильма «Ле-Ман»",
      "aliases": [
        "917 K",
        "Steve McQueen Le Mans 917"
      ]
    },
    {
      "id": "car-shelby-cobra-csx2000",
      "category": "cars",
      "brand": "Shelby",
      "model": "Cobra CSX2000",
      "title": "1962 Shelby 260 Cobra, chassis CSX 2000",
      "subtitle": "1962, V8 Ford 260, первый построенный Cobra",
      "price": 13750000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2016-08-19",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самый первый Shelby Cobra, личная машина Кэрролла Шелби — уникальный экземпляр.",
      "image": null,
      "nameRu": "Shelby Cobra CSX2000",
      "aliases": [
        "CSX 2000",
        "Кобра"
      ]
    },
    {
      "id": "car-talbot-lago-t150c-ss",
      "category": "cars",
      "brand": "Talbot-Lago",
      "model": "T150-C SS Teardrop",
      "title": "1937 Talbot-Lago T150-C SS Figoni et Falaschi, chassis 90107",
      "subtitle": "1937, кузов Figoni et Falaschi, шасси 90107",
      "price": 13425000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-03-05",
      "note": "Продан на аукционе Gooding & Company на Амелия-Айленд; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Красивый довоенный кузов, но малоизвестная марка.",
      "image": null,
      "nameRu": "Talbot-Lago T150-C SS «Капля»",
      "aliases": [
        "Talbot Lago Teardrop",
        "Goutte d'Eau"
      ]
    },
    {
      "id": "car-jaguar-xkss-707",
      "category": "cars",
      "brand": "Jaguar",
      "model": "XKSS #707",
      "title": "1957 Jaguar XKSS, chassis XKSS 707",
      "subtitle": "1957, рядная 6-ка 3.4 л, шасси XKSS 707",
      "price": 13205000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-08-18",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Один из немногих XKSS — редкость для знатоков.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/1957_Jaguar_XK-SS.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:1957_Jaguar_XK-SS.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Jaguar XKSS",
      "aliases": [
        "XK-SS"
      ]
    },
    {
      "id": "car-ford-gt40-p1074",
      "category": "cars",
      "brand": "Ford",
      "model": "GT40 P/1074 (Gulf)",
      "title": "1968 Ford GT40 Gulf/Mirage, chassis P/1074",
      "subtitle": "1968, V8, шасси P/1074, машина-камера фильма «Ле-Ман»",
      "price": 11000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2012-08-17",
      "note": "Продан на аукционе RM Auctions в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Гоночный GT40 в ливрее Gulf, служивший машиной-камерой на съёмках фильма «Ле-Ман».",
      "image": null,
      "nameRu": "Ford GT40 Gulf/Mirage",
      "aliases": [
        "GT40 Gulf",
        "GT 40"
      ]
    },
    {
      "id": "car-ferrari-f40-lm",
      "category": "cars",
      "brand": "Ferrari",
      "model": "F40 LM",
      "title": "1993 Ferrari F40 LM, chassis 95448",
      "subtitle": "1993, V8 битурбо, шасси 95448",
      "price": 11005000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-08-16",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Гоночная версия F40, известна в основном фанатам.",
      "image": null,
      "nameRu": "Ferrari F40 LM",
      "aliases": [
        "F40LM"
      ]
    },
    {
      "id": "car-bugatti-chiron-profilee",
      "category": "cars",
      "brand": "Bugatti",
      "model": "Chiron Profilée",
      "title": "2022 Bugatti Chiron Profilée",
      "subtitle": "2022, W16 8.0 л, 1500 л.с., единственный экземпляр",
      "price": 10608215,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-01-31",
      "note": "Продан на аукционе RM Sotheby's в Париже; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Единичная версия Chiron, но сама модель хорошо знакома.",
      "image": null,
      "nameRu": "Bugatti Chiron Profilée",
      "aliases": [
        "Chiron Profilee"
      ]
    },
    {
      "id": "car-mercedes-clk-gtr-roadster",
      "category": "cars",
      "brand": "Mercedes-Benz",
      "model": "CLK GTR Roadster",
      "title": "2002 Mercedes-Benz CLK GTR Roadster, chassis 000034",
      "subtitle": "2002, V12 6.9 л, шасси 000034",
      "price": 10235000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-11-17",
      "note": "Продан на аукционе RM Sotheby's в Лас-Вегасе; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Малосерийный омологационный суперкар.",
      "image": null,
      "nameRu": "Mercedes-Benz CLK GTR Roadster",
      "aliases": [
        "CLK-GTR"
      ]
    },
    {
      "id": "car-bugatti-royale-kellner",
      "category": "cars",
      "brand": "Bugatti",
      "model": "Type 41 Royale Kellner",
      "title": "1931 Bugatti Type 41 Royale Kellner Coupé, chassis 41.141",
      "subtitle": "1931, рядная 8-ка 12.7 л, шасси 41.141",
      "price": 9800000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1987-11-17",
      "note": "Продан на аукционе Christie's в Лондоне; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Одна из шести построенных Bugatti Royale — один из самых громких лотов 1980-х.",
      "image": null,
      "nameRu": "Bugatti Royale Kellner",
      "aliases": [
        "Type 41",
        "Бугатти Рояль"
      ]
    },
    {
      "id": "car-mercedes-300sl-alloy-gullwing",
      "category": "cars",
      "brand": "Mercedes-Benz",
      "model": "300 SL Alloy Gullwing",
      "title": "1956 Mercedes-Benz 300 SL 'Alloy' Gullwing",
      "subtitle": "1956, рядная 6-ка 3.0 л, алюминиевый кузов",
      "price": 9355000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2024-10-26",
      "note": "Продан на аукционе RM Sotheby's в Лос-Анджелесе; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Редкая алюминиевая версия известной модели.",
      "image": null,
      "nameRu": "Mercedes-Benz 300 SL «Крыло чайки» с алюминиевым кузовом",
      "aliases": [
        "300SL Gullwing alloy",
        "Гулвинг"
      ]
    },
    {
      "id": "car-bugatti-divo",
      "category": "cars",
      "brand": "Bugatti",
      "model": "Divo",
      "title": "2020 Bugatti Divo",
      "subtitle": "2020, W16 8.0 л, 1500 л.с., один из 40",
      "price": 8557500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-08-15",
      "note": "Продан на аукционе Bonhams в Кармеле (Калифорния); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серия из 40 машин, современный гиперкар.",
      "image": null,
      "nameRu": "Bugatti Divo",
      "aliases": [
        "Диво"
      ]
    },
    {
      "id": "car-jaguar-e-type-lightweight",
      "category": "cars",
      "brand": "Jaguar",
      "model": "E-Type Lightweight",
      "title": "1963 Jaguar E-Type Lightweight, chassis S850664",
      "subtitle": "1963, рядная 6-ка 3.8 л, алюминиевый кузов",
      "price": 8000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-08-18",
      "note": "Продан на аукционе Bonhams в Кармеле (Калифорния); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Гоночная версия известной модели.",
      "image": null,
      "nameRu": "Jaguar E-Type Lightweight",
      "aliases": [
        "E-Type Lightweight"
      ]
    },
    {
      "id": "car-shelby-daytona-coupe-csx2601",
      "category": "cars",
      "brand": "Shelby",
      "model": "Cobra Daytona Coupe",
      "title": "1965 Shelby Cobra Daytona Coupe, chassis CSX2601",
      "subtitle": "1965, V8 Ford 289, шасси CSX2601",
      "price": 7685000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2009-08-15",
      "note": "Продан на аукционе Mecum в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Гоночное купе, известно в основном фанатам.",
      "image": null,
      "nameRu": "Shelby Cobra Daytona Coupe",
      "aliases": [
        "Daytona Coupe"
      ]
    },
    {
      "id": "car-rolls-royce-10hp-1904",
      "category": "cars",
      "brand": "Rolls-Royce",
      "model": "10 hp (1904)",
      "title": "1904 Rolls-Royce 10 hp Two-Seater, chassis 20154",
      "subtitle": "1904, двухцилиндровый 1.8 л, шасси 20154",
      "price": 7254290,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2007-12-03",
      "note": "Продан на аукционе Bonhams в Лондоне; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Один из первых Rolls-Royce — история, но не хит узнаваемости.",
      "image": null,
      "nameRu": "Rolls-Royce 10 hp 1904 года",
      "aliases": [
        "Rolls-Royce 10hp"
      ]
    },
    {
      "id": "car-aston-martin-db5-bond",
      "category": "cars",
      "brand": "Aston Martin",
      "model": "DB5 James Bond",
      "title": "1965 Aston Martin DB5 'James Bond' Thunderball promotional car, DB5/2008/R",
      "subtitle": "1964/65, рядная 6-ка 4.0 л, шпионские гаджеты, DB5/2008/R",
      "price": 6385000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-08-15",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Одна из машин, оснащённых гаджетами для промо фильмов о Бонде.",
      "image": null,
      "nameRu": "Aston Martin DB5 Джеймса Бонда",
      "aliases": [
        "DB5 Bond car",
        "Астон Мартин Бонда"
      ]
    },
    {
      "id": "car-porsche-911-gt1-strassenversion",
      "category": "cars",
      "brand": "Porsche",
      "model": "911 GT1 Straßenversion",
      "title": "1998 Porsche 911 GT1 Straßenversion",
      "subtitle": "1998, оппозитная 6-ка битурбо 3.2 л, омологационная серия",
      "price": 5665000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-03-10",
      "note": "Продан на аукционе Gooding & Company на Амелия-Айленд; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Омологационная версия, известна фанатам.",
      "image": null,
      "nameRu": "Porsche 911 GT1 Strassenversion",
      "aliases": [
        "911 GT1 Evo road",
        "GT1 Strassenversion"
      ]
    },
    {
      "id": "car-pagani-zonda-r-revolucion",
      "category": "cars",
      "brand": "Pagani",
      "model": "Zonda R Revolución",
      "title": "2010 Pagani Zonda Revolución",
      "subtitle": "трековый гиперкар, V12 AMG 6.0 л, экземпляр №5",
      "price": 5340000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-03-04",
      "note": "Продан на аукционе RM Sotheby's на Амелия-Айленд; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Трековая Zonda малой серии.",
      "image": null,
      "nameRu": "Pagani Zonda Revolución",
      "aliases": [
        "Zonda Revolucion"
      ]
    },
    {
      "id": "car-maserati-mc12-stradale",
      "category": "cars",
      "brand": "Maserati",
      "model": "MC12 Stradale",
      "title": "2005 Maserati MC12 Stradale",
      "subtitle": "2005, V12 6.0 л, один из 50 дорожных",
      "price": 5202500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-08-14",
      "note": "Продан на аукционе Broad Arrow в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серия около 50 машин.",
      "image": null,
      "nameRu": "Maserati MC12",
      "aliases": [
        "MC12"
      ]
    },
    {
      "id": "car-batmobile-1966",
      "category": "cars",
      "brand": "Barris / Warner Bros.",
      "model": "Batmobile (1966 TV)",
      "title": "1966 Batmobile, George Barris, #1",
      "subtitle": "на базе концепта Lincoln Futura 1955, оригинал из сериала «Бэтмен»",
      "price": 4620000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013-01-19",
      "note": "Продан на аукционе Barrett-Jackson в Скоттсдейле (Аризона); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Единственный оригинальный Бэтмобиль из телесериала 1966 года.",
      "image": null,
      "nameRu": "Бэтмобиль 1966 года",
      "aliases": [
        "Batmobile",
        "Бэтмобиль",
        "Lincoln Futura"
      ]
    },
    {
      "id": "car-gm-futurliner",
      "category": "cars",
      "brand": "General Motors",
      "model": "Futurliner #11",
      "title": "1950 GM Futurliner, #011",
      "subtitle": "1950, автобус-выставка «Parade of Progress», экземпляр №11",
      "price": 4320000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2006-01-21",
      "note": "Продан на аукционе Barrett-Jackson в Скоттсдейле (Аризона); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Необычный автобус-выставка, но малоизвестен.",
      "image": null,
      "nameRu": "GM Futurliner",
      "aliases": [
        "Futurliner"
      ]
    },
    {
      "id": "car-ruf-ctr-yellowbird",
      "category": "cars",
      "brand": "RUF",
      "model": "CTR Yellowbird Lightweight",
      "title": "1989 RUF CTR 'Yellowbird' Lightweight",
      "subtitle": "1989, оппозитная 6-ка битурбо 3.4 л, облегчённая версия",
      "price": 4295000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-08-16",
      "note": "Продан на аукционе RM Sotheby's в Монтерее; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Культовая для фанатов, малоизвестна широкой публике.",
      "image": null,
      "nameRu": "RUF CTR «Жёлтая птица»",
      "aliases": [
        "Yellowbird",
        "RUF CTR1"
      ]
    },
    {
      "id": "car-de-dion-la-marquise",
      "category": "cars",
      "brand": "De Dion, Bouton et Trépardoux",
      "model": "La Marquise (1884)",
      "title": "1884 De Dion, Bouton et Trépardoux Dos-à-Dos Steam Runabout 'La Marquise'",
      "subtitle": "1884, паровой двигатель, старейший ходовой автомобиль",
      "price": 4620000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2011-10-07",
      "note": "Продан на аукционе RM Auctions в Херши (Пенсильвания); номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Старейший ходовой автомобиль — диковинка для знатоков.",
      "image": null,
      "nameRu": "Паровой автомобиль De Dion «Ла Маркиз»",
      "aliases": [
        "La Marquise"
      ]
    },
    {
      "id": "car-ford-mustang-bullitt",
      "category": "cars",
      "brand": "Ford",
      "model": "Mustang GT «Bullitt»",
      "title": "1968 Ford Mustang GT 390 'Bullitt' (Steve McQueen hero car)",
      "subtitle": "1968, V8 390, оригинальная «геройская» машина Стива Маккуина",
      "price": 3740000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2020-01-10",
      "note": "Продан на аукционе Mecum в Киссимми (Флорида) в январе 2020 г.; рекорд для Mustang.",
      "source": {
        "label": "jalopnik.com",
        "url": "https://jalopnik.com/the-mustang-from-bullitt-sells-for-3-74-million-at-a-1840937700"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Одна из двух машин, построенных для съёмок «Буллитта», — самый дорогой Mustang в истории.",
      "image": null,
      "nameRu": "Ford Mustang из фильма «Буллитт»",
      "aliases": [
        "Bullitt Mustang",
        "Буллит Мустанг"
      ]
    },
    {
      "id": "car-porsche-911-turbo-s-2026",
      "category": "cars",
      "brand": "Porsche",
      "model": "911 Turbo S (992.2)",
      "title": "2026 Porsche 911 Turbo S Coupe",
      "subtitle": "2026 г., гибрид T-Hybrid 3.6 л, 701 л.с., купе",
      "price": 272650,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая цена (MSRP) купе в США, включая доставку, по данным Road & Track (перепубликация AOL).",
      "source": {
        "label": "aol.com / Road & Track",
        "url": "https://www.aol.com/finance/2026-porsche-911-turbo-701-130000178.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Порше 911 Турбо С",
      "aliases": [
        "911 Turbo S T-Hybrid",
        "Порше 911 Турбо S"
      ]
    },
    {
      "id": "car-rolls-royce-spectre-2026",
      "category": "cars",
      "brand": "Rolls-Royce",
      "model": "Spectre",
      "title": "2026 Rolls-Royce Spectre",
      "subtitle": "2026 г., электрокупе, 2 электромотора",
      "price": 397750,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/rolls-royce/spectre/2026/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Роллс-Ройс Спектр",
      "aliases": [
        "Роллс-Ройс Спектр",
        "RR Spectre"
      ]
    },
    {
      "id": "car-ferrari-12cilindri-2025",
      "category": "cars",
      "brand": "Ferrari",
      "model": "12Cilindri",
      "title": "2025 Ferrari 12Cilindri",
      "subtitle": "2025 г., V12 6.5 л, 830 л.с., купе",
      "price": 472000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/ferrari/12-cilindri/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Феррари 12Чилиндри",
      "aliases": [
        "Ferrari 12 Cilindri",
        "Феррари Додичи Чилиндри"
      ]
    },
    {
      "id": "car-lamborghini-revuelto-2026",
      "category": "cars",
      "brand": "Lamborghini",
      "model": "Revuelto",
      "title": "2026 Lamborghini Revuelto",
      "subtitle": "2026 г., гибрид V12 6.5 л, 1015 л.с.",
      "price": 673294,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/lamborghini/revuelto/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Ламборгини Ревуэльто",
      "aliases": [
        "Ламборгини Ревуэльто"
      ]
    },
    {
      "id": "car-rolls-royce-cullinan-2027",
      "category": "cars",
      "brand": "Rolls-Royce",
      "model": "Cullinan Series II",
      "title": "2027 Rolls-Royce Cullinan Series II",
      "subtitle": "2027 г., V12 6.75 л битурбо, внедорожник",
      "price": 442750,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2027",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/rolls-royce/cullinan/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Роллс-Ройс Куллинан",
      "aliases": [
        "Роллс-Ройс Каллинан",
        "Cullinan"
      ]
    },
    {
      "id": "car-rolls-royce-phantom-2027",
      "category": "cars",
      "brand": "Rolls-Royce",
      "model": "Phantom",
      "title": "2027 Rolls-Royce Phantom",
      "subtitle": "2027 г., V12 6.75 л битурбо, седан",
      "price": 560350,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2027",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/rolls-royce/phantom/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Роллс-Ройс Фантом",
      "aliases": [
        "Роллс-Ройс Фантом VIII"
      ]
    },
    {
      "id": "car-corvette-z06-2027",
      "category": "cars",
      "brand": "Chevrolet",
      "model": "Corvette Z06 (C8)",
      "title": "2027 Chevrolet Corvette Z06",
      "subtitle": "2027 г., V8 5.5 л атмосферный, 670 л.с.",
      "price": 121395,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2027",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/chevrolet/corvette/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Шевроле Корвет Z06",
      "aliases": [
        "Корвет Z06",
        "C8 Z06"
      ]
    },
    {
      "id": "car-corvette-zr1-2027",
      "category": "cars",
      "brand": "Chevrolet",
      "model": "Corvette ZR1 (C8)",
      "title": "2027 Chevrolet Corvette ZR1",
      "subtitle": "2027 г., V8 5.5 л битурбо, 1064 л.с.",
      "price": 197195,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2027",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/chevrolet/corvette/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Шевроле Корвет ZR1",
      "aliases": [
        "Корвет ZR1",
        "C8 ZR1"
      ]
    },
    {
      "id": "car-mclaren-750s-2027",
      "category": "cars",
      "brand": "McLaren",
      "model": "750S",
      "title": "2027 McLaren 750S",
      "subtitle": "2027 г., V8 4.0 л битурбо, 750 л.с.",
      "price": 375500,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2027",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/mclaren/750s/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Макларен 750S",
      "aliases": [
        "Макларен 750С"
      ]
    },
    {
      "id": "car-ferrari-296-gtb-2026",
      "category": "cars",
      "brand": "Ferrari",
      "model": "296 GTB",
      "title": "2026 Ferrari 296 GTB",
      "subtitle": "2026 г., гибрид V6 3.0 л, 830 л.с.",
      "price": 338250,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/ferrari/296-gtb/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Феррари 296 GTB",
      "aliases": [
        "Феррари 296"
      ]
    },
    {
      "id": "car-bentley-continental-gt-2025",
      "category": "cars",
      "brand": "Bentley",
      "model": "Continental GT (4th gen)",
      "title": "2025 Bentley Continental GT",
      "subtitle": "2025 г., гибрид V8 4.0 л, купе 4-го поколения",
      "price": 296950,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book (младшая версия в прайсе KBB); без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/bentley/continental-gt/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Бентли Континентал GT",
      "aliases": [
        "Бентли Континенталь"
      ]
    },
    {
      "id": "car-mustang-dark-horse-sc-2026",
      "category": "cars",
      "brand": "Ford",
      "model": "Mustang Dark Horse SC",
      "title": "2026 Ford Mustang Dark Horse SC",
      "subtitle": "2026 г., V8 5.2 л с компрессором",
      "price": 108485,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/ford/mustang/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Форд Мустанг Дарк Хорс SC",
      "aliases": [
        "Мустанг Dark Horse SC"
      ]
    },
    {
      "id": "car-rivian-r1s-2027",
      "category": "cars",
      "brand": "Rivian",
      "model": "R1S",
      "title": "2027 Rivian R1S Premium",
      "subtitle": "2027 г., электрический 7-местный внедорожник",
      "price": 85885,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2027",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/rivian/r1s/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Ривиан R1S",
      "aliases": [
        "Ривиан Р1С"
      ]
    },
    {
      "id": "car-lotus-emira-2026",
      "category": "cars",
      "brand": "Lotus",
      "model": "Emira",
      "title": "2026 Lotus Emira Turbo SE",
      "subtitle": "2026 г., 2.0 л турбо, среднемоторное купе",
      "price": 109400,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/lotus/emira/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Лотус Эмира",
      "aliases": [
        "Лотус Эмайра"
      ]
    },
    {
      "id": "car-aston-martin-db12-2025",
      "category": "cars",
      "brand": "Aston Martin",
      "model": "DB12",
      "title": "2025 Aston Martin DB12 Coupe",
      "subtitle": "2025 г., V8 4.0 л битурбо, 680 л.с.",
      "price": 249000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/aston-martin/db12/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Астон Мартин DB12",
      "aliases": [
        "Астон Мартин ДБ12"
      ]
    },
    {
      "id": "car-gmc-hummer-ev-2026",
      "category": "cars",
      "brand": "GMC",
      "model": "Hummer EV Pickup",
      "title": "2026 GMC Hummer EV Pickup 2X",
      "subtitle": "2026 г., электропикап, 2 мотора",
      "price": 99895,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/gmc/hummer-ev/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Хаммер EV",
      "aliases": [
        "GMC Hummer EV",
        "Хаммер электрический"
      ]
    },
    {
      "id": "car-toyota-gr-supra-2026",
      "category": "cars",
      "brand": "Toyota",
      "model": "GR Supra (A90)",
      "title": "2026 Toyota GR Supra 3.0",
      "subtitle": "2026 г., рядная 6 3.0 л турбо, 5-е поколение",
      "price": 59495,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/toyota/gr-supra/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Тойота GR Супра",
      "aliases": [
        "Supra A90",
        "Супра MkV"
      ]
    },
    {
      "id": "car-lamborghini-temerario-2026",
      "category": "cars",
      "brand": "Lamborghini",
      "model": "Temerario",
      "title": "2026 Lamborghini Temerario",
      "subtitle": "2026 г., гибрид V8 4.0 л битурбо, 920 л.с.",
      "price": 386649,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/lamborghini/temerario/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Ламборгини Темерарио",
      "aliases": [
        "Ламборгини Темерарио"
      ]
    },
    {
      "id": "car-ferrari-purosangue-2025",
      "category": "cars",
      "brand": "Ferrari",
      "model": "Purosangue",
      "title": "2025 Ferrari Purosangue",
      "subtitle": "2025 г., V12 6.5 л, 4 двери",
      "price": 438686,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/ferrari/purosangue/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Феррари Пуросангве",
      "aliases": [
        "Феррари Пуросанге"
      ]
    },
    {
      "id": "car-aston-martin-vanquish-2026",
      "category": "cars",
      "brand": "Aston Martin",
      "model": "Vanquish",
      "title": "2026 Aston Martin Vanquish",
      "subtitle": "2026 г., V12 5.2 л битурбо, 824 л.с.",
      "price": 465300,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Стартовая рекомендованная цена (MSRP) в США по данным Kelley Blue Book; без опций.",
      "source": {
        "label": "kbb.com (Kelley Blue Book)",
        "url": "https://www.kbb.com/aston-martin/vanquish/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, которую можно заказать у дилера.",
      "image": null,
      "nameRu": "Астон Мартин Вэнквиш",
      "aliases": [
        "Астон Мартин Ванквиш"
      ]
    },
    {
      "id": "car-mercedes-amg-one",
      "category": "cars",
      "brand": "Mercedes-AMG",
      "model": "ONE",
      "title": "Mercedes-AMG One",
      "subtitle": "2022–2025, гибрид с мотором Формулы-1 1.6 л V6, 275 шт.",
      "price": 2720000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2017",
      "note": "Заявленная цена за экземпляр — $2,72 млн по данным Википедии (объявлена при анонсе Project One).",
      "source": {
        "label": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Mercedes-AMG_One"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серия 275 машин, гиперкар с мотором Формулы-1.",
      "image": null,
      "nameRu": "Мерседес-AMG ONE",
      "aliases": [
        "AMG Project One",
        "Мерседес АМГ Уан"
      ]
    },
    {
      "id": "car-pagani-utopia",
      "category": "cars",
      "brand": "Pagani",
      "model": "Utopia Coupe",
      "title": "Pagani Utopia Coupe",
      "subtitle": "2024 г., V12 6.0 л AMG битурбо, механика, 99 шт.",
      "price": 2190000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024",
      "note": "Стартовая цена купе Utopia модельного 2024 года по данным Википедии.",
      "source": {
        "label": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Pagani_Utopia"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Всего 99 купе, все распроданы заранее.",
      "image": null,
      "nameRu": "Пагани Утопия",
      "aliases": [
        "Пагани Утопия"
      ]
    },
    {
      "id": "car-ferrari-f40",
      "category": "cars",
      "brand": "Ferrari",
      "model": "F40",
      "title": "Ferrari F40 (1987–1992)",
      "subtitle": "1987–1992, V8 2.9 л битурбо, 478 л.с.",
      "price": 3640400,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ferrari/f40/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серия 1315 машин, регулярно продаются на рынке коллекционных авто.",
      "image": null,
      "nameRu": "Феррари F40",
      "aliases": [
        "Феррари Ф40"
      ]
    },
    {
      "id": "car-porsche-959",
      "category": "cars",
      "brand": "Porsche",
      "model": "959",
      "title": "Porsche 959 (1986–1993)",
      "subtitle": "1986–1993, оппозитная 6 2.85 л битурбо, полный привод",
      "price": 2669339,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/porsche/959/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Около 300 машин, продаются на рынке коллекционных авто.",
      "image": null,
      "nameRu": "Порше 959",
      "aliases": [
        "Порше 959"
      ]
    },
    {
      "id": "car-toyota-2000gt",
      "category": "cars",
      "brand": "Toyota",
      "model": "2000GT",
      "title": "Toyota 2000GT (1967–1970)",
      "subtitle": "1967–1970, рядная 6 2.0 л, купе",
      "price": 1043461,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/toyota/2000gt/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "351 машина, редкая японская классика с рынка.",
      "image": null,
      "nameRu": "Тойота 2000GT",
      "aliases": [
        "Тойота 2000 ГТ"
      ]
    },
    {
      "id": "car-bmw-m1",
      "category": "cars",
      "brand": "BMW",
      "model": "M1 (E26)",
      "title": "BMW M1 road car (1978–1981)",
      "subtitle": "1978–1981, рядная 6 3.5 л, дорожная версия",
      "price": 586872,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/bmw/m1/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "453 машины, коллекционная классика.",
      "image": null,
      "nameRu": "БМВ M1",
      "aliases": [
        "BMW M1 E26",
        "БМВ М1"
      ]
    },
    {
      "id": "car-nissan-skyline-r34-gt-r-vspec",
      "category": "cars",
      "brand": "Nissan",
      "model": "Skyline GT-R R34 V-Spec",
      "title": "Nissan Skyline GT-R (R34) V-Spec",
      "subtitle": "1999–2000, RB26DETT 2.6 л битурбо, V-Spec I",
      "price": 194547,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/nissan/skyline/r34/gt-r/v-spec-i/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Культовая японская модель, регулярно продаётся на аукционах коллекционерам.",
      "image": null,
      "nameRu": "Ниссан Скайлайн GT-R R34 V-Spec",
      "aliases": [
        "R34 GT-R",
        "Скайлайн Р34"
      ]
    },
    {
      "id": "car-toyota-supra-a80-turbo",
      "category": "cars",
      "brand": "Toyota",
      "model": "Supra Turbo (A80)",
      "title": "Toyota Supra Twin Turbo (A80, US spec)",
      "subtitle": "1993–1998, 2JZ-GTE 3.0 л битурбо, американская версия",
      "price": 107458,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/toyota/supra/4th-gen/twin-turbo-us-ca-spec/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Культовая модель 90-х, цены сильно выросли.",
      "image": null,
      "nameRu": "Тойота Супра A80 Турбо",
      "aliases": [
        "Supra MkIV",
        "Супра Mk4"
      ]
    },
    {
      "id": "car-mazda-rx-7-fd",
      "category": "cars",
      "brand": "Mazda",
      "model": "RX-7 (FD)",
      "title": "Mazda RX-7 (FD, US base)",
      "subtitle": "1993–1995, роторный 13B 1.3 л битурбо",
      "price": 40758,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/mazda/rx-7/3rd-gen/base-model/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Коллекционная классика с роторным мотором.",
      "image": null,
      "nameRu": "Мазда RX-7 FD",
      "aliases": [
        "RX-7 FD3S",
        "Мазда РХ-7"
      ]
    },
    {
      "id": "car-acura-nsx-na1",
      "category": "cars",
      "brand": "Acura",
      "model": "NSX (NA1) Coupe",
      "title": "Acura NSX NA1 Coupe (1991–1994)",
      "subtitle": "1991–1994, V6 3.0 л, среднемоторное купе",
      "price": 84843,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/acura/nsx/1st-gen/na1/coupe/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Коллекционная классика, регулярно торгуется.",
      "image": null,
      "nameRu": "Акура NSX NA1",
      "aliases": [
        "Honda NSX NA1",
        "Хонда NSX"
      ]
    },
    {
      "id": "car-lamborghini-countach-lp400",
      "category": "cars",
      "brand": "Lamborghini",
      "model": "Countach LP400",
      "title": "Lamborghini Countach LP400 (1974–1978)",
      "subtitle": "1974–1978, V12 3.9 л, ранняя «перископная» версия",
      "price": 891662,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/lamborghini/countach/lp400/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Ранний Countach, коллекционная классика с рынка.",
      "image": null,
      "nameRu": "Ламборгини Каунтач LP400",
      "aliases": [
        "Countach Periscopio",
        "Ламборгини Countach"
      ]
    },
    {
      "id": "car-lamborghini-diablo",
      "category": "cars",
      "brand": "Lamborghini",
      "model": "Diablo",
      "title": "Lamborghini Diablo (base model)",
      "subtitle": "1990–1998, V12 5.7 л, базовая заднеприводная версия",
      "price": 315802,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/lamborghini/diablo/base-model/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Коллекционный суперкар 90-х.",
      "image": null,
      "nameRu": "Ламборгини Диабло",
      "aliases": [
        "Ламборгини Дьябло"
      ]
    },
    {
      "id": "car-ferrari-testarossa",
      "category": "cars",
      "brand": "Ferrari",
      "model": "Testarossa",
      "title": "Ferrari Testarossa (1984–1991)",
      "subtitle": "1984–1991, оппозитный 12 цилиндров 4.9 л",
      "price": 178073,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ferrari/testarossa/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Коллекционная классика 80-х, около 7000 штук.",
      "image": null,
      "nameRu": "Феррари Тестаросса",
      "aliases": [
        "Феррари Тестаросса"
      ]
    },
    {
      "id": "car-delorean-dmc-12",
      "category": "cars",
      "brand": "DeLorean",
      "model": "DMC-12",
      "title": "DeLorean DMC-12 (manual)",
      "subtitle": "1981–1983, V6 2.85 л, кузов из нержавеющей стали",
      "price": 63878,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/delorean/dmc-12/manual/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Культовая машина из «Назад в будущее», около 9000 штук.",
      "image": null,
      "nameRu": "Делориан DMC-12",
      "aliases": [
        "Делореан",
        "DeLorean"
      ]
    },
    {
      "id": "car-jaguar-e-type-s1-roadster",
      "category": "cars",
      "brand": "Jaguar",
      "model": "E-Type Series 1 Roadster",
      "title": "Jaguar E-Type Series 1 Roadster",
      "subtitle": "1962–1968, рядная 6 3.8/4.2 л, родстер",
      "price": 120219,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/jaguar/e-type/series-1/roadster/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Коллекционная классика, регулярно продаётся на аукционах.",
      "image": null,
      "nameRu": "Ягуар E-Type Series 1 родстер",
      "aliases": [
        "Jaguar XK-E",
        "Ягуар Е-Тайп"
      ]
    },
    {
      "id": "car-lancia-delta-integrale-evo-ii",
      "category": "cars",
      "brand": "Lancia",
      "model": "Delta HF Integrale Evo II",
      "title": "Lancia Delta HF Integrale Evoluzione II",
      "subtitle": "1993–1995, 2.0 л турбо, полный привод",
      "price": 108892,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/lancia/delta/1st-gen/hf-integrale-evo-ii/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Омологационная легенда ралли, около 2500 штук.",
      "image": null,
      "nameRu": "Лянча Дельта Интеграле Эво II",
      "aliases": [
        "Lancia Delta Evo 2",
        "Лянча Дельта"
      ]
    },
    {
      "id": "car-ford-gt-2005",
      "category": "cars",
      "brand": "Ford",
      "model": "GT (2005–2006)",
      "title": "Ford GT (1st gen, 2005–2006)",
      "subtitle": "2005–2006, V8 5.4 л с компрессором",
      "price": 485787,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ford/gt/1st-gen/base-model/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Около 4000 экземпляров, современная классика.",
      "image": null,
      "nameRu": "Форд GT 2005",
      "aliases": [
        "Ford GT 1st gen",
        "Форд ГТ"
      ]
    },
    {
      "id": "car-ford-gt-2017",
      "category": "cars",
      "brand": "Ford",
      "model": "GT (2017–2022)",
      "title": "Ford GT (2nd gen, base model)",
      "subtitle": "2017–2021, V6 3.5 л EcoBoost битурбо, карбон",
      "price": 880901,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ford/gt/2nd-gen/base-model/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Около 1350 экземпляров, продавались по заявкам.",
      "image": null,
      "nameRu": "Форд GT 2017",
      "aliases": [
        "Ford GT 2nd gen",
        "Форд ГТ второго поколения"
      ]
    },
    {
      "id": "car-lexus-lfa",
      "category": "cars",
      "brand": "Lexus",
      "model": "LFA",
      "title": "Lexus LFA (base)",
      "subtitle": "2010–2012, V10 4.8 л, 560 л.с., 500 шт.",
      "price": 880529,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/lexus/lfa/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Выпущено всего 500 экземпляров.",
      "image": null,
      "nameRu": "Лексус LFA",
      "aliases": [
        "Лексус ЛФА"
      ]
    },
    {
      "id": "car-ferrari-enzo",
      "category": "cars",
      "brand": "Ferrari",
      "model": "Enzo",
      "title": "Ferrari Enzo (2002–2004)",
      "subtitle": "2002–2004, V12 6.0 л, 660 л.с.",
      "price": 8093268,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ferrari/enzo/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "400 машин, регулярно продаются на рынке.",
      "image": null,
      "nameRu": "Феррари Энцо",
      "aliases": [
        "Энцо Феррари"
      ]
    },
    {
      "id": "car-ferrari-laferrari",
      "category": "cars",
      "brand": "Ferrari",
      "model": "LaFerrari",
      "title": "Ferrari LaFerrari Coupe",
      "subtitle": "2013–2016, гибрид V12 6.3 л, 963 л.с.",
      "price": 5104861,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ferrari/laferrari/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "500 купе, регулярно продаются на рынке.",
      "image": null,
      "nameRu": "Феррари ЛаФеррари",
      "aliases": [
        "ЛаФеррари"
      ]
    },
    {
      "id": "car-ferrari-f50",
      "category": "cars",
      "brand": "Ferrari",
      "model": "F50",
      "title": "Ferrari F50 (1995–1997)",
      "subtitle": "1995–1997, V12 4.7 л, 520 л.с.",
      "price": 8039743,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ferrari/f50/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "349 машин, продаются на рынке.",
      "image": null,
      "nameRu": "Феррари F50",
      "aliases": [
        "Феррари Ф50"
      ]
    },
    {
      "id": "car-lamborghini-miura-p400s",
      "category": "cars",
      "brand": "Lamborghini",
      "model": "Miura P400 S",
      "title": "Lamborghini Miura P400 S",
      "subtitle": "1968–1971, V12 3.9 л поперечно, 370 л.с.",
      "price": 2150532,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/lamborghini/miura/p400s/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Культовая классика, но не уникальный экземпляр.",
      "image": null,
      "nameRu": "Ламборгини Миура P400 S",
      "aliases": [
        "Ламборгини Миура"
      ]
    },
    {
      "id": "car-bugatti-veyron-164",
      "category": "cars",
      "brand": "Bugatti",
      "model": "Veyron 16.4",
      "title": "Bugatti Veyron EB 16.4",
      "subtitle": "2006–2011, W16 8.0 л, 4 турбины, 1001 л.с.",
      "price": 1958258,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/bugatti/veyron/eb-164/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Около 300 купе, регулярно появляются на рынке.",
      "image": null,
      "nameRu": "Бугатти Вейрон 16.4",
      "aliases": [
        "Бугатти Вейрон"
      ]
    },
    {
      "id": "car-bmw-z8",
      "category": "cars",
      "brand": "BMW",
      "model": "Z8 (E52)",
      "title": "BMW Z8 (2000–2003)",
      "subtitle": "2000–2003, V8 4.9 л S62, родстер",
      "price": 205356,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/bmw/z8/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Около 5700 экземпляров, коллекционная модель.",
      "image": null,
      "nameRu": "БМВ Z8",
      "aliases": [
        "BMW E52",
        "БМВ З8"
      ]
    },
    {
      "id": "car-ferrari-288-gto",
      "category": "cars",
      "brand": "Ferrari",
      "model": "288 GTO",
      "title": "Ferrari 288 GTO (1984–1987)",
      "subtitle": "1984–1987, V8 2.9 л битурбо, 400 л.с.",
      "price": 7799629,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/ferrari/288-gto/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "272 машины, коллекционная классика.",
      "image": null,
      "nameRu": "Феррари 288 GTO",
      "aliases": [
        "Феррари 288 ГТО"
      ]
    },
    {
      "id": "car-bmw-750il-e38",
      "category": "cars",
      "brand": "BMW",
      "model": "750iL (E38)",
      "title": "BMW 750iL (E38)",
      "subtitle": "1995–2001, V12 5.4 л, удлинённый седан",
      "price": 19200,
      "currency": "USD",
      "region": "US",
      "priceType": "used_market",
      "priceDate": "2026-10",
      "note": "Типичная рыночная стоимость (CLASSIC.COM Market Benchmark) по продажам на аукционах, не MSRP; данные на октябрь 2026 г.",
      "source": {
        "label": "classic.com (CLASSIC.COM Market Benchmark)",
        "url": "https://www.classic.com/m/bmw/7-series/e38/750il/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Культовый седан 90-х, востребован у коллекционеров.",
      "image": null,
      "nameRu": "БМВ 750iL E38",
      "aliases": [
        "БМВ 7 E38",
        "Бумер"
      ]
    },
    {
      "id": "jw-patek-grandmaster-chime-6300a",
      "category": "jewelry",
      "brand": "Patek Philippe · Christie's",
      "model": "Grandmaster Chime 6300A-010",
      "title": "Patek Philippe Grandmaster Chime Ref. 6300A-010 (Only Watch 2019)",
      "subtitle": "2019, единственный экземпляр в стали",
      "price": 31000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-11-09",
      "note": "Продан на благотворительном аукционе Only Watch (Christie's, Женева) в ноябре 2019 г.; мировой рекорд для наручных часов.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Уникальный стальной экземпляр и самые дорогие наручные часы, когда-либо проданные на аукционе.",
      "image": null,
      "nameRu": "Patek Philippe Grandmaster Chime 6300A",
      "aliases": [
        "Grandmaster Chime",
        "6300A",
        "Гранд Мастер Чайм"
      ]
    },
    {
      "id": "jw-henry-graves-supercomplication",
      "category": "jewelry",
      "brand": "Patek Philippe · Sotheby's",
      "model": "Henry Graves Supercomplication",
      "title": "Patek Philippe Henry Graves Supercomplication pocket watch",
      "subtitle": "Золотые карманные часы, 24 усложнения",
      "price": 23983000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2014-11-11",
      "note": "Продан на аукционе Sotheby's в Женеве 11 ноября 2014 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Уникальные карманные часы, десятилетиями бывшие самым сложным механическим хронометром в мире.",
      "image": null,
      "nameRu": "Суперусложнение Генри Грейвса",
      "aliases": [
        "Graves Supercomplication",
        "Суперкомпликация Грейвса"
      ]
    },
    {
      "id": "jw-paul-newman-daytona-6239",
      "category": "jewelry",
      "brand": "Rolex · Phillips",
      "model": "Paul Newman's Daytona 6239",
      "title": "Paul Newman's own Rolex Cosmograph Daytona Ref. 6239",
      "subtitle": "Сталь, личные часы актёра",
      "price": 17753000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-10-26",
      "note": "Личные часы Пола Ньюмана, проданы на аукционе Phillips в Нью-Йорке в октябре 2017 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самый знаменитый Rolex в истории, лично принадлежавший Полу Ньюману; рекордный лот.",
      "image": null,
      "nameRu": "Rolex Daytona Пола Ньюмана",
      "aliases": [
        "Paul Newman Daytona",
        "Rolex 6239 Paul Newman",
        "Дайтона Пола Ньюмана"
      ]
    },
    {
      "id": "jw-patek-1518-steel",
      "category": "jewelry",
      "brand": "Patek Philippe · Phillips",
      "model": "Ref. 1518 Stainless Steel",
      "title": "Patek Philippe Ref. 1518 perpetual calendar chronograph in stainless steel",
      "subtitle": "Сталь, вечный календарь + хронограф",
      "price": 11137000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2016-11-12",
      "note": "Продан на аукционе Phillips в Женеве в ноябре 2016 г., цена с комиссией.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Редчайший стальной экземпляр культовой модели с вечным календарём и хронографом; топ-5 часовых аукционов.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Patek_Philippe_cronografo_calendario_perpetuo_ref._1518%2C_met%C3%A0_anni_%2740_circa.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Patek_Philippe_cronografo_calendario_perpetuo_ref._1518%2C_met%C3%A0_anni_%2740_circa.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Patek Philippe 1518 в стали",
      "aliases": [
        "Patek 1518 steel",
        "1518 стальной"
      ]
    },
    {
      "id": "jw-rolex-bao-dai-6062",
      "category": "jewelry",
      "brand": "Rolex · Phillips",
      "model": "\"Bao Dai\" Ref. 6062",
      "title": "Rolex Ref. 6062 \"Bao Dai\" triple calendar moonphase",
      "subtitle": "Тройной календарь с фазой Луны, часы императора Вьетнама",
      "price": 5060000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-05-13",
      "note": "Часы последнего императора Вьетнама Бао Дая, проданы на аукционе Phillips в Женеве в мае 2017 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Редкие часы с историей, известны в основном коллекционерам.",
      "image": null,
      "nameRu": "Rolex «Бао Дай» 6062",
      "aliases": [
        "Bao Dai Rolex",
        "Emperor Bao Dai",
        "Бао Дай"
      ]
    },
    {
      "id": "jw-marlon-brando-gmt-1675",
      "category": "jewelry",
      "brand": "Rolex · Phillips",
      "model": "Marlon Brando's GMT-Master 1675",
      "title": "Marlon Brando's Rolex GMT-Master Ref. 1675 (worn in Apocalypse Now)",
      "subtitle": "Сталь, часы из фильма «Апокалипсис сегодня»",
      "price": 1952000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-12",
      "note": "Личные часы Марлона Брандо, проданы на аукционе Phillips в Нью-Йорке в 2019 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Часы знаменитости, серийная модель.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Rolex_GMT-Master_ref._1675_%22Pink_Panther%22.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Rolex_GMT-Master_ref._1675_%22Pink_Panther%22.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Rolex GMT-Master Марлона Брандо",
      "aliases": [
        "Brando GMT",
        "Apocalypse Now Rolex"
      ]
    },
    {
      "id": "jw-nautilus-5711-tiffany",
      "category": "jewelry",
      "brand": "Patek Philippe · Phillips",
      "model": "Nautilus 5711/1A-018 Tiffany",
      "title": "Patek Philippe Nautilus Ref. 5711/1A-018 Tiffany & Co. blue dial",
      "subtitle": "2021, сталь, циферблат цвета Tiffany Blue, лимитированная серия",
      "price": 6503000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-12-11",
      "note": "Первый экземпляр серии продан на благотворительном аукционе Phillips в Нью-Йорке в декабре 2021 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Лимитированная версия серийной модели.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Patek-Philippe-Nautilus-5711-1A-010-1.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Patek-Philippe-Nautilus-5711-1A-010-1.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Patek Philippe Nautilus Tiffany",
      "aliases": [
        "Tiffany Nautilus",
        "5711 Tiffany",
        "Наутилус Тиффани"
      ]
    },
    {
      "id": "jw-heuer-monaco-mcqueen",
      "category": "jewelry",
      "brand": "Heuer · Phillips",
      "model": "Steve McQueen's Monaco 1133",
      "title": "Heuer Monaco Ref. 1133 worn by Steve McQueen in Le Mans",
      "subtitle": "1970, сталь, часы со съёмок фильма «Ле-Ман»",
      "price": 2208000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2020-12-12",
      "note": "Часы, которые Стив Маккуин носил на съёмках «Ле-Мана», проданы на аукционе Phillips в Нью-Йорке в декабре 2020 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Часы знаменитости, серийная модель.",
      "image": null,
      "nameRu": "Heuer Monaco Стива Маккуина",
      "aliases": [
        "McQueen Monaco",
        "Le Mans Monaco",
        "TAG Heuer Monaco McQueen"
      ]
    },
    {
      "id": "jw-speedmaster-broad-arrow-2915",
      "category": "jewelry",
      "brand": "Omega · Phillips",
      "model": "Speedmaster \"Broad Arrow\" 2915-1",
      "title": "Omega Speedmaster CK2915-1 \"Broad Arrow\" (1957)",
      "subtitle": "1957, сталь, первое поколение Speedmaster",
      "price": 3418000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-11",
      "note": "Продан на аукционе Phillips в Женеве в ноябре 2021 г.; рекорд для Omega.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Ранний Speedmaster, ценность — для коллекционеров.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/OMEGA_Speedmaster_CK2915_%28cropped_to_watch_case%29.JPG?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:OMEGA_Speedmaster_CK2915_%28cropped_to_watch_case%29.JPG",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Omega Speedmaster «Broad Arrow» 2915-1",
      "aliases": [
        "Broad Arrow",
        "CK2915",
        "Спидмастер 1957"
      ]
    },
    {
      "id": "jw-patek-2499-clapton",
      "category": "jewelry",
      "brand": "Patek Philippe · Christie's",
      "model": "Eric Clapton's Ref. 2499/100",
      "title": "Patek Philippe Ref. 2499/100 platinum perpetual calendar chronograph (Eric Clapton)",
      "subtitle": "1987, платина, вечный календарь + хронограф",
      "price": 3656000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2012-11-12",
      "note": "Платиновые часы из коллекции Эрика Клэптона, проданы на аукционе Christie's в Женеве в ноябре 2012 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Часы знаменитости, коллекционный референс.",
      "image": null,
      "nameRu": "Patek Philippe 2499 Эрика Клэптона",
      "aliases": [
        "Clapton 2499",
        "2499/100 platinum"
      ]
    },
    {
      "id": "jw-rolex-deep-sea-special-1",
      "category": "jewelry",
      "brand": "Rolex · Christie's",
      "model": "Deep Sea Special No. 1",
      "title": "Rolex Deep Sea Special No. 1 (Trieste bathyscaphe prototype)",
      "subtitle": "1953, экспериментальные часы для батискафа «Триест»",
      "price": 2066000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-11-08",
      "note": "Первый экспериментальный образец, проданный на аукционе Christie's в Женеве в ноябре 2021 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Экспериментальные часы, известны коллекционерам.",
      "image": null,
      "nameRu": "Rolex Deep Sea Special №1",
      "aliases": [
        "Deep Sea Special",
        "Rolex Триест"
      ]
    },
    {
      "id": "jw-bulova-apollo-15-scott",
      "category": "jewelry",
      "brand": "Bulova · RR Auction",
      "model": "David Scott's Apollo 15 Chronograph",
      "title": "Bulova chronograph worn by David Scott on the Moon (Apollo 15)",
      "subtitle": "1971, хронограф, носившийся на поверхности Луны",
      "price": 1652000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2015-10-22",
      "note": "Часы астронавта Дэвида Скотта, в которых он работал на поверхности Луны; проданы RR Auction в октябре 2015 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Космическая история, но малоизвестный предмет.",
      "image": null,
      "nameRu": "Хронограф Bulova Дэвида Скотта",
      "aliases": [
        "Moon Bulova",
        "Apollo 15 watch",
        "часы с Луны"
      ]
    },
    {
      "id": "jw-fp-journe-ffc-blue",
      "category": "jewelry",
      "brand": "F.P. Journe · Christie's",
      "model": "FFC Blue (Only Watch)",
      "title": "F.P. Journe FFC Blue prototype (with Francis Ford Coppola)",
      "subtitle": "2021, уникальный прототип для Only Watch",
      "price": 4934000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2021-11-06",
      "note": "Уникальный прототип, созданный вместе с Фрэнсисом Фордом Копполой, продан на Only Watch (Christie's, Женева) в ноябре 2021 г.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive watches sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_watches_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Уникальные часы благотворительного аукциона, известны знатокам.",
      "image": null,
      "nameRu": "F.P. Journe FFC Blue",
      "aliases": [
        "FFC Blue",
        "Coppola watch",
        "Journe FFC"
      ]
    },
    {
      "id": "jw-pink-star",
      "category": "jewelry",
      "brand": "Sotheby's Hong Kong",
      "model": "CTF Pink Star 59.60 ct",
      "title": "CTF Pink Star diamond, 59.60 carats",
      "subtitle": "59,60 карат, fancy vivid pink, огранка овал",
      "price": 71200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-04-04",
      "note": "Продан на аукционе Sotheby's в Гонконге 4 апреля 2017 г.; рекорд для драгоценного камня на аукционе.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Pink_Star_(diamond)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самый дорогой бриллиант и драгоценный камень, когда-либо проданный на аукционе.",
      "image": null,
      "nameRu": "Бриллиант «Розовая звезда»",
      "aliases": [
        "Pink Star",
        "CTF Pink Star",
        "Pink Dream",
        "Пинк Стар"
      ]
    },
    {
      "id": "jw-oppenheimer-blue",
      "category": "jewelry",
      "brand": "Christie's Geneva",
      "model": "Oppenheimer Blue 14.62 ct",
      "title": "Oppenheimer Blue diamond, 14.62 carats",
      "subtitle": "14,62 карата, fancy vivid blue",
      "price": 57500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2016-05",
      "note": "Продан на аукционе Christie's в Женеве в мае 2016 г. (56,8 млн швейцарских франков).",
      "source": {
        "label": "langerman-diamonds.com",
        "url": "https://www.langerman-diamonds.com/blogs/news/oppenheimer-blue-diamond-sells-for-57-5-million-at-christie-s"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "На момент продажи — рекорд для любого драгоценного камня на аукционе.",
      "image": null,
      "nameRu": "Бриллиант «Голубой Оппенгеймер»",
      "aliases": [
        "Oppenheimer Blue",
        "Оппенгеймер Блю"
      ]
    },
    {
      "id": "jw-blue-moon-josephine",
      "category": "jewelry",
      "brand": "Sotheby's Geneva",
      "model": "Blue Moon of Josephine 12.03 ct",
      "title": "Blue Moon of Josephine diamond, 12.03 carats",
      "subtitle": "12,03 карата, fancy vivid blue, огранка кушон",
      "price": 48400000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2015-11",
      "note": "Продан на аукционе Sotheby's в Женеве в ноябре 2015 г.; покупатель — гонконгский магнат Джозеф Лау.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Blue_Moon_of_Josephine"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Уникальный голубой бриллиант, на момент продажи — рекорд цены за карат.",
      "image": null,
      "nameRu": "Бриллиант «Голубая луна Жозефины»",
      "aliases": [
        "Blue Moon diamond",
        "Голубая луна"
      ]
    },
    {
      "id": "jw-graff-pink",
      "category": "jewelry",
      "brand": "Sotheby's Geneva",
      "model": "Graff Pink 24.78 ct",
      "title": "The Graff Pink diamond, 24.78 carats",
      "subtitle": "24,78 карата, fancy intense pink",
      "price": 46200000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2010-11-16",
      "note": "Продан на аукционе Sotheby's в Женеве в ноябре 2010 г. ювелиру Лоренсу Граффу.",
      "source": {
        "label": "aol.com",
        "url": "https://www.aol.com/2010-11-16-pink-diamond-is-sold-for-a-record-46-2-million.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Уникальный розовый бриллиант, установивший мировой рекорд в 2010 г.",
      "image": null,
      "nameRu": "Бриллиант «Графф Пинк»",
      "aliases": [
        "Graff Pink",
        "Графф Пинк"
      ]
    },
    {
      "id": "jw-winston-pink-legacy",
      "category": "jewelry",
      "brand": "Christie's Geneva",
      "model": "Winston Pink Legacy 18.96 ct",
      "title": "Winston Pink Legacy diamond, 18.96 carats",
      "subtitle": "18,96 карата, fancy vivid pink, ранее собственность Оппенгеймеров",
      "price": 50400000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-11-13",
      "note": "Продан на аукционе Christie's в Женеве в ноябре 2018 г.; покупатель — Harry Winston.",
      "source": {
        "label": "nationaljeweler.com",
        "url": "https://www.nationaljeweler.com/fashion/jewelry-auctions/7184-harry-winston-just-acquired-the-pink-legacy-for-50-million"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Уникальный розовый бриллиант с рекордной на тот момент ценой за карат.",
      "image": null,
      "nameRu": "Бриллиант «Розовое наследие Уинстона»",
      "aliases": [
        "Pink Legacy",
        "Розовое наследие"
      ]
    },
    {
      "id": "jw-williamson-pink-star",
      "category": "jewelry",
      "brand": "Sotheby's Hong Kong",
      "model": "Williamson Pink Star 11.15 ct",
      "title": "Williamson Pink Star diamond, 11.15 carats",
      "subtitle": "11,15 карата, fancy vivid pink, internally flawless",
      "price": 57700000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-10-07",
      "note": "Продан на аукционе Sotheby's в Гонконге в октябре 2022 г.; рекорд цены за карат для любого камня.",
      "source": {
        "label": "nationaljeweler.com",
        "url": "https://www.nationaljeweler.com/articles/11348-williamson-pink-star-diamond-sets-auction-record-at-57-7m"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Уникальный камень с мировым рекордом цены за карат.",
      "image": null,
      "nameRu": "Бриллиант «Розовая звезда Уильямсона»",
      "aliases": [
        "Williamson Pink Star",
        "Уильямсон"
      ]
    },
    {
      "id": "jw-la-peregrina",
      "category": "jewelry",
      "brand": "Christie's New York",
      "model": "La Peregrina pearl (Elizabeth Taylor)",
      "title": "La Peregrina pearl necklace from the collection of Elizabeth Taylor",
      "subtitle": "XVI в., натуральная жемчужина в колье Cartier, коллекция Элизабет Тейлор",
      "price": 11840000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2011-12",
      "note": "Продана на аукционе Christie's в Нью-Йорке в декабре 2011 г. в составе коллекции Элизабет Тейлор; рекорд для жемчуга.",
      "source": {
        "label": "superyachts.com",
        "url": "https://www.superyachts.com/lifestyle/story/elizabeth-taylor-pearl-sells-for-record-dollar118-million-at-auction-1079"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Уникальная историческая жемчужина испанской короны и рекорд для жемчуга на аукционе.",
      "image": null,
      "nameRu": "Жемчужина «Ла Перегрина»",
      "aliases": [
        "La Peregrina",
        "Перегрина",
        "Странница"
      ]
    },
    {
      "id": "jw-taylor-burton-diamond-1969",
      "category": "jewelry",
      "brand": "Parke-Bernet New York",
      "model": "Taylor–Burton Diamond (1969)",
      "title": "Taylor–Burton Diamond, 69.42 carats, 1969 auction",
      "subtitle": "69,42 карата, грушевидная огранка; аукцион 1969 г.",
      "price": 1050000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "1969-10-23",
      "note": "Продан на аукционе Parke-Bernet в Нью-Йорке 23 октября 1969 г. компании Cartier; на следующий день его выкупил Ричард Бёртон для Элизабет Тейлор.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Taylor%E2%80%93Burton_Diamond"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Знаменитый камень голливудской пары, в 1969 г. — рекорд для публичного аукциона драгоценностей.",
      "image": null,
      "nameRu": "Бриллиант Тейлор — Бёртон",
      "aliases": [
        "Taylor-Burton",
        "Тейлор-Бертон"
      ]
    },
    {
      "id": "jw-elizabeth-taylor-diamond",
      "category": "jewelry",
      "brand": "Christie's New York",
      "model": "Elizabeth Taylor Diamond 33.19 ct",
      "title": "The Elizabeth Taylor Diamond (formerly Krupp Diamond), 33.19 carats",
      "subtitle": "33,19 карата, кольцо, подарок Ричарда Бёртона",
      "price": 8818500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2011-12-13",
      "note": "Продан на аукционе Christie's в Нью-Йорке 13 декабря 2011 г., цена с комиссией покупателя.",
      "source": {
        "label": "komonews.com (AP)",
        "url": "https://komonews.com/news/entertainment/taylors-ring-from-burton-fetches-88m-in-ny"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Знаменитое кольцо Элизабет Тейлор с богатой историей.",
      "image": null,
      "nameRu": "Бриллиант Элизабет Тейлор (Крупп)",
      "aliases": [
        "Krupp Diamond",
        "Крупп"
      ]
    },
    {
      "id": "jw-patek-nautilus-5811-1g",
      "category": "jewelry",
      "brand": "Patek Philippe",
      "model": "Nautilus 5811/1G-001",
      "title": "Patek Philippe Nautilus Ref. 5811/1G-001 white gold",
      "subtitle": "41 мм, белое золото, автомат 26-330 S C",
      "price": 82021,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "patek.com",
        "url": "https://www.patek.com/en/collection/nautilus/5811-1g-001"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серийная модель, но фактически недоступна в бутиках — очереди на годы.",
      "image": null,
      "nameRu": "Patek Philippe Nautilus 5811",
      "aliases": [
        "Nautilus 5811",
        "Наутилус"
      ]
    },
    {
      "id": "jw-patek-aquanaut-5168g",
      "category": "jewelry",
      "brand": "Patek Philippe",
      "model": "Aquanaut 5168G-001",
      "title": "Patek Philippe Aquanaut Ref. 5168G-001 white gold",
      "subtitle": "42,2 мм, белое золото, синий циферблат, автомат",
      "price": 57890,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "patek.com",
        "url": "https://www.patek.com/en/collection/aquanaut/5168g-001"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель текущей коллекции.",
      "image": null,
      "nameRu": "Patek Philippe Aquanaut 5168G",
      "aliases": [
        "Aquanaut",
        "Акванавт"
      ]
    },
    {
      "id": "jw-patek-calatrava-6119r",
      "category": "jewelry",
      "brand": "Patek Philippe",
      "model": "Calatrava 6119R-001",
      "title": "Patek Philippe Calatrava Ref. 6119R-001 rose gold",
      "subtitle": "39 мм, розовое золото, ручной завод 30-255 PS",
      "price": 37510,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "patek.com",
        "url": "https://www.patek.com/en/collection/calatrava/6119r-001"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная классическая модель текущей коллекции.",
      "image": null,
      "nameRu": "Patek Philippe Calatrava 6119R",
      "aliases": [
        "Calatrava",
        "Калатрава"
      ]
    },
    {
      "id": "jw-lange-1-pink-gold",
      "category": "jewelry",
      "brand": "A. Lange & Söhne",
      "model": "Lange 1 (191.032)",
      "title": "A. Lange & Söhne Lange 1 Ref. 191.032, pink gold",
      "subtitle": "38,5 мм, розовое золото, ручной завод L121.1",
      "price": 49500,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "alange-soehne.com",
        "url": "https://www.alange-soehne.com/us-en/timepieces/lange-1/lange-1/lange-1-in-750-pink-gold-191-032"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель текущей коллекции саксонской мануфактуры.",
      "image": null,
      "nameRu": "A. Lange & Söhne Lange 1",
      "aliases": [
        "Lange 1",
        "Ланге 1"
      ]
    },
    {
      "id": "jw-grand-seiko-snowflake",
      "category": "jewelry",
      "brand": "Grand Seiko",
      "model": "SBGA211 \"Snowflake\"",
      "title": "Grand Seiko SBGA211 \"Snowflake\" Spring Drive",
      "subtitle": "41 мм, титан, Spring Drive 9R65",
      "price": 6900,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "grand-seiko.com",
        "url": "https://www.grand-seiko.com/us-en/collections/sbga211g"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель, свободно доступная у дилеров.",
      "image": null,
      "nameRu": "Grand Seiko «Снежинка» SBGA211",
      "aliases": [
        "Snowflake",
        "Снежинка"
      ]
    },
    {
      "id": "jw-omega-constellation-41",
      "category": "jewelry",
      "brand": "Omega",
      "model": "Constellation 41 mm",
      "title": "Omega Constellation Co-Axial Master Chronometer 41 mm 131.33.41.21.03.001",
      "subtitle": "41 мм, сталь, синий циферблат, калибр 8900",
      "price": 8000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "omegawatches.com",
        "url": "https://www.omegawatches.com/en-us/watch-omega-constellation-co-axial-master-chronometer-41-mm-13133412103001"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель текущей коллекции.",
      "image": null,
      "nameRu": "Omega Constellation",
      "aliases": [
        "Constellation",
        "Констелейшн"
      ]
    },
    {
      "id": "jw-breitling-navitimer-b01-43",
      "category": "jewelry",
      "brand": "Breitling",
      "model": "Navitimer B01 Chronograph 43",
      "title": "Breitling Navitimer B01 Chronograph 43 AB0138211B1P1",
      "subtitle": "43 мм, сталь, чёрный циферблат, калибр B01",
      "price": 10300,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "breitling.com",
        "url": "https://www.breitling.com/us-en/watches/navitimer/navitimer-b01-chronograph-43-my22/AB0138211B1P1/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель текущей коллекции.",
      "image": null,
      "nameRu": "Breitling Navitimer B01",
      "aliases": [
        "Navitimer",
        "Навитаймер"
      ]
    },
    {
      "id": "jw-iwc-big-pilot-tourbillon-petit-prince",
      "category": "jewelry",
      "brand": "IWC",
      "model": "Big Pilot's Tourbillon Le Petit Prince",
      "title": "IWC Big Pilot's Watch 43 Tourbillon Le Petit Prince IW329501, platinum",
      "subtitle": "43 мм, платина, турбийон, калибр 82905",
      "price": 99400,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "iwc.com",
        "url": "https://www.iwc.com/us-en/watches/pilot-watches/iw329501-big-pilots-watch-43-tourbillon-le-petit-prince"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Лимитированная серия с турбийоном из платины.",
      "image": null,
      "nameRu": "IWC Big Pilot Tourbillon «Маленький принц»",
      "aliases": [
        "Big Pilot Tourbillon",
        "Большой пилот"
      ]
    },
    {
      "id": "jw-jlc-reverso-tribute-duoface",
      "category": "jewelry",
      "brand": "Jaeger-LeCoultre",
      "model": "Reverso Tribute Duoface",
      "title": "Jaeger-LeCoultre Reverso Tribute Duoface Small Seconds Q3988481",
      "subtitle": "47×28,3 мм, сталь, два циферблата, ручной завод 854",
      "price": 15600,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "jaeger-lecoultre.com",
        "url": "https://www.jaeger-lecoultre.com/us-en/watches/reverso/reverso-tribute/reverso-tribute-duoface-small-seconds-q3988481"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель текущей коллекции.",
      "image": null,
      "nameRu": "Jaeger-LeCoultre Reverso Duoface",
      "aliases": [
        "Reverso",
        "Реверсо"
      ]
    },
    {
      "id": "jw-tag-monaco-th20",
      "category": "jewelry",
      "brand": "TAG Heuer",
      "model": "Monaco Chronograph 39 mm",
      "title": "TAG Heuer Monaco Chronograph CBL2111.FC6453 (TH20-00)",
      "subtitle": "39 мм, сталь, синий циферблат, калибр TH20-00",
      "price": 8300,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "tagheuer.com",
        "url": "https://www.tagheuer.com/us/en/timepieces/collections/tag-heuer-monaco/39-mm-th20-00/CBL2111.FC6453.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель текущей коллекции.",
      "image": null,
      "nameRu": "TAG Heuer Monaco",
      "aliases": [
        "Monaco",
        "Монако"
      ]
    },
    {
      "id": "jw-rolex-day-date-40-platinum",
      "category": "jewelry",
      "brand": "Rolex",
      "model": "Day-Date 40 Platinum",
      "title": "Rolex Day-Date 40 m228236-0012, platinum, ice-blue dial",
      "subtitle": "40 мм, платина 950, ледяной голубой циферблат, калибр 3255",
      "price": 68800,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "rolex.com",
        "url": "https://www.rolex.com/en-us/watches/day-date/m228236-0012"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серийная модель Rolex, но платиновые версии выдаются бутиками по распределению.",
      "image": null,
      "nameRu": "Rolex Day-Date 40 платиновый",
      "aliases": [
        "President",
        "Day-Date",
        "Президент",
        "Дэй-Дейт"
      ]
    },
    {
      "id": "jw-bulgari-serpenti-viper",
      "category": "jewelry",
      "brand": "Bulgari",
      "model": "Serpenti Viper bracelet",
      "title": "Bvlgari Serpenti Viper bracelet, yellow gold, demi-pavé diamonds",
      "subtitle": "18К жёлтое золото, бриллианты демипаве",
      "price": 13700,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "bulgari.com",
        "url": "https://www.bulgari.com/en-us/jewelry/bracelets/serpenti-viper-bracelet-yellow-gold-diamonds-br860040"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийное украшение из постоянной коллекции.",
      "image": null,
      "nameRu": "Браслет Bvlgari Serpenti Viper",
      "aliases": [
        "Serpenti",
        "Серпенти",
        "Bvlgari"
      ]
    },
    {
      "id": "jw-tiffany-lock-bangle",
      "category": "jewelry",
      "brand": "Tiffany & Co.",
      "model": "Tiffany Lock bangle",
      "title": "Tiffany Lock Bangle in Yellow Gold with Diamond Accents",
      "subtitle": "18К жёлтое золото, бриллианты 0,31 карата",
      "price": 13000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "tiffany.com",
        "url": "https://www.tiffany.com/jewelry/bracelets/tiffany-lock-18k-yellow-gold-diamond-bracelets-1366151844.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийное украшение из постоянной коллекции.",
      "image": null,
      "nameRu": "Браслет Tiffany Lock",
      "aliases": [
        "Lock bracelet",
        "Тиффани Лок"
      ]
    },
    {
      "id": "jw-vca-vintage-alhambra-20",
      "category": "jewelry",
      "brand": "Van Cleef & Arpels",
      "model": "Vintage Alhambra long necklace, 20 motifs",
      "title": "Van Cleef & Arpels Vintage Alhambra long necklace, 20 motifs, white gold",
      "subtitle": "18К белое золото, 20 мотивов-клеверов",
      "price": 28400,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10",
      "note": "Официальная розничная цена на американском сайте бренда (октябрь 2026 г., без налогов).",
      "source": {
        "label": "vancleefarpels.com",
        "url": "https://www.vancleefarpels.com/us/en/collections/jewelry/alhambra.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийное украшение из постоянной коллекции.",
      "image": null,
      "nameRu": "Колье Van Cleef & Arpels Vintage Alhambra",
      "aliases": [
        "Alhambra",
        "Альгамбра",
        "VCA"
      ]
    },
    {
      "id": "pt-red-v-raptor-xl-8k-vv",
      "category": "protech",
      "brand": "RED",
      "model": "V-Raptor XL 8K VV",
      "title": "RED V-Raptor XL 8K VV",
      "subtitle": "2022, кинокамера 8K VV, полнокадровый сенсор, корпус XL",
      "price": 39500,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2022-08",
      "note": "Цена базовой камеры (без комплекта Production Pack) при открытии предзаказа в августе 2022 г.",
      "source": {
        "label": "newsshooter.com",
        "url": "https://www.newsshooter.com/2022/08/02/red-v-raptor-xl-8k-vv-announced/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная профессиональная кинокамера, доступная к заказу.",
      "image": null,
      "nameRu": "РЕД Ви-Раптор XL 8K VV",
      "aliases": [
        "V-Raptor XL",
        "RED Raptor XL"
      ]
    },
    {
      "id": "pt-blackmagic-ursa-cine-12k-lf",
      "category": "protech",
      "brand": "Blackmagic Design",
      "model": "URSA Cine 12K LF",
      "title": "Blackmagic URSA Cine 12K LF (body)",
      "subtitle": "2025, кинокамера 12K, сенсор LF, корпус с байонетом EF",
      "price": 6995,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-01-30",
      "note": "Цена корпуса камеры (EF) по официальному объявлению Blackmagic в январе 2025 г.",
      "source": {
        "label": "newsshooter.com",
        "url": "https://www.newsshooter.com/2025/01/30/blackmagic-ursa-cine-12k-lf-body-6995-usd/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная кинокамера, продаётся новой.",
      "image": null,
      "nameRu": "Блэкмэджик URSA Cine 12K LF",
      "aliases": [
        "URSA Cine 12K"
      ]
    },
    {
      "id": "pt-canon-eos-r1",
      "category": "protech",
      "brand": "Canon",
      "model": "EOS R1",
      "title": "Canon EOS R1 (body)",
      "subtitle": "2024, флагманская беззеркалка, 24 Мп, только корпус",
      "price": 6299,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-07-17",
      "note": "Рекомендованная цена корпуса в США на момент анонса в июле 2024 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Canon-EOS-R1-and-R5-Mark-II-mirrorless-cameras-officially-launched-starting-at-6-299-and-4-299-respectively.864416.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная профессиональная камера.",
      "image": null,
      "nameRu": "Кэнон EOS R1",
      "aliases": [
        "Canon R1"
      ]
    },
    {
      "id": "pt-canon-eos-r5-mark-ii",
      "category": "protech",
      "brand": "Canon",
      "model": "EOS R5 Mark II",
      "title": "Canon EOS R5 Mark II (body)",
      "subtitle": "2024, беззеркалка 45 Мп, видео 8K, только корпус",
      "price": 4299,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-07-17",
      "note": "Рекомендованная цена корпуса в США на момент анонса в июле 2024 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Canon-EOS-R1-and-R5-Mark-II-mirrorless-cameras-officially-launched-starting-at-6-299-and-4-299-respectively.864416.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная профессиональная камера.",
      "image": null,
      "nameRu": "Кэнон EOS R5 Mark II",
      "aliases": [
        "Canon R5 II",
        "R5 Mk II"
      ]
    },
    {
      "id": "pt-canon-eos-c400",
      "category": "protech",
      "brand": "Canon",
      "model": "EOS C400",
      "title": "Canon EOS C400",
      "subtitle": "2024, кинокамера 6K, полный кадр, байонет RF",
      "price": 7999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-06-05",
      "note": "Ориентировочная розничная цена в США из пресс-релиза Canon (июнь 2024 г.).",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Canon-unveils-35mm-full-frame-EOS-C400-camera-for-filmmakers-with-6K-60P-recording-extended-102-400-ISO-AI-autofocus-and-IP-streaming.845031.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная кинокамера.",
      "image": null,
      "nameRu": "Кэнон EOS C400",
      "aliases": [
        "Canon C400"
      ]
    },
    {
      "id": "pt-nikon-z9",
      "category": "protech",
      "brand": "Nikon",
      "model": "Z9",
      "title": "Nikon Z9 (body)",
      "subtitle": "2021, флагманская беззеркалка 45,7 Мп, только корпус",
      "price": 5500,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2021-10",
      "note": "Стартовая цена корпуса в США на момент выхода (по данным Википедии).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Nikon_Z9"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная профессиональная камера.",
      "image": null,
      "nameRu": "Никон Z9",
      "aliases": [
        "Nikon Z 9"
      ]
    },
    {
      "id": "pt-hasselblad-x2d-ii-100c",
      "category": "protech",
      "brand": "Hasselblad",
      "model": "X2D II 100C",
      "title": "Hasselblad X2D II 100C (body)",
      "subtitle": "2025, среднеформатная камера 100 Мп, корпус",
      "price": 7399,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-08-26",
      "note": "Цена корпуса в США на момент анонса в августе 2025 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Hasselblad-X2D-II-100C-launches-with-HDR-RAW-AF-C-and-lighter-body-alongside-new-35-100mm-zoom-lens.1097071.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная среднеформатная камера.",
      "image": null,
      "nameRu": "Хассельблад X2D II 100C",
      "aliases": [
        "X2D II"
      ]
    },
    {
      "id": "pt-fujifilm-gfx100-ii",
      "category": "protech",
      "brand": "Fujifilm",
      "model": "GFX100 II",
      "title": "Fujifilm GFX100 II",
      "subtitle": "2023, среднеформатная беззеркалка 102 Мп",
      "price": 7499,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-09-12",
      "note": "Цена в США, объявленная при анонсе на Fujifilm X Summit в сентябре 2023 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Fujifilm-launches-GFX100-II-flagship-medium-format-camera-with-improved-sensor-AF-IBIS-and-25-lower-price-than-original.748794.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная камера.",
      "image": null,
      "nameRu": "Фуджифилм GFX100 II",
      "aliases": [
        "GFX 100 II"
      ]
    },
    {
      "id": "pt-leica-m11",
      "category": "protech",
      "brand": "Leica",
      "model": "M11",
      "title": "Leica M11",
      "subtitle": "2022, цифровой дальномер, 60 Мп, корпус",
      "price": 8995,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2022-01-13",
      "note": "Розничная цена в США на момент анонса в январе 2022 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/The-Leica-M11-arrives-with-a-60-MP-sensor-an-electronic-shutter-and-USB-Type-C-for-US-8-995.592582.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная камера, хоть и дорогая.",
      "image": null,
      "nameRu": "Лейка M11",
      "aliases": [
        "Leica M 11"
      ]
    },
    {
      "id": "pt-phase-one-xf-iq4-150",
      "category": "protech",
      "brand": "Phase One",
      "model": "XF IQ4 150MP",
      "title": "Phase One XF IQ4 150MP Camera System",
      "subtitle": "2018, среднеформатная система, цифровой задник 151 Мп",
      "price": 51990,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2018-08-28",
      "note": "Рекомендованная цена системы (камера XF + задник IQ4 150MP) в США на момент анонса.",
      "source": {
        "label": "shutterbug.com",
        "url": "https://www.shutterbug.com/node/577360"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная, хотя и нишевая, профессиональная система.",
      "image": null,
      "nameRu": "Фейз Ван XF IQ4 150MP",
      "aliases": [
        "IQ4 150",
        "Phase One IQ4"
      ]
    },
    {
      "id": "pt-dji-ronin-4d-8k",
      "category": "protech",
      "brand": "DJI",
      "model": "Ronin 4D-8K",
      "title": "DJI Ronin 4D-8K",
      "subtitle": "2023, кинокамера 8K со встроенным 4-осевым стабилизатором и лидаром",
      "price": 12838,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-12-16",
      "note": "Цена версии Ronin 4D-8K до налогов на момент выхода в декабре 2023 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/DJI-Ronin-4D-8K-debuts-with-new-Zenmuse-X9-8K-camera.784418.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная кинокамера.",
      "image": null,
      "nameRu": "DJI Ронин 4D-8K",
      "aliases": [
        "Ronin 4D 8K",
        "Zenmuse X9-8K"
      ]
    },
    {
      "id": "pt-dji-inspire-3",
      "category": "protech",
      "brand": "DJI",
      "model": "Inspire 3",
      "title": "DJI Inspire 3",
      "subtitle": "2023, кинодрон с камерой Zenmuse X9-8K Air",
      "price": 16499,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-05-30",
      "note": "Цена при старте мировых продаж в мае 2023 г. (сайт DJI и авторизованные продавцы).",
      "source": {
        "label": "amateurphotographer.com",
        "url": "https://amateurphotographer.com/latest/photo-news/dji-inspire-3-on-sale-globally"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный профессиональный дрон.",
      "image": null,
      "nameRu": "DJI Инспайр 3",
      "aliases": [
        "Inspire 3"
      ]
    },
    {
      "id": "pt-sony-pxw-z200",
      "category": "protech",
      "brand": "Sony",
      "model": "PXW-Z200",
      "title": "Sony PXW-Z200 camcorder",
      "subtitle": "2024, проф. видеокамера 4K 120p, зум 24–480 мм",
      "price": 3999.99,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-09-12",
      "note": "Рекомендованная цена в США на момент анонса в сентябре 2024 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Sony-unveils-HXR-NX800-and-PXW-Z200-professional-camcorders-with-4K-120fps-24-480mm-zoom-AI-autofocus-live-streaming-and-auto-subject-framing.886833.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная профессиональная видеокамера.",
      "image": null,
      "nameRu": "Сони PXW-Z200",
      "aliases": [
        "Z200"
      ]
    },
    {
      "id": "pt-nvidia-rtx-5090",
      "category": "protech",
      "brand": "NVIDIA",
      "model": "GeForce RTX 5090",
      "title": "NVIDIA GeForce RTX 5090 Founders Edition",
      "subtitle": "2025, видеокарта, 32 ГБ GDDR7, Blackwell",
      "price": 1999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-01-23",
      "note": "Рекомендованная цена (MSRP) на старте продаж в январе 2025 г.",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/reviews/nvidia-geforce-rtx-5090-review"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная видеокарта.",
      "image": null,
      "nameRu": "Нвидиа GeForce RTX 5090",
      "aliases": [
        "RTX 5090",
        "5090 FE"
      ]
    },
    {
      "id": "pt-nvidia-dgx-spark",
      "category": "protech",
      "brand": "NVIDIA",
      "model": "DGX Spark",
      "title": "NVIDIA DGX Spark",
      "subtitle": "2025, настольный ИИ-суперкомпьютер, GB10, 128 ГБ памяти",
      "price": 3999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-10-15",
      "note": "Цена NVIDIA без налогов и пошлин на старте продаж 15 октября 2025 г.",
      "source": {
        "label": "tech.yahoo.com",
        "url": "https://tech.yahoo.com/computing/articles/nvidia-start-selling-3-999-223000329.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный продукт.",
      "image": null,
      "nameRu": "Нвидиа DGX Spark",
      "aliases": [
        "Project DIGITS"
      ]
    },
    {
      "id": "pt-nvidia-jetson-agx-thor",
      "category": "protech",
      "brand": "NVIDIA",
      "model": "Jetson AGX Thor Dev Kit",
      "title": "NVIDIA Jetson AGX Thor Developer Kit",
      "subtitle": "2025, «мозг» для роботов, 2070 TFLOPS, Blackwell",
      "price": 3499,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-08-25",
      "note": "Цена комплекта разработчика на старте в августе 2025 г.",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/reviews/nvidia-jetson-agx-thor-developer-kit-hands-on"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный комплект разработчика.",
      "image": null,
      "nameRu": "Нвидиа Jetson AGX Thor",
      "aliases": [
        "Jetson Thor"
      ]
    },
    {
      "id": "pt-amd-ryzen-ai-halo",
      "category": "protech",
      "brand": "AMD",
      "model": "Ryzen AI Halo",
      "title": "AMD Ryzen AI Halo developer workstation",
      "subtitle": "2026, мини-станция для ИИ, Ryzen AI Max+ 395, 128 ГБ",
      "price": 3999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-07-06",
      "note": "Рекомендованная цена (MSRP) по обзору HotHardware в июле 2026 г.",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/reviews/amd-ryzen-ai-halo-hands-on-review"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный продукт.",
      "image": null,
      "nameRu": "АМД Ryzen AI Halo",
      "aliases": [
        "Ryzen AI Halo"
      ]
    },
    {
      "id": "pt-apple-mac-pro-m2-ultra",
      "category": "protech",
      "brand": "Apple",
      "model": "Mac Pro (M2 Ultra)",
      "title": "Apple Mac Pro Tower (M2 Ultra)",
      "subtitle": "2023, башня с M2 Ultra и слотами PCIe; снят с производства в 2026",
      "price": 6999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-06",
      "note": "Стартовая цена Mac Pro в корпусе Tower; в марте 2026 г. Apple сняла модель с продажи.",
      "source": {
        "label": "macworld.com",
        "url": "https://www.macworld.com/article/347010/new-mac-pro-2023.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный компьютер, недавно снятый с продажи.",
      "image": null,
      "nameRu": "Эппл Мак Про",
      "aliases": [
        "Mac Pro 2023"
      ]
    },
    {
      "id": "pt-apple-studio-display-xdr",
      "category": "protech",
      "brand": "Apple",
      "model": "Studio Display XDR",
      "title": "Apple Studio Display XDR (nano-texture, height-adjustable stand)",
      "subtitle": "Монитор, нанотекстурное стекло, подставка с регулировкой высоты",
      "price": 3599,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-10-16",
      "note": "Текущая цена в американском Apple Store для версии с нанотекстурой и регулируемой подставкой.",
      "source": {
        "label": "apple.com",
        "url": "https://www.apple.com/shop/product/MWPE2LL/A"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный монитор.",
      "image": null,
      "nameRu": "Эппл Studio Display XDR",
      "aliases": [
        "Studio Display XDR"
      ]
    },
    {
      "id": "pt-apple-vision-pro-m5",
      "category": "protech",
      "brand": "Apple",
      "model": "Vision Pro (M5)",
      "title": "Apple Vision Pro (M5, 256GB)",
      "subtitle": "2025, гарнитура смешанной реальности, чип M5, 256 ГБ",
      "price": 3500,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-10-22",
      "note": "Стартовая цена при выходе обновлённой версии с M5 в октябре 2025 г. (по данным Road to VR).",
      "source": {
        "label": "roadtovr.com",
        "url": "https://roadtovr.com/apple-vision-pro-m5-chip-october-22-launch/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийное устройство.",
      "image": null,
      "nameRu": "Эппл Вижн Про",
      "aliases": [
        "Vision Pro",
        "Apple Vision Pro 2"
      ]
    },
    {
      "id": "pt-steam-deck-oled-1tb",
      "category": "protech",
      "brand": "Valve",
      "model": "Steam Deck OLED 1TB",
      "title": "Valve Steam Deck OLED 1TB",
      "subtitle": "Портативная консоль, OLED 7,4″, 1 ТБ; цена после повышения 2026",
      "price": 949,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-05-28",
      "note": "Цена в США после повышения цен Valve в мае 2026 г. (до налогов).",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/news/valve-hikes-steam-deck-pricing"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная консоль.",
      "image": null,
      "nameRu": "Стим Дек OLED 1 ТБ",
      "aliases": [
        "Steam Deck"
      ]
    },
    {
      "id": "pt-hp-z8-fury-g5",
      "category": "protech",
      "brand": "HP",
      "model": "Z8 Fury G5 (4× RTX A6000)",
      "title": "HP Z8 Fury G5 workstation (Xeon w9-3495X, 4x RTX A6000)",
      "subtitle": "2023, рабочая станция: Xeon 56 ядер, 4× RTX A6000, 128 ГБ",
      "price": 24378,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-06-21",
      "note": "Цена тестовой конфигурации по обзору HotHardware в июне 2023 г.",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/reviews/hp-z8-fury-g5-workstation-review"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная рабочая станция в топовой конфигурации.",
      "image": null,
      "nameRu": "ЭйчПи Z8 Fury G5",
      "aliases": [
        "Z8 Fury"
      ]
    },
    {
      "id": "pt-alienware-area-51-2025",
      "category": "protech",
      "brand": "Alienware",
      "model": "Area-51 (RTX 5090)",
      "title": "Alienware Area-51 gaming desktop (2025, Core Ultra 9 285K, RTX 5090)",
      "subtitle": "2025, игровой ПК: Core Ultra 9 285K, RTX 5090, 64 ГБ",
      "price": 5699,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-05-13",
      "note": "Цена тестовой конфигурации с RTX 5090 по обзору HotHardware в мае 2025 г.",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/reviews/alienware-area-51-2025-review"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный игровой ПК.",
      "image": null,
      "nameRu": "Элиенвэр Area-51",
      "aliases": [
        "Area 51"
      ]
    },
    {
      "id": "pt-hp-omen-max-45l",
      "category": "protech",
      "brand": "HP",
      "model": "Omen Max 45L (RTX 5090)",
      "title": "HP Omen Max 45L gaming desktop (Ryzen 9 9900X3D, RTX 5090)",
      "subtitle": "2026, игровой ПК: Ryzen 9 9900X3D, RTX 5090, 64 ГБ",
      "price": 6894,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-04-30",
      "note": "Цена тестовой конфигурации по обзору HotHardware в апреле 2026 г.",
      "source": {
        "label": "hothardware.com",
        "url": "https://hothardware.com/reviews/hp-omen-max-45l-gaming-desktop-review-fire-and-forget"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный игровой ПК.",
      "image": null,
      "nameRu": "ЭйчПи Omen Max 45L",
      "aliases": [
        "Omen 45L"
      ]
    },
    {
      "id": "pt-boston-dynamics-spot",
      "category": "protech",
      "brand": "Boston Dynamics",
      "model": "Spot",
      "title": "Boston Dynamics Spot (base)",
      "subtitle": "Робот-собака для промышленности, базовая версия",
      "price": 74500,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2020-06-16",
      "note": "Базовая цена при открытии продаж для коммерческих клиентов в июне 2020 г.",
      "source": {
        "label": "bostonglobe.com",
        "url": "https://www.bostonglobe.com/2020/06/16/business/boston-dynamics-turns-spot-robot-loose"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный робот, продаётся компаниям.",
      "image": null,
      "nameRu": "Бостон Дайнемикс Спот",
      "aliases": [
        "Spot robot",
        "робопёс Спот"
      ]
    },
    {
      "id": "pt-unitree-g1",
      "category": "protech",
      "brand": "Unitree",
      "model": "G1",
      "title": "Unitree G1 humanoid robot",
      "subtitle": "2024, человекоподобный робот ~130 см, базовая версия",
      "price": 16000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-08-19",
      "note": "Цена серийной версии на момент запуска производства в августе 2024 г.",
      "source": {
        "label": "maginative.com",
        "url": "https://www.maginative.com/article/unitree-launches-production-version-of-g1-humanoid-robot/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный гуманоид, продаётся открыто.",
      "image": null,
      "nameRu": "Юнитри G1",
      "aliases": [
        "Unitree G1 humanoid"
      ]
    },
    {
      "id": "pt-unitree-h1",
      "category": "protech",
      "brand": "Unitree",
      "model": "H1",
      "title": "Unitree H1 humanoid robot",
      "subtitle": "Полноразмерный человекоподобный робот ~180 см",
      "price": 90000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-05",
      "note": "Стартовая цена, указанная heise в мае 2024 г. («от 90 000 долларов»).",
      "source": {
        "label": "heise.de",
        "url": "https://heise.de/-9720187"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Нишевый исследовательский гуманоид, выпускается малыми партиями.",
      "image": null,
      "nameRu": "Юнитри H1",
      "aliases": [
        "Unitree H1 humanoid"
      ]
    },
    {
      "id": "pt-unitree-r1",
      "category": "protech",
      "brand": "Unitree",
      "model": "R1",
      "title": "Unitree R1 humanoid robot",
      "subtitle": "2025, компактный гуманоид для потребителей",
      "price": 5900,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-07-26",
      "note": "Стартовая цена при анонсе в июле 2025 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Humanoid-robot-for-consumers-Unitree-R1-launches-starting-at-US-5-900.1069005.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный продукт.",
      "image": null,
      "nameRu": "Юнитри R1",
      "aliases": [
        "Unitree R1 humanoid"
      ]
    },
    {
      "id": "pt-1x-neo",
      "category": "protech",
      "brand": "1X Technologies",
      "model": "NEO",
      "title": "1X NEO home humanoid robot",
      "subtitle": "2025, домашний человекоподобный робот, поставки с 2026",
      "price": 20000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-10-28",
      "note": "Цена разовой покупки при открытии предзаказов в октябре 2025 г. (есть и подписка).",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/1X-opens-pre-orders-for-20-000-NEO-humanoid-home-robot.1149203.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Первые партии домашнего гуманоида, выпуск пока небольшой.",
      "image": null,
      "nameRu": "1X НЕО",
      "aliases": [
        "NEO Gamma",
        "1X Neo"
      ]
    },
    {
      "id": "pt-sony-aibo-first-litter",
      "category": "protech",
      "brand": "Sony",
      "model": "aibo First Litter Edition",
      "title": "Sony aibo ERS-1000 First Litter Edition (US)",
      "subtitle": "2018, робот-собака, лимитированная серия для США",
      "price": 2899.99,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2018-09-18",
      "note": "Рекомендованная цена лимитированной серии при старте продаж в США.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Limited-First-Litter-edition-of-Sony-s-robotic-dog-aibo-released-in-US.333218.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Ограниченная стартовая серия aibo для американского рынка.",
      "image": null,
      "nameRu": "Сони Айбо First Litter",
      "aliases": [
        "aibo ERS-1000",
        "Айбо"
      ]
    },
    {
      "id": "pt-casio-moflin",
      "category": "protech",
      "brand": "Casio",
      "model": "Moflin",
      "title": "Casio Moflin AI pet robot",
      "subtitle": "2025, пушистый робот-питомец с ИИ",
      "price": 429,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-09-18",
      "note": "Цена в США при выходе на американский рынок в сентябре 2025 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Casio-brings-its-Moflin-furry-robot-to-more-markets-including-the-US-for-429.1117319.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный гаджет.",
      "image": null,
      "nameRu": "Касио Мофлин",
      "aliases": [
        "Moflin"
      ]
    },
    {
      "id": "pt-acemate-tennis-robot",
      "category": "protech",
      "brand": "Acemate",
      "model": "Tennis Robot",
      "title": "Acemate AI Tennis Robot",
      "subtitle": "2025, ИИ-робот для тенниса: подаёт и отбивает мячи",
      "price": 2499,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-09-05",
      "note": "Рекомендованная розничная цена (без скидки раннего предзаказа).",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Acemate-unveils-AI-powered-Tennis-Robot-An-NTRP-1-0-to-6-0-rally-and-serve-partner.1105604.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный продукт.",
      "image": null,
      "nameRu": "Эйсмейт теннисный робот",
      "aliases": [
        "Acemate"
      ]
    },
    {
      "id": "pt-hypershell-x-ultra",
      "category": "protech",
      "brand": "Hypershell",
      "model": "X Ultra",
      "title": "Hypershell X Ultra exoskeleton",
      "subtitle": "2025, экзоскелет для походов, запас хода 30 км",
      "price": 1999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-09-09",
      "note": "Цена при старте заказов в сентябре 2025 г.",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Hypershell-X-Ultra-exoskeleton-for-outdoor-adventures-launches-with-more-power-and-30-km-range.1108972.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный потребительский экзоскелет.",
      "image": null,
      "nameRu": "Хайпершелл X Ultra",
      "aliases": [
        "Hypershell exoskeleton"
      ]
    },
    {
      "id": "pt-even-g2",
      "category": "protech",
      "brand": "Even Realities",
      "model": "Even G2",
      "title": "Even Realities Even G2 smart glasses",
      "subtitle": "2026, умные очки с micro-LED дисплеем 1200 нит",
      "price": 599,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-04-08",
      "note": "Цена очков без аксессуаров (диоптрии и кольцо R1 продаются отдельно).",
      "source": {
        "label": "notebookcheck.net",
        "url": "https://www.notebookcheck.net/Even-G2-Smart-Glasses-with-1-200-nits-micro-LED-display-now-available.1269318.0.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный гаджет.",
      "image": null,
      "nameRu": "Ивен G2",
      "aliases": [
        "Even G2 glasses"
      ]
    },
    {
      "id": "pt-bambu-lab-h2d",
      "category": "protech",
      "brand": "Bambu Lab",
      "model": "H2D",
      "title": "Bambu Lab H2D 3D printer",
      "subtitle": "2025, 3D-принтер с двумя экструдерами",
      "price": 1899,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-03-25",
      "note": "Цена базовой версии в США на момент анонса в марте 2025 г.",
      "source": {
        "label": "3dprintingindustry.com",
        "url": "https://3dprintingindustry.com/news/bambu-labs-new-h2d-3d-printer-technical-specifications-and-pricing-237763/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный 3D-принтер.",
      "image": null,
      "nameRu": "Бамбу Лаб H2D",
      "aliases": [
        "H2D"
      ]
    },
    {
      "id": "re-farnsworth-house",
      "category": "realestate",
      "brand": "Mies van der Rohe · Sotheby's",
      "model": "Farnsworth House",
      "title": "Farnsworth House (Plano, Illinois)",
      "subtitle": "1951, стекло и сталь, Мис ван дер Роэ; аукцион 2003",
      "price": 7500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2003-12",
      "note": "Продан на аукционе Sotheby's в 2003 г. (ставка $6,7 млн + комиссия $0,8 млн); покупатели — National Trust for Historic Preservation и Landmarks Illinois.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Farnsworth_House"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Икона модернизма, единственный в своём роде дом Миса ван дер Роэ.",
      "image": null,
      "nameRu": "Дом Фарнсворт",
      "aliases": [
        "Farnsworth House",
        "Фарнсворт"
      ]
    },
    {
      "id": "re-flatiron-building",
      "category": "realestate",
      "brand": "Аукцион · Нью-Йорк",
      "model": "Flatiron Building",
      "title": "Flatiron Building (New York)",
      "subtitle": "1902, 22 этажа, Манхэттен; повторный аукцион 2023",
      "price": 161000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-05-23",
      "note": "Выигрышная ставка на повторном аукционе в мае 2023 г.: контроль над зданием получила группа совладельцев (первый победитель торгов не внёс оплату).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Flatiron_Building"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из самых узнаваемых небоскрёбов мира, проданный с публичного аукциона.",
      "image": null,
      "nameRu": "Флэтайрон-билдинг",
      "aliases": [
        "Flatiron",
        "Fuller Building",
        "Утюг"
      ]
    },
    {
      "id": "re-220-cps-griffin",
      "category": "realestate",
      "brand": "Ken Griffin · 220 Central Park South",
      "model": "220 CPS, кондо Гриффина",
      "title": "Ken Griffin's condo at 220 Central Park South",
      "subtitle": "2019, четырёхэтажная квартира, Манхэттен",
      "price": 238000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2019-01",
      "note": "Сделка закрыта в январе 2019 г.; на тот момент — самая дорогая покупка жилья в США.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/220_Central_Park_South"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Рекордная сделка с жильём в истории США.",
      "image": null,
      "nameRu": "Квартира Кена Гриффина на 220 Central Park South",
      "aliases": [
        "220 Central Park South",
        "Griffin penthouse",
        "пентхаус Гриффина"
      ]
    },
    {
      "id": "re-the-one-bel-air",
      "category": "realestate",
      "brand": "Bel Air · банкротный аукцион",
      "model": "The One",
      "title": "The One (Bel Air, Los Angeles)",
      "subtitle": "105 000 кв. футов, особняк Ниями; аукцион 2022",
      "price": 141000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-03",
      "note": "Продан на банкротном аукционе в марте 2022 г. CEO Fashion Nova Ричарду Сагиану: ставка $126 млн плюс 12% комиссии.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/The_One_(Los_Angeles)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Громкая продажа, но новый дом без истории.",
      "image": null,
      "nameRu": "The One (Бел-Эйр)",
      "aliases": [
        "The One Bel Air",
        "Nile Niami mansion"
      ]
    },
    {
      "id": "re-playboy-mansion",
      "category": "realestate",
      "brand": "Daren Metropoulos",
      "model": "Playboy Mansion",
      "title": "Playboy Mansion (Holmby Hills)",
      "subtitle": "1927, Холмби-Хиллз, Лос-Анджелес; продажа 2016",
      "price": 100000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2016-08",
      "note": "Куплен Дареном Метропулосом в августе 2016 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Playboy_Mansion"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из самых знаменитых особняков поп-культуры.",
      "image": null,
      "nameRu": "Особняк Playboy",
      "aliases": [
        "Playboy Mansion West",
        "особняк Хефнера"
      ]
    },
    {
      "id": "re-neverland-ranch",
      "category": "realestate",
      "brand": "Ron Burkle",
      "model": "Neverland Ranch",
      "title": "Neverland Ranch (Santa Barbara County)",
      "subtitle": "2700 акров, бывшее ранчо Майкла Джексона; продажа 2020",
      "price": 22000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2020-12",
      "note": "Куплено миллиардером Роном Беркле в декабре 2020 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Neverland_Ranch"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Легендарное поместье Майкла Джексона.",
      "image": null,
      "nameRu": "Ранчо «Неверленд»",
      "aliases": [
        "Neverland",
        "Sycamore Valley Ranch",
        "Неверленд"
      ]
    },
    {
      "id": "re-lanai-ellison",
      "category": "realestate",
      "brand": "Larry Ellison",
      "model": "Остров Ланаи (98%)",
      "title": "Lanai island (98% stake)",
      "subtitle": "Гавайи, 98% острова у Castle & Cooke; 2012",
      "price": 300000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2012-06",
      "note": "В июне 2012 г. Ларри Эллисон купил долю 98% острова у Castle & Cooke.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Lanai"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Покупка почти целого обитаемого гавайского острова частным лицом.",
      "image": null,
      "nameRu": "Остров Ланаи",
      "aliases": [
        "Lanai",
        "Lānaʻi",
        "Ланаи"
      ]
    },
    {
      "id": "re-plaza-hotel",
      "category": "realestate",
      "brand": "Henry J. Hardenbergh",
      "model": "The Plaza Hotel",
      "title": "The Plaza Hotel (1907 building), construction",
      "subtitle": "1907, 19 этажей, Пятая авеню, Нью-Йорк",
      "price": 12500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1907",
      "note": "Итоговая стоимость строительства нынешнего здания отеля (открыт в 1907 г.).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Plaza_Hotel"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Известный отель, цена — историческая стоимость постройки.",
      "image": null,
      "nameRu": "Отель «Плаза»",
      "aliases": [
        "Plaza Hotel",
        "Плаза"
      ]
    },
    {
      "id": "re-chateau-louis-xiv",
      "category": "realestate",
      "brand": "Mohammad bin Salman",
      "model": "Château Louis XIV",
      "title": "Château Louis XIV (Louveciennes)",
      "subtitle": "2008–2011, Лувесьенн, Франция; продажа 2015",
      "price": 301000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2015",
      "note": "В 2015 г. куплен наследным принцем Саудовской Аравии Мухаммедом бин Сальманом.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Ch%C3%A2teau_Louis_XIV"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "На момент сделки — самый дорогой дом в мире.",
      "image": null,
      "nameRu": "Шато Людовика XIV",
      "aliases": [
        "Chateau Louis XIV",
        "Шато Луи XIV"
      ]
    },
    {
      "id": "re-spelling-manor",
      "category": "realestate",
      "brand": "Holmby Hills",
      "model": "The Manor (Spelling Manor)",
      "title": "Spelling Manor (Holmby Hills)",
      "subtitle": "1988, ~56 000 кв. футов, Холмби-Хиллз; 2019",
      "price": 120000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2019-07",
      "note": "Продан в июле 2019 г. анонимному покупателю — рекорд Калифорнии на тот момент.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Spelling_Manor"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Дорогая продажа особняка без культурного статуса.",
      "image": null,
      "nameRu": "Поместье Спеллинга",
      "aliases": [
        "The Manor",
        "Spelling Manor"
      ]
    },
    {
      "id": "re-ennis-house",
      "category": "realestate",
      "brand": "Frank Lloyd Wright",
      "model": "Ennis House",
      "title": "Ennis House (Los Angeles)",
      "subtitle": "1924, текстильные блоки, Ф. Л. Райт; продажа 2019",
      "price": 18000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2019-10",
      "note": "Продан Роном Беркле в октябре 2019 г.; на тот момент — рекордная цена за дом Райта.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Ennis_House"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Известный дом Райта, но не главный.",
      "image": null,
      "nameRu": "Дом Эннис",
      "aliases": [
        "Ennis-Brown House",
        "дом Энниса"
      ]
    },
    {
      "id": "re-walker-house-carmel",
      "category": "realestate",
      "brand": "Frank Lloyd Wright",
      "model": "Mrs. Clinton Walker House",
      "title": "Mrs. Clinton Walker House (Carmel-by-the-Sea)",
      "subtitle": "1952, на скале над океаном, Кармел; продажа 2023",
      "price": 22000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2023",
      "note": "Продан в 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Mrs._Clinton_Walker_House"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Небольшой дом Райта, известен знатокам.",
      "image": null,
      "nameRu": "Дом миссис Клинтон Уокер",
      "aliases": [
        "Cabin on the Rocks",
        "Walker House"
      ]
    },
    {
      "id": "re-kaufmann-desert-house",
      "category": "realestate",
      "brand": "Richard Neutra",
      "model": "Kaufmann Desert House",
      "title": "Kaufmann Desert House (Palm Springs)",
      "subtitle": "1946, Рихард Нойтра, Палм-Спрингс; продажа 2022",
      "price": 13000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2022",
      "note": "Продан в 2022 г. — рекорд для рынка Палм-Спрингс.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Kaufmann_Desert_House"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Известен любителям архитектуры.",
      "image": null,
      "nameRu": "Пустынный дом Кауфмана",
      "aliases": [
        "Kaufmann House Palm Springs"
      ]
    },
    {
      "id": "re-fallingwater",
      "category": "realestate",
      "brand": "Frank Lloyd Wright",
      "model": "Fallingwater",
      "title": "Fallingwater (Mill Run, Pennsylvania)",
      "subtitle": "1936–1939, дом и гостевой флигель, Пенсильвания",
      "price": 155000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1939",
      "note": "Итоговая стоимость строительства дома и гостевого флигеля (почти вчетверо выше исходного бюджета).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Fallingwater"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Самый знаменитый частный дом XX века.",
      "image": null,
      "nameRu": "Дом над водопадом",
      "aliases": [
        "Fallingwater",
        "Kaufmann Residence",
        "Дом над водопадом"
      ]
    },
    {
      "id": "re-empire-state-building",
      "category": "realestate",
      "brand": "Shreve, Lamb & Harmon",
      "model": "Empire State Building",
      "title": "Empire State Building (construction)",
      "subtitle": "1930–1931, 102 этажа, Нью-Йорк",
      "price": 40948900,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1931",
      "note": "Стоимость строительства небоскрёба по данным на момент постройки.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Empire_State_Building"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из самых известных небоскрёбов мира.",
      "image": null,
      "nameRu": "Эмпайр-стейт-билдинг",
      "aliases": [
        "Empire State",
        "Эмпайр-стейт"
      ]
    },
    {
      "id": "re-mar-a-lago",
      "category": "realestate",
      "brand": "Donald Trump",
      "model": "Mar-a-Lago",
      "title": "Mar-a-Lago (Palm Beach)",
      "subtitle": "1927, поместье М. М. Пост, Палм-Бич; покупка 1985",
      "price": 7000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "1985",
      "note": "Цена покупки поместья Дональдом Трампом в 1985 г. (без учёта мебели; общая сумма по разным источникам выше).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Mar-a-Lago"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Известное поместье, обычная сделка 1985 г.",
      "image": null,
      "nameRu": "Мар-а-Лаго",
      "aliases": [
        "Mar a Lago",
        "Мар-а-Лаго"
      ]
    },
    {
      "id": "re-one57-dell-penthouse",
      "category": "realestate",
      "brand": "Michael Dell · One57",
      "model": "Пентхаус One57",
      "title": "One57 top penthouse",
      "subtitle": "2014, верхний пентхаус, Billionaires' Row",
      "price": 100500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2014",
      "note": "Верхний пентхаус One57 продан в 2014 г.; покупателем оказался Майкл Делл.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/One57"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Дорогой пентхаус без исторического значения.",
      "image": null,
      "nameRu": "Пентхаус в One57",
      "aliases": [
        "One57 penthouse",
        "Dell penthouse"
      ]
    },
    {
      "id": "re-grey-gardens",
      "category": "realestate",
      "brand": "Liz Lange",
      "model": "Grey Gardens",
      "title": "Grey Gardens (East Hampton)",
      "subtitle": "1897, Ист-Хэмптон; продажа 2017",
      "price": 15500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2017-12-20",
      "note": "Продан дизайнеру Лиз Ланге 20 декабря 2017 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Grey_Gardens_(estate)"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Известен по документальному фильму, но не уникален.",
      "image": null,
      "nameRu": "Грей Гарденс",
      "aliases": [
        "Grey Gardens",
        "Серые сады"
      ]
    },
    {
      "id": "re-graceland",
      "category": "realestate",
      "brand": "Elvis Presley",
      "model": "Graceland",
      "title": "Graceland (Memphis)",
      "subtitle": "1939, Мемфис; покупка Элвисом 1957",
      "price": 102500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "1957-03-19",
      "note": "Цена, которую Элвис Пресли заплатил за поместье 19 марта 1957 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Graceland"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самый знаменитый дом рок-н-ролла.",
      "image": null,
      "nameRu": "Грейсленд",
      "aliases": [
        "Graceland",
        "Грейсленд"
      ]
    },
    {
      "id": "re-woolworth-building",
      "category": "realestate",
      "brand": "Cass Gilbert",
      "model": "Woolworth Building",
      "title": "Woolworth Building (construction)",
      "subtitle": "1910–1913, 57 этажей, Нью-Йорк",
      "price": 13500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1913",
      "note": "Итоговая оценочная стоимость строительства (включая землю $5 млн).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Woolworth_Building"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Исторический небоскрёб, известен меньше Empire State.",
      "image": null,
      "nameRu": "Вулворт-билдинг",
      "aliases": [
        "Woolworth Building",
        "Собор коммерции"
      ]
    },
    {
      "id": "re-casa-casuarina",
      "category": "realestate",
      "brand": "Versace Mansion",
      "model": "Casa Casuarina",
      "title": "Casa Casuarina (Versace Mansion), Miami Beach",
      "subtitle": "1930, Оушен-драйв, Майами-Бич; продажа 2013",
      "price": 41500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013",
      "note": "Куплен компанией VM South Beach LLC в 2013 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Casa_Casuarina"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Известный особняк, обычная сделка.",
      "image": null,
      "nameRu": "Особняк Версаче",
      "aliases": [
        "Versace Mansion",
        "Casa Casuarina",
        "дом Версаче"
      ]
    },
    {
      "id": "re-pickfair",
      "category": "realestate",
      "brand": "Mary Pickford & Douglas Fairbanks",
      "model": "Pickfair",
      "title": "Pickfair (Beverly Hills)",
      "subtitle": "Поместье Пикфорд и Фэрбенкса, Беверли-Хиллз; 2005",
      "price": 15000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2005-04-19",
      "note": "Куплен компанией UNICOM Global 19 апреля 2005 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Pickfair"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Голливудская история, малоизвестна сегодня.",
      "image": null,
      "nameRu": "Пикфэр",
      "aliases": [
        "Pickfair"
      ]
    },
    {
      "id": "re-transamerica-pyramid",
      "category": "realestate",
      "brand": "William Pereira",
      "model": "Transamerica Pyramid",
      "title": "Transamerica Pyramid (San Francisco)",
      "subtitle": "1972, 48 этажей, Сан-Франциско; продажа 2020",
      "price": 650000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2020-10",
      "note": "В 2020 г. Aegon продала здание SHVO и Deutsche Finance America.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Transamerica_Pyramid"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Главный символ силуэта Сан-Франциско.",
      "image": null,
      "nameRu": "Пирамида Трансамерика",
      "aliases": [
        "Transamerica Pyramid",
        "Трансамерика"
      ]
    },
    {
      "id": "re-space-needle",
      "category": "realestate",
      "brand": "Seattle World's Fair",
      "model": "Space Needle",
      "title": "Space Needle (Seattle), construction",
      "subtitle": "1961–1962, 184 м, Сиэтл",
      "price": 4500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1962-04",
      "note": "Стоимость строительства башни к Всемирной выставке 1962 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Space_Needle"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Символ Сиэтла и эпохи космического оптимизма.",
      "image": null,
      "nameRu": "Спейс-Нидл",
      "aliases": [
        "Space Needle",
        "Космическая игла"
      ]
    },
    {
      "id": "re-golden-gate-bridge",
      "category": "realestate",
      "brand": "Joseph Strauss",
      "model": "Golden Gate Bridge",
      "title": "Golden Gate Bridge, construction",
      "subtitle": "1933–1937, пролёт 1280 м, Сан-Франциско",
      "price": 35000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1937-05",
      "note": "Стоимость строительства (по источнику — «более $35 млн», проект сдан с экономией бюджета).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Golden_Gate_Bridge"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "LEGENDARY",
      "rarityReason": "Один из самых узнаваемых мостов мира.",
      "image": null,
      "nameRu": "Мост Золотые Ворота",
      "aliases": [
        "Golden Gate",
        "Золотые Ворота"
      ]
    },
    {
      "id": "re-gateway-arch",
      "category": "realestate",
      "brand": "Eero Saarinen",
      "model": "Gateway Arch",
      "title": "Gateway Arch (St. Louis), construction",
      "subtitle": "1963–1965, 192 м, нержавеющая сталь, Сент-Луис",
      "price": 13000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1965-10",
      "note": "Общая стоимость строительства арки.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Gateway_Arch"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Самая высокая арка в мире, работа Ээро Сааринена.",
      "image": null,
      "nameRu": "Арка «Ворота на Запад»",
      "aliases": [
        "Gateway Arch",
        "Арка Сент-Луиса"
      ]
    },
    {
      "id": "re-walt-disney-concert-hall",
      "category": "realestate",
      "brand": "Frank Gehry",
      "model": "Walt Disney Concert Hall",
      "title": "Walt Disney Concert Hall (Los Angeles)",
      "subtitle": "2003, Фрэнк Гери, Лос-Анджелес",
      "price": 274000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "2003-10",
      "note": "Оценочная стоимость проекта на момент завершения (из них $110 млн — паркинг).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Walt_Disney_Concert_Hall"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Знаковое здание Фрэнка Гери.",
      "image": null,
      "nameRu": "Концертный зал Уолта Диснея",
      "aliases": [
        "Disney Concert Hall"
      ]
    },
    {
      "id": "re-guggenheim-bilbao",
      "category": "realestate",
      "brand": "Frank Gehry",
      "model": "Guggenheim Bilbao",
      "title": "Guggenheim Museum Bilbao, construction",
      "subtitle": "1993–1997, титан, Фрэнк Гери, Бильбао",
      "price": 89000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1997-10",
      "note": "Стоимость строительства музея подрядчиком Ferrovial.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Guggenheim_Museum_Bilbao"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Здание, давшее имя «эффекту Бильбао».",
      "image": null,
      "nameRu": "Музей Гуггенхайма в Бильбао",
      "aliases": [
        "Guggenheim Bilbao",
        "Гуггенхайм Бильбао"
      ]
    },
    {
      "id": "re-lucas-oil-stadium",
      "category": "realestate",
      "brand": "Indianapolis Colts",
      "model": "Lucas Oil Stadium",
      "title": "Lucas Oil Stadium (Indianapolis)",
      "subtitle": "2008, раздвижная крыша, ~67 000 мест",
      "price": 720000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "2008-08",
      "note": "Общая стоимость строительства стадиона (открыт 16 августа 2008 г.).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Lucas_Oil_Stadium"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Современный стадион НФЛ — крупный, но не уникальный объект.",
      "image": null,
      "nameRu": "Лукас Ойл Стэдиум",
      "aliases": [
        "Lucas Oil Stadium"
      ]
    },
    {
      "id": "re-fenway-park",
      "category": "realestate",
      "brand": "Boston Red Sox",
      "model": "Fenway Park",
      "title": "Fenway Park (Boston), construction",
      "subtitle": "1912, Бостон, старейший стадион MLB",
      "price": 650000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1912-04",
      "note": "Стоимость строительства стадиона (открыт 20 апреля 1912 г.).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Fenway_Park"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Знаменитый стадион, но интерес — в основном для фанатов бейсбола.",
      "image": null,
      "nameRu": "Фенуэй-парк",
      "aliases": [
        "Fenway Park",
        "Фенуэй"
      ]
    },
    {
      "id": "re-wrigley-field",
      "category": "realestate",
      "brand": "Chicago Cubs",
      "model": "Wrigley Field",
      "title": "Wrigley Field (Chicago), construction",
      "subtitle": "1914, Чикаго, стадион «Кабс»",
      "price": 250000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1914-04",
      "note": "Стоимость строительства стадиона (открыт 23 апреля 1914 г.).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Wrigley_Field"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Знаменитый стадион, но интерес — в основном для фанатов бейсбола.",
      "image": null,
      "nameRu": "Ригли-филд",
      "aliases": [
        "Wrigley Field",
        "Ригли"
      ]
    },
    {
      "id": "re-oheka-castle",
      "category": "realestate",
      "brand": "Hideki Yokoi",
      "model": "Oheka Castle",
      "title": "Oheka Castle (Long Island)",
      "subtitle": "1919, 127 комнат, Лонг-Айленд; продажа 1988",
      "price": 22500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "1988",
      "note": "В 1988 г. Гэри Мелиус продал замок японскому бизнесмену Хидэки Ёкои.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Oheka_Castle"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Особняк-замок, малоизвестен.",
      "image": null,
      "nameRu": "Замок Охека",
      "aliases": [
        "Oheka",
        "Otto Kahn estate"
      ]
    },
    {
      "id": "re-robie-house",
      "category": "realestate",
      "brand": "Frank Lloyd Wright",
      "model": "Robie House",
      "title": "Frederick C. Robie House (Chicago)",
      "subtitle": "1910, стиль прерий, Чикаго; продажа 1958",
      "price": 102000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "1958-08",
      "note": "Девелопер Уильям Зекендорф приобрёл дом в августе 1958 г., спасая его от сноса.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Frederick_C._Robie_House"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Важный дом Райта, известен знатокам.",
      "image": null,
      "nameRu": "Дом Роби",
      "aliases": [
        "Robie House",
        "дом Роби"
      ]
    },
    {
      "id": "re-stahl-house",
      "category": "realestate",
      "brand": "Pierre Koenig",
      "model": "Stahl House",
      "title": "Stahl House (Case Study House #22)",
      "subtitle": "1959–1960, Case Study House #22, Голливуд-Хиллз",
      "price": 37500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1960",
      "note": "Стоимость строительства дома по проекту Пьера Кёнига (бассейн — отдельно).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Stahl_House"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Икона модернизма, но цена — скромная стоимость постройки.",
      "image": null,
      "nameRu": "Дом Шталя",
      "aliases": [
        "Case Study House 22",
        "CSH #22",
        "Stahl House"
      ]
    },
    {
      "id": "re-brooklyn-bridge",
      "category": "realestate",
      "brand": "John A. Roebling",
      "model": "Brooklyn Bridge",
      "title": "Brooklyn Bridge, construction",
      "subtitle": "1869–1883, висячий мост, Нью-Йорк",
      "price": 15500000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "construction_cost",
      "priceDate": "1883-05",
      "note": "Стоимость строительства моста в долларах 1883 г. (открыт 24 мая 1883 г.).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Brooklyn_Bridge"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Один из первых стально-тросовых висячих мостов, символ Нью-Йорка.",
      "image": null,
      "nameRu": "Бруклинский мост",
      "aliases": [
        "Brooklyn Bridge",
        "Бруклинский мост"
      ]
    },
    {
      "id": "tr-ducati-panigale-v4r-2026",
      "category": "transport",
      "brand": "Ducati",
      "model": "Panigale V4 R (2026)",
      "title": "2026 Ducati Panigale V4 R",
      "subtitle": "2026, V4 998 см³, омологационный супербайк",
      "price": 49995,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-03",
      "note": "Стартовая рекомендованная цена (MSRP) в США для модели 2026 года.",
      "source": {
        "label": "aol.com (Robb Report)",
        "url": "https://www.aol.com/lifestyle/ducati-introduces-2026-panigale-v4-223013626.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный мотоцикл, который можно купить у дилера.",
      "image": null,
      "nameRu": "Дукати Панигале V4 R",
      "aliases": [
        "Panigale V4R",
        "Панигале V4 R"
      ]
    },
    {
      "id": "tr-ducati-superleggera-v4-centenario",
      "category": "transport",
      "brand": "Ducati",
      "model": "Superleggera V4 Centenario",
      "title": "Ducati Superleggera V4 Centenario",
      "subtitle": "2026, карбоновая рама и колёса, 500 номерных экземпляров",
      "price": 165000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026-03",
      "note": "Цена в США, объявленная Ducati; все 500 экземпляров распроданы сразу после анонса.",
      "source": {
        "label": "finance.yahoo.com",
        "url": "https://finance.yahoo.com/news/ducatis-165000-no-limits-superleggera-motorcycle-is-already-sold-out-135940211.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Лимитированная серия из 500 пронумерованных мотоциклов.",
      "image": null,
      "nameRu": "Дукати Суперледжера V4 Чентенарио",
      "aliases": [
        "Superleggera V4 Centenario",
        "Суперледжера"
      ]
    },
    {
      "id": "tr-harley-cvo-road-glide-st-2026",
      "category": "transport",
      "brand": "Harley-Davidson",
      "model": "CVO Road Glide ST (2026)",
      "title": "2026 Harley-Davidson CVO Road Glide ST",
      "subtitle": "2026, V-twin Milwaukee-Eight 121, заводской кастом CVO",
      "price": 44999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Рекомендованная цена в США без учёта доставки ($895).",
      "source": {
        "label": "motorcycle.com",
        "url": "https://www.motorcycle.com/specs/harley-davidson/touring/2026/road-glide/cvo-st/detail.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийная модель линейки CVO, продаётся у дилеров.",
      "image": null,
      "nameRu": "Харли-Дэвидсон CVO Роуд Глайд ST",
      "aliases": [
        "CVO Road Glide",
        "Роуд Глайд"
      ]
    },
    {
      "id": "tr-bmw-m1000rr-50-years-m",
      "category": "transport",
      "brand": "BMW Motorrad",
      "model": "M 1000 RR «50 Years M»",
      "title": "BMW M 1000 RR 50 Years M Edition",
      "subtitle": "2022, рядная 4-ка 999 см³, юбилейная версия",
      "price": 36995,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2022-05",
      "note": "Рекомендованная цена в США при анонсе юбилейной версии, без доставки ($645).",
      "source": {
        "label": "press.bmwgroup.com",
        "url": "https://www.press.bmwgroup.com/usa/article/detail/T0391614EN_US/bmw-motorrad-presents-the-bmw-m-1000-rr-as-the-anniversary-model-m-rr-50-years-m"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Юбилейная спецверсия, выпускавшаяся ограниченное время.",
      "image": null,
      "nameRu": "БМВ M 1000 RR «50 лет M»",
      "aliases": [
        "M1000RR",
        "BMW M RR"
      ]
    },
    {
      "id": "tr-kawasaki-ninja-h2r-2026",
      "category": "transport",
      "brand": "Kawasaki",
      "model": "Ninja H2R (2026)",
      "title": "2026 Kawasaki Ninja H2R ABS",
      "subtitle": "2026, 998 см³ с наддувом, трековый, ~310 л.с.",
      "price": 59100,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2026",
      "note": "Рекомендованная цена в США для трековой версии 2026 модельного года.",
      "source": {
        "label": "rideapart.com",
        "url": "https://www.rideapart.com/news/771622/kawasaki-h2-h2r-superbike-supercharged-2026-pricing-usa/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный (хоть и трековый) мотоцикл, заказывается у дилера.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Kawasaki_Ninja_H2R_%2819786257286%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Kawasaki_Ninja_H2R_%2819786257286%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Кавасаки Ниндзя H2R",
      "aliases": [
        "H2R",
        "Ninja H2 R"
      ]
    },
    {
      "id": "tr-honda-gold-wing-tour-2025",
      "category": "transport",
      "brand": "Honda",
      "model": "Gold Wing Tour (2025)",
      "title": "2025 Honda Gold Wing Tour",
      "subtitle": "2025, оппозитная 6-ка 1833 см³, туристический",
      "price": 28700,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-02",
      "note": "Рекомендованная цена в США за базовую версию Gold Wing Tour 2025 г.",
      "source": {
        "label": "powersportsbusiness.com",
        "url": "https://powersportsbusiness.com/top-stories/2025/02/06/honda-celebrates-50th-anniversary-of-gold-wing-with-2025-models/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный туристический мотоцикл.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Honda_Gold_Wing_GL_1800_%28SC79_-_2018%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Honda_Gold_Wing_GL_1800_%28SC79_-_2018%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Хонда Голд Винг Тур",
      "aliases": [
        "Goldwing",
        "Голдвинг",
        "GL1800"
      ]
    },
    {
      "id": "tr-triumph-rocket-3-storm-r",
      "category": "transport",
      "brand": "Triumph",
      "model": "Rocket 3 Storm R",
      "title": "2025 Triumph Rocket 3 Storm R",
      "subtitle": "2025, рядная 3-ка 2458 см³ — самый большой серийный мотор",
      "price": 24995,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-03",
      "note": "Рекомендованная цена версии Storm R 2025 модельного года при анонсе.",
      "source": {
        "label": "ultimatemotorcycling.com",
        "url": "https://ultimatemotorcycling.com/?p=276007"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный мотоцикл.",
      "image": null,
      "nameRu": "Триумф Рокет 3 Шторм R",
      "aliases": [
        "Rocket III",
        "Рокет 3"
      ]
    },
    {
      "id": "tr-ktm-1390-super-duke-r-evo",
      "category": "transport",
      "brand": "KTM",
      "model": "1390 Super Duke R Evo",
      "title": "2024 KTM 1390 Super Duke R Evo",
      "subtitle": "2024, V-twin 1350 см³, 190 л.с., нейкед",
      "price": 21499,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-11",
      "note": "Рекомендованная цена модели 2024 года при первом анонсе.",
      "source": {
        "label": "ultimatemotorcycling.com",
        "url": "https://ultimatemotorcycling.com/2023/11/29/2024-ktm-1390-super-duke-r-evo-first-look-17-fast-facts"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный мотоцикл.",
      "image": null,
      "nameRu": "КТМ 1390 Супер Дюк R Эво",
      "aliases": [
        "Super Duke 1390",
        "The Beast"
      ]
    },
    {
      "id": "tr-zero-srf-2025",
      "category": "transport",
      "brand": "Zero Motorcycles",
      "model": "SR/F (2025)",
      "title": "2025 Zero SR/F Z-Force 17.3",
      "subtitle": "2025, электромотоцикл, батарея 17,3 кВт·ч",
      "price": 20495,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025",
      "note": "Рекомендованная цена в США для электромотоцикла SR/F 2025 г.",
      "source": {
        "label": "motorcycle.com",
        "url": "https://www.motorcycle.com/specs/zero/standard/2025/sr-f/z-force-17-3/detail.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный электромотоцикл.",
      "image": null,
      "nameRu": "Зиро SR/F",
      "aliases": [
        "Zero SRF"
      ]
    },
    {
      "id": "tr-arch-krgt-1",
      "category": "transport",
      "brand": "Arch Motorcycle",
      "model": "KRGT-1",
      "title": "Arch Motorcycle KRGT-1",
      "subtitle": "Ручная сборка, V-twin S&S 2032 см³, компания Киану Ривза",
      "price": 78000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2016-08",
      "note": "Ориентировочная цена нового мотоцикла ручной сборки, по данным Time Out (2016).",
      "source": {
        "label": "timeout.com",
        "url": "https://www.timeout.com/los-angeles/blog/keanu-reeves-will-build-you-a-motorcycleif-youve-got-78-000-081716"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Мелкосерийный мотоцикл ручной сборки под заказ.",
      "image": null,
      "nameRu": "Арч KRGT-1 (мотоцикл Киану Ривза)",
      "aliases": [
        "Keanu Reeves motorcycle",
        "Arch KRGT1"
      ]
    },
    {
      "id": "tr-vespa-gts-310-2025",
      "category": "transport",
      "brand": "Vespa",
      "model": "GTS 310 (2025)",
      "title": "2025 Vespa GTS 310",
      "subtitle": "2025, скутер 310 см³, стальной кузов",
      "price": 7899,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025",
      "note": "Рекомендованная цена в США для GTS 310 2025 г.",
      "source": {
        "label": "motorcycle.com",
        "url": "https://www.motorcycle.com/specs/vespa/scooter/2025/gts/310/detail.html"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "COMMON",
      "rarityReason": "Серийный скутер.",
      "image": null,
      "nameRu": "Веспа GTS 310",
      "aliases": [
        "Vespa GTS"
      ]
    },
    {
      "id": "tr-indian-roadmaster-elite-2025",
      "category": "transport",
      "brand": "Indian Motorcycle",
      "model": "Roadmaster Elite (2025)",
      "title": "2025 Indian Roadmaster Elite",
      "subtitle": "2025, V-twin PowerPlus 112, 300 номерных экземпляров",
      "price": 41999,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2024-11",
      "note": "Рекомендованная цена в США лимитированной версии 2025 г.",
      "source": {
        "label": "cyclenews.com",
        "url": "https://www.cyclenews.com/2024/11/article/new-2025-indian-motorcycle-roadmaster-elite-specs-and-price"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Лимитированная серия: 300 экземпляров на весь мир.",
      "image": null,
      "nameRu": "Индиан Роудмастер Элит",
      "aliases": [
        "Roadmaster Elite"
      ]
    },
    {
      "id": "tr-vincent-black-lightning-1951",
      "category": "transport",
      "brand": "Bonhams · Las Vegas",
      "model": "Vincent Black Lightning 1951",
      "title": "1951 Vincent Black Lightning (frame 7305, ex-Jack Ehret)",
      "subtitle": "1951, 998 см³, рекорд Австралии 141,5 миль/ч, оригинал",
      "price": 929000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-01",
      "note": "Продан на аукционе Bonhams в Лас-Вегасе в январе 2018 г.; на тот момент — мировой рекорд для мотоцикла.",
      "source": {
        "label": "ridermagazine.com",
        "url": "https://ridermagazine.com/record-setting-1951-vincent-black-lightning-sells-for-929000-at-auction/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "LEGENDARY",
      "rarityReason": "Один из ~30 построенных Black Lightning и рекордный аукционный лот.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/VINCENT_Black_Lightning.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:VINCENT_Black_Lightning.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Винсент Блэк Лайтнинг 1951",
      "aliases": [
        "Black Lightning",
        "Винсент"
      ]
    },
    {
      "id": "tr-harley-strap-tank-1908",
      "category": "transport",
      "brand": "Mecum · Las Vegas",
      "model": "Harley-Davidson Strap Tank 1908",
      "title": "1908 Harley-Davidson Strap Tank",
      "subtitle": "1908, одноцилиндровый, оригинальные бак и колёса",
      "price": 935000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-01",
      "note": "Продан на аукционе Mecum в январе 2023 г. — рекорд для мотоцикла на аукционе.",
      "source": {
        "label": "abc7chicago.com",
        "url": "https://abc7chicago.com/post/1908-harley-davidson-strap-tank-motorcycle-auction/12878817/"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "EPIC",
      "rarityReason": "Очень редкий мотоцикл, но не мировой рекорд и не икона.",
      "image": null,
      "nameRu": "Харли-Дэвидсон Strap Tank 1908",
      "aliases": [
        "1908 Harley",
        "Strap Tank"
      ]
    },
    {
      "id": "tr-easy-rider-captain-america",
      "category": "transport",
      "brand": "Profiles in History",
      "model": "Чоппер Captain America",
      "title": "Easy Rider 'Captain America' Harley-Davidson chopper",
      "subtitle": "1969, Harley-Davidson Panhead, фильм «Беспечный ездок»",
      "price": 1350000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2014-10",
      "note": "Продан на аукционе голливудских реликвий Profiles in History в октябре 2014 г.; подлинность экземпляра оспаривалась.",
      "source": {
        "label": "motorcyclenews.com",
        "url": "https://motorcyclenews.com/news/2014/october/captain-america-sells-for-135-million"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Культовый киномотоцикл, но происхождение лота оспаривается.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Captain_America_motorcycle_from_Easy_Rider.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Captain_America_motorcycle_from_Easy_Rider.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Чоппер «Капитан Америка» из «Беспечного ездока»",
      "aliases": [
        "Captain America bike",
        "Easy Rider chopper"
      ]
    },
    {
      "id": "tr-mcqueen-husqvarna-400-cross",
      "category": "transport",
      "brand": "Bonhams · Carmel",
      "model": "Husqvarna Стива Маккуина",
      "title": "1971 Husqvarna 400 Cross ex-Steve McQueen",
      "subtitle": "1971, мотокросс 400 см³, принадлежал Стиву Маккуину",
      "price": 144500,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2011-05",
      "note": "Продан на аукционе Bonhams & Butterfields в Кармеле в мае 2011 г. — мировой рекорд для Husqvarna.",
      "source": {
        "label": "sportscarmarket.com",
        "url": "https://www.sportscarmarket.com/news/world-record-price-for-mcqueen-husqvarna"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Серийный мотоцикл, ценность — в истории владельца.",
      "image": null,
      "nameRu": "Хускварна 400 Cross Стива Маккуина",
      "aliases": [
        "Steve McQueen Husqvarna"
      ]
    },
    {
      "id": "tr-gulfstream-g700",
      "category": "transport",
      "brand": "Gulfstream",
      "model": "G700",
      "title": "Gulfstream G700",
      "subtitle": "Бизнес-джет, 2×Rolls-Royce Pearl, дальность ~13 900 км",
      "price": 79900000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023",
      "note": "Цена в типовой комплектации (equipped price) по данным справочника Business & Commercial Aviation, 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/G650"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный бизнес-джет, выпускаемый на заказ.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Gulfstream_G700_%2810-20-2022%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Gulfstream_G700_%2810-20-2022%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Гольфстрим G700",
      "aliases": [
        "G700",
        "Гольфстрим"
      ]
    },
    {
      "id": "tr-bombardier-global-7500",
      "category": "transport",
      "brand": "Bombardier",
      "model": "Global 7500",
      "title": "Bombardier Global 7500",
      "subtitle": "Бизнес-джет, 4 салона, дальность ~14 260 км",
      "price": 78000000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023",
      "note": "Цена в типовой комплектации по справочнику Business & Commercial Aviation, 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Bombardier_Global_7500"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный бизнес-джет.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Bombardier_Global_7500%2C_Paris_Air_Show_2019%2C_Le_Bourget_%28SIAE8905%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Bombardier_Global_7500%2C_Paris_Air_Show_2019%2C_Le_Bourget_%28SIAE8905%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Бомбардье Глобал 7500",
      "aliases": [
        "Global 7500"
      ]
    },
    {
      "id": "tr-cessna-citation-longitude",
      "category": "transport",
      "brand": "Cessna",
      "model": "Citation Longitude",
      "title": "Cessna Citation Longitude",
      "subtitle": "Бизнес-джет супер-среднего класса, до 12 пассажиров",
      "price": 29995000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023",
      "note": "Цена в типовой комплектации по справочнику Business & Commercial Aviation, 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Cessna_Citation_Longitude"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный бизнес-джет.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Cessna_700_Citation_Longitude_NBAA_2022.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Cessna_700_Citation_Longitude_NBAA_2022.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Сессна Ситейшн Лонгитьюд",
      "aliases": [
        "Citation Longitude",
        "Cessna 700"
      ]
    },
    {
      "id": "tr-pilatus-pc-24",
      "category": "transport",
      "brand": "Pilatus",
      "model": "PC-24",
      "title": "Pilatus PC-24",
      "subtitle": "Бизнес-джет, умеет садиться на грунт",
      "price": 12200000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023",
      "note": "Цена в типовой комплектации по справочнику Business & Commercial Aviation, 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Pilatus_PC-24"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный бизнес-джет.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Pilatus_PC-24%2C_P01%2C_HB-VXA_%2818743050229%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Pilatus_PC-24%2C_P01%2C_HB-VXA_%2818743050229%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Пилатус PC-24",
      "aliases": [
        "PC-24",
        "Super Versatile Jet"
      ]
    },
    {
      "id": "tr-pilatus-pc-12-ngx",
      "category": "transport",
      "brand": "Pilatus",
      "model": "PC-12 NGX",
      "title": "Pilatus PC-12 NGX",
      "subtitle": "Одномоторный турбовинтовой, PT6E-67XP, до 9 пассажиров",
      "price": 6028000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023",
      "note": "Цена в типовой комплектации по справочнику Business & Commercial Aviation, 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Pilatus_PC-12"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный самолёт.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Pilatus_PC-12-47E_NGX_%2810-20-2022%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Pilatus_PC-12-47E_NGX_%2810-20-2022%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Пилатус PC-12 NGX",
      "aliases": [
        "PC-12"
      ]
    },
    {
      "id": "tr-cirrus-vision-jet-g2plus",
      "category": "transport",
      "brand": "Cirrus",
      "model": "Vision Jet SF50 G2+",
      "title": "Cirrus Vision SF50 G2+",
      "subtitle": "Однодвигательный персональный джет с парашютом",
      "price": 3250000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023",
      "note": "Цена в типовой комплектации версии G2+ по справочнику Business & Commercial Aviation, 2023 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/Cirrus_Vision_SF50"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный персональный самолёт.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Cirrus_Vision_SF50_G2%2B_%2810-20-2022%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Cirrus_Vision_SF50_G2%2B_%2810-20-2022%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Сиррус Вижн Джет SF50",
      "aliases": [
        "Vision Jet",
        "SF50"
      ]
    },
    {
      "id": "tr-hondajet-elite-ii",
      "category": "transport",
      "brand": "Honda Aircraft",
      "model": "HondaJet Elite II",
      "title": "Honda HA-420 HondaJet Elite II",
      "subtitle": "Лёгкий бизнес-джет, двигатели над крылом",
      "price": 6950000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2022-10",
      "note": "Цена новой версии Elite II при анонсе в октябре 2022 г.",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/HondaJet"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный бизнес-джет.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Honda_HA-420_HondaJet_Elite_II_%287-28-2023%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Honda_HA-420_HondaJet_Elite_II_%287-28-2023%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "ХондаДжет Элит II",
      "aliases": [
        "HondaJet",
        "HA-420"
      ]
    },
    {
      "id": "tr-boeing-777-9",
      "category": "transport",
      "brand": "Boeing",
      "model": "777-9 (777X)",
      "title": "Boeing 777-9",
      "subtitle": "Крупнейший двухмоторный лайнер, складные законцовки крыла",
      "price": 442200000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2023-05",
      "note": "Каталожная (list) цена Boeing на май 2023 г.; реальные контракты заключаются со скидками.",
      "source": {
        "label": "malaymail.com",
        "url": "https://www.malaymail.com/news/money/2024/07/20/inside-the-777x-what-you-need-to-know-about-the-latest-boeing-model/144450"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный авиалайнер (по каталогу).",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Boeing_777-9_front_view.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Boeing_777-9_front_view.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Боинг 777-9",
      "aliases": [
        "777X",
        "Боинг 777X"
      ]
    },
    {
      "id": "tr-airbus-a380",
      "category": "transport",
      "brand": "Airbus",
      "model": "A380",
      "title": "Airbus A380-800",
      "subtitle": "Двухпалубный лайнер, до 853 мест",
      "price": 445600000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2018-01",
      "note": "Средняя каталожная цена Airbus на 2018 г.; авиакомпании платили значительно меньше.",
      "source": {
        "label": "businesstraveller.com",
        "url": "https://www.businesstraveller.com/business-travel/airbus-publishes-2018-aircraft-list-prices/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный авиалайнер (выпуск завершён в 2021 г.).",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Airbus_A380-800_-_Emirates_%28A6-EDF%29.JPG?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Airbus_A380-800_-_Emirates_%28A6-EDF%29.JPG",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Аэробус A380",
      "aliases": [
        "A380",
        "Аэробус 380"
      ]
    },
    {
      "id": "tr-airbus-a350-1000",
      "category": "transport",
      "brand": "Airbus",
      "model": "A350-1000",
      "title": "Airbus A350-1000",
      "subtitle": "Широкофюзеляжный лайнер, 350–410 мест",
      "price": 366500000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2018-01",
      "note": "Средняя каталожная цена Airbus на 2018 г.",
      "source": {
        "label": "businesstraveller.com",
        "url": "https://www.businesstraveller.com/business-travel/airbus-publishes-2018-aircraft-list-prices/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "COMMON",
      "rarityReason": "Серийный авиалайнер.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Qatar_Airways_Airbus_A350-1000_%28A7-ANA%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Qatar_Airways_Airbus_A350-1000_%28A7-ANA%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Аэробус A350-1000",
      "aliases": [
        "A350",
        "Аэробус 350"
      ]
    },
    {
      "id": "tr-f-35a-lightning-ii",
      "category": "transport",
      "brand": "Lockheed Martin",
      "model": "F-35A Lightning II",
      "title": "Lockheed Martin F-35A Lightning II",
      "subtitle": "Истребитель 5-го поколения, лоты 18–19",
      "price": 92000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "unit_cost",
      "priceDate": "2026-09",
      "note": "Средняя стоимость производства одного F-35A (flyaway cost) в лотах 18–19, с двигателем.",
      "source": {
        "label": "airandspaceforces.com",
        "url": "https://www.airandspaceforces.com/what-an-f-35-costs-right-now-variants-2026/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Военный самолёт: купить нельзя, цена — стоимость одной машины для госзаказа.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/F-35A_flight_%28cropped%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:F-35A_flight_%28cropped%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Локхид Мартин F-35A",
      "aliases": [
        "F-35",
        "Ф-35"
      ]
    },
    {
      "id": "tr-b-2-spirit",
      "category": "transport",
      "brand": "Northrop Grumman",
      "model": "B-2 Spirit",
      "title": "Northrop Grumman B-2 Spirit",
      "subtitle": "Стелс-бомбардировщик «летающее крыло», построен 21",
      "price": 737000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "unit_cost",
      "priceDate": "1997",
      "note": "Закупочная стоимость одного B-2 в долларах 1997 г. (без затрат на разработку).",
      "source": {
        "label": "en.wikipedia.org",
        "url": "https://en.wikipedia.org/wiki/B-2"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Построено всего 21 самолёт.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/B-2_Spirit_original.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:B-2_Spirit_original.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Нортроп B-2 «Спирит»",
      "aliases": [
        "B-2",
        "Stealth bomber",
        "Б-2"
      ]
    },
    {
      "id": "tr-spitfire-tr9-sm520",
      "category": "transport",
      "brand": "Bonhams · Hendon",
      "model": "Spitfire TR.IX SM520",
      "title": "Supermarine Spitfire TR Mk IX SM520 (G-ILDA)",
      "subtitle": "Двухместный учебный Spitfire Mk IX, лётный",
      "price": 2527784,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2009-04",
      "note": "Продан на аукционе Bonhams в Музее RAF в Хендоне (Лондон) 20 апреля 2009 г.",
      "source": {
        "label": "sportscarmarket.com",
        "url": "https://www.sportscarmarket.com/news/spitfire-soars-to-2-5m-at-bonhams-hendon"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Один из сохранившихся Spitfire, но не уникальный тип.",
      "image": null,
      "nameRu": "Спитфайр TR.IX SM520",
      "aliases": [
        "Spitfire",
        "Спитфайр"
      ]
    },
    {
      "id": "tr-elvis-lockheed-jetstar",
      "category": "transport",
      "brand": "Mecum",
      "model": "JetStar Элвиса Пресли",
      "title": "1962 Lockheed 1329 JetStar ex-Elvis Presley",
      "subtitle": "1962, Lockheed JetStar, 40 лет простоял в пустыне",
      "price": 286000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-01",
      "note": "Продан на аукционе Mecum в начале 2023 г., цена с комиссиями.",
      "source": {
        "label": "antiquetrader.com",
        "url": "https://www.antiquetrader.com/auctions/elvis-jet-sells-at-auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Серийный самолёт, ценность — в истории владельца.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Lockheed_Jetstar_Hound_Dog_II_Graceland_Memphis_TN_2013-04-01_015.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Lockheed_Jetstar_Hound_Dog_II_Graceland_Memphis_TN_2013-04-01_015.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Частный самолёт Элвиса Пресли",
      "aliases": [
        "Elvis jet",
        "JetStar"
      ]
    },
    {
      "id": "tr-jetson-one",
      "category": "transport",
      "brand": "Jetson",
      "model": "Jetson ONE",
      "title": "Jetson ONE personal eVTOL",
      "subtitle": "Одноместный электромультикоптер, сверхлёгкий класс",
      "price": 128000,
      "currency": "USD",
      "region": "US",
      "priceType": "new_msrp",
      "priceDate": "2025-10",
      "note": "Цена для покупателей, озвученная на UP Summit 2025.",
      "source": {
        "label": "flightjournal.com",
        "url": "https://next.flightjournal.com/articles/now-available-128k-personal-evtols"
      },
      "checkedAt": "2026-10-16",
      "status": "needs-image",
      "rarity": "RARE",
      "rarityReason": "Мелкосерийный летательный аппарат с длинной очередью заказов.",
      "image": null,
      "nameRu": "Джетсон ONE (личный электролёт)",
      "aliases": [
        "Jetson One",
        "eVTOL"
      ]
    },
    {
      "id": "tr-mercedes-w04-hamilton",
      "category": "transport",
      "brand": "RM Sotheby's · Las Vegas",
      "model": "Mercedes W04 Хэмилтона",
      "title": "2013 Mercedes-AMG F1 W04 (chassis 04), Lewis Hamilton",
      "subtitle": "2013, V8 2,4 л, победа на Гран-при Венгрии",
      "price": 18815000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2023-11-17",
      "note": "Продан на аукционе RM Sotheby's в Лас-Вегасе; номинальная цена продажи в долларах США по данным Википедии.",
      "source": {
        "label": "en.wikipedia.org — List of most expensive cars sold at auction",
        "url": "https://en.wikipedia.org/wiki/List_of_most_expensive_cars_sold_at_auction"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "LEGENDARY",
      "rarityReason": "Рекордный лот: самый дорогой современный болид F1 на аукционе.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_AMG_F1_W04_-_Lewis_Hamilton_%288493461760%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Mercedes_AMG_F1_W04_-_Lewis_Hamilton_%288493461760%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Мерседес W04 Льюиса Хэмилтона",
      "aliases": [
        "W04",
        "Hamilton Mercedes"
      ]
    },
    {
      "id": "tr-ferrari-f2003-ga-schumacher",
      "category": "transport",
      "brand": "Sotheby's · Geneva",
      "model": "Ferrari F2003-GA Шумахера",
      "title": "2003 Ferrari F2003-GA (chassis 229), Michael Schumacher",
      "subtitle": "2003, V10 3,0 л, 5 побед, 6-й титул Шумахера",
      "price": 14873327,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-11",
      "note": "Продан на аукционе Sotheby's в Женеве в ноябре 2022 г.",
      "source": {
        "label": "news.dupontregistry.com",
        "url": "https://news.dupontregistry.com/ferrari/sothebys-sells-michael-schumacher-driven-2003-ferrari-f1-racecar-at-geneva-auction-for-14873327"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Важный болид, но в наборе несколько болидов Шумахера; легендарный уровень — только для уникальных рекордов.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Ferrari_F2003-GA_Michael_Schumacher_2003.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Ferrari_F2003-GA_Michael_Schumacher_2003.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Феррари F2003-GA Михаэля Шумахера",
      "aliases": [
        "F2003",
        "Schumacher Ferrari 2003"
      ]
    },
    {
      "id": "tr-mclaren-mcl40a-2026",
      "category": "transport",
      "brand": "RM Sotheby's · Abu Dhabi",
      "model": "McLaren MCL40A (2026)",
      "title": "2026 McLaren Formula 1 Team MCL40A",
      "subtitle": "Болид F1 сезона 2026, шасси Пиастри или Норриса на выбор",
      "price": 11480000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2025-12",
      "note": "Продан на аукционе RM Sotheby's в Абу-Даби 5 декабря 2025 г. — впервые болид F1 продали до того, как он вышел на старт.",
      "source": {
        "label": "rmsothebys.com",
        "url": "https://rmsothebys.com/media-center/press-releases/rm-sotheby-s-inaugural-abu-dhabi-collectors-week-auction-grosses-85-million-becoming-the-region-s-most-successful-collector-car-auction-ever/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Современный болид, ещё не стал легендой.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Mclaren_MCL40_-_Lando_Norris_approaches_Spoon_Curve_at_Suzuka_during_the_2026_Japanese_GP_%2855195326398%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Mclaren_MCL40_-_Lando_Norris_approaches_Spoon_Curve_at_Suzuka_during_the_2026_Japanese_GP_%2855195326398%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Макларен MCL40A 2026",
      "aliases": [
        "MCL40",
        "McLaren 2026 F1"
      ]
    },
    {
      "id": "tr-ferrari-f2001-schumacher-monaco",
      "category": "transport",
      "brand": "Sotheby's · New York",
      "model": "Ferrari F2001 Шумахера",
      "title": "2001 Ferrari F2001 (chassis 211), Michael Schumacher",
      "subtitle": "2001, V10 3,0 л, победа на Гран-при Монако",
      "price": 7504000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2017-11",
      "note": "Продан на вечерних торгах современного искусства Sotheby's в Нью-Йорке в ноябре 2017 г.",
      "source": {
        "label": "petrolicious.com",
        "url": "https://petrolicious.com/schumacher-s-ferrari-sells-for-record-7-5-million"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Победный болид Шумахера, на тот момент — рекорд для современной F1.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Schumacher_Ferrari_F2001_at_Laguna_Seca.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Schumacher_Ferrari_F2001_at_Laguna_Seca.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Феррари F2001 Михаэля Шумахера",
      "aliases": [
        "F2001",
        "Schumacher Monaco Ferrari"
      ]
    },
    {
      "id": "tr-ferrari-f2002-schumacher",
      "category": "transport",
      "brand": "RM Sotheby's · Abu Dhabi",
      "model": "Ferrari F2002 Шумахера",
      "title": "2002 Ferrari F2002, Michael Schumacher",
      "subtitle": "2002, V10 3,0 л, чемпионская победа во Франции",
      "price": 6643750,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2019-11",
      "note": "Продан на аукционе RM Sotheby's и Formula 1 в Абу-Даби 30 ноября 2019 г.",
      "source": {
        "label": "formula1.com",
        "url": "https://www.formula1.com/en/latest/article/ex-schumacher-ferrari-becomes-second-most-expensive-f1-car-sold-at-auction.2rDesnT8UMFcXo4pWvweQi"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Третий болид Шумахера в наборе — интересный, но не уникальный.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Ferrari_F2002_front.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Ferrari_F2002_front.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Феррари F2002 Михаэля Шумахера",
      "aliases": [
        "F2002"
      ]
    },
    {
      "id": "tr-ferrari-f300-schumacher",
      "category": "transport",
      "brand": "Sotheby's · Monterey",
      "model": "Ferrari F300 Шумахера",
      "title": "1998 Ferrari F300 (chassis 187), Michael Schumacher",
      "subtitle": "1998, V10 3,0 л, 4 гонки — 4 победы",
      "price": 6220000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2022-08",
      "note": "Продан на аукционе Sotheby's в Монтерее в августе 2022 г.",
      "source": {
        "label": "crash.net",
        "url": "https://crash.net/f1/news/1010371/1/michael-schumacher-s-1998-ferrari-sold-headspinning-pricetag"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Болид Шумахера сезона без титула.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Schumacher_and_Coulthard_in_the_1998_British_Grand_Prix.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Schumacher_and_Coulthard_in_the_1998_British_Grand_Prix.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Феррари F300 Михаэля Шумахера",
      "aliases": [
        "F300"
      ]
    },
    {
      "id": "tr-mclaren-mp4-8a-senna",
      "category": "transport",
      "brand": "Bonhams · Monaco",
      "model": "McLaren MP4/8A Сенны",
      "title": "1993 McLaren MP4/8A (chassis 6), Ayrton Senna",
      "subtitle": "1993, Ford V8, шестая победа Сенны в Монако",
      "price": 4949000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2018-05",
      "note": "Продан на аукционе Bonhams в Монако в 2018 г. (во время Historic Grand Prix), цена с комиссией.",
      "source": {
        "label": "crankandpiston.com",
        "url": "https://crankandpiston.com/?p=120615"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Болид Сенны с рекордной шестой победой в Монако.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Senna%27s_McLaren_MP4-8.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Senna%27s_McLaren_MP4-8.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Макларен MP4/8A Айртона Сенны",
      "aliases": [
        "MP4/8",
        "Senna McLaren 1993"
      ]
    },
    {
      "id": "tr-alfa-nero-yacht",
      "category": "transport",
      "brand": "Northrop & Johnson",
      "model": "Яхта Alfa Nero",
      "title": "Alfa Nero superyacht (Oceanco, 81 m)",
      "subtitle": "Oceanco 2007, 81 м, бассейн-вертолётная площадка",
      "price": 40000000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "private_sale",
      "priceDate": "2024-07",
      "note": "Продана по частному контракту в июле 2024 г. после ареста яхты на Антигуа.",
      "source": {
        "label": "fortune.com",
        "url": "https://fortune.com/2024/07/22/alfa-nero-superyacht-sale-price-russian-billionaire-oligarch-new-secret-owner"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "RARE",
      "rarityReason": "Суперяхта с известной историей, но не мировая икона.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/Yacht_Alfa_Nero_-_Antibes_-_01.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:Yacht_Alfa_Nero_-_Antibes_-_01.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "exact",
        "license": "unknown"
      },
      "nameRu": "Суперяхта Alfa Nero",
      "aliases": [
        "Alfa Nero",
        "Альфа Неро"
      ]
    },
    {
      "id": "tr-lotus-esprit-wet-nellie",
      "category": "transport",
      "brand": "RM Auctions",
      "model": "Lotus Esprit «Wet Nellie»",
      "title": "1976 Lotus Esprit submarine 'Wet Nellie' (The Spy Who Loved Me)",
      "subtitle": "1976, реквизит-субмарина из «Шпиона, который меня любил»",
      "price": 866000,
      "currency": "USD",
      "region": "WORLD",
      "priceType": "auction",
      "priceDate": "2013-10",
      "note": "Продан на аукционе RM Auctions осенью 2013 г.; покупателем назвали Илона Маска.",
      "source": {
        "label": "jalopnik.com",
        "url": "https://www.jalopnik.com/elon-musk-is-secret-buyer-who-spent-866k-on-james-bon-1446999712/"
      },
      "checkedAt": "2026-10-16",
      "status": "verified",
      "rarity": "EPIC",
      "rarityReason": "Уникальная машина-амфибия из фильма о Бонде.",
      "image": {
        "remote": "https://commons.wikimedia.org/wiki/Special:FilePath/1976_Lotus_Esprit_submarine_car_-_James_Bond_%285963589176%29.jpg?width=960",
        "pageUrl": "https://commons.wikimedia.org/wiki/File:1976_Lotus_Esprit_submarine_car_-_James_Bond_%285963589176%29.jpg",
        "credit": "Wikimedia Commons (licence not checked)",
        "match": "same-model",
        "license": "unknown"
      },
      "nameRu": "Lotus Esprit-подлодка Джеймса Бонда",
      "aliases": [
        "Wet Nellie",
        "Bond submarine car"
      ]
    }
  ];

  var PENDING = [
    {
      "id": "nike-af1-07",
      "reason": "Nike Air Force 1 '07, $115 — nike.com не отдаёт ссылку на фото"
    },
    {
      "id": "ridge-wallet",
      "reason": "Ridge Wallet Gunmetal, $95 — фото на странице другого цвета"
    },
    {
      "id": "chanel-n5-edp",
      "reason": "Chanel N°5 EDP 100 мл, $190 — нет фото на странице"
    },
    {
      "id": "longchamp-le-pliage-l",
      "reason": "Longchamp Le Pliage L, $180 — нет фото"
    },
    {
      "id": "fjallraven-kanken",
      "reason": "Fjällräven Kånken, $95 — нет фото"
    },
    {
      "id": "laneige-lip-mask",
      "reason": "Laneige Lip Sleeping Mask 22 г, $25 (Sephora) — нет фото"
    },
    {
      "id": "the-ordinary-niacinamide",
      "reason": "The Ordinary Niacinamide 30 мл, $6 — нет фото"
    },
    {
      "id": "mac-ruby-woo",
      "reason": "MAC Retro Matte Lipstick, $24 — нет фото"
    },
    {
      "id": "dyson-supersonic",
      "reason": "Dyson Supersonic, $399.99 — нет фото"
    },
    {
      "id": "nintendo-switch-2",
      "reason": "Nintendo Switch 2, $499.99 — нет фото на странице"
    },
    {
      "id": "logitech-superlight-2",
      "reason": "Logitech G PRO X Superlight 2, $159.99 — нет фото товара"
    },
    {
      "id": "roomba-combo-essential",
      "reason": "Roomba Combo Essential, $274.99 — нет фото"
    },
    {
      "id": "momofuku-chili-crunch",
      "reason": "Momofuku Chili Crunch, $13 — на странице нет фото самого товара"
    },
    {
      "id": "la-colombe-draft-latte",
      "reason": "La Colombe Draft Latte 12 шт., $34 — фото на странице не подходит"
    },
    {
      "id": "hydro-flask-32",
      "reason": "Hydro Flask 32 oz Wide Mouth, $44.95 — нет фото"
    },
    {
      "id": "dyson-airwrap-coanda2x",
      "reason": "Dyson Airwrap Co-anda2x, $749.99 — нет фото товара на странице"
    }
  ];

  var api = { CATEGORIES: CATEGORIES, REGIONS: REGIONS, QUESTIONS: QUESTIONS, PENDING: PENDING };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FV_DATA = api;
})(typeof window !== "undefined" ? window : this);
