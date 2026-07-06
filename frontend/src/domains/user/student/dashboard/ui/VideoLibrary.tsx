import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Lock, CheckCircle2, Clock, Star, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { MOCK_VIDEO_COURSES } from '@/src/shared/constants/mock-data';

export default function VideoLibrary() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = levelFilter === 'all' ? MOCK_VIDEO_COURSES : MOCK_VIDEO_COURSES.filter(c => c.level === levelFilter);
  const selected = MOCK_VIDEO_COURSES.find(c => c.id === selectedCourse);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h3 className="font-display font-bold text-xl text-slate-900">Video Library</h3><p className="text-xs text-slate-500 mt-1">Watch structured lessons from expert instructors</p></div>
        <div className="flex gap-2">
          {levels.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-colors capitalize ${levelFilter === l ? 'bg-[#2563EB] text-slate-900' : 'bg-white text-slate-600 border border-slate-200'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      {!selected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedCourse(course.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="relative aspect-video bg-slate-100">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center"><Play className="w-5 h-5 text-slate-900 ml-0.5" /></div>
                </div>
                <div className="absolute top-2 left-2 bg-white/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{course.duration}</div>
                <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${course.level === 'Beginner' ? 'bg-emerald-500 text-slate-900' : course.level === 'Intermediate' ? 'bg-amber-500 text-slate-900' : 'bg-red-500 text-slate-900'}`}>{course.level}</div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm text-slate-900 mb-1 leading-tight">{course.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{course.instructor}</p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${course.completionPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{course.completionPct}% complete</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{course.rating} • <Users className="w-3 h-3" />{course.enrolled}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Course Detail */}
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="relative aspect-[21/9] bg-slate-50">
            <img src={selected.thumbnail} alt={selected.title} className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                <Play className="w-7 h-7 text-slate-900 ml-1" />
              </button>
            </div>
            <button onClick={() => setSelectedCourse(null)} className="absolute top-4 left-4 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur hover:bg-white/30">← Back</button>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">{selected.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{selected.instructor} • {selected.duration} • {selected.lessons.length} lessons</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg"><Star className="w-4 h-4 text-amber-500" /><span className="font-bold text-sm text-amber-700">{selected.rating}</span></div>
            </div>
            <p className="text-sm text-slate-600 mb-6">{selected.description}</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1"><div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${selected.completionPct}%` }} /></div>
            <p className="text-xs text-slate-400 mb-6">{selected.completionPct}% complete</p>

            <h4 className="font-bold text-sm text-slate-900 mb-3">Lessons</h4>
            <div className="space-y-2">
              {selected.lessons.map((lesson, i) => (
                <div key={lesson.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${lesson.completed ? 'bg-emerald-50/50 border-emerald-100' : lesson.locked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-[#2563EB] cursor-pointer'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${lesson.completed ? 'bg-emerald-500 text-slate-900' : lesson.locked ? 'bg-slate-200 text-slate-400' : 'bg-[#2563EB]/10 text-[#2563EB]'}`}>
                    {lesson.completed ? <CheckCircle2 className="w-4 h-4" /> : lesson.locked ? <Lock className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1"><p className={`text-sm ${lesson.completed ? 'text-emerald-700' : 'text-slate-800'} font-medium`}>{lesson.title}</p></div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
