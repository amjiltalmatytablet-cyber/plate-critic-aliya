import React, { useState, useEffect } from 'react';
import { Star, Utensils, Send, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'snack';
}

export default function StudentPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedType, setSelectedType] = useState<'breakfast' | 'lunch' | 'snack'>('lunch');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [studentName, setStudentName] = useState('');
  const [catRatings, setCatRatings] = useState({ taste: 3, portion: 3, service: 3 });

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  async function fetchTodayMeals() {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('serving_date', new Date().toISOString().split('T')[0]);
      
      if (error) throw error;
      setMeals(data || []);
    } catch (err) {
      console.error('Meals fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const currentMeal = meals.find(m => m.type === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !currentMeal || !comment) return;

    try {
      const { error } = await supabase.from('reviews').insert({
        meal_id: currentMeal.id,
        overall_rating: rating,
        taste_rating: catRatings.taste,
        portion_rating: catRatings.portion,
        service_rating: catRatings.service,
        comment,
        student_name: studentName || 'Анонимді'
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Қате орын алды. Қайта көріңіз.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-[#F27D26] rounded-full flex items-center justify-center text-white mx-auto mb-6">
            <Send size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Рақмет!</h2>
          <p className="text-[#1D1D1B]/60 mb-8">Сенің пікірің асхана сапасын жақсартуға көмектеседі.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-[#F27D26] font-bold hover:underline"
          >
            Тағы бір пікір қалдыру
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1D1D1B] pb-20">
      <header className="px-6 py-8 border-b border-[#1D1D1B]/5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#1D1D1B] text-white p-2 rounded-lg"><Utensils size={18} /></div>
            <h1 className="text-lg font-bold">Табақ Сыншысы</h1>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#1D1D1B]/40">Студент Порталы</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold mb-3 tracking-tight">Тағамды бағалаңыз</h2>
          <p className="text-[#1D1D1B]/60">Сіздің пікіріңіз асхана әкімшілігіне тікелей жетеді.</p>
        </div>

        {/* Meal Type Tabs */}
        <div className="flex bg-[#1D1D1B]/5 p-1 rounded-2xl mb-8">
          {(['breakfast', 'lunch', 'snack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedType === type ? 'bg-white shadow-sm text-[#F27D26]' : 'text-[#1D1D1B]/40 hover:text-[#1D1D1B]'
              }`}
            >
              {type === 'breakfast' ? 'Таңғы ас' : type === 'lunch' ? 'Түскі ас' : 'Бесін ас'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 bg-[#1D1D1B]/5 animate-pulse rounded-3xl" />
        ) : !currentMeal ? (
          <div className="text-center py-20 border-2 border-dashed border-[#1D1D1B]/10 rounded-3xl">
            <p className="text-[#1D1D1B]/40 font-medium italic">Бүгінгі мәзірде бұл тағам табылмады.</p>
          </div>
        ) : (
          <motion.div 
            key={currentMeal.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-[#1D1D1B] p-8 rounded-[2.5rem] shadow-xl"
          >
            <div className="mb-8 pb-6 border-b border-[#1D1D1B]/5">
              <span className="text-[10px] uppercase font-black text-[#F27D26] tracking-widest mb-1 block">Мәзірдегі тағам</span>
              <h3 className="text-2xl font-bold">{currentMeal.name}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#1D1D1B]/40">Жалпы бағаңыз</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        size={40} 
                        className={`${
                          star <= (hoverRating || rating) 
                            ? 'fill-[#F27D26] text-[#F27D26]' 
                            : 'text-[#1D1D1B]/10'
                        } transition-colors`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {Object.entries({ 
                  taste: 'Дәм сапасы', 
                  portion: 'Порция өлшемі', 
                  service: 'Қызмет көрсету' 
                }).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#1D1D1B]/60 uppercase tracking-wide">{label}</span>
                      <span className="text-[#F27D26]">{catRatings[key as keyof typeof catRatings]}/5</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" max="5" step="1"
                      value={catRatings[key as keyof typeof catRatings]}
                      onChange={(e) => setCatRatings({...catRatings, [key]: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-[#1D1D1B]/5 rounded-lg appearance-none cursor-pointer accent-[#F27D26]"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#1D1D1B]/40">Пікіріңіз</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Тағам туралы шындықты жазыңыз сапасы, дәмі, температурасы..."
                  className="w-full bg-[#1D1D1B]/5 border-none rounded-2xl px-5 py-4 min-h-[140px] focus:ring-2 focus:ring-[#F27D26] outline-none font-medium"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[#1D1D1B]/40">Атыңыз (Міндетті емес)</label>
                <input 
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Мысалы: Әлихан 10Б"
                  className="w-full bg-[#1D1D1B]/5 border-none rounded-2xl px-5 py-4 outline-none font-medium"
                />
              </div>

              <button 
                type="submit"
                disabled={!rating || !comment}
                className="w-full bg-[#1D1D1B] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-[#F27D26] transition-all disabled:opacity-30 disabled:hover:bg-[#1D1D1B] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                Пікірді Жөнелту
                <ChevronRight size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
