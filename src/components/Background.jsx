const Background = ({ imgSrc }) => {
  return (
    <img
      src={imgSrc}
      alt="background"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default Background;
