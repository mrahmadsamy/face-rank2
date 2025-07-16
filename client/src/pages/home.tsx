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

  const getSortButtonClass = (value: string) => 
    `px-3 py-1 rounded text-sm border transition-colors ${
      sortBy === value
        ? "bg-[#00D9FF]/20 text-[#00D9FF] border-[#00D9FF]/50"
        : "bg-transparent text-gray-400 border-gray-600 hover:border-[#FF0080]"
    }`;

  return (
    <div className="pt-20 pb-12">
      {/* Hero Section */}
      <section className="pb-12 text-center">
        <div className="container mx-auto px-4">
          <div className="animate-float">
            <h1 className="font-black text-responsive-lg md:text-7xl mb-6" dir="rtl">
              <span className="text-[#00D9FF]">تقيّمني؟!</span><br />
              <span className="text-[#FF0080] animate-pulse-neon">استنى بس... دورك جيه!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed" dir="rtl">
              🎯 المنصة الوحيدة اللي تقدر تقيم فيها أي حد وتشوف رأي الناس فيه!
              <br />من الخنزير 🐷 للإمبراطور 👑
            </p>
            
            {/* Statistics Counter */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="neon-border rounded-xl p-6 text-center hover-glow">
                  <div className="text-3xl font-bold text-[#00D9FF]">{stats.totalPeople.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">أشخاص متقيمين</div>
                </div>
                <div className="neon-border rounded-xl p-6 text-center hover-glow">
                  <div className="text-3xl font-bold text-[#FF0080]">{stats.totalRatings.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">تقييم حار</div>
                </div>
                <div className="neon-border rounded-xl p-6 text-center hover-glow">
                  <div className="text-3xl font-bold text-[#39FF14]">{stats.totalComments.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">تعليق ساخر</div>
                </div>
                <div className="neon-border rounded-xl p-6 text-center hover-glow">
                  <div className="text-3xl font-bold text-yellow-400">{stats.onlineUsers}</div>
                  <div className="text-sm text-gray-400">متصل حالياً</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {/* Filter and Search Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between" dir="rtl">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث عن شخص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1a1a1a] border-2 border-[#00D9FF]/30 rounded-lg px-4 py-2 pl-10 focus:border-[#00D9FF] focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 transition-all duration-300 text-white"
              />
              <Search className="absolute left-3 top-3 text-[#00D9FF]/70" size={16} />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#1a1a1a] border-2 border-[#FF0080]/30 rounded-lg focus:border-[#FF0080] focus:outline-none text-white">
                <SelectValue placeholder="كل الفئات" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#FF0080]/30 text-white">
                <SelectItem value="all">كل الفئات</SelectItem>
                <SelectItem value="teacher">👨‍🏫 أساتذة</SelectItem>
                <SelectItem value="student">🎓 طلاب</SelectItem>
                <SelectItem value="employee">💼 موظفين</SelectItem>
                <SelectItem value="celebrity">⭐ مشاهير</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-gray-400">ترتيب حسب:</span>
            <button 
              onClick={() => setSortBy("averageRating")}
              className={getSortButtonClass("averageRating")}
            >
              الأعلى تقييماً
            </button>
            <button 
              onClick={() => setSortBy("newest")}
              className={getSortButtonClass("newest")}
            >
              الأحدث
            </button>
            <button 
              onClick={() => setSortBy("mostComments")}
              className={getSortButtonClass("mostComments")}
            >
              الأكثر تفاعلاً
            </button>
          </div>
        </div>

        {/* People Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-[#00D9FF] animate-pulse-neon">جاري التحميل... 🔄</div>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-400 mb-4">لا توجد نتائج</div>
            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو غير الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
