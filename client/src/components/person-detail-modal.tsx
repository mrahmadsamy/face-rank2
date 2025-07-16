import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, ChevronUp, ChevronDown, MessageCircle, Eye, EyeOff } from "lucide-react";
import { Person, Comment } from "@shared/schema";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import StarRating from "./star-rating";
import CommentSection from "./comment-section";

interface PersonDetailModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}

const getRatingTitle = (rating: number) => {
  if (rating >= 4) return { title: "👑 إمبراطور", color: "text-[#00D9FF]" };
  if (rating >= 3) return { title: "😎 جامد نص نص", color: "text-[#00D9FF]" };
  if (rating >= 2) return { title: "😑 ملوش لازمة", color: "text-gray-400" };
  if (rating >= 1) return { title: "🤡 مهرج", color: "text-red-400" };
  return { title: "🐷 خنزير", color: "text-red-600" };
};

export default function PersonDetailModal({ person, isOpen, onClose }: PersonDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ratingMutation = useMutation({
    mutationFn: (rating: number) => api.createRating({ personId: person?.id, rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      queryClient.invalidateQueries({ queryKey: ['/api/people', person?.id] });
      toast({
        title: "تم التقييم بنجاح! ⭐",
        description: "شكراً لك على مشاركة رأيك"
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في التقييم",
        description: error.message || "ربما قمت بتقييم هذا الشخص من قبل",
        variant: "destructive"
      });
    }
  });

  const handleRate = (rating: number) => {
    if (person) {
      ratingMutation.mutate(rating);
    }
  };

  if (!person) return null;

  const ratingInfo = getRatingTitle(person.averageRating || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-lg border border-[#00D9FF]/30 text-white p-0" dir="rtl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#00D9FF]">تفاصيل الشخص</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <div className="neon-border rounded-xl overflow-hidden">
                <img 
                  src={person.imageUrl} 
                  alt={person.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1a1a1a&color=00d9ff&size=400`;
                  }}
                />
                <div className="p-6">
                  <h3 className="font-bold text-2xl mb-2">{person.name}</h3>
                  <p className="text-gray-400 mb-4">{person.description}</p>
                  
                  {/* Rating Section */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-2">
                      <StarRating rating={person.averageRating || 0} readonly size={24} />
                    </div>
                    <div className="text-3xl font-bold text-[#00D9FF] mb-2">
                      {(person.averageRating || 0).toFixed(1)}
                    </div>
                    <div className={`font-bold ${ratingInfo.color}`}>
                      {ratingInfo.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      من {person.totalRatings || 0} تقييم
                    </div>
                  </div>

                  {/* Rate This Person */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-3">قيم هذا الشخص:</p>
                    <div className="flex justify-center mb-4">
                      <StarRating 
                        rating={0} 
                        onRate={handleRate}
                        size={28}
                      />
                    </div>
                    {ratingMutation.isPending && (
                      <p className="text-sm text-[#39FF14]">جاري إرسال التقييم...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="lg:col-span-2">
              <CommentSection personId={person.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
