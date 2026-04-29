import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Utensils, Sparkles, TrendingUp, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

interface Review {
  id: string;
  overall_rating: number;
  taste_rating: number;
  portion_rating: number;
  service_rating: number;
  comment: string;
  student_name: string;
  created_at: string;
  meals: {
    name: string;
    type: string;
  } | null;
}

export default function AdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ bottomLine: string; advice: string[] } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          meals (name, type)
        `)
        .order('created_at', { ascending: false });

        console.log(data)
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  }

  const generateSummary = async () => {
    if (reviews.length === 0) return;
    setIsSummarizing(true);
    try {
      const reviewText = reviews.slice(0, 50).map(r => 
        `[${r.overall_rating}/5] ${r.meals?.name}: ${r.comment} (Дәмі: ${r.taste_rating}, Порциясы: ${r.portion_rating})`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Сен - мектеп асханасының сарапшысысың. Мына пікірлерді талдап, ҚАЗАҚ ТІЛІНДЕ жауап бер:
        Жауапты мына JSON форматында қайтар:
        {
          "bottomLine": "Студенттердің қазіргі көңіл-күйі туралы 1-2 сөйлем.",
          "advice": ["Нақты кеңес 1", "Нақты кеңес 2", "Нақты кеңес 3"]
        }
        
        Пікірлер:
        ${reviewText}`,
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setSummary(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('Summary failed:', error);
      setSummary({ 
        bottomLine: "Талдау жасау мүмкін болмады.", 
        advice: ["Деректерді тексеріңіз", "API-ді тексеріңіз", "Қайта көріңіз"] 
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, taste: 0, portion: 0, service: 0 };
    const count = reviews.length;
    return {
      avg: (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / count).toFixed(1),
      taste: (reviews.reduce((acc, r) => acc + (r.taste_rating || 0), 0) / count).toFixed(1),
      portion: (reviews.reduce((acc, r) => acc + (r.portion_rating || 0), 0) / count).toFixed(1),
      service: (reviews.reduce((acc, r) => acc + (r.service_rating || 0), 0) / count).toFixed(1),
    };
  }, [reviews]);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1D1D1B]">
      {/* Admin Nav */}
      <nav className="bg-[#1D1D1B] text-white px-6 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#F27D26] p-2 rounded-lg"><BarChart3 size={20} /></div>
          <div>
            <h1 className="font-bold tracking-tight">Әкімшілік Дашборды</h1>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Табақ Сыншысы</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-xs font-medium text-white/60 hidden md:block">Асхана сапасын бақылау жүйесі</span>
           <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">AS</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border-2 border-[#1D1D1B] p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(29,29,27,1)]">
             <p className="text-[10px] font-black text-[#1D1D1B]/40 uppercase tracking-widest mb-2">Жалпы Рейтинг</p>
             <div className="flex items-end gap-2">
                <span className="text-5xl font-black">{stats.avg}</span>
                <Star className="text-[#F27D26] fill-[#F27D26] mb-1.5" size={24} />
             </div>
          </div>
          <div className="bg-white border-2 border-[#1D1D1B]/5 p-6 rounded-[2rem]">
             <p className="text-[10px] font-black text-[#1D1D1B]/40 uppercase tracking-widest mb-2">Дәм сапасы</p>
             <span className="text-3xl font-bold">{stats.taste}</span>
          </div>
          <div className="bg-white border-2 border-[#1D1D1B]/5 p-6 rounded-[2rem]">
             <p className="text-[10px] font-black text-[#1D1D1B]/40 uppercase tracking-widest mb-2">Порция өлшемі</p>
             <span className="text-3xl font-bold">{stats.portion}</span>
          </div>
          <div className="bg-white border-2 border-[#1D1D1B]/5 p-6 rounded-[2rem]">
             <p className="text-[10px] font-black text-[#1D1D1B]/40 uppercase tracking-widest mb-2">Қызмет</p>
             <span className="text-3xl font-bold">{stats.service}</span>
          </div>
        </div>

        {/* AI Analytics Section */}
        <section className="mb-16">
          <div className="bg-[#1D1D1B] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
                 <div className="flex items-center gap-3">
                    <div className="bg-[#F27D26] p-2 rounded-xl text-white shadow-lg shadow-[#F27D26]/20">
                       <Sparkles size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black tracking-tight leading-none">AI Асхана Сапасының Талдауы</h2>
                       <p className="text-xs text-white/40 mt-1 uppercase font-bold tracking-widest">Пікірлер негізінде жасалған есеп</p>
                    </div>
                 </div>
                 <button 
                  onClick={generateSummary}
                  disabled={isSummarizing || reviews.length === 0}
                  className="bg-[#F27D26] hover:bg-[#ff8e42] text-sm px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all shadow-xl active:scale-95 disabled:opacity-50"
                 >
                   {isSummarizing ? 'Талдау жасалуда...' : 'AI Есепті Жаңарту'}
                 </button>
              </div>

              {summary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <h3 className="text-xs font-black uppercase text-[#F27D26] tracking-widest mb-4">Қорытынды</h3>
                      <p className="text-2xl font-bold leading-relaxed">{summary.bottomLine}</p>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-[#F27D26] tracking-widest mb-4">Нақты кеңестер (Action Items)</h3>
                      {summary.advice.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10">
                           <div className="w-8 h-8 bg-[#F27D26] rounded-full flex items-center justify-center font-black text-sm shrink-0">{i+1}</div>
                           <p className="text-white/80 font-medium">{item}</p>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="py-16 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                   <AlertCircle size={32} className="mx-auto text-white/20 mb-3" />
                   <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Бүгінгі пікірлерді талдау үшін батырманы басыңыз</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Feed */}
        <section>
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-3">
                <div className="bg-[#1D1D1B] text-white p-2 rounded-lg leading-none"><TrendingUp size={20} /></div>
                <h3 className="text-3xl font-black tracking-tight uppercase">Соңғы Пікірлер</h3>
             </div>
             <span className="text-[10px] font-black bg-[#1D1D1B]/5 px-3 py-1 rounded-full uppercase tracking-widest text-[#1D1D1B]/40">
                Барлығы: {reviews.length}
             </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-48 bg-[#1D1D1B]/5 animate-pulse rounded-[2rem]" />)
            ) : reviews.length === 0 ? (
              <div className="col-span-2 text-center py-20 bg-white border-2 border-dashed border-[#1D1D1B]/10 rounded-[3rem]">
                <Utensils size={48} className="mx-auto text-[#1D1D1B]/10 mb-4" />
                <p className="text-[#1D1D1B]/40 font-bold uppercase tracking-widest">Әлі пікірлер түскен жоқ.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div 
                  initial={{ opacity:0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  key={review.id} 
                  className="bg-white border-2 border-[#1D1D1B]/5 hover:border-[#1D1D1B] p-8 rounded-[2.5rem] transition-all hover:shadow-2xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                       <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= review.overall_rating ? "fill-[#F27D26] text-[#F27D26]" : "text-[#1D1D1B]/10"} />
                          ))}
                       </div>
                       <span className="text-[10px] font-black uppercase text-[#F27D26] tracking-tighter">Рейтинг: {review.overall_rating}/5</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-[#1D1D1B]/20 uppercase">
                          {new Date(review.created_at).toLocaleDateString('kk-KZ')}
                       </p>
                    </div>
                  </div>

                  <blockquote className="text-xl font-bold mb-6 italic leading-snug">"{review.comment}"</blockquote>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#1D1D1B]/5">
                     <span className="bg-[#1D1D1B] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {review.meals?.name || 'Тағам'}
                     </span>
                     <span className="text-xs font-bold text-[#1D1D1B]/40 font-mono">
                        — {review.student_name}
                     </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
