import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TabBar.css';

import crownIcon from '../../../assets/icons/crown.svg';
import crownFillIcon from '../../../assets/icons/crown.fill.svg';
import heartIcon from '../../../assets/icons/heart.svg';
import heartFillIcon from '../../../assets/icons/heart.fill.svg';

const TABS = [
  {
    id: 'misses',
    label: 'Мисски',
    icon: crownIcon,
    iconActive: crownFillIcon,
    path: '/',
  },
  {
    id: 'voting',
    label: 'Голосование',
    icon: heartIcon,
    iconActive: heartFillIcon,
    path: '/voting',
  },
] as const;

export const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = TABS.filter((t) => t.id !== 'voting');

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex((t) => t.path === location.pathname);
    return idx >= 0 ? idx : 0;
  }, [location.pathname, tabs]);

  if (tabs.length <= 1) return null;
  if (location.pathname.startsWith('/miss')) return null;

  return (
    <div className="tabbar-wrapper">
      <nav className="tabbar-pill" aria-label="Main navigation">
        <div
          className="tabbar-active-indicator"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tabbar-item${isActive ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <img
                src={isActive ? tab.iconActive : tab.icon}
                alt=""
                className="tabbar-icon"
              />
              <span className="tabbar-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
