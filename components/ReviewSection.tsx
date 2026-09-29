'use client';

import React, { useState } from 'react';
import { Review } from '@/lib/types';
import { Star, MessageSquare, Send, CheckCircle, UserCheck } from 'lucide-react';

interface ReviewSectionProps {
  destinationId: string;
  initialReviews?: Review[];
}

export default function ReviewSection({ destinationId, initialReviews = [] }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId,
          rating,
          comment,
          userName: userName.trim() || 'Du khách phương xa',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setComment('');
        setSuccessMsg('Đánh giá của bạn đã được ghi nhận vào nhật ký di sản!');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D7] p-6 sm:p-8 shadow-heritage space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E7E2D7] pb-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#2D5A43]" />
            <span>Cảm Nhận Du Khách & Đánh Giá</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Ghi lại những khoảnh khắc xúc cảm sau khi ghé thăm di tích
          </p>
        </div>
        <span className="text-sm font-semibold text-[#2D5A43] bg-[#2D5A43]/10 px-3 py-1 rounded-full">
          {reviews.length} Phản hồi
        </span>
      </div>

      {/* Form gửi đánh giá */}
      <form onSubmit={handleSubmit} className="bg-[#FBF9F5] rounded-xl p-5 border border-[#E7E2D7] space-y-4">
        <h4 className="text-sm font-bold text-[#1C1917]">Gửi Cảm Nhận Của Bạn</h4>

        {/* Rating Stars */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600 font-medium">Mức độ hài lòng:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-5 h-5 ${
                    (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-stone-700 ml-1">
            {rating === 5 ? 'Tuyệt vời (5/5)' : `${rating}/5`}
          </span>
        </div>

        {/* Input Tên */}
        <div>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Họ và tên của bạn (hoặc để trống để làm Du khách phương xa)"
            className="w-full text-xs p-3 rounded-lg border border-[#E7E2D7] bg-white text-[#1C1917] focus:outline-none focus:border-[#2D5A43]"
          />
        </div>

        {/* Textarea Cảm nhận */}
        <div>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về cảnh sắc, âm thanh cồng chiêng, món ăn bản địa hoặc cảm giác khi đến đây..."
            className="w-full text-xs p-3 rounded-lg border border-[#E7E2D7] bg-white text-[#1C1917] focus:outline-none focus:border-[#2D5A43]"
          />
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#234634] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Đang gửi...' : 'Gửi Đánh Giá Di Sản'}</span>
          </button>
        </div>
      </form>

      {/* Danh sách các review đã có */}
      <div className="space-y-4 pt-2">
        {reviews.length === 0 ? (
          <p className="text-xs text-stone-500 italic text-center py-4">
            Chưa có cảm nhận nào. Hãy là người đầu tiên để lại dấu ấn tại đây!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl border border-[#E7E2D7] bg-[#FBF9F5] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#2D5A43]/15 text-[#2D5A43] flex items-center justify-center font-bold text-xs">
                    {rev.userName ? rev.userName[0].toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1C1917]">
                      {rev.userName || 'Du khách phương xa'}
                    </h5>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-normal pl-9">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
