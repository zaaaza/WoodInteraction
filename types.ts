import React from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface Ripple extends Point {
  id: number;
  timestamp: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}