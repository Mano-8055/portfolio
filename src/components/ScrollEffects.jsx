// Legacy file — kept to avoid import errors during transition.
// Active scroll effects are now handled directly in App.jsx via the Reveal component.

export function FloatingBlobs() { return null; }
export function ScrollBackground() { return null; }
export function TiltCard({ children, className = "", style, ...props }) {
  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
}
export function ParallaxBox({ children, className = "", style = {} }) {
  return <div className={className} style={style}>{children}</div>;
}
