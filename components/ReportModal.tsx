import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { DocumentTextIcon, ClipboardIcon } from './icons';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string | null;
  isLoading: boolean;
  error: string | null;
}

const parseMarkdownReport = (markdown: string) => {
    const sections = markdown.split(/###\s(.+)/).filter(Boolean);
    const parsedSections: { title: string; content: React.ReactNode }[] = [];

    for (let i = 0; i < sections.length; i += 2) {
        const title = sections[i].trim();
        const content = sections[i + 1].trim();
        
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.includes('|'));
        const headers = lines[0]?.split('|').map(h => h.trim()).filter(Boolean) || [];
        const rows = lines.slice(2).map(row => row.split('|').map(cell => cell.trim()).filter(Boolean));

        const tableNode = (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        parsedSections.push({ title, content: tableNode });
    }

    return parsedSections;
};


const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportContent, isLoading, error }) => {
  const { t } = useLanguage();
  const [copyButtonText, setCopyButtonText] = useState(t('copy_report'));

  const parsedReport = useMemo(() => {
    if (!reportContent) return [];
    return parseMarkdownReport(reportContent);
  }, [reportContent]);
  
  if (!isOpen) return null;
  
  const handleCopy = () => {
      if (reportContent) {
          navigator.clipboard.writeText(reportContent);
          setCopyButtonText(t('copied'));
          setTimeout(() => setCopyButtonText(t('copy_report')), 2000);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl w-full transform transition-all animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-600/20 rounded-full">
                       <DocumentTextIcon className="w-6 h-6 text-teal-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t('architectural_report_title')}</h2>
                </div>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 -mr-2 space-y-6">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <svg className="animate-spin h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{t('generating_architectural_report')}</p>
                    </div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="font-bold mb-2">{t('report_generation_failed')}</h4>
                      <p className="text-sm">{error}</p>
                    </div>
                )}
                {!isLoading && !error && parsedReport.map((section, index) => (
                    <div key={index}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{section.title}</h3>
                        {section.content}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="px-6 py-2 text-md font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    {t('close')}
                </button>
                <button
                    onClick={handleCopy}
                    disabled={!reportContent || isLoading}
                    className="px-6 py-2 text-md font-bold text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition-colors disabled:bg-teal-600/50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <ClipboardIcon className="w-5 h-5" />
                    <span>{copyButtonText}</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default ReportModal;
