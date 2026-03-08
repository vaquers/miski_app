import React from 'react';
import heartFillIcon from '../../assets/icons/heart.fill.svg';
import { Footer } from '@/components/Footer/Footer';
import './VotingScreen.css';

export const VotingScreen: React.FC = () => (
  <div className="voting-screen">
    <div className="voting-content">
      <div className="voting-icon-wrap">
        <img src={heartFillIcon} alt="" className="voting-icon" />
      </div>
      <h1 className="voting-title">Голосование</h1>
      <p className="voting-subtitle">
        Скоро здесь откроется голосование за&nbsp;участниц
      </p>
    </div>
    <Footer />
  </div>
);
