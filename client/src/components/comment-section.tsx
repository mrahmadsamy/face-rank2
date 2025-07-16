import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Comment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, MessageCircle, KeyRound, EyeOff, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  personId: number;
}

export default function CommentSection({ personId }: CommentSectionProps) {
  const [newCommentText, setNewCommentText] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/people', personId, 'comments', sortBy],
    queryFn: () => api.getComments(personId, sortBy),
  });

  const createCommentMutation = useMutation({
    mutationFn: (text: string) => api.createComment({ personId, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people', personId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      setNewCommentText("");
      toast({
        title: "تم إضافة تعليقك! 💬",
        description: "شكراً لمشاركتك الرأي الساخر"
      });
    },
    onError: () => {
      toast({
        title: "فشل في إضافة التعليق",
        description: "تأكد من كتابة تعليق مناسب",
        variant: "destructive"
      });
    }
  });

  const voteMutation = useMutation({
    mutationFn: ({ commentId, voteType }: { commentId: number; voteType: 'up' | 'down' }) => 
      api.voteOnComment(commentId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people', personId, 'comments'] });
      toast({
        title: "تم تسجيل تصويتك! 👍",
        description: "شكراً للمساعدة في ترتيب التعليقات"
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في التصويت",
        description: error.message || "ربما صوتت على هذا التعليق من قبل",
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    createCommentMutation.mutate(newCommentText);
  };

  const handleVote = (commentId: number, voteType: 'up' | 'down') => {
    voteMutation.mutate({ commentId, voteType });
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "منذ دقائق";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="neon-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-xl text-[#FF0080]">
          <MessageCircle className="inline mr-2" size={20} />
          التعليقات الساخرة ({comments.length})
        </h4>
        
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => setSortBy("score")}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              sortBy === "score" 
                ? "bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/50" 
                : "bg-transparent text-gray-400 border-gray-600 hover:border-[#FF0080]"
            }`}
          >
            الأعلى تقييماً
          </button>
          <button
            onClick={() => setSortBy("newest")}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              sortBy === "newest" 
                ? "bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/50" 
                : "bg-transparent text-gray-400 border-gray-600 hover:border-[#39FF14]"
            }`}
          >
            الأحدث
          </button>
        </div>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
        <Textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="اكتب تعليقك الساخر هنا... 😈"
          className="w-full bg-[#333333] border border-[#00D9FF]/30 rounded-lg text-white placeholder-gray-400 focus:border-[#00D9FF] focus:outline-none mb-3"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">💡 نصيحة: كن ساخراً لكن بأدب</span>
          <Button
            type="submit"
            disabled={!newCommentText.trim() || createCommentMutation.isPending}
            className="bg-[#00D9FF]/20 text-[#00D9FF] hover:bg-[#00D9FF]/40 border border-[#00D9FF]/50"
          >
            <Send className="mr-1" size={16} />
            {createCommentMutation.isPending ? "جاري الإرسال..." : "إرسال"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">
            جاري تحميل التعليقات...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            لا توجد تعليقات حتى الآن. كن أول من يعلق! 🥇
          </div>
        ) : (
          comments.map((comment: Comment & { isBuried?: boolean }) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onVote={handleVote}
              isVoting={voteMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment & { isBuried?: boolean };
  onVote: (commentId: number, voteType: 'up' | 'down') => void;
  isVoting: boolean;
}

function CommentItem({ comment, onVote, isVoting }: CommentItemProps) {
  const [showBuried, setShowBuried] = useState(false);

  const getBorderColor = () => {
    if (comment.score && comment.score > 10) return "border-r-4 border-[#39FF14]";
    if (comment.score && comment.score > 5) return "border-r-4 border-[#00D9FF]";
    if (comment.score && comment.score > 0) return "border-r-4 border-[#FF0080]";
    return "border-r-4 border-red-500";
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "منذ دقائق";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  if (comment.isBuried && !showBuried) {
    return (
      <div className="bg-red-900/20 rounded-lg p-4 border-r-4 border-red-500 opacity-60">
        <div className="flex items-center space-x-2 space-x-reverse">
          <EyeOff className="text-red-400" size={16} />
          <span className="text-sm text-red-400">تم دفن هذا التعليق بسبب التقييم السلبي</span>
          <button 
            className="text-xs text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowBuried(true)}
          >
            إظهار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1a1a1a] rounded-lg p-4 ${getBorderColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-8 h-8 bg-[#00D9FF]/20 rounded-full flex items-center justify-center">
            <KeyRound className="text-[#00D9FF]" size={14} />
          </div>
          <span className="font-bold text-sm">مستخدم مجهول</span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(comment.createdAt || new Date())}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <button 
            onClick={() => onVote(comment.id, 'up')}
            disabled={isVoting}
            className="text-[#39FF14] hover:text-[#39FF14]/80 transition-colors disabled:opacity-50"
          >
            <ChevronUp size={16} />
          </button>
          <span className={`text-sm font-bold ${
            (comment.score || 0) > 0 ? 'text-[#39FF14]' : 
            (comment.score || 0) < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {comment.score && comment.score > 0 ? '+' : ''}{comment.score || 0}
          </span>
          <button 
            onClick={() => onVote(comment.id, 'down')}
            disabled={isVoting}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
      <p className="text-gray-300">{comment.text}</p>
    </div>
  );
}
