import React, { useState } from 'react';
import type { ProductInput, ToneOption, PlatformOption } from '../types.tsx';
import { TONE_OPTIONS, PLATFORM_OPTIONS } from '../types.tsx';

interface InputFormProps {
    onSubmit: (products: ProductInput[], tones: ToneOption[], shouldGenerateImage: boolean, platform: PlatformOption, temperature: number) => void;
    isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
    const [products, setProducts] = useState<ProductInput[]>([
        { id: crypto.randomUUID(), name: '', desc: '', link: '', isAffiliate: true },
    ]);
    const [selectedTones, setSelectedTones] = useState<ToneOption[]>([]);
    const [shouldGenerateImage, setShouldGenerateImage] = useState(false);
    const [platform, setPlatform] = useState<PlatformOption>('Thread (Ngắn)');
    const [temperature, setTemperature] = useState(0.8);

    const handleProductChange = (id: string, field: keyof Omit<ProductInput, 'id'>, value: string | boolean) => {
        setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addProduct = () => {
        setProducts([...products, { id: crypto.randomUUID(), name: '', desc: '', link: '', isAffiliate: true }]);
    };

    const removeProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const handleToneChange = (tone: ToneOption) => {
        setSelectedTones(prev =>
            prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validProducts = products.filter(p => p.name && p.desc && p.link);
        if (validProducts.length === 0) {
            alert('Vui lòng điền đầy đủ thông tin cho ít nhất một sản phẩm.');
            return;
        }
        onSubmit(validProducts, selectedTones, shouldGenerateImage, platform, temperature);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Input Section */}
            <div className="space-y-6">
                {products.map((product, index) => (
                    <div key={product.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg relative">
                        {products.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeProduct(product.id)}
                                className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                aria-label="Xóa sản phẩm"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-600 dark:text-slate-300">Sản phẩm #{index + 1}</h3>
                             <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                                placeholder="Tên sản phẩm"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm"
                                required
                            />
                            <textarea
                                value={product.desc}
                                onChange={(e) => handleProductChange(product.id, 'desc', e.target.value)}
                                placeholder="Mô tả ngắn gọn"
                                rows={3}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm"
                                required
                            />
                            <input
                                type="url"
                                value={product.link}
                                onChange={(e) => handleProductChange(product.id, 'link', e.target.value)}
                                placeholder="Link Shopee (https://...)"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm"
                                required
                            />
                            <div className="flex items-center">
                                <input
                                    id={`isAffiliate-${product.id}`}
                                    type="checkbox"
                                    checked={product.isAffiliate}
                                    onChange={(e) => handleProductChange(product.id, 'isAffiliate', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor={`isAffiliate-${product.id}`} className="ml-2 block text-sm">
                                    Đây là link Affiliate
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addProduct} className="w-full py-2 px-4 border border-dashed border-slate-400 dark:border-slate-500 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    <i className="fa-solid fa-plus mr-2"></i>Thêm sản phẩm
                </button>
            </div>
            
            {/* Platform Selection Section */}
            <div>
                 <h3 className="text-base font-semibold mb-3">Chọn nền tảng</h3>
                 <div className="flex flex-col space-y-2">
                     {PLATFORM_OPTIONS.map(option => (
                         <label key={option} className="flex items-center space-x-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                             <input
                                 type="radio"
                                 name="platform"
                                 value={option}
                                 checked={platform === option}
                                 onChange={(e) => setPlatform(e.target.value as PlatformOption)}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                             />
                             <span className="text-sm">{option}</span>
                         </label>
                     ))}
                 </div>
            </div>

            {/* Tone Selection Section */}
            <div>
                 <h3 className="text-base font-semibold mb-3">Tùy chọn phong cách (không bắt buộc)</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                     {TONE_OPTIONS.map(tone => (
                         <label key={tone} className="flex items-center space-x-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                             <input
                                 type="checkbox"
                                 checked={selectedTones.includes(tone)}
                                 onChange={() => handleToneChange(tone)}
                                 className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                             />
                             <span className="text-sm">{tone}</span>
                         </label>
                     ))}
                 </div>
            </div>
            
             {/* Temperature Control */}
            <div>
                <label htmlFor="temperature" className="text-base font-semibold mb-3 block">
                    Độ sáng tạo (Temperature)
                    <span className="ml-2 font-mono text-sm text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
                </label>
                <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
            </div>

             {/* Image Generation Option */}
            <div>
                 <label className="flex items-center space-x-2 p-3 rounded-md bg-slate-100 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    <input
                        type="checkbox"
                        checked={shouldGenerateImage}
                        onChange={(e) => setShouldGenerateImage(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium"><i className="fa-regular fa-image mr-2 text-blue-500"></i>Kèm hình ảnh minh họa</span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang sáng tạo...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                        Tạo Nội Dung
                    </>
                )}
            </button>
        </form>
    );
};

export default InputForm;