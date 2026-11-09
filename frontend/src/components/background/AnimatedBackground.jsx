function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">

      <div
        className="
        absolute
        top-10
        left-10
        h-72
        w-72
        rounded-full
        bg-cyan-500/20
        blur-3xl
        animate-pulse"
      />

      <div
        className="
        absolute
        bottom-20
        right-20
        h-96
        w-96
        rounded-full
        bg-blue-600/20
        blur-3xl
        animate-pulse"
      />

      <div
        className="
        absolute
        left-1/2
        top-1/2
        h-80
        w-80
        rounded-full
        bg-indigo-500/20
        blur-3xl
        animate-pulse"
      />

    </div>
  );
}

export default AnimatedBackground;