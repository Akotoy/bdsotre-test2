import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Review } from './cartStore';

export interface Category {
  id: string;
  title: string;
}

// ─── Fake Products (4 per blogger) ───────────────────────────────────────────

const FAKE_PRODUCTS: Product[] = [
  // MASHA (Pink / lifestyle)
  {
    id: 'masha-1', article: 'M001', title: 'Худи «Мечтай громче»', brand: 'masha',
    price: 3490, old_price: 4200, rating: 4.9, reviews_count: 312, is_recommended: true, collection: 'hits',
    description: 'Оверсайз худи из 80% хлопка с принтом от Маши Кремль.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: { XS: 3, S: 8, M: 15, L: 10, XL: 5 },
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop'],
    reviews: [], color: 'Розовый', composition: '80% хлопок, 20% полиэстер', season: 'Осень/Зима', gender: 'Женский'
  },
  {
    id: 'masha-2', article: 'M002', title: 'Футболка «Masha Energy»', brand: 'masha',
    price: 1990, old_price: undefined, rating: 4.7, reviews_count: 198, is_recommended: true, collection: 'new',
    description: 'Базовая футболка с минималистичным логотипом.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 20, M: 25, L: 18, XL: 8 },
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'],
    reviews: [], color: 'Белый', composition: '100% хлопок', season: 'Весна/Лето', gender: 'Женский'
  },
  {
    id: 'masha-3', article: 'M003', title: 'Свитшот «Love Life»', brand: 'masha',
    price: 2890, old_price: undefined, rating: 4.8, reviews_count: 87, is_recommended: false, collection: 'new',
    description: 'Свитшот oversize с уникальным принтом.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: { XS: 0, S: 5, M: 12, L: 9, XL: 3 },
    image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop'],
    reviews: [], color: 'Бежевый', composition: '70% хлопок, 30% ПЭ', season: 'Весна/Осень', gender: 'Женский'
  },
  {
    id: 'masha-4', article: 'M004', title: 'Сумка-шоппер «Pink Dream»', brand: 'masha',
    price: 1290, rating: 4.6, reviews_count: 54, is_recommended: false, collection: 'hits',
    description: 'Холщовая сумка с авторским принтом.',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 30 },
    image_url: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f3c0?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1600857062241-98e5dba7f3c0?w=600&h=800&fit=crop'],
    reviews: [], color: 'Розовый', composition: '100% хлопок', season: 'Круглогодично', gender: 'Унисекс'
  },

  // DJ PULSE (Purple / music)
  {
    id: 'djpulse-1', article: 'P001', title: 'Худи «Pulse Drop»', brand: 'djpulse',
    price: 3990, old_price: 4900, rating: 4.8, reviews_count: 241, is_recommended: true, collection: 'drops',
    description: 'Тёмное худи DJ Pulse с неоновым принтом.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 10, M: 18, L: 14, XL: 7, XXL: 3 },
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop'],
    reviews: [], color: 'Чёрный', composition: '80% хлопок, 20% ПЭ', season: 'Осень/Зима', gender: 'Мужской'
  },
  {
    id: 'djpulse-2', article: 'P002', title: 'Футболка «Bass Face»', brand: 'djpulse',
    price: 2190, rating: 4.6, reviews_count: 133, is_recommended: true, collection: 'drops',
    description: 'Футболка с принтом волновой формы.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 25, M: 30, L: 20, XL: 10 },
    image_url: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=600&h=800&fit=crop'],
    reviews: [], color: 'Белый', composition: '100% хлопок', season: 'Весна/Лето', gender: 'Мужской'
  },
  {
    id: 'djpulse-3', article: 'P003', title: 'Кепка «DJ Pulse»', brand: 'djpulse',
    price: 1490, rating: 4.5, reviews_count: 89, is_recommended: false, collection: 'all',
    description: 'Пятипанельная кепка с вышивкой.',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 50 },
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=800&fit=crop'],
    reviews: [], color: 'Чёрный', composition: '100% хлопок', season: 'Круглогодично', gender: 'Унисекс'
  },
  {
    id: 'djpulse-4', article: 'P004', title: 'Свитшот «Frequency»', brand: 'djpulse',
    price: 3290, old_price: 3900, rating: 4.9, reviews_count: 67, is_recommended: true, collection: 'all',
    description: 'Свитшот с принтом частотного эквалайзера.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 7, M: 12, L: 8, XL: 4 },
    image_url: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=800&fit=crop'],
    reviews: [], color: 'Серый', composition: '70% хлопок, 30% ПЭ', season: 'Весна/Осень', gender: 'Мужской'
  },

  // CHEF BEAR (Amber / food)
  {
    id: 'chefbear-1', article: 'C001', title: 'Фартук «Bear Chef»', brand: 'chefbear',
    price: 1890, rating: 4.9, reviews_count: 412, is_recommended: true, collection: 'kitchen',
    description: 'Фартук с принтом «Я готовлю с любовью».',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 100 },
    image_url: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=600&h=800&fit=crop'],
    reviews: [], color: 'Бежевый', composition: '100% хлопок', season: 'Круглогодично', gender: 'Унисекс'
  },
  {
    id: 'chefbear-2', article: 'C002', title: 'Футболка «Рецепт успеха»', brand: 'chefbear',
    price: 1990, old_price: 2400, rating: 4.7, reviews_count: 278, is_recommended: true, collection: 'all',
    description: 'Принт с ингредиентами идеального дня.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 15, M: 22, L: 17, XL: 9, XXL: 5 },
    image_url: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&h=800&fit=crop'],
    reviews: [], color: 'Белый', composition: '100% хлопок', season: 'Весна/Лето', gender: 'Унисекс'
  },
  {
    id: 'chefbear-3', article: 'C003', title: 'Кружка «Лучший повар»', brand: 'chefbear',
    price: 890, rating: 4.8, reviews_count: 534, is_recommended: false, collection: 'kitchen',
    description: 'Фарфоровая кружка 350мл с принтом.',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 200 },
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=800&fit=crop'],
    reviews: [], color: 'Белый', composition: 'Фарфор', season: 'Круглогодично', gender: 'Унисекс'
  },
  {
    id: 'chefbear-4', article: 'C004', title: 'Худи «Мишкин рецепт»', brand: 'chefbear',
    price: 3690, rating: 4.7, reviews_count: 91, is_recommended: true, collection: 'all',
    description: 'Тёплое худи с вышитым медвежонком в поварском колпаке.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 6, M: 11, L: 9, XL: 4 },
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop'],
    reviews: [], color: 'Оранжевый', composition: '80% хлопок, 20% ПЭ', season: 'Осень/Зима', gender: 'Унисекс'
  },

  // KOSMIK (Cyan / gaming)
  {
    id: 'kosmik-1', article: 'K001', title: 'Толстовка «GG No Re»', brand: 'kosmik',
    price: 3790, old_price: 4500, rating: 4.9, reviews_count: 523, is_recommended: true, collection: 'gaming',
    description: 'Заряженная толстовка для ночных сессий.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], stock: { XS: 5, S: 12, M: 20, L: 15, XL: 8, XXL: 4 },
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=800&fit=crop'],
    reviews: [], color: 'Тёмно-синий', composition: '80% хлопок, 20% ПЭ', season: 'Осень/Зима', gender: 'Унисекс'
  },
  {
    id: 'kosmik-2', article: 'K002', title: 'Футболка «Neon Controller»', brand: 'kosmik',
    price: 2290, rating: 4.8, reviews_count: 344, is_recommended: true, collection: 'gaming',
    description: 'Принт геймпада в неоновых цветах.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 18, M: 24, L: 19, XL: 9 },
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=800&fit=crop'],
    reviews: [], color: 'Чёрный', composition: '100% хлопок', season: 'Весна/Лето', gender: 'Унисекс'
  },
  {
    id: 'kosmik-3', article: 'K003', title: 'Кепка «Stream Mode»', brand: 'kosmik',
    price: 1390, rating: 4.6, reviews_count: 187, is_recommended: false, collection: 'all',
    description: 'Кепка с вышивкой логотипа Kosmik.',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 75 },
    image_url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&h=800&fit=crop'],
    reviews: [], color: 'Голубой', composition: '100% хлопок', season: 'Круглогодично', gender: 'Унисекс'
  },
  {
    id: 'kosmik-4', article: 'K004', title: 'Носки «Pixel Pack» (3 пары)', brand: 'kosmik',
    price: 890, rating: 4.7, reviews_count: 832, is_recommended: true, collection: 'gaming',
    description: '3 пары носков с пиксельными принтами.',
    sizes: ['36-39', '40-43', '44-46'], stock: { '36-39': 40, '40-43': 35, '44-46': 20 },
    image_url: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&h=800&fit=crop'],
    reviews: [], color: 'Разноцветный', composition: '75% хлопок, 25% ПЭ', season: 'Круглогодично', gender: 'Унисекс'
  },

  // ALINTOY (Green / fitness)
  {
    id: 'alintoy-1', article: 'A001', title: 'Леггинсы «Move Free»', brand: 'alintoy',
    price: 2890, old_price: 3400, rating: 4.9, reviews_count: 671, is_recommended: true, collection: 'training',
    description: 'Компрессионные леггинсы для тренировок и танцев.',
    sizes: ['XS', 'S', 'M', 'L'], stock: { XS: 10, S: 16, M: 21, L: 9 },
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop'],
    reviews: [], color: 'Зелёный', composition: '80% полиамид, 20% ПЭ', season: 'Круглогодично', gender: 'Женский'
  },
  {
    id: 'alintoy-2', article: 'A002', title: 'Топ «Dance Hard»', brand: 'alintoy',
    price: 1690, rating: 4.8, reviews_count: 389, is_recommended: true, collection: 'training',
    description: 'Спортивный топ с дышащим материалом.',
    sizes: ['XS', 'S', 'M', 'L'], stock: { XS: 8, S: 14, M: 18, L: 7 },
    image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=800&fit=crop'],
    reviews: [], color: 'Мятный', composition: '85% полиэстер, 15% эластан', season: 'Весна/Лето', gender: 'Женский'
  },
  {
    id: 'alintoy-3', article: 'A003', title: 'Бутылка «Hydrate»', brand: 'alintoy',
    price: 1290, rating: 4.7, reviews_count: 223, is_recommended: false, collection: 'all',
    description: 'Термобутылка 500мл с логотипом Alintoy.',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 80 },
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=800&fit=crop'],
    reviews: [], color: 'Зелёный', composition: 'Нержавеющая сталь', season: 'Круглогодично', gender: 'Унисекс'
  },
  {
    id: 'alintoy-4', article: 'A004', title: 'Худи «Warm Up»', brand: 'alintoy',
    price: 3290, rating: 4.8, reviews_count: 142, is_recommended: true, collection: 'all',
    description: 'Спортивное худи с карманами-кенгуру.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: { XS: 4, S: 9, M: 14, L: 11, XL: 5 },
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'],
    reviews: [], color: 'Белый', composition: '70% хлопок, 30% ПЭ', season: 'Весна/Осень', gender: 'Женский'
  },

  // ZERO GRAVITY (Amber/Black / streetwear)
  {
    id: 'zerog-1', article: 'Z001', title: 'Худи «Gravity Zero»', brand: 'zerog',
    price: 4290, old_price: 5200, rating: 4.9, reviews_count: 198, is_recommended: true, collection: 'skate',
    description: 'Тяжёлое оверсайз-худи уличного бренда Zero Gravity.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 6, M: 11, L: 9, XL: 5, XXL: 2 },
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop&sat=-100',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=800&fit=crop'],
    reviews: [], color: 'Чёрный', composition: '80% хлопок, 20% ПЭ', season: 'Осень/Зима', gender: 'Унисекс'
  },
  {
    id: 'zerog-2', article: 'Z002', title: 'Футболка «Anti-Gravity»', brand: 'zerog',
    price: 2490, rating: 4.8, reviews_count: 156, is_recommended: true, collection: 'all',
    description: 'Принт со скейтером в невесомости.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 20, M: 25, L: 18, XL: 8 },
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=800&fit=crop'],
    reviews: [], color: 'Белый', composition: '100% хлопок', season: 'Весна/Лето', gender: 'Мужской'
  },
  {
    id: 'zerog-3', article: 'Z003', title: 'Джоггеры «Street Zero»', brand: 'zerog',
    price: 3490, old_price: 3900, rating: 4.7, reviews_count: 94, is_recommended: false, collection: 'skate',
    description: 'Прямые джоггеры с лампасами ZG.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 8, M: 13, L: 10, XL: 5 },
    image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=800&fit=crop'],
    reviews: [], color: 'Чёрный', composition: '70% хлопок, 30% ПЭ', season: 'Весна/Осень', gender: 'Мужской'
  },
  {
    id: 'zerog-4', article: 'Z004', title: 'Кепка 5-Panel «Zero»', brand: 'zerog',
    price: 1690, rating: 4.8, reviews_count: 267, is_recommended: true, collection: 'skate',
    description: 'Кепка пятипанельная с вышивкой лого.',
    sizes: ['ONE SIZE'], stock: { 'ONE SIZE': 60 },
    image_url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=800&fit=crop',
    images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=800&fit=crop'],
    reviews: [], color: 'Жёлтый', composition: '100% хлопок', season: 'Весна/Лето', gender: 'Унисекс'
  },

  // BASHKIRKA (BD)
  {
    id: 'bd-1', article: '238549826', title: 'Костюм летний рубашка с шортами льняной', brand: 'bashkirka',
    price: 3675, old_price: 10000, rating: 4.8, reviews_count: 120, is_recommended: true, collection: 'hits',
    description: 'Яркий и стильный летний костюм с рубашкой и шортами от бренда Башкирская Домохозяйка - BD. Этот комплект станет настоящим украшением вашего летнего гардероба, предлагая оптимальное сочетание комфорта и элегантности.\nСозданный из легких и натуральных тканей, костюм обеспечивает максимальное удобство в жаркую погоду, позволяя коже дышать и поддерживая оптимальную температуру тела. Летний костюм состоит из двух частей: стильной рубашки прямого кроя и удобных шорт средней длины, выполненных в единой цветовой гамме. Такой комплект выглядит целостно и аккуратно, подчеркивая природную красоту женской фигуры.\nЛегкая и дышащая ткань костюмов обеспечивает приятные ощущения даже в самые жаркие дни, сохраняя ощущение прохлады и свежести. Рубашка свободного кроя мягко облегает тело, не сковывая движений, а удобные шорты дополняют образ, даря чувство легкости и свободы.\nВыбирая летние костюмы от BD, вы подарите себе комфорт, яркость и уверенность в новом сезоне!',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 10, M: 15, L: 20, XL: 10, XXL: 5 },
    image_url: '/238549826_0.webp',
    images: ['/238549826_0.webp', '/238549826_1.webp', '/238549826_2.webp', '/238549826_3.webp'],
    reviews: [], color: 'Бежевый', composition: 'Лен', season: 'Лето', gender: 'Женский'
  },
  {
    id: 'bd-2', article: '463685475', title: 'Костюм велюровый спортивный', brand: 'bashkirka',
    price: 3675, old_price: 10000, rating: 4.9, reviews_count: 340, is_recommended: true, collection: 'hits',
    description: 'Спортивный костюм из нежнейшего велюра, созданный брендом Башкирская домохозяйка - BD. Этот наряд отличается особым шармом и комфортом, что сделает его незаменимым предметом вашего гардероба.\nДанный костюм является прекрасным решением для межсезонья, ведь он одинаково хорош и в прохладные дни ранней весны, и в тёплые летние вечера. Элегантный однотонный дизайн открывает широкие возможности сочетания с различной одеждой и аксессуарами, помогая создавать яркие образы в стиле спорт-шик.\nВыбор цвета и размера предоставляется огромным спектром вариантов, включая большие размеры, что даёт возможность каждой женщине найти оптимальный вариант для своей фигуры. Ткань легко чистится и быстро восстанавливает первоначальный вид после стирки, гарантируя долгий срок службы и неизменно хорошее настроение при каждом выходе.\nОдежда от БД - это не просто красивая одежда, а предмет гордости гардероба, который будет радовать долгие годы.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], stock: { S: 5, M: 12, L: 18, XL: 15, XXL: 8, XXXL: 4 },
    image_url: '/463685475_0.webp',
    images: ['/463685475_0.webp', '/463685475_1.webp', '/463685475_2.webp', '/463685475_3.webp'],
    reviews: [], color: 'Черный', composition: 'Хлопок 80%, полиэстер 20%', season: 'Круглогодичный', gender: 'Женский'
  },
  {
    id: 'bd-3', article: '463685476', title: 'Костюм велюровый спортивный', brand: 'bashkirka',
    price: 3675, old_price: 10000, rating: 4.7, reviews_count: 210, is_recommended: false, collection: 'new',
    description: 'Спортивный костюм из нежнейшего велюра, созданный брендом Башкирская домохозяйка - BD. Этот наряд отличается особым шармом и комфортом, что сделает его незаменимым предметом вашего гардероба.\nДанный костюм является прекрасным решением для межсезонья, ведь он одинаково хорош и в прохладные дни ранней весны, и в тёплые летние вечера. Элегантный однотонный дизайн открывает широкие возможности сочетания с различной одеждой и аксессуарами, помогая создавать яркие образы в стиле спорт-шик.\nВыбор цвета и размера предоставляется огромным спектром вариантов, включая большие размеры, что даёт возможность каждой женщине найти оптимальный вариант для своей фигуры. Ткань легко чистится и быстро восстанавливает первоначальный вид после стирки, гарантируя долгий срок службы и неизменно хорошее настроение при каждом выходе.\nОдежда от БД - это не просто красивая одежда, а предмет гордости гардероба, который будет радовать долгие годы.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], stock: { S: 8, M: 14, L: 20, XL: 10, XXL: 6, XXXL: 2 },
    image_url: '/463685476_0.webp',
    images: ['/463685476_0.webp', '/463685476_1.webp', '/463685476_2.webp', '/463685476_3.webp'],
    reviews: [], color: 'Голубой', composition: 'Хлопок 80%, полиэстер 20%', season: 'Круглогодичный', gender: 'Женский'
  },
  {
    id: 'bd-4', article: '463685477', title: 'Костюм велюровый спортивный', brand: 'bashkirka',
    price: 3675, old_price: 10000, rating: 4.8, reviews_count: 150, is_recommended: true, collection: 'all',
    description: 'Спортивный костюм из нежнейшего велюра, созданный брендом Башкирская домохозяйка - BD. Этот наряд отличается особым шармом и комфортом, что сделает его незаменимым предметом вашего гардероба.\nДанный костюм является прекрасным решением для межсезонья, ведь он одинаково хорош и в прохладные дни ранней весны, и в тёплые летние вечера. Элегантный однотонный дизайн открывает широкие возможности сочетания с различной одеждой и аксессуарами, помогая создавать яркие образы в стиле спорт-шик.\nВыбор цвета и размера предоставляется огромным спектром вариантов, включая большие размеры, что даёт возможность каждой женщине найти оптимальный вариант для своей фигуры. Ткань легко чистится и быстро восстанавливает первоначальный вид после стирки, гарантируя долгий срок службы и неизменно хорошее настроение при каждом выходе.\nОдежда от БД - это не просто красивая одежда, а предмет гордости гардероба, который будет радовать долгие годы.',
    sizes: ['S', 'M', 'L', 'XL'], stock: { S: 12, M: 18, L: 15, XL: 5 },
    image_url: '/463685477_0.webp',
    images: ['/463685477_0.webp', '/463685477_1.webp', '/463685477_2.webp', '/463685477_3.webp'],
    reviews: [], color: 'Серый; Графит', composition: 'Хлопок 80%, полиэстер 20%', season: 'Демисезон', gender: 'Женский'
  },
  {
    id: 'bd-5', article: '235366841', title: 'Костюм летний с шортами и рубашкой', brand: 'bashkirka',
    price: 3500, old_price: 8000, rating: 4.6, reviews_count: 85, is_recommended: false, collection: 'new',
    description: 'Яркий и стильный летний костюм с рубашкой и шортами от бренда Башкирская Домохозяйка - BD. Этот комплект станет настоящим украшением вашего летнего гардероба, предлагая оптимальное сочетание комфорта и элегантности.\nСозданный из легких и натуральных тканей, костюм обеспечивает максимальное удобство в жаркую погоду, позволяя коже дышать и поддерживая оптимальную температуру тела. Летний костюм состоит из двух частей: стильной рубашки прямого кроя и удобных шорт средней длины, выполненных в единой цветовой гамме. Такой комплект выглядит целостно и аккуратно, подчеркивая природную красоту женской фигуры.\nЛегкая и дышащая ткань костюмов обеспечивает приятные ощущения даже в самые жаркие дни, сохраняя ощущение прохлады и свежести. Рубашка свободного кроя мягко облегает тело, не сковывая движений, а удобные шорты дополняют образ, даря чувство легкости и свободы.\nВыбирая летние костюмы от BD, вы подарите себе комфорт, яркость и уверенность в новом сезоне!',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], stock: { S: 10, M: 20, L: 25, XL: 15, XXL: 10, XXXL: 5 },
    image_url: '/235366841_0.webp',
    images: ['/235366841_0.webp', '/235366841_1.webp', '/235366841_2.webp', '/235366841_3.webp'],
    reviews: [], color: 'Белый', composition: 'Муслин', season: 'Лето', gender: 'Женский'
  },
  {
    id: 'bd-6', article: '237491986', title: 'Костюм летний льняной рубашка с шортами', brand: 'bashkirka',
    price: 3500, old_price: 8000, rating: 4.9, reviews_count: 110, is_recommended: true, collection: 'all',
    description: 'Яркий и стильный летний костюм с рубашкой и шортами от бренда Башкирская Домохозяйка - BD. Этот комплект станет настоящим украшением вашего летнего гардероба, предлагая оптимальное сочетание комфорта и элегантности.\nСозданный из легких и натуральных тканей, костюм обеспечивает максимальное удобство в жаркую погоду, позволяя коже дышать и поддерживая оптимальную температуру тела. Летний костюм состоит из двух частей: стильной рубашки прямого кроя и удобных шорт средней длины, выполненных в единой цветовой гамме. Такой комплект выглядит целостно и аккуратно, подчеркивая природную красоту женской фигуры.\nЛегкая и дышащая ткань костюмов обеспечивает приятные ощущения даже в самые жаркие дни, сохраняя ощущение прохлады и свежести. Рубашка свободного кроя мягко облегает тело, не сковывая движений, а удобные шорты дополняют образ, даря чувство легкости и свободы.\nВыбирая летние костюмы от BD, вы подарите себе комфорт, яркость и уверенность в новом сезоне!',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 15, M: 22, L: 18, XL: 12, XXL: 6 },
    image_url: '/237491986_0.webp',
    images: ['/237491986_0.webp', '/237491986_1.webp', '/237491986_2.webp', '/237491986_3.webp'],
    reviews: [], color: 'Белый', composition: 'Лен', season: 'Лето', gender: 'Женский'
  },
  {
    id: 'bd-7', article: '237492115', title: 'Костюм летний рубашка с шортами', brand: 'bashkirka',
    price: 3500, old_price: 8000, rating: 4.7, reviews_count: 95, is_recommended: false, collection: 'all',
    description: 'Яркий и стильный летний костюм с рубашкой и шортами от бренда Башкирская Домохозяйка - BD. Этот комплект станет настоящим украшением вашего летнего гардероба, предлагая оптимальное сочетание комфорта и элегантности.\nСозданный из легких и натуральных тканей, костюм обеспечивает максимальное удобство в жаркую погоду, позволяя коже дышать и поддерживая оптимальную температуру тела. Летний костюм состоит из двух частей: стильной рубашки прямого кроя и удобных шорт средней длины, выполненных в единой цветовой гамме. Такой комплект выглядит целостно и аккуратно, подчеркивая природную красоту женской фигуры.\nЛегкая и дышащая ткань костюмов обеспечивает приятные ощущения даже в самые жаркие дни, сохраняя ощущение прохлады и свежести. Рубашка свободного кроя мягко облегает тело, не сковывая движений, а удобные шорты дополняют образ, даря чувство легкости и свободы.\nВыбирая летние костюмы от BD, вы подарите себе комфорт, яркость и уверенность в новом сезоне!',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 12, M: 16, L: 14, XL: 8, XXL: 4 },
    image_url: '/237492115_0.webp',
    images: ['/237492115_0.webp', '/237492115_1.webp', '/237492115_2.webp', '/237492115_3.webp'],
    reviews: [], color: 'Розовый', composition: 'Хлопок 80%, полиэстер 20%', season: 'Лето', gender: 'Женский'
  },
  {
    id: 'bd-8', article: '237492517', title: 'Костюм летний рубашка с шортами', brand: 'bashkirka',
    price: 3500, old_price: 8000, rating: 4.8, reviews_count: 105, is_recommended: true, collection: 'hits',
    description: 'Яркий и стильный летний костюм с рубашкой и шортами от бренда Башкирская Домохозяйка - BD. Этот комплект станет настоящим украшением вашего летнего гардероба, предлагая оптимальное сочетание комфорта и элегантности.\nСозданный из легких и натуральных тканей, костюм обеспечивает максимальное удобство в жаркую погоду, позволяя коже дышать и поддерживая оптимальную температуру тела. Летний костюм состоит из двух частей: стильной рубашки прямого кроя и удобных шорт средней длины, выполненных в единой цветовой гамме. Такой комплект выглядит целостно и аккуратно, подчеркивая природную красоту женской фигуры.\nЛегкая и дышащая ткань костюмов обеспечивает приятные ощущения даже в самые жаркие дни, сохраняя ощущение прохлады и свежести. Рубашка свободного кроя мягко облегает тело, не сковывая движений, а удобные шорты дополняют образ, даря чувство легкости и свободы.\nВыбирая летние костюмы от BD, вы подарите себе комфорт, яркость и уверенность в новом сезоне!',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 18, M: 24, L: 20, XL: 12, XXL: 6 },
    image_url: '/237492517_0.webp',
    images: ['/237492517_0.webp', '/237492517_1.webp', '/237492517_2.webp', '/237492517_3.webp'],
    reviews: [], color: 'Голубой', composition: 'Хлопок 80%, полиэстер 20%', season: 'Лето', gender: 'Женский'
  },
  {
    id: 'bd-9', article: '385327478', title: 'Костюм летний рубашка с шортами', brand: 'bashkirka',
    price: 3500, old_price: 8000, rating: 4.8, reviews_count: 105, is_recommended: true, collection: 'hits',
    description: 'Яркий и стильный летний костюм с рубашкой и шортами от бренда Башкирская Домохозяйка - BD. Этот комплект станет настоящим украшением вашего летнего гардероба, предлагая оптимальное сочетание комфорта и элегантности.\nСозданный из легких и натуральных тканей, костюм обеспечивает максимальное удобство в жаркую погоду, позволяя коже дышать и поддерживая оптимальную температуру тела. Летний костюм состоит из двух частей: стильной рубашки прямого кроя и удобных шорт средней длины, выполненных в единой цветовой гамме. Такой комплект выглядит целостно и аккуратно, подчеркивая природную красоту женской фигуры.\nЛегкая и дышащая ткань костюмов обеспечивает приятные ощущения даже в самые жаркие дни, сохраняя ощущение прохлады и свежести. Рубашка свободного кроя мягко облегает тело, не сковывая движений, а удобные шорты дополняют образ, даря чувство легкости и свободы.\nВыбирая летние костюмы от BD, вы подарите себе комфорт, яркость и уверенность в новом сезоне!',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: { S: 18, M: 24, L: 20, XL: 12, XXL: 6 },
    image_url: '/385327478_0.webp',
    images: ['/385327478_0.webp', '/385327478_1.webp', '/385327478_2.webp', '/385327478_3.webp'],
    reviews: [], color: 'Разноцветный', composition: 'Хлопок 80%, полиэстер 20%', season: 'Лето', gender: 'Женский'
  },
  {
    id: 'bd-10', article: '463682093', title: 'Костюм велюровый спортивный', brand: 'bashkirka',
    price: 3675, old_price: 10000, rating: 4.9, reviews_count: 340, is_recommended: true, collection: 'hits',
    description: 'Спортивный костюм из нежнейшего велюра, созданный брендом Башкирская домохозяйка - BD. Этот наряд отличается особым шармом и комфортом, что сделает его незаменимым предметом вашего гардероба.\nДанный костюм является прекрасным решением для межсезонья, ведь он одинаково хорош и в прохладные дни ранней весны, и в тёплые летние вечера. Элегантный однотонный дизайн открывает широкие возможности сочетания с различной одеждой и аксессуарами, помогая создавать яркие образы в стиле спорт-шик.\nВыбор цвета и размера предоставляется огромным спектром вариантов, включая большие размеры, что даёт возможность каждой женщине найти оптимальный вариант для своей фигуры. Ткань легко чистится и быстро восстанавливает первоначальный вид после стирки, гарантируя долгий срок службы и неизменно хорошее настроение при каждом выходе.\nОдежда от БД - это не просто красивая одежда, а предмет гордости гардероба, который будет радовать долгие годы.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], stock: { S: 5, M: 12, L: 18, XL: 15, XXL: 8, XXXL: 4 },
    image_url: '/463682093_0.webp',
    images: ['/463682093_0.webp', '/463682093_1.webp', '/463682093_2.webp', '/463682093_3.webp'],
    reviews: [], color: 'Разноцветный', composition: 'Хлопок 80%, полиэстер 20%', season: 'Круглогодичный', gender: 'Женский'
  }

];

// ─── Store ────────────────────────────────────────────────────────────────────

interface ProductState {
  products: Product[];
  categories: Category[];
  recentlyViewed: string[];
  isLoading: boolean;
  error: string | null;
  adminReviews: any[];

  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  fetchReviews: (productId: string) => Promise<void>;
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  addRecentlyViewed: (productId: string) => void;
  fetchAdminReviews: () => Promise<void>;
  updateReviewStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => Promise<void>;
  updateReviewReply: (id: string, reply: string) => Promise<void>;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: FAKE_PRODUCTS,
      categories: [],
      recentlyViewed: [],
      adminReviews: [],
      isLoading: false,
      error: null,

      fetchCategories: async () => {
        // No-op — no remote categories needed
      },

      fetchProducts: async () => {
        // Always use fake products — no Supabase needed
        set({ products: FAKE_PRODUCTS, isLoading: false });
      },

      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updated) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updated } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      fetchReviews: async (_productId) => {
        // No-op for fake mode
      },

      addReview: async (_productId, _review) => {
        // Simulate success
        alert('Ваш отзыв отправлен и появится после проверки!');
      },

      addRecentlyViewed: (productId) => set((state) => {
        const filtered = state.recentlyViewed.filter(id => id !== productId);
        return { recentlyViewed: [productId, ...filtered].slice(0, 10) };
      }),

      fetchAdminReviews: async () => { },
      updateReviewStatus: async () => { },
      updateReviewReply: async () => { },
    }),
    {
      name: 'product-storage-v3',
      version: 3,
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    }
  )
);
