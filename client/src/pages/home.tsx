import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Person } from "@shared/schema";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PersonCard from "@/components/person-card";
import PersonDetailModal from "@/components/person-detail-modal";

export default function Home() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("averageRating");

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['/api/people', category === "all" ? "" : category, sortBy],
    queryFn: () => api.getPeople(category === "all" ? "" : category, sortBy),
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: api.getStats,
  });

  const filteredPeople = people.filter((person: Person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.description.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="pt-20 pb-12">
      {/* Hero Section */}
      <section className="pb-8 md:pb-12 text-center">
        <div className="container mx-auto px-4">
          <div className="animate-float">
            <h1 className="font-black text-4xl md:text-7xl mb-6 font-mono" dir="rtl">
              <span className="gradient-cyber block">{">> SYSTEM LOADED"}</span>
              <span className="text-cyan-400 text-2xl md:text-4xl mt-2 block">نظام تقييم الأهداف</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-mono" dir="rtl">
              {">> منصة تقييم متطورة لتحليل الشخصيات"}
              <br />
              <span className="text-purple-400">{"من [FAIL] إلى [SUCCESS]"}</span>
            </p>
            
            {/* Statistics Counter */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-8 md:mt-12 max-w-4xl mx-auto">
                <div className="cyber-card rounded-lg p-3 md:p-6 text-center hover-cyber">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono">{stats.totalPeople.toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-gray-400 font-mono">[TARGETS]</div>
                </div>
                <div className="cyber-card rounded-lg p-3 md:p-6 text-center hover-cyber">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400 font-mono">{stats.totalRatings.toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-gray-400 font-mono">[RATINGS]</div>
                </div>
                <div className="cyber-card rounded-lg p-3 md:p-6 text-center hover-cyber">
                  <div className="text-2xl md:text-3xl font-bold text-green-400 font-mono">{stats.totalComments.toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-gray-400 font-mono">[COMMENTS]</div>
                </div>
                <div className="cyber-card rounded-lg p-3 md:p-6 text-center hover-cyber">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 font-mono">{stats.onlineUsers}</div>
                  <div className="text-xs md:text-sm text-gray-400 font-mono">[ONLINE]</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder=">> ابحث عن هدف..."
                className="pl-10 bg-gray-900/50 border-purple-500/30 focus:border-cyan-400 text-white font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
              <Filter className="text-purple-400" size={18} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-40 bg-gray-900/50 border-purple-500/30 focus:border-cyan-400 text-white font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="cyber-card border-purple-500/50 text-white font-mono">
                  <SelectItem value="all">[ALL] كل الفئات</SelectItem>
                  <SelectItem value="teacher">[EDU] أساتذة</SelectItem>
                  <SelectItem value="student">[STD] طلاب</SelectItem>
                  <SelectItem value="employee">[EMP] موظفين</SelectItem>
                  <SelectItem value="celebrity">[VIP] مشاهير</SelectItem>
                  <SelectItem value="other">[???] أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8 justify-center">
            <span className="text-cyan-400 font-bold font-mono text-sm md:text-base">[SORT]:</span>
            <button
              onClick={() => setSortBy("averageRating")}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm border transition-colors font-mono ${
                sortBy === "averageRating"
                  ? "bg-cyan-400/20 text-cyan-400 border-cyan-400/50 cyber-glow"
                  : "bg-transparent text-gray-400 border-gray-600 hover:border-purple-400"
              }`}
            >
              [★] أعلى
            </button>
            <button
              onClick={() => setSortBy("totalRatings")}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm border transition-colors font-mono ${
                sortBy === "totalRatings"
                  ? "bg-purple-400/20 text-purple-400 border-purple-400/50 cyber-glow"
                  : "bg-transparent text-gray-400 border-gray-600 hover:border-purple-400"
              }`}
            >
              [🔥] أكثر
            </button>
            <button
              onClick={() => setSortBy("totalComments")}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm border transition-colors font-mono ${
                sortBy === "totalComments"
                  ? "bg-green-400/20 text-green-400 border-green-400/50 cyber-glow"
                  : "bg-transparent text-gray-400 border-gray-600 hover:border-purple-400"
              }`}
            >
              [💬] تفاعل
            </button>
            <button
              onClick={() => setSortBy("totalViews")}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm border transition-colors font-mono ${
                sortBy === "totalViews"
                  ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/50 cyber-glow"
                  : "bg-transparent text-gray-400 border-gray-600 hover:border-purple-400"
              }`}
            >
              [👁] مشاهدة
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4">

        {/* People Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-xl md:text-2xl text-cyan-400 animate-pulse font-mono">
              {"[...] جاري تحميل الأهداف"}
            </div>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl md:text-2xl text-red-400 mb-4 font-mono">[404] لا توجد أهداف</div>
            <p className="text-gray-400 font-mono">{">> جرب البحث بكلمات مختلفة أو غير الفئة"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredPeople.map((person: Person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => setSelectedPerson(person)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}
