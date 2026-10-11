/*
 * FACE VALUE — база вопросов (сгенерирована из проверенных данных).
 *
 * Все цены — официальные цены в США (USD) на сайтах производителей или их
 * официальных магазинов, проверены 11.10.2026. Товары со скидкой в базу не попадали.
 *
 * Поля вопроса:
 *   id, category, brand, model, title, subtitle — что за товар
 *   price, currency, region                   — цена, валюта (USD), регион (US)
 *   note                                      — пояснение к цене (показывается после ответа)
 *   source { label, url }, checkedAt          — откуда цена и когда проверена
 *   status                                    — "verified" или "test"
 *   image { remote, pageUrl, credit }         — официальное фото товара (ссылка)
 *     Локальные копии фото скачиваются командой `node tools/download-images.mjs`
 *     в папку assets/products/ и подключаются автоматически через manifest.js.
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
      "everyday": "Популярные товары"
  };

  var REGIONS = { US: "США" };

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
      "image": {
        "remote": "https://liquiddeath.com/cdn/shop/files/LD_Flav_AmazonVarietyPack_12oz_12pkFRONT3_4FACING_1.png?v=1747166964&width=1200",
        "pageUrl": "https://liquiddeath.com/products/soda-flavored-sparkling-water-variety-pack-12oz-12-pack",
        "credit": "© Liquid Death"
      }
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
