import { useMemo } from "react";
import "./BurndownChart.css";

const BurndownChart = ({ sprint, issues }) => {
  const chartData = useMemo(() => {
    if (!sprint || !issues) return null;

    const start = new Date(sprint.startDate);
    const end   = new Date(sprint.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If sprint has ended but we're viewing it after the end date,
    // extend the chart to today so late-completed issues are visible.
    const chartEnd = today.getTime() > end.getTime() ? today : end;

    const totalTime = chartEnd.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(totalTime / (1000 * 60 * 60 * 24)));
    // Keep the original sprint duration for the ideal line slope (don't stretch ideal beyond sprint end)
    const sprintDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Generate dates array: sprint start → max(sprint end, today)
    const dates = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push(date);
    }

    // Total story points across all issues in this sprint
    const totalStoryPoints = issues.reduce((acc, issue) => acc + (issue.storyPoints || 0), 0);

    // Build data points
    const dataPoints = dates.map((date, idx) => {
      // Ideal line: linear from totalStoryPoints on Day 0 → 0 at sprint end day
      const idealIdx = Math.min(idx, sprintDays);
      const ideal = Math.max(0, totalStoryPoints - (totalStoryPoints * idealIdx) / sprintDays);

      // Actual remaining: subtract story points of issues completed on or before this date
      let completedPoints = 0;
      issues.forEach((issue) => {
        const isDone = issue.status === "DONE" || issue.status === "done";
        if (isDone) {
          // Use completedAt first, then updatedAt, then createdAt as fallback
          const rawDate = issue.completedAt || issue.updatedAt || issue.createdAt;
          const completedDate = new Date(rawDate);
          completedDate.setHours(0, 0, 0, 0);
          // Only count if this issue was completed on or before the current data-point date
          if (completedDate.getTime() <= date.getTime()) {
            completedPoints += (issue.storyPoints || 0);
          }
        }
      });
      const actual = Math.max(0, totalStoryPoints - completedPoints);

      // Don't render the actual line for dates strictly in the future
      const isFuture = date.getTime() > today.getTime();

      return {
        dateString: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        ideal: parseFloat(ideal.toFixed(1)),
        actual: parseFloat(actual.toFixed(1)),
        isFuture,
        isPastSprintEnd: date.getTime() > end.getTime()
      };
    });

    return {
      totalStoryPoints,
      dataPoints,
      totalDays,
      sprintDays
    };
  }, [sprint, issues]);

  if (!chartData || chartData.totalStoryPoints === 0) {
    return (
      <div className="burndown-empty">
        <i className="ti ti-chart-line" aria-hidden="true" />
        <p>No story points assigned to this sprint yet, or start/end dates are missing.</p>
      </div>
    );
  }

  const { dataPoints, totalStoryPoints, totalDays, sprintDays } = chartData;

  // SVG Chart Layout Config
  const width = 600;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scale functions — X uses totalDays (may extend past sprint end), Y uses totalStoryPoints
  const getX = (index) => paddingLeft + (index / totalDays) * chartWidth;
  const getY = (value) => {
    if (totalStoryPoints === 0) return paddingTop + chartHeight;
    return paddingTop + chartHeight - (value / totalStoryPoints) * chartHeight;
  };

  // Ideal path: only draw up to sprintDays (the actual sprint end)
  const idealPoints = dataPoints.slice(0, sprintDays + 1);
  const idealPath = idealPoints
    .map((dp, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(dp.ideal)}`)
    .join(" ");

  // Actual path: draw all non-future points using their real index position in dataPoints
  const visibleActualPoints = dataPoints
    .map((dp, idx) => ({ dp, idx }))
    .filter(({ dp }) => !dp.isFuture);
  const actualPath = visibleActualPoints.length > 0
    ? visibleActualPoints
        .map(({ dp, idx }, i) => `${i === 0 ? "M" : "L"} ${getX(idx)} ${getY(dp.actual)}`)
        .join(" ")
    : "";

  // X position of sprint end boundary (for the vertical dashed marker)
  const sprintEndX = getX(sprintDays);
  const isExtended = totalDays > sprintDays;

  return (
    <div className="burndown-container">
      <div className="burndown-header">
        <h3 className="burndown-title">Sprint Burndown Chart</h3>
        <div className="burndown-legend">
          <div className="legend-item">
            <span className="legend-line legend-ideal" />
            <span>Ideal Burndown</span>
          </div>
          <div className="legend-item">
            <span className="legend-line legend-actual" />
            <span>Actual Remaining</span>
          </div>
          {isExtended && (
            <div className="legend-item">
              <span className="legend-line legend-sprintend" />
              <span>Sprint End</span>
            </div>
          )}
        </div>
      </div>

      <div className="burndown-chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="burndown-svg">
          {/* Y-Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = totalStoryPoints * ratio;
            const y = getY(val);
            return (
              <g key={ratio} className="grid-group">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} className="grid-line" />
                <text x={paddingLeft - 10} y={y + 4} className="axis-text axis-y-text">
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {dataPoints.map((dp, idx) => {
            if (totalDays > 10 && idx % Math.ceil(totalDays / 5) !== 0 && idx !== totalDays) {
              return null;
            }
            const x = getX(idx);
            return (
              <g key={idx} className="grid-group">
                <line x1={x} y1={paddingTop} x2={x} y2={height - paddingBottom} className="grid-line x-grid-line" />
                <text x={x} y={height - paddingBottom + 20} className="axis-text axis-x-text">
                  {dp.dateString}
                </text>
              </g>
            );
          })}

          {/* Sprint End Vertical Marker (shown when chart extends past sprint end) */}
          {isExtended && (
            <g>
              <line
                x1={sprintEndX} y1={paddingTop}
                x2={sprintEndX} y2={height - paddingBottom}
                stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3"
              />
              <text x={sprintEndX + 4} y={paddingTop + 12} fill="#f97316" fontSize="9" fontFamily="inherit">
                Sprint End
              </text>
            </g>
          )}

          {/* Paths */}
          <path d={idealPath} className="path-ideal" />
          {actualPath && <path d={actualPath} className="path-actual" />}

          {/* Interactive Data Dots */}
          {visibleActualPoints.map(({ dp, idx }) => (
            <g key={idx} className="chart-dot-group">
              <circle cx={getX(idx)} cy={getY(dp.actual)} r={4} className="dot-actual" />
              <title>{`${dp.dateString}\nActual: ${dp.actual} SP\nIdeal: ${dp.ideal} SP`}</title>
            </g>
          ))}
        </svg>
      </div>

      <div className="burndown-footer">
        <p>Total Story Points: <strong>{totalStoryPoints} SP</strong></p>
        <p>Sprint Duration: <strong>{totalDays} Days</strong></p>
      </div>
    </div>
  );
};

export default BurndownChart;
