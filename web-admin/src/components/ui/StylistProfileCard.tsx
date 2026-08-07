/**
 * StylistProfileCard uses the salon gold/black editorial palette (#C5A880 / #0A0B0E).
 * This is intentionally separate from the Midnight Slate fleet dashboard theme —
 * the card is designed for the beauty/salon product domain, not fleet management.
 * Do not migrate these colours to indigo/CSS vars.
 */
import React from 'react';
import { Star, Calendar, MapPin, Award, ArrowUpRight, Scissors } from 'lucide-react';

export interface StylistProfile {
  id: string;
  name: string;
  title: string;
  studio: string;
  location: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  completedSessions: number;
  imageUrl: string;
  specialties: string[];
  availability: 'Available Today' | 'Next Slot: Tomorrow' | 'Fully Booked';
  startingRate: string;
}

const DEFAULT_STYLIST: StylistProfile = {
  id: 'STY-2026-08',
  name: 'ELENA ROSTOVA',
  title: 'Senior Editorial & Runway Hair Stylist',
  studio: 'STUDIO 04 · VOGUE ATELIER',
  location: 'MUMBAI / BANDRA WEST',
  rating: 4.98,
  reviewCount: 142,
  yearsExperience: 9,
  completedSessions: 480,
  imageUrl: '/stylist_portrait.jpg',
  specialties: ['Editorial Sculpting', 'Runway Colouring', 'Avant-Garde Bridal', 'Precision Cuts'],
  availability: 'Available Today',
  startingRate: '₹14,500 / session',
};

interface StylistProfileCardProps {
  stylist?: StylistProfile;
  onBookSession?: (stylistId: string) => void;
  onViewPortfolio?: (stylistId: string) => void;
}

export const StylistProfileCard: React.FC<StylistProfileCardProps> = ({
  stylist = DEFAULT_STYLIST,
  onBookSession,
  onViewPortfolio,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 font-sans">
      {/* 
        MAIN CARD CONTAINER 
        Constraint Compliance: Zero rounded corners (rounded-none), dark obsidian background (#0A0B0E), 
        no default drop shadows, hairline metallic champagne border (#C5A880 / 25%).
      */}
      <div className="relative bg-[#0A0B0E] border border-[#C5A880]/30 text-slate-100 rounded-none overflow-hidden transition-all duration-300 hover:border-[#C5A880]/60">
        
        {/* Subtle Background Watermark & Monogram Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(#C5A880 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Distinctive Visual Risk: Asymmetric Architectural Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
          
          {/* 
            LEFT COLUMN: Offset Floating Portrait Monolith (4 cols)
            Zero-radius crop with architectural corner stencil tag & sharp metallic frame.
          */}
          <div className="lg:col-span-5 relative p-6 bg-[#121319] border-b lg:border-b-0 lg:border-r border-[#C5A880]/20 flex flex-col justify-between">
            {/* Top Serial Stencil */}
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#C5A880] uppercase mb-4">
              <span className="flex items-center gap-1.5 font-semibold">
                <Scissors className="w-3 h-3 text-[#C5A880]" />
                {stylist.id}
              </span>
              <span className="px-2 py-0.5 border border-[#C5A880]/30 bg-[#C5A880]/10 text-[#E5C396] text-[9px]">
                {stylist.studio}
              </span>
            </div>

            {/* Sharp Architectural Image Container with Offset Corner Cutout */}
            <div className="relative group mx-auto w-full aspect-square max-w-[280px] bg-slate-900 border border-[#C5A880]/40 p-1.5 transition-transform duration-300 group-hover:scale-[1.01]">
              {/* Inner Portrait */}
              <div className="relative w-full h-full overflow-hidden bg-black">
                <img
                  src={stylist.imageUrl}
                  alt={stylist.name}
                  className="w-full h-full object-cover object-center filter grayscale brightness-95 contrast-105 group-hover:grayscale-0 transition-all duration-500 ease-out"
                />
                
                {/* Micro Corner Stencils */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 border border-[#C5A880]/50 text-[9px] font-mono text-[#E5C396] uppercase tracking-tighter">
                  PRO // CERTIFIED
                </div>

                {/* Rating Badge Overlay */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/90 border border-[#C5A880]/40 flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{stylist.rating.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({stylist.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Bottom Location Caption */}
            <div className="mt-4 pt-3 border-t border-[#C5A880]/15 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#C5A880]" />
                {stylist.location}
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {stylist.availability}
              </span>
            </div>
          </div>

          {/* 
            DISTINCTIVE VISUAL RISK: 
            Signature Architectural Metallic Angle Slash Divider (lg:visible)
            Cuts vertically across the split with an angled razor line & brass accent pin.
          */}
          <div className="hidden lg:block absolute left-[41.666%] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#C5A880]/10 via-[#C5A880]/60 to-[#C5A880]/10 z-20 pointer-events-none">
            <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-3 h-3 bg-[#0A0B0E] border border-[#C5A880] rotate-45" />
          </div>

          {/* 
            RIGHT COLUMN: High-Fashion Editorial Metadata & Action Block (7 cols)
          */}
          <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-br from-[#0A0B0E] via-[#0E0F15] to-[#12141D]">
            
            {/* Header Block */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A880]">
                <span>SENIOR ARTISTRY ATELIER</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Award className="w-3 h-3 text-[#C5A880]" />
                  {stylist.yearsExperience} YRS EXPERIENCE
                </span>
              </div>

              {/* Stylist Name - Bold High Tracking Typography */}
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-50 uppercase mt-1 font-display">
                {stylist.name}
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide mt-1">
                {stylist.title}
              </p>

              {/* Signature Horizontal Slash Accent Line */}
              <div className="relative my-4 h-[1px] w-full bg-gradient-to-r from-[#C5A880]/60 via-[#C5A880]/20 to-transparent">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-[#C5A880]" />
              </div>
            </div>

            {/* Performance Metrics Grid (Restrained Minimalist Rectangular Blocks) */}
            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="p-2.5 bg-[#14161F] border border-[#C5A880]/20 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">SESSIONS</span>
                <span className="text-base font-bold font-mono text-slate-100">{stylist.completedSessions}+</span>
              </div>
              <div className="p-2.5 bg-[#14161F] border border-[#C5A880]/20 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">SATISFACTION</span>
                <span className="text-base font-bold font-mono text-emerald-400">99.4%</span>
              </div>
              <div className="p-2.5 bg-[#14161F] border border-[#C5A880]/20 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">RATE</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#E5C396]">{stylist.startingRate}</span>
              </div>
            </div>

            {/* Specialty Tag Chips - Sharp Edge Rectangles */}
            <div className="my-3">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                01 // SPECIALTY ATELIER FOCUS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stylist.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-[#161822] text-slate-200 border border-slate-700/60 hover:border-[#C5A880]/50 transition-colors"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Restrained Metallic CTA */}
            <div className="mt-4 pt-4 border-t border-[#C5A880]/15 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => onBookSession?.(stylist.id)}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-[#C5A880] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#D8B98F] active:translate-y-0.5 transition-all rounded-none cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reserve Session</span>
              </button>
              
              <button
                type="button"
                onClick={() => onViewPortfolio?.(stylist.id)}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-transparent text-slate-200 border border-[#C5A880]/40 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-[#C5A880]/10 hover:text-[#E5C396] active:translate-y-0.5 transition-all rounded-none cursor-pointer"
              >
                <span>View Portfolio</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880]" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
