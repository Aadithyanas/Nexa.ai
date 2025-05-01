export const styles = {
  container: {
    base: "relative w-full h-full flex flex-col",
    mini: "max-w-md mx-auto",
    full: "max-w-6xl mx-auto p-4",
  },
  videoContainer: {
    base: "relative rounded-2xl overflow-hidden bg-dark-lighter border border-light/10",
    mini: "w-full aspect-video",
    full: "w-full aspect-[16/9]",
  },
  video: "w-full h-full object-cover",
  canvas: "absolute inset-0 z-10",
  statusOverlay: {
    base: "absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20 transition-opacity duration-300",
    active: "opacity-100",
    inactive: "opacity-0 pointer-events-none",
  },
  statusText: "text-2xl font-semibold text-white text-center",
  controls: {
    container: "mt-4 flex flex-wrap gap-4 items-center justify-between",
    button: {
      base: "px-4 py-2 rounded-lg font-medium transition-all duration-300",
      primary: "bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      secondary: "bg-dark-lighter border border-light/10 hover:border-primary/50 text-light hover:text-primary",
    },
  },
  stats: {
    container: "mt-4 grid grid-cols-2 md:grid-cols-4 gap-4",
    card: "p-4 rounded-xl bg-dark-lighter border border-light/10",
    label: "text-sm text-light/60",
    value: "text-xl font-semibold text-light mt-1",
  },
  verification: {
    container: "absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-dark-lighter/80 backdrop-blur border border-light/10",
    status: "text-lg font-medium",
    details: "mt-2 text-sm text-light/80",
  },
  alerts: {
    container: "absolute top-4 right-4 flex flex-col gap-2",
    alert: {
      base: "p-3 rounded-lg shadow-lg animate-fade-in",
      warning: "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400",
      error: "bg-red-500/20 border border-red-500/50 text-red-400",
      success: "bg-green-500/20 border border-green-500/50 text-green-400",
    },
  },
} 