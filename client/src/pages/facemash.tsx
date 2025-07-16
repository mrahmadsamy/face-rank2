import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Person } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { RefreshCw, Flame, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/star-rating";

export default function FaceMash() {
  const [currentComparison, setCurrentComparison] = useState<{ person1: Person; person2: Person } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comparison, isLoading, refetch } = useQuery({
    queryKey: ['/api/facemash/comparison'],
    queryFn: api.getFaceMashComparison,
    onSuccess: (data) => {
      setCurrentComparison(data);
    },
  });

  const compareMutation = useMutation({
    mutationFn: ({ winnerId, loserId }: { winnerId: number; loserId: number }) =>
      api.submitFaceMashChoice(winnerId, loserId),
    onSuccess: () => {
      toast({
        title: "تم تسجيل اختيارك! 🔥",
        description: "مقارنة جديدة قادمة..."
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "فشل في تسجيل الاختيار",
        description: "حاول مرة أخرى",
        variant: "destructive"
      });
    }
  });

  const handleChoice = (winnerId: number, loserId: number) => {
    compareMutation.mutate({ winnerId, loserId });
  };

  const handleSkip = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-[#FF0080] animate-pulse-neon mb-4">
            <Flame className="inline mr-4" size={48} />
            FaceMash Mode
          </div>
          <p className="text-xl text-gray-300">جاري تحضير المقارنة... 🔄</p>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-red-400 mb-4">😞</div>
          <p className="text-xl text-gray-300 mb-4">لا توجد أشخاص كافية للمقارنة</p>
          <p className="text-gray-400">تحتاج على الأقل شخصين لبدء المقارنات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-black text-4xl md:text-6xl font-bold mb-8 text-[#FF0080] animate-pulse-neon" dir="rtl">
          <Flame className="inline mr-4" size={48} />
          FaceMash Mode
        </h2>
        <p className="text-xl mb-8 text-gray-300" dir="rtl">
          مين فيهم أروش؟ اختار بسرعة! 🔥
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Person 1 */}
          <div className="neon-border rounded-xl overflow-hidden hover-glow cursor-pointer transition-all duration-300 group">
            <div 
              onClick={() => handleChoice(comparison.person1.id, comparison.person2.id)}
              className="cursor-pointer"
            >
              <img 
                src={comparison.person1.imageUrl} 
                alt={comparison.person1.name}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comparison.person1.name)}&background=1a1a1a&color=00d9ff&size=400`;
                }}
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{comparison.person1.name}</h3>
                <div className="flex justify-center space-x-1 space-x-reverse mb-4">
                  <StarRating rating={comparison.person1.averageRating || 0} readonly size={20} />
                  <span className="text-sm font-bold mr-2">
                    {(comparison.person1.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <Button 
                  onClick={() => handleChoice(comparison.person1.id, comparison.person2.id)}
                  disabled={compareMutation.isPending}
                  className="w-full py-3 bg-[#00D9FF]/20 text-[#00D9FF] rounded-lg font-bold hover:bg-[#00D9FF]/40 transition-all duration-300 border border-[#00D9FF]/50"
                >
                  اختار هذا الوش 👈
                </Button>
              </div>
            </div>
          </div>

          {/* VS Divider - Only on larger screens */}
          <div className="hidden md:flex items-center justify-center col-span-2 md:col-span-1 order-first md:order-none">
            <div className="text-6xl animate-pulse text-[#FF0080] font-bold">VS</div>
          </div>

          {/* Mobile VS Divider */}
          <div className="md:hidden flex items-center justify-center my-4">
            <div className="text-4xl animate-pulse text-[#FF0080] font-bold">VS</div>
          </div>

          {/* Person 2 */}
          <div className="neon-border rounded-xl overflow-hidden hover-glow cursor-pointer transition-all duration-300 group">
            <div 
              onClick={() => handleChoice(comparison.person2.id, comparison.person1.id)}
              className="cursor-pointer"
            >
              <img 
                src={comparison.person2.imageUrl} 
                alt={comparison.person2.name}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comparison.person2.name)}&background=1a1a1a&color=00d9ff&size=400`;
                }}
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{comparison.person2.name}</h3>
                <div className="flex justify-center space-x-1 space-x-reverse mb-4">
                  <StarRating rating={comparison.person2.averageRating || 0} readonly size={20} />
                  <span className="text-sm font-bold mr-2">
                    {(comparison.person2.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <Button 
                  onClick={() => handleChoice(comparison.person2.id, comparison.person1.id)}
                  disabled={compareMutation.isPending}
                  className="w-full py-3 bg-[#FF0080]/20 text-[#FF0080] rounded-lg font-bold hover:bg-[#FF0080]/40 transition-all duration-300 border border-[#FF0080]/50"
                >
                  اختار هذا الوش 👈
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4 space-x-reverse">
          <Button 
            variant="outline"
            onClick={handleSkip}
            disabled={compareMutation.isPending}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors border-gray-600"
          >
            <SkipForward className="mr-2" size={16} />
            تخطي هذه المقارنة
          </Button>
          <Button 
            onClick={() => refetch()}
            disabled={compareMutation.isPending}
            className="px-6 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-lg border border-[#39FF14]/50 hover:bg-[#39FF14]/40 transition-all duration-300"
          >
            <RefreshCw className="mr-2" size={16} />
            مقارنة جديدة
          </Button>
        </div>

        {compareMutation.isPending && (
          <div className="mt-4 text-[#39FF14] animate-pulse">
            جاري حفظ اختيارك... ⏳
          </div>
        )}
      </div>
    </div>
  );
}
