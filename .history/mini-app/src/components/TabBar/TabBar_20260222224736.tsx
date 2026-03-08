import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TabBar.css';

import dotScopeIcon from '../../../assets/icons/dot.scope.svg';
import calendarIcon from '../../../assets/icons/calendar.svg';
import chartBarIcon from '../../../assets/icons/chart.bar.svg';
import trayIcon from '../../../assets/icons/tray.svg';
import squareGridIcon from '../../../assets/icons/square.grid.2x2.svg';

const MAIN_TABS = [
  { id: 'today', label: 'Today', icon: dotScopeIcon, path: '/' },
  { id: 'plan', label: 'Plan', icon: calendarIcon, path: '/plan' },
  { id: 'progress', label: 'Progress', icon: chartBarIcon, path: '/progress' },
  { id: 'inbox', label: 'Inbox', icon: trayIcon, path: '/inbox' },
] as const;

const MORE_PATHS = ['/health', '/skills', '/life', '/settings'];

interface TabBarProps {
  onMoreClick?: () => void;
  onCloseMoreMenu?: () => void;
  isMoreMenuOpen?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  onMoreClick,
  onCloseMoreMenu,
  isMoreMenuOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    if (MORE_PATHS.includes(location.pathname)) return 'more';
    const tab = MAIN_TABS.find((t) => t.path === location.pathname);
    return tab ? tab.id : 'today';
  }, [location.pathname]);

  const activeIndex = useMemo(() => {
    const i = MAIN_TABS.findIndex((t) => t.id === activeTab);
    return i >= 0 ? i : 0;
  }, [activeTab]);

  const isPillHighlightVisible = activeTab !== 'more';
  const prevActiveTabRef = useRef(activeTab);
  const [skipPillTransition, setSkipPillTransition] = useState(false);

  useEffect(() => {
    const wasMore = prevActiveTabRef.current === 'more';
    const isNowMain = activeTab !== 'more';
    if (wasMore && isNowMain) {
      setSkipPillTransition(true);
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!skipPillTransition) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSkipPillTransition(false));
    });
    return () => cancelAnimationFrame(id);
  }, [skipPillTransition]);

  const handleTabClick = (path: string) => {
    onCloseMoreMenu?.();
    navigate(path);
  };

  const handleMoreClick = () => {
    if (isMoreMenuOpen) {
      onCloseMoreMenu?.();
    } else {
      onMoreClick?.();
    }
  };

  return (
    <div className="tabbar-wrapper">
      <nav className="tabbar-pill" aria-label="Main navigation">
        <div
          className={`tabbar-active-indicator ${isPillHighlightVisible ? '' : 'tabbar-active-indicator--hidden'} ${skipPillTransition ? 'tabbar-active-indicator--no-transition' : ''}`}
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {MAIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tabbar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <img
                src={tab.icon}
                alt=""
                className="tabbar-icon"
              />
              <span className="tabbar-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        className={`tabbar-more-btn ${activeTab === 'more' ? 'active' : ''}`}
        onClick={handleMoreClick}
        aria-label="More"
        aria-expanded={isMoreMenuOpen}
      >
        <img
          src={squareGridIcon}
          alt=""
          className="tabbar-icon"
        />
      </button>
    </div>
  );
};
