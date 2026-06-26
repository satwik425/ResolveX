import { useState, useEffect }  from "react";
import issueApi      from "../../api/issueApi";
import "./SprintBoard.css";

const COLUMNS = [
  { key: "todo",        label: "To do",      color: "col-todo"     },
  { key: "in-progress", label: "In progress", color: "col-progress" },
  { key: "in-review",   label: "In review",   color: "col-review"   },
  { key: "done",        label: "Done",        color: "col-done"     },
];

const SprintBoard = ({ sprint, issues: initialIssues, onIssueClick, onIssueUpdate }) => {
  const [issues,      setIssues]      = useState(initialIssues || []);
  const [dragging,    setDragging]    = useState(null);
  const [dragOver,    setDragOver]    = useState(null);

  useEffect(() => {
    setIssues(initialIssues || []);
  }, [initialIssues]);

  const normalizeStatus = (status) => {
    if (!status) return "";
    let s = status.toLowerCase().replace("_", "-");
    if (s === "review") return "in-review";
    return s;
  };

  const getIssues = (status) => issues.filter((i) => normalizeStatus(i.status) === status);

  const handleDragStart = (issue) => setDragging(issue);
  const handleDragOver  = (e, col) => { e.preventDefault(); setDragOver(col); };
  const handleDragLeave = () => setDragOver(null);

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!dragging || normalizeStatus(dragging.status) === newStatus) {
      setDragging(null);
      setDragOver(null);
      return;
    }

    const backendStatusMap = {
      "todo": "TODO",
      "in-progress": "IN_PROGRESS",
      "in-review": "REVIEW",
      "done": "DONE"
    };
    const backendStatus = backendStatusMap[newStatus] || newStatus;

    try {
      const res = await issueApi.updateIssue(dragging._id, { status: backendStatus });
      // Use the server response so completedAt is included
      const updatedIssue = res.data.issue || { ...dragging, status: backendStatus };
      setIssues((prev) =>
        prev.map((i) => (i._id === dragging._id ? updatedIssue : i))
      );
      // ✅ Propagate the updated issue back up to SprintPage
      onIssueUpdate?.(updatedIssue);
    } catch (err) {
      console.error("Failed to update issue status:", err.message);
    } finally {
      setDragging(null);
      setDragOver(null);
    }
  };

  const priorityColor = (p) => {
    if (p === "high")   return "prio-high";
    if (p === "medium") return "prio-medium";
    return "prio-low";
  };

  return (
    <div className="board">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`board-col ${dragOver === col.key ? "board-col-over" : ""}`}
          onDragOver={(e) => handleDragOver(e, col.key)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, col.key)}
        >
          <div className="board-col-header">
            <div className={`board-col-dot ${col.color}`} />
            <span className="board-col-label">{col.label}</span>
            <span className="board-col-count">{getIssues(col.key).length}</span>
          </div>

          <div className="board-col-body">
            {getIssues(col.key).map((issue) => (
              <div
                key={issue._id}
                className={`board-card ${dragging?._id === issue._id ? "board-card-dragging" : ""}`}
                draggable
                onDragStart={() => handleDragStart(issue)}
                onClick={() => onIssueClick?.(issue)}
              >
                <p className="board-card-title">{issue.title}</p>
                <div className="board-card-footer">
                  <span className={`board-card-prio ${priorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                  {issue.assignee && (
                    <div className="board-card-avatar">
                      {issue.assignee?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SprintBoard;