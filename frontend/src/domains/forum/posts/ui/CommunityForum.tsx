import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, Pin, Tag, Send, ChevronDown, Search, Plus, X } from 'lucide-react';
import { MOCK_FORUM_POSTS } from '@/src/shared/constants/mock-data';
import type { ForumPost } from '@/src/shared/types';

type Category = 'All' | 'General' | 'Help' | 'Showcase' | 'Competition' | 'Tutorial';
const CATEGORIES: Category[] = ['All', 'General', 'Help', 'Showcase', 'Competition', 'Tutorial'];
const CAT_COLORS: Record<string, string> = { General: 'bg-slate-100 text-slate-600', Help: 'bg-red-50 text-red-600', Showcase: 'bg-emerald-50 text-emerald-600', Competition: 'bg-amber-50 text-amber-600', Tutorial: 'bg-purple-50 text-purple-600' };

export default function CommunityForum() {
  const [posts, setPosts] = useState(MOCK_FORUM_POSTS);
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [replyText, setReplyText] = useState('');

  const filtered = posts
    .filter(p => category === 'All' || p.category === category)
    .filter(p => search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const submitPost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const post: ForumPost = { id: Date.now().toString(), author: 'You', authorRole: 'Student', avatar: '🙋', title: newTitle, content: newContent, category: newCategory as any, timestamp: 'Just now', likes: 0, replies: [], tags: [] };
    setPosts(prev => [post, ...prev]); setShowNew(false); setNewTitle(''); setNewContent('');
  };

  const addReply = (postId: string) => {
    if (!replyText.trim()) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: [...p.replies, { id: Date.now().toString(), author: 'You', authorRole: 'Student', content: replyText, timestamp: 'Just now', likes: 0 }] } : p));
    setReplyText('');
  };

  const likePost = (postId: string) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));

  return (
    <div className="min-h-[calc(100vh-76px)] bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-[#25338d] uppercase tracking-widest font-bold mb-1">COMMUNITY</p>
            <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">Discussion Forum</h1>
            <p className="text-slate-500 text-sm mt-1">Ask questions, share projects, and connect with the community.</p>
          </div>
          <button onClick={() => setShowNew(true)} className="bg-[#25338d] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-[#1a2670] transition-colors self-start"><Plus className="w-4 h-4" />New Post</button>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all ${category === c ? 'bg-[#25338d] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{c}</button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#25338d]" />
          </div>
        </div>

        {/* New Post Form */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm text-slate-900">Create New Post</h3><button onClick={() => setShowNew(false)}><X className="w-4 h-4 text-slate-400" /></button></div>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#25338d]" />
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} placeholder="What's on your mind?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none mb-3 focus:outline-none focus:border-[#25338d]" />
                <div className="flex items-center justify-between">
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={submitPost} className="bg-[#25338d] text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-[#1a2670]"><Send className="w-3.5 h-3.5" />Publish</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="p-5 cursor-pointer" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg shrink-0">{post.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {post.pinned && <Pin className="w-3 h-3 text-amber-500" />}
                      <span className="font-bold text-sm text-slate-900">{post.author}</span>
                      <span className="text-[10px] text-slate-400 font-mono">• {post.authorRole} • {post.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-800 mb-1">{post.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={e => { e.stopPropagation(); likePost(post.id); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#25338d] transition-colors"><ThumbsUp className="w-3.5 h-3.5" />{post.likes}</button>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><MessageSquare className="w-3.5 h-3.5" />{post.replies.length}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[post.category] || 'bg-slate-100 text-slate-600'}`}>{post.category}</span>
                      {post.tags.map(tag => <span key={tag} className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">#{tag}</span>)}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-600 shrink-0 transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5 ml-13">
                      {post.replies.map(reply => (
                        <div key={reply.id} className="ml-8 mt-3 pl-4 border-l-2 border-slate-100">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-800">{reply.author}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{reply.authorRole} • {reply.timestamp}</span>
                          </div>
                          <p className="text-sm text-slate-600">{reply.content}</p>
                          <button className="text-[10px] text-slate-400 hover:text-[#25338d] flex items-center gap-1 mt-1"><ThumbsUp className="w-3 h-3" />{reply.likes}</button>
                        </div>
                      ))}
                      <div className="ml-8 mt-4 flex gap-2">
                        <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReply(post.id)}
                          placeholder="Write a reply..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#25338d]" />
                        <button onClick={() => addReply(post.id)} className="bg-[#25338d] text-white px-3 py-2 rounded-lg"><Send className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
