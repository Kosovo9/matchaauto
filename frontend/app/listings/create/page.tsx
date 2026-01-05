'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Image as ImageIcon,
    DollarSign,
    Tag,
    MapPin,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';

const CATEGORIES = [
    'electronics',
    'fashion',
    'home',
    'vehicles',
    'real-estate',
    'services',
    'digital',
    'collectibles',
];

const CONDITIONS = [
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
];

const CURRENCIES = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'SOL', label: 'SOL' },
];

interface UploadedFile {
    file: File;
    preview: string;
    uploadProgress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export default function CreateListingPage() {
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [moderationStatus, setModerationStatus] = useState<'pending' | 'processing' | 'approved' | 'rejected'>('pending');
    const [toxicityScore, setToxicityScore] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        category: '',
        condition: 'good',
        location: {
            city: '',
            country: '',
        },
        contactInfo: {
            email: user?.emailAddresses[0]?.emailAddress || '',
            phone: '',
            telegram: '',
        },
    });

    // Image upload state
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.slice(0, 10 - uploadedFiles.length).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            uploadProgress: 0,
            status: 'pending' as const,
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
    }, [uploadedFiles.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
    });

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (files: UploadedFile[]): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const fileData of files) {
            try {
                setUploadedFiles(prev => prev.map(f =>
                    f.file === fileData.file ? { ...f, status: 'uploading' } : f
                ));

                // Create form data
                const formData = new FormData();
                formData.append('file', fileData.file);
                formData.append('userId', user?.id || '');
                formData.append('fileName', fileData.file.name);
                formData.append('fileType', fileData.file.type);

                // Upload to our API endpoint that will handle R2 upload
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Trace-ID': `upload_${Date.now()}_${user?.id}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                uploadedUrls.push(data.url);

                setUploadedFiles(prev => prev.map(f =>
                    f.file === fileData.file ? { ...f, status: 'success', uploadProgress: 100 } : f
                ));

                // Simulate progress updates
                for (let progress = 10; progress <= 90; progress += 20) {
                    setTimeout(() => {
                        setUploadedFiles(prev => prev.map(f =>
                            f.file === fileData.file ? { ...f, uploadProgress: progress } : f
                        ));
                    }, progress * 10);
                }
            } catch (error) {
                console.error('Upload error:', error);
                setUploadedFiles(prev => prev.map(f =>
                    f.file === fileData.file ? {
                        ...f,
                        status: 'error',
                        error: 'Upload failed'
                    } : f
                ));
            }
        }

        return uploadedUrls;
    };

    const moderateContent = async (content: string): Promise<boolean> => {
        try {
            setModerationStatus('processing');

            const response = await fetch('/api/moderate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Trace-ID': `moderate_${Date.now()}_${user?.id}`,
                },
                body: JSON.stringify({ text: content }),
            });

            if (!response.ok) {
                throw new Error('Moderation failed');
            }

            const data = await response.json();
            setToxicityScore(data.toxicityScore);

            if (data.toxicityScore > 0.8) {
                setModerationStatus('rejected');
                toast({
                    title: 'Content Rejected',
                    description: 'Your content was flagged by our AI moderation system.',
                    variant: 'destructive',
                });
                return false;
            }

            setModerationStatus('approved');
            return true;
        } catch (error) {
            console.error('Moderation error:', error);
            setModerationStatus('pending');
            toast({
                title: 'Moderation Error',
                description: 'Could not verify content safety. Please try again.',
                variant: 'destructive',
            });
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Upload images
            const imageUrls = await uploadImages(uploadedFiles);

            if (imageUrls.length === 0 && uploadedFiles.length > 0) {
                throw new Error('Failed to upload images');
            }

            // Step 2: Moderate content
            const isContentSafe = await moderateContent(formData.description);
            if (!isContentSafe) {
                setLoading(false);
                return;
            }

            // Step 3: Create listing
            const listingData = {
                ...formData,
                price: parseFloat(formData.price),
                images: imageUrls,
                traceId: `listing_${Date.now()}_${user?.id}`,
            };

            const response = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Trace-ID': listingData.traceId,
                },
                body: JSON.stringify(listingData),
            });

            if (!response.ok) {
                throw new Error('Failed to create listing');
            }

            const data = await response.json();

            toast({
                title: 'Listing Created!',
                description: 'Your listing is now live on the marketplace.',
                duration: 5000,
            });

            // Redirect to listing page
            router.push(`/listings/${data.data.id}`);
        } catch (error) {
            console.error('Error creating listing:', error);
            toast({
                title: 'Error',
                description: 'Failed to create listing. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNestedChange = (parent: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent as keyof typeof prev],
                [field]: value,
            },
        }));
    };

    const steps = [
        { number: 1, title: 'Basic Info', icon: <Tag className="h-5 w-5" /> },
        { number: 2, title: 'Details', icon: <DollarSign className="h-5 w-5" /> },
        { number: 3, title: 'Images', icon: <ImageIcon className="h-5 w-5" /> },
        { number: 4, title: 'Location', icon: <MapPin className="h-5 w-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Create New Listing
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sell your items fast with our edge-optimized marketplace
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 transition-all duration-300"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                        />
                        {steps.map((stepItem) => (
                            <div key={stepItem.number} className="relative z-10">
                                <button
                                    onClick={() => setStep(stepItem.number)}
                                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${step >= stepItem.number
                                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-transparent text-white'
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'
                                        }`}
                                >
                                    {step > stepItem.number ? (
                                        <CheckCircle className="h-6 w-6" />
                                    ) : (
                                        stepItem.icon
                                    )}
                                </button>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-sm font-medium">
                                    {stepItem.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && (
                                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Basic Information
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Listing Title *
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                    placeholder="What are you selling?"
                                                    required
                                                    className="w-full"
                                                />
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Be specific and descriptive
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Category *
                                                </label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => handleInputChange('category', value)}
                                                    required
                                                >
                                                    <option value="">Select a category</option>
                                                    {CATEGORIES.map((category) => (
                                                        <option key={category} value={category}>
                                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Description *
                                                </label>
                                                <Textarea
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    placeholder="Describe your item in detail..."
                                                    rows={6}
                                                    required
                                                    className="w-full"
                                                />
                                                <div className="mt-2 flex items-center justify-between">
                                                    <p className="text-sm text-gray-500">
                                                        {formData.description.length}/5000 characters
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {moderationStatus === 'approved' && (
                                                            <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                                                <CheckCircle className="h-4 w-4" />
                                                                Content Approved
                                                            </span>
                                                        )}
                                                        {moderationStatus === 'rejected' && (
                                                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                                                                <AlertCircle className="h-4 w-4" />
                                                                Content Rejected
                                                            </span>
                                                        )}
                                                        {toxicityScore !== null && (
                                                            <span className={`text-sm ${toxicityScore > 0.5 ? 'text-amber-600' : 'text-green-600'}`}>
                                                                Toxicity: {(toxicityScore * 100).toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {step === 2 && (
                                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Pricing & Condition
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Price *
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="number"
                                                            value={formData.price}
                                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                                            placeholder="0.00"
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                            className="flex-1"
                                                        />
                                                        <Select
                                                            value={formData.currency}
                                                            onValueChange={(value) => handleInputChange('currency', value)}
                                                            className="w-32"
                                                        >
                                                            {CURRENCIES.map((currency) => (
                                                                <option key={currency.value} value={currency.value}>
                                                                    {currency.label}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Condition
                                                    </label>
                                                    <Select
                                                        value={formData.condition}
                                                        onValueChange={(value) => handleInputChange('condition', value)}
                                                    >
                                                        {CONDITIONS.map((condition) => (
                                                            <option key={condition.value} value={condition.value}>
                                                                {condition.label}
                                                            </option>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Contact Email
                                                    </label>
                                                    <Input
                                                        type="email"
                                                        value={formData.contactInfo.email}
                                                        onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                                                        placeholder="your@email.com"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Phone Number
                                                    </label>
                                                    <Input
                                                        type="tel"
                                                        value={formData.contactInfo.phone}
                                                        onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                                                        placeholder="+1 (555) 123-4567"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Telegram
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={formData.contactInfo.telegram}
                                                        onChange={(e) => handleNestedChange('contactInfo', 'telegram', e.target.value)}
                                                        placeholder="@username"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {step === 3 && (
                                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Upload Images
                                        </h2>

                                        {/* Dropzone */}
                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                                                }`}
                                        >
                                            <input {...getInputProps()} />
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                                {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                or click to select files
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Up to 10 images, 10MB each. Supported: JPG, PNG, WebP, AVIF
                                            </p>
                                        </div>

                                        {/* Uploaded Images Preview */}
                                        {uploadedFiles.length > 0 && (
                                            <div className="mt-8">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                    Uploaded Images ({uploadedFiles.length}/10)
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                    {uploadedFiles.map((file, index) => (
                                                        <div key={index} className="relative group">
                                                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                                <Image
                                                                    src={file.preview}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                    width={200}
                                                                    height={200}
                                                                />
                                                                {/* Upload Progress */}
                                                                {file.status === 'uploading' && (
                                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                        <div className="text-white text-sm">
                                                                            {file.uploadProgress}%
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Status Badge */}
                                                                {file.status === 'success' && (
                                                                    <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                                                                        <CheckCircle className="h-4 w-4 text-white" />
                                                                    </div>
                                                                )}
                                                                {file.status === 'error' && (
                                                                    <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full">
                                                                        <AlertCircle className="h-4 w-4 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {step === 4 && (
                                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Location Details
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    City *
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.location.city}
                                                    onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                                                    placeholder="Enter city"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Country *
                                                </label>
                                                <Select
                                                    value={formData.location.country}
                                                    onValueChange={(value) => handleNestedChange('location', 'country', value)}
                                                    required
                                                >
                                                    <option value="">Select country</option>
                                                    <option value="US">United States</option>
                                                    <option value="GB">United Kingdom</option>
                                                    <option value="CA">Canada</option>
                                                    <option value="AU">Australia</option>
                                                    <option value="DE">Germany</option>
                                                    <option value="FR">France</option>
                                                    <option value="ES">Spain</option>
                                                    <option value="IT">Italy</option>
                                                    <option value="JP">Japan</option>
                                                    <option value="KR">South Korea</option>
                                                </Select>
                                            </div>

                                            {/* AI Moderation Status */}
                                            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    AI Moderation Status
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">Content Safety</span>
                                                        {moderationStatus === 'approved' ? (
                                                            <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                                                                <CheckCircle className="h-5 w-5" />
                                                                Approved
                                                            </span>
                                                        ) : moderationStatus === 'rejected' ? (
                                                            <span className="inline-flex items-center gap-2 text-red-600 font-semibold">
                                                                <AlertCircle className="h-5 w-5" />
                                                                Requires Revision
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-600 font-semibold">Pending Review</span>
                                                        )}
                                                    </div>

                                                    {toxicityScore !== null && (
                                                        <div>
                                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                                <span>Toxicity Score</span>
                                                                <span>{(toxicityScore * 100).toFixed(1)}%</span>
                                                            </div>
                                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${toxicityScore > 0.8
                                                                            ? 'bg-red-500'
                                                                            : toxicityScore > 0.5
                                                                                ? 'bg-amber-500'
                                                                                : 'bg-green-500'
                                                                        }`}
                                                                    style={{ width: `${toxicityScore * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(prev => Math.max(1, prev - 1))}
                            disabled={step === 1}
                        >
                            Previous
                        </Button>

                        {step < 4 ? (
                            <Button
                                type="button"
                                onClick={() => setStep(prev => Math.min(4, prev + 1))}
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={loading || moderationStatus === 'rejected'}
                                className="gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Listing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Publish Listing
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>

                {/* Security Notice */}
                <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/30 dark:to-blue-900/20 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-4">
                        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Security & Privacy First
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your listing is processed through our edge-native AI moderation system.
                                All images are securely stored on Cloudflare R2 with automatic content scanning.
                                Personal contact information is protected and only shared with verified buyers.
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    Edge-Optimized Uploads
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    AI Content Moderation
                                </span>
                                <span className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                                    Sentinel-X Protected
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
