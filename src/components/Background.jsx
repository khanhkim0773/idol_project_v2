const Background = ({ imgSrc }) => {
  return (
    <img
      src={imgSrc}
      alt="background"
      className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
    />
  );
};

export default Background;
