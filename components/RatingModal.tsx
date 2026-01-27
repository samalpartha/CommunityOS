import React, { useState } from 'react';
import { Star, ThumbsUp, Shield, MessageSquare, X } from 'lucide-react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, tags: string[], comments: string) => void;
    type: 'HOST' | 'VOLUNTEER'; // Who is being rated?
    targetName: string;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, type, targetName }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comments, setComments] = useState('');

    if (!isOpen) return null;

    const tags = type === 'HOST'
        ? ['Safe Environment', 'Clear Instructions', 'Responsive', 'Accurate Description']
        : ['Hard Worker', 'Punctual', 'Skilled', 'Positive Attitude'];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleSubmit = () => {
        onSubmit(rating, selectedTags, comments);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                            <Star className="w-5 h-5 fill-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Rate {type === 'HOST' ? 'Host' : 'Volunteer'}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Help build trust in the community</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            How was your experience with <span className="font-bold text-slate-900 dark:text-white">{targetName}</span>?
                        </p>
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'fill-slate-100 text-slate-300 dark:fill-slate-700 dark:text-slate-600'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="h-4 text-xs font-bold text-amber-500 uppercase tracking-widest">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || rating]}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">What went well?</p>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTags.includes(tag)
                                            ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50 dark:text-indigo-300'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Additional Comments
                        </label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Share more details about your experience..."
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24 dark:text-white dark:placeholder-slate-400"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Submit Review <ThumbsUp className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RatingModal;
