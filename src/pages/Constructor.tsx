import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Type, Image as ImageIcon, Palette, ShoppingBag, Loader2 } from 'lucide-react';
import { useCreatorStore } from '../store/creatorStore';
import { useCartStore, CustomDesign } from '../store/cartStore';
import { useUiStore } from '../store/uiStore';

type BaseType = 'tshirt' | 'hoodie';
type Step = 'base' | 'design' | 'checkout';

const BASE_PRICES = {
    tshirt: 2500,
    hoodie: 4500,
};

const COLORS = [
    { id: 'white', name: 'Белый', hex: '#FFFFFF' },
    { id: 'black', name: 'Черный', hex: '#111111' },
    { id: 'gray', name: 'Серый', hex: '#6b7280' },
    { id: 'red', name: 'Красный', hex: '#ef4444' },
];

export default function Constructor() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const creator = useCreatorStore(s => slug ? s.getCreator(slug) : undefined);
    const addItem = useCartStore(s => s.addItem);
    const { addToast, openCart } = useUiStore();

    const [step, setStep] = useState<Step>('base');

    // Customization State
    const [baseType, setBaseType] = useState<BaseType>('tshirt');
    const [baseColor, setBaseColor] = useState(COLORS[0]);
    const [designType, setDesignType] = useState<'ai' | 'text' | 'image'>('ai');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentDesign, setCurrentDesign] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');

    // SIZES
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    if (!creator) {
        return (
            <div className="text-center py-24">
                <h2 className="text-2xl font-bold dark:text-white">Блогер не найден</h2>
                <Link to="/" className="text-violet-500 hover:underline mt-4 inline-block">На главную</Link>
            </div>
        );
    }

    // Pre-fill a color option with creator's accent color
    const dynamicColors = [
        ...COLORS,
        { id: 'creator', name: 'Фирменный', hex: creator.accentColor }
    ];

    const handleGenerateAI = () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        // Fake AI Delay
        setTimeout(() => {
            // Pick a random cool AI-like abstract image from unsplash
            const randomSeed = Math.floor(Math.random() * 1000);
            setCurrentDesign(`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop&seed=${randomSeed}`);
            setIsGenerating(false);
        }, 2500);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            addToast('Пожалуйста, выберите размер', 'error');
            return;
        }
        if (!currentDesign) {
            addToast('Пожалуйста, добавьте дизайн', 'error');
            return;
        }

        const customData: CustomDesign = {
            baseType,
            baseColor: baseColor.hex,
            designImage: currentDesign,
            isAI: designType === 'ai',
        };

        addItem({
            id: `custom-${Date.now()}`, // Unique ID for custom items
            title: `Кастомный мерч от ${creator.name} (${baseType === 'tshirt' ? 'Футболка' : 'Худи'})`,
            price: BASE_PRICES[baseType],
            image_url: currentDesign, // We'll just show the design in the cart for now (or a composite if we get fancy)
            brand: creator.slug,
            selectedSize,
            customDesign: customData, // Flag and details
            stock: { [selectedSize]: 999 }, // Infinite stock for custom
        });

        addToast('Кастомный дизайн добавлен в корзину!', 'success');
        openCart();
        navigate(`/shop/${creator.slug}`);
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] pb-24 lg:pb-0">

            {/* HEADER */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                            <ArrowLeft size={20} className="dark:text-white" />
                        </button>
                        <h1 className="font-black text-lg sm:text-xl dark:text-white tracking-tight flex items-center gap-2">
                            <Sparkles size={18} style={{ color: creator.accentColor }} />
                            Конструктор <span className="hidden sm:inline">с {creator.name}</span>
                        </h1>
                    </div>

                    {/* Progress Steps (Desktop) */}
                    <div className="hidden md:flex items-center gap-2 text-sm font-bold">
                        <button onClick={() => setStep('base')} className={`px-4 py-1.5 rounded-full transition-colors ${step === 'base' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>1. База</button>
                        <span className="text-neutral-300 dark:text-neutral-700">/</span>
                        <button onClick={() => setStep('design')} className={`px-4 py-1.5 rounded-full transition-colors ${step === 'design' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>2. Дизайн</button>
                        <span className="text-neutral-300 dark:text-neutral-700">/</span>
                        <button onClick={() => setStep('checkout')} className={`px-4 py-1.5 rounded-full transition-colors ${step === 'checkout' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>3. Заказ</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 flex flex-col lg:flex-row gap-8 lg:gap-16">

                {/* LEFT: MOCKUP VIEW */}
                <div className="lg:flex-1 lg:sticky lg:top-24 h-[50vh] lg:h-[70vh] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800/50 flex items-center justify-center relative border border-neutral-300/50 dark:border-neutral-700/50 shadow-inner">

                    {/* Base Item Mask/Color (Simulating clothing item with a solid colored div for now, in real life you'd use a multiply blend mode over a white mockup) */}
                    <div
                        className="absolute inset-x-8 inset-y-8 rounded-[4rem] transition-colors duration-500 ease-in-out shadow-2xl"
                        style={{
                            backgroundColor: baseColor.hex,
                            clipPath: baseType === 'tshirt' ? 'polygon(20% 0%, 80% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)' : 'polygon(30% 0%, 70% 0%, 100% 20%, 90% 100%, 10% 100%, 0% 20%)',
                            opacity: 0.9
                        }}
                    />

                    {/* Overlay Text indicating what the base is since geometry is simple wrapper */}
                    <div className="absolute top-4 left-6 mix-blend-difference text-white/50 text-xs font-black tracking-widest uppercase">
                        {baseType === 'tshirt' ? 'Футболка' : 'Худи'} CLASSIC • {baseColor.name}
                    </div>

                    {/* Design Placement Area (Center Chest) */}
                    <div className="absolute w-[45%] h-[45%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl preserve-3d">
                        {currentDesign ? (
                            <motion.img
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                src={currentDesign}
                                alt="Design"
                                className="w-full h-full object-contain drop-shadow-2xl mix-blend-normal"
                            />
                        ) : (
                            <div className="text-white/40 text-sm font-bold flex flex-col items-center gap-2 mix-blend-difference">
                                <ImageIcon size={32} opacity={0.5} />
                                Область принта
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: CONTROLS */}
                <div className="lg:w-[450px] shrink-0">

                    <AnimatePresence mode="wait">
                        {/* STEP 1: BASE */}
                        {step === 'base' && (
                            <motion.div
                                key="base"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-2xl font-black dark:text-white mb-4">1. Выбери базу</h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setBaseType('tshirt')}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${baseType === 'tshirt' ? 'border-black dark:border-white bg-white dark:bg-neutral-800' : 'border-transparent bg-white dark:bg-neutral-900 shadow-sm text-neutral-500'}`}
                                        >
                                            <h3 className={`font-bold ${baseType === 'tshirt' ? 'dark:text-white' : ''}`}>Футболка</h3>
                                            <p className="text-sm opacity-60">От 2 500 ₽</p>
                                        </button>
                                        <button
                                            onClick={() => setBaseType('hoodie')}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${baseType === 'hoodie' ? 'border-black dark:border-white bg-white dark:bg-neutral-800' : 'border-transparent bg-white dark:bg-neutral-900 shadow-sm text-neutral-500'}`}
                                        >
                                            <h3 className={`font-bold ${baseType === 'hoodie' ? 'dark:text-white' : ''}`}>Худи</h3>
                                            <p className="text-sm opacity-60">От 4 500 ₽</p>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold dark:text-white">Цвет ткани</h3>
                                        <span className="text-sm font-medium text-neutral-500">{baseColor.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {dynamicColors.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => setBaseColor(color)}
                                                className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${baseColor.id === color.id ? 'border-black dark:border-white scale-110' : 'border-transparent shadow'}`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep('design')}
                                    className="w-full py-4 rounded-2xl font-black text-white transition-transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2"
                                    style={{ backgroundColor: creator.accentColor, color: creator.accentText }}
                                >
                                    Далее: Дизайн
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: DESIGN */}
                        {step === 'design' && (
                            <motion.div
                                key="design"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-2xl font-black dark:text-white mb-4">2. Создай дизайн</h2>

                                    {/* Design Tools Tabs */}
                                    <div className="flex bg-neutral-200 dark:bg-neutral-800 p-1 rounded-xl mb-6">
                                        <button
                                            onClick={() => setDesignType('ai')}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${designType === 'ai' ? 'bg-white dark:bg-neutral-700 shadow dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            <Sparkles size={16} /> ИИ Арт
                                        </button>
                                        <button
                                            onClick={() => setDesignType('text')}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${designType === 'text' ? 'bg-white dark:bg-neutral-700 shadow dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            <Type size={16} /> Текст
                                        </button>
                                        <button
                                            onClick={() => setDesignType('image')}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${designType === 'image' ? 'bg-white dark:bg-neutral-700 shadow dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            <ImageIcon size={16} /> Фото
                                        </button>
                                    </div>

                                    {/* AI Generation Tool */}
                                    {designType === 'ai' && (
                                        <div className="space-y-4">
                                            <label className="block text-sm font-bold dark:text-white">Опиши идею нейросети:</label>
                                            <div className="relative">
                                                <textarea
                                                    value={prompt}
                                                    onChange={(e) => setPrompt(e.target.value)}
                                                    placeholder="Киберпанк кот на скейтборде, неоновые цвета..."
                                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 pr-12 min-h-[120px] resize-none focus:outline-none focus:ring-2 dark:text-white placeholder-neutral-400"
                                                />
                                            </div>
                                            <button
                                                onClick={handleGenerateAI}
                                                disabled={isGenerating || !prompt.trim()}
                                                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white disabled:opacity-50 transition-all shadow-md"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)' }}
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                                {isGenerating ? 'Создаем магию...' : 'Сгенерировать принт'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Text Tool Stub */}
                                    {designType === 'text' && (
                                        <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
                                            <Palette size={32} className="mx-auto text-neutral-400 mb-3" />
                                            <p className="font-bold dark:text-white text-sm">Текстовый редактор в разработке</p>
                                            <p className="text-xs text-neutral-500 mt-1">Пока используйте ИИ генерацию</p>
                                        </div>
                                    )}

                                    {/* Image Tool Stub */}
                                    {designType === 'image' && (
                                        <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
                                            <ImageIcon size={32} className="mx-auto text-neutral-400 mb-3" />
                                            <p className="font-bold dark:text-white text-sm">Загрузка файлов в разработке</p>
                                            <p className="text-xs text-neutral-500 mt-1">Только JPG/PNG</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('base')}
                                        className="px-6 py-4 rounded-2xl font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!currentDesign) {
                                                addToast('Сначала сгенерируйте дизайн!', 'error');
                                                return;
                                            }
                                            setStep('checkout');
                                        }}
                                        className="flex-1 py-4 rounded-2xl font-black text-white transition-transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2"
                                        style={{ backgroundColor: creator.accentColor, color: creator.accentText }}
                                    >
                                        Далее: Размер
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: CHECKOUT */}
                        {step === 'checkout' && (
                            <motion.div
                                key="checkout"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-2xl font-black dark:text-white mb-2">3. Оформление</h2>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                                        Твой уникальный мерч почти готов. Выбери размер.
                                    </p>

                                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 mb-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Итоговая стоимость</p>
                                            <p className="text-3xl font-black dark:text-white">{BASE_PRICES[baseType].toLocaleString('ru-RU')} ₽</p>
                                        </div>
                                        <ShoppingBag size={32} className="text-neutral-200 dark:text-neutral-800" />
                                    </div>

                                    <h3 className="font-bold dark:text-white mb-3">Размер</h3>
                                    <div className="grid grid-cols-5 gap-2 mb-8">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedSize === size ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('design')}
                                        className="px-6 py-4 rounded-2xl font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 py-4 rounded-2xl font-black text-white transition-transform hover:scale-[1.02] shadow-lg flex justify-center items-center gap-2"
                                        style={{ backgroundColor: creator.accentColor, color: creator.accentText }}
                                    >
                                        В корзину
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
