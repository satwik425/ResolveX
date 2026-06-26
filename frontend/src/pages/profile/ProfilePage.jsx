import { useEffect, useState } from "react";
import { useAuth }             from "../../contexts/AuthContext";
import Layout                  from "../../Layout";
import Loader                  from "../../components/common/Loader";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading]  = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Layout><Loader text="Loading profile..." /></Layout>;
  if (!user)   return null;

  return (
    <Layout>
      <div className="profile-page">

        <div className="profile-card">
          <div className="profile-avatar-lg">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <div className="profile-details">
          {[
            { label: "Full name", value: user.name,  icon: "ti-user"  },
            { label: "Email",     value: user.email, icon: "ti-mail"  },
            { label: "Role",      value: user.role || "member", icon: "ti-shield" },
          ].map((row) => (
            <div className="profile-row" key={row.label}>
              <div className="profile-row-label">
                <i className={`ti ${row.icon}`} aria-hidden="true" />
                {row.label}
              </div>
              <div className="profile-row-value">{row.value}</div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default ProfilePage;