import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Person } from "@shared/schema";
import { Trophy, TrendingDown, Crown, Skull } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarRating from "@/components/star-rating";

export default function Rankings() {
  const { data: topPeople = [], isLoading: loadingTop } = useQuery({
    queryKey: ['/api/rankings/top'],
    queryFn: () => api.getTopRankings(20),
  });

  const { data: worstPeople = [], isLoading: loadingWorst } = useQuery({
    queryKey: ['/api/rankings/worst'],
    queryFn: () => api.getWorstRankings(20),
  });

  const { data: faceMashRankings = [], isLoading: loadingFaceMash } = useQuery({
    queryKey: ['/api/people', '', 'faceMash'],
    queryFn: () => api.getPeople('', 'faceMash'),
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getRatingTitle = (rating: number) => {
    if (rating >= 4) return { title: "👑 إمبراطور", color: "text-[#00D9FF]" };
    if (rating >= 3) return { title: "😎 جامد نص نص", color: "text-[#00D9FF]" };
    if (rating >= 2) return { title: "😑 ملوش لازمة", color: "text-gray-400" };
    if (rating >= 1) return { title: "🤡 مهرج", color: "text-red-400" };
    return { title: "🐷 خنزير", color: "text-red-600" };
  };

  const RankingList = ({ 
    people, 
    isLoading, 
    emptyMessage, 
    showFaceMashStats = false 
  }: { 
    people: Person[], 
    isLoading: boolean, 
    emptyMessage: string,
    showFaceMashStats?: boolean 
  }) => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="text-xl text-[#00D9FF] animate-pulse-neon">جاري التحميل... 🔄</div>
        </div>
      );
    }

    if (people.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-xl text-gray-400">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {people.map((person, index) => {
          const ratingInfo = getRatingTitle(person.averageRating || 0);
          return (
            <div 
              key={person.id}
              className="neon-border rounded-lg p-4 hover-glow transition-all duration-300 flex items-center space-x-4 space-x-reverse"
            >
              <div className="text-2xl font-bold text-[#39FF14] w-12 text-center">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00D9FF]/50">
                <img 
                  src={person.imageUrl} 
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1a1a1a&color=00d9ff&size=200`;
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{person.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-1">{person.description}</p>
                <div className={`text-sm ${ratingInfo.color} font-bold`}>
                  {ratingInfo.title}
                </div>
              </div>
              
              <div className="text-right">
                {showFaceMashStats ? (
                  <div className="space-y-1">
                    <div className="text-[#39FF14] font-bold">
                      🏆 {person.faceMashWins || 0} انتصار
                    </div>
                    <div className="text-red-400 text-sm">
                      💔 {person.faceMashLosses || 0} هزيمة
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-end space-x-1 space-x-reverse">
                      <StarRating rating={person.averageRating || 0} readonly size={16} />
                    </div>
                    <div className="text-[#00D9FF] font-bold text-lg">
                      {(person.averageRating || 0).toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      من {person.totalRatings || 0} تقييم
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-black text-4xl md:text-6xl mb-4" dir="rtl">
            <span className="text-[#39FF14]">التصنيفات</span>
            <span className="text-[#FF0080]"> الساخنة</span>
          </h1>
          <p className="text-xl text-gray-300" dir="rtl">
            شوف مين في القمة ومين في القاع! 📊
          </p>
        </div>

        <Tabs defaultValue="top" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#1a1a1a] border border-[#00D9FF]/30">
            <TabsTrigger 
              value="top" 
              className="data-[state=active]:bg-[#39FF14]/20 data-[state=active]:text-[#39FF14] text-gray-400"
            >
              <Crown className="mr-2" size={16} />
              الأساطير
            </TabsTrigger>
            <TabsTrigger 
              value="facemash" 
              className="data-[state=active]:bg-[#FF0080]/20 data-[state=active]:text-[#FF0080] text-gray-400"
            >
              <Trophy className="mr-2" size={16} />
              أبطال FaceMash
            </TabsTrigger>
            <TabsTrigger 
              value="worst" 
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400"
            >
              <Skull className="mr-2" size={16} />
              الفشل المذريع
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#39FF14] mb-2 flex items-center" dir="rtl">
                <Crown className="mr-2" size={24} />
                وش الأسبوع - الأساطير
              </h2>
              <p className="text-gray-400" dir="rtl">
                الناس اللي خلاصة المجتمع وكله بيحبهم 👑
              </p>
            </div>
            <RankingList
              people={topPeople}
              isLoading={loadingTop}
              emptyMessage="لا توجد أساطير حتى الآن! كن أول من يصل للقمة 🚀"
            />
          </TabsContent>

          <TabsContent value="facemash" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#FF0080] mb-2 flex items-center" dir="rtl">
                <Trophy className="mr-2" size={24} />
                أبطال FaceMash - الأقوى وجوهاً
              </h2>
              <p className="text-gray-400" dir="rtl">
                الناس اللي كسبوا أكتر مقارنات في FaceMash Mode 🔥
              </p>
            </div>
            <RankingList
              people={faceMashRankings.slice(0, 20)}
              isLoading={loadingFaceMash}
              emptyMessage="لا توجد مقارنات حتى الآن! ادخل FaceMash Mode وابدأ 💪"
              showFaceMashStats={true}
            />
          </TabsContent>

          <TabsContent value="worst" className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-red-400 mb-2 flex items-center" dir="rtl">
                <Skull className="mr-2" size={24} />
                الفشل المذريع - قاع المجتمع
              </h2>
              <p className="text-gray-400" dir="rtl">
                الناس اللي محدش طايقهم... F في التشات 💀
              </p>
            </div>
            <RankingList
              people={worstPeople}
              isLoading={loadingWorst}
              emptyMessage="مافيش حد وصل للقاع لسه! 🤔"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
