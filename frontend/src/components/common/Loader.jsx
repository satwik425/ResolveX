import "./CSSFile/Loader.css";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner" aria-label="Loading" />
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;