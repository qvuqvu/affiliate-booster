import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import { generateViralThread, generateImage } from './services/geminiService';
import type { BatchResult, ProductInput, ToneOption, PlatformOption } from './types';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string | null>(null);
    const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null);
    const [lastSubmittedPlatform, setLastSubmittedPlatform] = useState<PlatformOption | null>(null);

    const handleSubmit = async (products: ProductInput[], tones: ToneOption[], shouldGenerateImage: boolean, platform: PlatformOption, temperature: number) => {
        setIsLoading(true);
        setError(null);
        setBatchResults(null);
        setProgressMessage(null);
        setLastSubmittedPlatform(platform);
        
        let results: BatchResult[] = [];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            try {
                // Step 1: Generate Text Content
                setProgressMessage(`✍️ Đang viết nội dung cho "${product.name}" (${i + 1}/${products.length})...`);
                const textContent = await generateViralThread(product.name, product.desc, product.link, product.isAffiliate, tones, platform, temperature);
                
                let finalContent = textContent;

                // Initially push text content
                results.push({ product, content: finalContent });
                setBatchResults([...results]);
                
                // Step 2: Generate Image if requested
                if (shouldGenerateImage) {
                    const imagePrompt = textContent[0]?.imagePrompt;

                    if (imagePrompt) {
                        // Show loading state for the image
                        results = results.map(r => r.product.id === product.id 
                            ? { ...r, content: r.content.map(c => ({...c, isImageLoading: true}))}
                            : r
                        );
                        setBatchResults([...results]);
                        
                        setProgressMessage(`🎨 Đang vẽ hình ảnh cho "${product.name}" (${i + 1}/${products.length})...`);
                        const imageUrl = await generateImage(imagePrompt);
                        
                        // Add image URL to the final content and remove loading state
                        finalContent = textContent.map(template => ({ ...template, imageUrl, isImageLoading: false }));
                        
                        results = results.map(r => r.product.id === product.id ? { ...r, content: finalContent } : r);
                        setBatchResults([...results]);

                    } else {
                         console.warn(`No image prompt found for "${product.name}". Skipping image generation.`);
                    }
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
                setError(`Lỗi khi xử lý sản phẩm "${product.name}": ${errorMessage}. Đã dừng quá trình.`);
                setIsLoading(false);
                setProgressMessage(null);
                return; // Stop on first error
            }
        }
        
        setIsLoading(false);
        setProgressMessage(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md sticky top-24">
                            <h2 className="text-lg font-bold mb-4">Tùy chỉnh & Nhập liệu</h2>
                            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
                             {isLoading && progressMessage && (
                                <div className="mt-4 text-center text-sm text-blue-600 dark:text-blue-400">
                                    {progressMessage}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                                <strong className="font-bold">Rất tiếc!</strong>
                                <span className="block sm:inline ml-2">{error}</span>
                            </div>
                        )}
                        <OutputDisplay content={batchResults} platform={lastSubmittedPlatform}/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;