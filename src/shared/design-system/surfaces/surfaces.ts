export const surfaceSystem = {
  panel: {
    base: 'glass-elevated',
    muted: 'glass-muted',
    accent: 'glass-accent',
  },
  border: {
    subtle: 'rgba(193, 178, 154, 0.42)',
    strong: 'rgba(138, 115, 82, 0.22)',
  },
  material: {
    admin: 'luxury-paper',
    public: 'luxury-canvas',
    modal: 'luxury-modal',
  },
} as const

export type SurfaceSystem = typeof surfaceSystem
