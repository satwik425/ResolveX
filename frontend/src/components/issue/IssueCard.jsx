import "./IssueCard.css";

const priorityColor = (p) => {
  if (p === "high")   return "prio-high";
  if (p === "medium") return "prio-medium";
  return "prio-low";
};

const statusColor = (s) => {
  if (s === "done")        return "status-done";
  if (s === "in-progress") return "status-progress";
  if (s === "in-review")   return "status-review";
  return "status-todo";
};

const IssueCard = ({ issue, onClick }) => {
  return (
    <div className="issue-card" onClick={() => onClick?.(issue)}>

      <div className="issue-card-top">
        <span className={`issue-status ${statusColor(issue.status)}`}>
          {issue.status}
        </span>
        <span className={`issue-prio ${priorityColor(issue.priority)}`}>
          <i className="ti ti-flag" aria-hidden="true" />
          {issue.priority}
        </span>
      </div>

      <p className="issue-card-title">{issue.title}</p>

      {issue.description && (
        <p className="issue-card-desc">{issue.description}</p>
      )}

      <div className="issue-card-footer">
        <div className="issue-card-meta">
          <i className="ti ti-calendar" aria-hidden="true" />
          {new Date(issue.createdAt).toLocaleDateString()}
        </div>

        {issue.assignee && (
          <div className="issue-card-assignee">
            <div className="issue-avatar">
              {issue.assignee?.name?.charAt(0).toUpperCase()}
            </div>
            <span>{issue.assignee?.name}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default IssueCard;