export const surfaceSystem = {
  panel: {
    base: 'glass-elevated',
    muted: 'glass-muted',
    accent: 'glass-accent',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    strong: 'rgba(255, 45, 45, 0.18)',
  },
  material: {
    admin: 'luxury-paper',
    public: 'luxury-canvas',
    modal: 'luxury-modal',
  },
} as const

export type SurfaceSystem = typeof surfaceSystem
