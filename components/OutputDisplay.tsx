import React, { useState } from 'react';
import { BatchResult, Template, PlatformOption } from '../types.tsx';
import CopyButton from './CopyButton.tsx';

const getPlatformTitle = (platform: PlatformOption | null) => {
    switch (platform) {
        case 'Facebook Post':
            return 'Nội dung bài đăng Facebook';
        case 'Comment':
            return 'Nội dung Bình luận';
        case 'Thread (Ngắn)':
        default:
            return 'Chuỗi bài đăng (Thread)';
    }
};

const TemplateCard: React.FC<{ template: Template, productName: string, platform: PlatformOption | null }> = ({ template, productName, platform }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 space-y-6">
            
            {template.isImageLoading && (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-64 w-full rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">Đang vẽ bức tranh hoàn hảo...</p>
                </div>
            )}
            {template.imageUrl && !template.isImageLoading && (
                <div className="mb-4">
                     <img src={template.imageUrl} alt={`Hình ảnh minh họa cho ${productName}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
            )}

            <div>
                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tiêu đề</h3>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{template.title}</p>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{getPlatformTitle(platform)}</h3>
                <div className="space-y-4">
                    {template.thread.map((post, index) => (
                        <div key={index} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md relative group">
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                                {template.thread.length > 1 && <span className="font-bold text-slate-500 dark:text-slate-400 mr-2">{index + 1}.</span>}
                                {post}
                            </p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton textToCopy={post} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                        {template.hashtags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 text-sm rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gợi ý đăng bài</h3>
                     <p className="text-slate-600 dark:text-slate-300">
                        <i className="fa-regular fa-clock mr-2"></i>
                        {template.scheduling_suggestion}
                    </p>
                </div>
            </div>

            <div>
                 <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gợi ý CTA</h3>
                 <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                    {template.cta_options.map((cta, i) => <li key={i}>{cta}</li>)}
                 </ul>
            </div>
        </div>
    );
};

const ProductResult: React.FC<{ result: BatchResult, platform: PlatformOption | null }> = ({ result, platform }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="w-full">
            <div className="mb-4 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {result.content.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`${
                                activeTab === index
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {template.template_used || `Phương án ${index + 1}`}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                {result.content.map((template, index) => (
                    <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                        <TemplateCard template={template} productName={result.product.name} platform={platform}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

const OutputDisplay: React.FC<{ content: BatchResult[] | null, platform: PlatformOption | null }> = ({ content, platform }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    if (!content || content.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md h-full">
                <span className="text-5xl mb-4">✨</span>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Nội dung của bạn sẽ xuất hiện ở đây</h2>
                <p className="text-slate-500 dark:text-slate-400">Thêm sản phẩm và bắt đầu sáng tạo ngay!</p>
            </div>
        );
    }
    
    const handleDownload = (filename: string, data: string, type: string) => {
        const blob = new Blob([data], { type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportJSON = () => {
        const jsonData = JSON.stringify(content, null, 2);
        handleDownload('viral_content.json', jsonData, 'application/json');
    };

    const convertToCSV = () => {
        const header = ['product_name', 'product_link', 'template_used', 'title', 'post_number', 'post_content', 'hashtags', 'cta_options', 'scheduling_suggestion', 'disclosure', 'image_url', 'image_prompt'];
        const rows = content.flatMap(result =>
            result.content.flatMap(template =>
                template.thread.map((post, index) => [
                    `"${result.product.name.replace(/"/g, '""')}"`,
                    `"${result.product.link}"`,
                    `"${template.template_used.replace(/"/g, '""')}"`,
                    `"${template.title.replace(/"/g, '""')}"`,
                    index + 1,
                    `"${post.replace(/"/g, '""')}"`,
                    `"${template.hashtags.join(', ')}"`,
                    `"${template.cta_options.join('; ')}"`,
                    `"${template.scheduling_suggestion}"`,
                    `"${template.disclosure}"`,
                    `"${template.imageUrl || ''}"`,
                    `"${(template.imagePrompt || '').replace(/"/g, '""')}"`
                ].join(','))
            )
        );
        return [header.join(','), ...rows].join('\n');
    };

    const exportCSV = () => {
        const csvData = convertToCSV();
        handleDownload('viral_content.csv', csvData, 'text/csv;charset=utf-8;');
    };

    return (
        <div className="w-full space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h2 className="text-lg font-bold">Kết quả Sáng tạo</h2>
                <div className="flex space-x-2">
                    <button onClick={exportJSON} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
                        <i className="fa-solid fa-file-code mr-1"></i> Xuất JSON
                    </button>
                    <button onClick={exportCSV} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition">
                        <i className="fa-solid fa-file-csv mr-1"></i> Xuất CSV
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {content.map((result) => (
                    <div key={result.product.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setOpenAccordion(openAccordion === result.product.id ? null : result.product.id)}
                            className="w-full flex justify-between items-center p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                        >
                            <span className="font-semibold text-left text-blue-700 dark:text-blue-400">{result.product.name}</span>
                            <i className={`fa-solid fa-chevron-down transition-transform ${openAccordion === result.product.id ? 'rotate-180' : ''}`}></i>
                        </button>
                        {openAccordion === result.product.id && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 animate-fade-in">
                                <ProductResult result={result} platform={platform} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OutputDisplay;