import React from 'react'

export const AdminLogo = () => (
  <div className="admin-logo-wrapper">
    <img
      src="/logo.png"
      alt="Viralatinhas Logo"
      className="admin-logo-img"
    />
    <div className="admin-logo-text">
      <span className="brand-name">VIRALATINHAS</span>
      <span className="brand-location">Sumaré - SP</span>
    </div>
  </div>
)

export const AdminIcon = () => (
  <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
    <img
      src="/logo.png"
      alt="Viralatinhas Icon"
      style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
    />
  </div>
)
