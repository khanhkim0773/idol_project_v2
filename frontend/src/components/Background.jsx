const Background = () => {
 return (
 <div className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden">
 {/* Seamless Multi-Layered Spotlight (No hard edges) */}
 <div
 className="absolute inset-0"
 style={{
 background: `
 radial-gradient(100% 100% at center, #312e81 0%, transparent 80%),
 radial-gradient(80% 50% at bottom, #4338ca 0%, transparent 100%),
 radial-gradient(100% 50% at top, #1e1b4b 0%, transparent 70%)
 `,
 opacity: 0.7
 }}
 />

 {/* Clean overlay */}
 <div className="absolute inset-0 bg-black/20 pointer-events-none" />
 </div>
 );
};

export default Background;
