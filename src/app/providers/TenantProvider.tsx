import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Interface matching the core Tenant model branding options
export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  type: string;
  logoUrl: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  country: string;
  location: string;
  description: string;
  is_public: boolean;
  verified: boolean;
}

interface TenantContextType {
  tenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
  subdomain: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
  subdomain: null,
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        const hostname = window.location.hostname;
        const searchParams = new URLSearchParams(window.location.search);
        
        // 1. Resolve subdomain slug
        let slug: string | null = null;
        
        // Developer fallback: check search params first (e.g. localhost:5173?tenant=girabola)
        const queryTenant = searchParams.get('tenant');
        if (queryTenant) {
          slug = queryTenant;
        } else {
          const parts = hostname.split('.');
          // e.g. girabola.bolayetu.com -> parts = ['girabola', 'bolayetu', 'com']
          if (parts.length >= 3) {
            const possibleSubdomain = parts[0];
            const reserved = ['www', 'app', 'api', 'admin', 'cdn', 'mail'];
            if (!reserved.includes(possibleSubdomain)) {
              slug = possibleSubdomain;
            }
          }
        }

        setSubdomain(slug);

        if (!slug) {
          // No tenant (Main platform index page)
          setTenant(null);
          setLoading(false);
          return;
        }

        // 2. Fetch Tenant settings from backend API
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${apiUrl}/api/organizations/public/${slug}/`);
        const data = response.data as TenantInfo;

        setTenant(data);

        // 3. Apply branding CSS Custom Variables to :root
        const root = document.documentElement;
        if (data.primary_color) {
          root.style.setProperty('--color-primary', data.primary_color);
          // Convert hex to rgb helper
          const rgb = hexToRgb(data.primary_color);
          if (rgb) root.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
        if (data.secondary_color) {
          root.style.setProperty('--color-secondary', data.secondary_color);
          const rgb = hexToRgb(data.secondary_color);
          if (rgb) root.style.setProperty('--color-secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
        if (data.accent_color) {
          root.style.setProperty('--color-accent', data.accent_color);
          const rgb = hexToRgb(data.accent_color);
          if (rgb) root.style.setProperty('--color-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
        
      } catch (err: any) {
        console.error('Failed to resolve Tenant:', err);
        setError('Falha ao carregar as definições da organização.');
      } finally {
        setLoading(false);
      }
    };

    resolveTenant();
  }, []);

  // Hex to RGB parser helper
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <TenantContext.Provider value={{ tenant, loading, error, subdomain }}>
      {children}
    </TenantContext.Provider>
  );
};
