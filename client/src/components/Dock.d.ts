declare module '@/components/Dock' {
  interface DockItem {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }

  interface DockProps {
    items: DockItem[];
    className?: string;
    spring?: {
      mass?: number;
      stiffness?: number;
      damping?: number;
    };
    magnification?: number;
    distance?: number;
    panelHeight?: number;
    dockHeight?: number;
    baseItemSize?: number;
  }

  const Dock: React.FC<DockProps>;
  export default Dock;
}
