import "./CSSFile/ErrorMessage.css";

const ErrorMessage = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="error-wrap">
      <div className="error-icon">
        <i className="ti ti-alert-circle" aria-hidden="true" />
      </div>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          <i className="ti ti-refresh" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;