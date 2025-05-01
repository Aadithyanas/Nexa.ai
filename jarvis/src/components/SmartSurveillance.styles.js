export const styles = {
  container: "max-w-7xl mx-auto p-4 space-y-6",
  title: "text-3xl md:text-4xl font-bold text-center mb-8 text-light",
  
  error: "bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center justify-between",
  closeButton: "text-red-400 hover:text-red-300 text-2xl font-bold",
  
  loading: "flex flex-col items-center justify-center space-y-4 p-8",
  spinner: "w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin",
  
  cameraContainer: "relative aspect-video w-full rounded-2xl overflow-hidden bg-dark-lighter border border-light/10",
  webcam: "w-full h-full object-cover",
  canvas: "absolute inset-0 z-10",
  
  controls: {
    container: "mt-6 flex flex-wrap gap-4",
    button: "px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
  },
  
  detections: {
    container: "mt-6 grid grid-cols-1 md:grid-cols-2 gap-6",
    card: "p-6 rounded-xl bg-dark-lighter border border-light/10",
    title: "text-xl font-semibold mb-4 text-light",
    list: "space-y-2",
    item: "flex items-center gap-2 text-light/80",
    count: "text-primary font-medium",
  },
  
  description: {
    container: "mt-6 p-6 rounded-xl bg-dark-lighter border border-light/10",
    title: "text-xl font-semibold mb-4 text-light",
    text: "text-light/80 leading-relaxed",
  },
  
  stats: {
    container: "mt-6 grid grid-cols-2 md:grid-cols-4 gap-4",
    card: "p-4 rounded-xl bg-dark-lighter border border-light/10",
    label: "text-sm text-light/60",
    value: "text-xl font-semibold text-light mt-1",
  },
  
  alerts: {
    container: "fixed bottom-4 right-4 flex flex-col gap-2 z-50",
    alert: {
      base: "p-4 rounded-lg shadow-lg animate-fade-in max-w-md",
      info: "bg-blue-500/20 border border-blue-500/50 text-blue-400",
      warning: "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400",
      error: "bg-red-500/20 border border-red-500/50 text-red-400",
    },
  },
} 