import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';
import { Minus, Plus, Trash2, ArrowRight, Tag, X, ShoppingBag, Truck, ChevronRight, Shield } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { items, updateQuantity, removeItem, promoCode, discountPercent, applyPromoCode, removePromoCode } = useCartStore();
  const addToast = useUiStore((s) => s.addToast);
  const [promoInput, setPromoInput] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountPercent ? (totalPrice * discountPercent) / 100 : 0;
  const finalPrice = totalPrice - discountAmount;
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    try {
      applyPromoCode(promoInput.trim());
      setPromoInput('');
      addToast('Промокод успешно применён!', 'success');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-28 gap-6"
      >
        <div className="w-24 h-24 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center">
          <ShoppingBag size={36} className="text-violet-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black dark:text-white mb-2">Корзина пуста</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xs">
            Перейдите в каталог и выберите что-нибудь 🛍
          </p>
        </div>
        <Link
          to="/catalog"
          className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3.5 rounded-full font-bold transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2"
        >
          <ShoppingBag size={18} /> Перейти в каталог
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 pt-4 mb-6">
        <Link to="/" className="hover:text-violet-600 transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-neutral-900 dark:text-white font-medium">Корзина</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-black dark:text-white">
          Корзина <span className="text-neutral-400 dark:text-neutral-600 font-medium text-xl ml-1">({totalQty})</span>
        </h1>
        <button onClick={() => items.forEach(i => removeItem(i.cartItemId || i.id))} className="text-sm text-neutral-400 hover:text-rose-500 transition-colors">
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Items ── */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.cartItemId || item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm group"
              >
                {/* Image */}
                <Link to={`/product/${item.id}`} className="w-24 h-32 shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.brand && <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">{item.brand}</p>}
                        {item.customDesign && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {item.customDesign.isAI ? 'ИИ Дизайн ✨' : 'Кастом Дизайн'}
                          </span>
                        )}
                      </div>
                      <Link to={item.customDesign ? '#' : `/product/${item.id}`} className="font-semibold text-sm text-neutral-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-2 leading-snug mt-0.5">
                        {item.title}
                      </Link>

                      <div className="flex items-center gap-2 mt-1">
                        {(item as any).selectedSize && (
                          <span className="inline-block text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-md font-medium">
                            Размер: {(item as any).selectedSize}
                          </span>
                        )}
                        {item.customDesign && (
                          <span className="inline-block text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                            Цвет: <div className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: item.customDesign.baseColor }} />
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.cartItemId || item.id)}
                      className="p-1.5 text-neutral-300 dark:text-neutral-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-9 text-center text-sm font-bold dark:text-white border-x border-neutral-200 dark:border-neutral-700 h-8 flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="font-black text-base dark:text-white">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-neutral-400">{item.price.toLocaleString('ru-RU')} ₽ × {item.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Delivery note */}
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-2xl">
            <Truck size={18} className="text-green-600 dark:text-green-400 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              {finalPrice >= 5000
                ? '🎉 Бесплатная доставка!'
                : `Добавьте ещё на ${(5000 - finalPrice).toLocaleString('ru-RU')} ₽ для бесплатной доставки`}
            </p>
          </div>
        </div>

        {/* ── Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl sticky top-24 shadow-sm space-y-5">
            <h2 className="text-lg font-bold dark:text-white">Итого</h2>

            {/* Promo code */}
            <div>
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-3">
                  <span className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
                    <Tag size={15} /> {promoCode} (-{discountPercent}%)
                  </span>
                  <button onClick={removePromoCode} className="text-green-600 dark:text-green-400 hover:opacity-70 transition-opacity p-1">
                    <X size={13} />
                  </button>
                </div>
              ) : showPromoInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    placeholder="Промокод"
                    autoFocus
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium uppercase dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:bg-violet-600 dark:hover:bg-violet-600 dark:hover:text-white transition-colors whitespace-nowrap"
                  >
                    Применить
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPromoInput(true)}
                  className="text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline underline-offset-2 transition-colors text-left flex items-center gap-1.5"
                >
                  <Tag size={13} /> У меня есть промокод
                </button>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Товары ({totalQty} шт.)</span>
                <span className="dark:text-white font-medium">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                  <span>Скидка ({discountPercent}%)</span>
                  <span>−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Доставка</span>
                <span className={finalPrice >= 5000 ? 'text-green-600 dark:text-green-400 font-semibold' : 'dark:text-white'}>
                  {finalPrice >= 5000 ? 'Бесплатно' : 'Рассчитается'}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <span className="font-bold text-neutral-900 dark:text-white">К оплате</span>
              <span className="font-black text-2xl dark:text-white">{finalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 text-base"
            >
              Оформить заказ <ArrowRight size={18} />
            </Link>

            {/* Security */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              <Shield size={12} />
              <span>Безопасная оплата через ЮKassa</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
