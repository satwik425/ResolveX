import { useEffect, useState }    from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace }           from "../../contexts/WorkspaceContext";
import Loader                     from "../../components/common/Loader";

const JoinWorkspacePage = () => {
  const { inviteCode } = useParams();
  const { joinByCode }  = useWorkspace();
  const navigate        = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const join = async () => {
      try {
        const ws = await joinByCode(inviteCode);
        navigate(`/workspaces/${ws._id}`);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to join workspace");
      }
    };
    join();
  }, [inviteCode]);

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
        <p>{error}</p>
        <button onClick={() => navigate("/workspaces")}>Go to workspaces</button>
      </div>
    );
  }

  return <Loader text="Joining workspace..." />;
};

export default JoinWorkspacePage;