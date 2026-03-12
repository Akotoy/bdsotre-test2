import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { useUiStore } from '../store/uiStore';
import { useCreatorStore } from '../store/creatorStore';
import {
  ArrowLeft, Heart, Star, Share2,
  ChevronRight, ChevronLeft, ShoppingBag, Sparkles
} from 'lucide-react';

export default function CreatorShop() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const creators = useCreatorStore((s) => s.creators);
  const getCreator = useCreatorStore((s) => s.getCreator);
  const creator = slug ? getCreator(slug) : creators[0];
  const activeSlug = creator?.slug;
  const allProducts = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { addToast, openCart } = useUiStore();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [isSticky, setIsSticky] = useState(false);

  // Sticky header detection
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!creator) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-5xl">🤷</p>
        <h2 className="text-2xl font-bold dark:text-white">Магазин не найден</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Такой страницы не существует
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:underline">
          <ArrowLeft size={16} /> На главную
        </Link>
      </div>
    );
  }

  // Filter products for this creator
  const products = allProducts.filter(p => p.brand === slug);

  // Helper for Product Card rendering (used in both carousels and grids)
  const ProductCard = ({ product }: { product: typeof products[0] }) => {
    const fav = isFavorite(product.id);
    const discount = product.old_price
      ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
      : 0;
    const selected = selectedSizes[product.id];
    const isOos = selected ? (product.stock?.[selected] ?? 0) === 0 : false;

    return (
      <motion.div
        layout
        className="group flex flex-col min-w-[160px] sm:min-w-[220px]"
      >
        {/* Image Box */}
        <div
          className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer mb-2 sm:mb-3"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-sm">
              -{discount}%
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={e => { e.stopPropagation(); toggleFavorite(product.id); }}
            className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 dark:bg-neutral-900/90 rounded-full flex items-center justify-center shadow transition-opacity ${fav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <Heart size={14} className={fav ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'} />
          </button>

          {/* Add to cart overlay (Desktop Hover) */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 p-2 opacity-0 sm:opacity-100">
            {!selected ? (
              <button
                onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-1.5"
                style={{ background: creator.accentColor, color: creator.accentText }}
              >
                Выбрать размер
              </button>
            ) : (
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (isOos) return;
                  addItem({ ...product, selectedSize: selected });
                  addToast('Добавлено в корзину', 'success');
                  openCart();
                }}
                disabled={isOos}
                className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-1.5"
                style={{ background: creator.accentColor, color: creator.accentText }}
              >
                {isOos ? 'Нет в наличии' : (
                  <>В корзину</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="flex flex-col flex-1 px-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <span className="text-sm sm:text-base font-black dark:text-white leading-none whitespace-nowrap">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            {product.old_price && (
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 line-through leading-none">
                {product.old_price.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          <p
            className="text-[10px] sm:text-xs font-bold mb-0.5 truncate uppercase tracking-wider"
            style={{ color: creator.accentColor }}
          >
            {creator.name}
          </p>
          <p
            className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-snug cursor-pointer group-hover:underline mb-1 flex-1"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.title}
          </p>

          {product.rating && (
            <div className="flex items-center gap-1 mt-auto">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {product.rating} <span className="text-neutral-300 dark:text-neutral-600">({product.reviews_count ?? 0})</span>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Carousel Wrapper
  const Carousel = ({ collectionId }: { collectionId: string }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const collectionProducts = products.filter(p => p.collection === collectionId);
    if (collectionProducts.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const amount = direction === 'left' ? -300 : 300;
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      }
    };

    return (
      <div className="relative group/carousel -mx-4 sm:mx-0 px-4 sm:px-0">
        {/* Desktop Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-neutral-800 rounded-full items-center justify-center shadow-lg border border-neutral-100 dark:border-neutral-700 z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronLeft size={20} className="text-neutral-600 dark:text-neutral-300" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white dark:bg-neutral-800 rounded-full items-center justify-center shadow-lg border border-neutral-100 dark:border-neutral-700 z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronRight size={20} className="text-neutral-600 dark:text-neutral-300" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 sm:gap-4 snap-x snap-mandatory hide-scrollbar pb-4"
        >
          {collectionProducts.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[45%] sm:w-[calc(25%-12px)] lg:w-[calc(20%-12.8px)]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slug}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-20 sm:pb-8"
      >
        {/* ── 1. STICKY HEADER (WB STYLE) ── */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-transparent transition-all duration-300 ${isSticky ? 'translate-y-0 border-neutral-200 dark:border-neutral-800 shadow-sm' : '-translate-y-full'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-8 h-8 rounded-full overflow-hidden border" style={{ borderColor: creator.accentColor }}>
                <img src={creator.photo} alt={creator.name} className="w-full h-full object-cover" />
              </button>
              <span className="font-bold text-sm dark:text-white truncate">{creator.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Ссылка скопирована', 'success');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Share2 size={14} />
              </button>
              <button
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={{ background: creator.accentColor, color: creator.accentText }}
              >
                Подписаться
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. HERO BANNER (DESKTOP & MOBILE) ── */}
        <section className="relative w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
          {/* Mobile Banner (aspect ratio tailored for phones) */}
          <div
            className="block sm:hidden w-full aspect-[3/4] sm:aspect-[4/5] bg-cover bg-center"
            style={{
              backgroundImage: `url(${creator.mobileHeroBg || creator.coverPhoto})`,
            }}
          />
          {/* Desktop Banner (wide) */}
          <div
            className="hidden sm:block w-full h-[300px] md:h-[400px] lg:h-[450px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${creator.coverPhoto})`,
            }}
          />

          {/* Overlay Gradient for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 sm:to-transparent" />

          {/* Floating Action Buttons (Top) */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-center z-10">
            <Link
              to="/"
              className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                addToast('Ссылка скопирована', 'success');
              }}
              className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>

          {/* Brand Logo/Info (Bottom of Banner) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-10 z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full sm:rounded-3xl border-2 sm:border-4 shadow-xl overflow-hidden shrink-0 bg-white"
              style={{ borderColor: creator.accentColor }}
            >
              <img src={creator.photo} alt={creator.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-1 sm:mb-2 drop-shadow-md">
                {creator.name}
              </h1>
              <p className="text-white/90 text-sm sm:text-base mb-3 max-w-2xl drop-shadow line-clamp-2 sm:line-clamp-none">
                {creator.tagline}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <span className="text-white/80 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <Star size={14} className="fill-white" /> 4.9 рейтинг
                </span>
                <span className="text-white/80 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <Heart size={14} className="fill-white" /> {creator.subscribers}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. HORIZONTAL MENU (TABS) ── */}
        <div className="sticky top-0 sm:top-0 z-40 bg-white dark:bg-[#0a0a0a] border-b border-neutral-100 dark:border-neutral-800 shadow-sm sm:shadow-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto hide-scrollbar gap-6 sm:gap-8 items-center h-14 snap-x">
              <a
                href="#section-constructor"
                className="snap-start shrink-0 text-sm sm:text-base font-black text-rose-500 hover:text-rose-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent hover:after:bg-rose-600 pb-4 pt-4 -mb-4 flex items-center gap-1.5"
              >
                <Sparkles size={16} /> Свой дизайн
              </a>
              {creator.collections?.map(col => (
                <a
                  key={col.id}
                  href={`#section-${col.id}`}
                  className="snap-start shrink-0 text-sm sm:text-base font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent hover:after:bg-black dark:hover:after:bg-white pb-4 pt-4 -mb-4"
                >
                  {col.title}
                </a>
              ))}
              <a
                href="#section-about"
                className="snap-start shrink-0 text-sm sm:text-base font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors pb-4 pt-4 -mb-4 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent hover:after:bg-black dark:hover:after:bg-white"
              >
                О Бренде
              </a>
            </nav>
          </div>
        </div>

        {/* ── 3.5. CONSTRUCTOR BANNER ── */}
        <section id="section-constructor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 scroll-mt-24">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 to-black dark:from-neutral-800 dark:to-neutral-900 border border-neutral-800 shadow-2xl">
            {/* Decorative background element */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold mb-4 uppercase tracking-wider backdrop-blur-md">
                  <Sparkles size={14} className="text-amber-400" /> Нейро-конструктор
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                  Создай свой <span style={{ color: creator.accentColor }}>уникальный мерч</span>
                </h2>
                <p className="text-white/70 text-sm sm:text-base max-w-xl mb-0">
                  Выбери худи или футболку от {creator.name}, напиши идею — и нейросеть сгенерирует эксклюзивный принт только для тебя.
                </p>
              </div>

              <Link
                to={`/constructor/${creator.slug}`}
                className="shrink-0 px-8 py-4 bg-white text-black rounded-2xl font-black text-lg transition-transform hover:scale-105 shadow-xl hover:shadow-white/20 flex items-center gap-2 group"
              >
                Сделать дизайн <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 4. COLLECTIONS & PRODUCTS ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-20">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border border-neutral-100 dark:border-neutral-800">
              <ShoppingBag size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <h3 className="text-xl font-bold dark:text-white mb-2">Витрина заполняется</h3>
              <p className="text-neutral-500 text-sm">Скоро здесь появятся новые коллекции.</p>
            </div>
          ) : (
            creator.collections?.map((col, idx) => {
              const colProducts = products.filter(p => p.collection === col.id);
              if (colProducts.length === 0) return null;

              return (
                <section key={col.id} id={`section-${col.id}`} className="scroll-mt-24">
                  <div className="flex items-end justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-3xl font-black dark:text-white tracking-tight">
                      {col.title}
                    </h2>
                    {col.type === 'carousel' && colProducts.length > 2 && (
                      <Link
                        to="#"
                        className="text-xs sm:text-sm font-bold opacity-60 hover:opacity-100 flex items-center gap-0.5"
                        style={{ color: creator.accentColor }}
                      >
                        Смотреть все <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>

                  {/* Render based on collection type */}
                  {col.type === 'carousel' ? (
                    <Carousel collectionId={col.id} />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
                      {colProducts.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* ── 5. ABOUT BRAND FOOTER (WB STYLE) ── */}
        <section id="section-about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-24 scroll-mt-24">
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-6 sm:p-12 border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0"
              style={{ border: `4px solid ${creator.accentColor}` }}
            >
              <img src={creator.photo} alt={creator.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-black dark:text-white mb-3">О бренде {creator.name}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
                {creator.bio}
                {' '}Каждая вещь в нашей коллекции создана с особым вниманием к деталям и качеству материалов.
                Мы верим, что одежда должна быть не только стильной, но и комфортной для ежедневного использования в любом ритме жизни.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <a
                  href="#"
                  className="px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: creator.accentColor, color: creator.accentText }}
                >
                  Все товары бренда
                </a>
              </div>
            </div>
          </div>
        </section>

      </motion.div>
    </AnimatePresence>
  );
}

