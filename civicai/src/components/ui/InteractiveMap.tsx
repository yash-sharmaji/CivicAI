import React, { useState, useEffect } from 'react';
import { Issue, getStoredIssues } from '@/lib/mockData';
import { MapPin, Info, Compass, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  interactive?: boolean;
  onLocationSelect?: (location: { address: string; lat: number; lng: number }) => void;
  selectedLat?: number;
  selectedLng?: number;
  highlightIssueId?: string;
  filterCategory?: string;
  filterStatus?: string;
  filterSeverity?: string;
  searchQuery?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  interactive = true,
  onLocationSelect,
  selectedLat,
  selectedLng,
  highlightIssueId,
  filterCategory = 'All',
  filterStatus = 'All',
  filterSeverity = 'All',
  searchQuery = ''
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [userPin, setUserPin] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getStoredIssues().then(setIssues);
    if (selectedLat && selectedLng) {
      setUserPin({ lat: selectedLat, lng: selectedLng });
    }
  }, [selectedLat, selectedLng]);

  // Coordinate projection bounds (San Francisco / Metro City area bounding box)
  const BOUNDS = {
    minLat: 37.7600,
    maxLat: 37.7900,
    minLng: -122.4500,
    maxLng: -122.4000
  };

  // Convert Lat/Lng to SVG view coordinates (percent 0-100)
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    // SVG y-axis points down, so invert
    const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Convert SVG clicks back to Lat/Lng (for pin placement)
  const deprojectCoords = (xPercent: number, yPercent: number) => {
    const lng = BOUNDS.minLng + (xPercent / 100) * (BOUNDS.maxLng - BOUNDS.minLng);
    const lat = BOUNDS.minLat + (1 - yPercent / 100) * (BOUNDS.maxLat - BOUNDS.minLat);
    return { lat, lng };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onLocationSelect) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const coords = deprojectCoords(x, y);
    const mockAddress = `${Math.floor(coords.lat * 1000) % 800 + 100} Digital Way, Cyber District, Metro City`;

    setUserPin(coords);
    onLocationSelect({
      address: mockAddress,
      lat: coords.lat,
      lng: coords.lng
    });
  };

  // Filter issues based on criteria
  const filteredIssues = issues.filter(issue => {
    if (filterCategory !== 'All' && issue.category !== filterCategory) return false;
    if (filterStatus !== 'All' && issue.status !== filterStatus) return false;
    if (filterSeverity !== 'All' && issue.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'reported': return 'text-amber-400';
      case 'verified': return 'text-indigo-400';
      case 'in-progress': return 'text-blue-400';
      case 'resolved': return 'text-emerald-400';
    }
  };

  const getSeverityColorBg = (severity: Issue['severity']) => {
    switch (severity) {
      case 'low': return 'bg-gray-400';
      case 'medium': return 'bg-amber-400';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050508] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Banner Control bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-2 bg-[#09090c]/85 border border-white/10 rounded-xl backdrop-blur-md">
        <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
        <span className="text-xs font-semibold text-white tracking-wide uppercase">Metro Core Grid</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-emerald-400 font-medium">Live Feed Connected</span>
      </div>

      {/* SVG Canvas Map Grid */}
      <svg
        className={`w-full flex-1 cursor-${onLocationSelect ? 'crosshair' : 'default'} min-h-[300px]`}
        onClick={handleMapClick}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Futuristic Cyber Grid */}
        <defs>
          <pattern id="mapGrid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mapGrid)" />

        {/* Styled Districts / Waterbodies / Parks */}
        <path d="M 0,20 Q 20,40 40,30 T 80,45 T 100,30 L 100,0 L 0,0 Z" fill="rgba(99, 102, 241, 0.015)" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="0.3" />
        <circle cx="20" cy="70" r="15" fill="rgba(16, 185, 129, 0.015)" stroke="rgba(16, 185, 129, 0.04)" strokeWidth="0.3" /> {/* Central Park */}
        <circle cx="85" cy="65" r="10" fill="rgba(16, 185, 129, 0.01)" stroke="rgba(16, 185, 129, 0.03)" strokeWidth="0.3" />

        {/* Vector Roads Overlay */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
        <line x1="40" y1="0" x2="40" y2="100" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
        <line x1="10" y1="0" x2="90" y2="100" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        <line x1="90" y1="0" x2="10" y2="100" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
        
        {/* Diagonal Arterial roads */}
        <path d="M 5,20 C 35,45 65,55 95,80" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.6" />
        <path d="M 95,15 C 65,35 35,65 5,85" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.6" />

        {/* Pin placement indicator when user reports an issue */}
        {userPin && (
          <g transform={`translate(${projectCoords(userPin.lat, userPin.lng).x}, ${projectCoords(userPin.lat, userPin.lng).y})`}>
            <circle r="6" fill="rgba(99, 102, 241, 0.25)" className="animate-ping" />
            <circle r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="0.8" />
          </g>
        )}

        {/* Active Issues Pins */}
        {filteredIssues.map((issue) => {
          const { x, y } = projectCoords(issue.location.lat, issue.location.lng);
          const isHighlighted = highlightIssueId === issue.id || selectedIssue?.id === issue.id;

          return (
            <g
              key={issue.id}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIssue(issue);
              }}
              onMouseEnter={() => setHoveredIssue(issue)}
              onMouseLeave={() => setHoveredIssue(null)}
            >
              {/* Outer pulsing ring for critical/high issues */}
              {(issue.severity === 'critical' || isHighlighted) && (
                <circle
                  cx={x}
                  cy={y}
                  r={isHighlighted ? 4.5 : 3.5}
                  fill="none"
                  stroke={issue.severity === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'}
                  strokeWidth="0.8"
                  className="animate-marker-pulse"
                />
              )}

              {/* Core Pin Dot */}
              <circle
                cx={x}
                cy={y}
                r={isHighlighted ? 2.5 : 1.8}
                className="transition-all duration-200"
                fill={
                  issue.status === 'resolved' ? '#10b981' :
                  issue.severity === 'critical' ? '#ef4444' :
                  issue.severity === 'high' ? '#f59e0b' :
                  '#3b82f6'
                }
                stroke="#000000"
                strokeWidth="0.3"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Info Overlay for Hover */}
      {hoveredIssue && (
        <div
          className="absolute z-30 p-2.5 bg-[#09090c]/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md text-[11px] pointer-events-none"
          style={{
            left: `${Math.min(75, projectCoords(hoveredIssue.location.lat, hoveredIssue.location.lng).x)}%`,
            top: `${Math.min(75, projectCoords(hoveredIssue.location.lat, hoveredIssue.location.lng).y - 12)}%`
          }}
        >
          <div className="font-semibold text-white truncate max-w-[150px]">{hoveredIssue.title}</div>
          <div className="text-gray-400 mt-0.5">{hoveredIssue.category}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${getSeverityColorBg(hoveredIssue.severity)}`} />
            <span className="capitalize font-medium text-gray-300">{hoveredIssue.severity}</span>
            <span className="text-gray-500">•</span>
            <span className={`capitalize font-semibold ${getStatusColor(hoveredIssue.status)}`}>{hoveredIssue.status}</span>
          </div>
        </div>
      )}

      {/* Floating Dialog details for Selected Issue */}
      {selectedIssue && (
        <div className="absolute bottom-4 left-4 right-4 z-20 p-4 bg-[#09090c]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedIssue.status)}`}>
                {selectedIssue.status.replace('-', ' ')}
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5 truncate">{selectedIssue.title}</h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">{selectedIssue.location.address}</p>
            </div>
            <button
              onClick={() => setSelectedIssue(null)}
              className="p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-gray-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="capitalize">{selectedIssue.severity}</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-indigo-400 font-semibold">{selectedIssue.upvotes} upvotes</span>
            </div>
            <a
              href={`/issues/${selectedIssue.id}`}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold text-[11px] transition-colors"
            >
              View Report
            </a>
          </div>
        </div>
      )}

      {/* Instruction footer in report mode */}
      {onLocationSelect && !userPin && (
        <div className="absolute bottom-4 left-4 right-4 z-20 p-2.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl backdrop-blur-md flex items-center gap-2 justify-center text-xs text-indigo-300">
          <Navigation className="w-3.5 h-3.5 animate-bounce" />
          <span>Click anywhere on the core grid map to select issue location</span>
        </div>
      )}
    </div>
  );
};
