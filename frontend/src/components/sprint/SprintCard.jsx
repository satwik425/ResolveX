import "./SprintCard.css";

const statusColor = (status) => {
  if (status === "active")    return "sprint-status-active";
  if (status === "completed") return "sprint-status-done";
  return "sprint-status-planned";
};

const SprintCard = ({ sprint, onClick }) => {
  return (
    <div className="sprint-card" onClick={onClick}>
      <div className="sprint-card-header">
        <span className={`sprint-status ${statusColor(sprint.status)}`}>
          {sprint.status}
        </span>
        <span className="sprint-dates">
          <i className="ti ti-calendar" aria-hidden="true" />
          {new Date(sprint.startDate).toLocaleDateString()} →{" "}
          {new Date(sprint.endDate).toLocaleDateString()}
        </span>
      </div>
      <h3 className="sprint-name">{sprint.name}</h3>
      <div className="sprint-footer">
        <div className="sprint-issues">
          <i className="ti ti-circle-dot" aria-hidden="true" />
          {sprint.issues?.length || 0} issues
        </div>
      </div>
    </div>
  );
};

export default SprintCard;