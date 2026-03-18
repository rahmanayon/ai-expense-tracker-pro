// components/Transactions/OCRUpload.js
'use client';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function OCRUpload({ onDataExtracted }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [preview, setPreview] = useState(null);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxSize: 200 * 1024 * 1024, // 200MB limit
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setPreview(URL.createObjectURL(file));
            setIsProcessing(true);

            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await fetch('/api/ocr/extract', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                onDataExtracted(data); // Send extracted data to parent
            } catch (error) {
                console.error('OCR Error:', error);
            } finally {
                setIsProcessing(false);
            }
        }
    });

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <p className="text-lg mb-2">📸 Scan Invoice</p>
                <p className="text-sm text-gray-600">
                    Drag & drop or <span className="text-blue-600">browse files</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 200MB</p>
            </div>
            {preview && (
                <div className="mt-4">
                    <img src={preview} alt="Receipt preview" className="max-h-48 mx-auto rounded" />
                </div>
            )}
            {isProcessing && (
                <div className="mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm mt-2">Processing...</p>
                </div>
            )}
        </div>
    );
}