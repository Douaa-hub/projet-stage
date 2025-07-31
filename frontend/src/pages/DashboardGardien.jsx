import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUser, getToken } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaBell, FaSignOutAlt } from "react-icons/fa";
import "./DashboardEmploye.css";

// Header identique
function Header() {
  const user = getUser();
  return (
    <div
      style={{
        backgroundColor: "#003049",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "4px solid #fcbf49",
        height: "70px",
      }}
    >
      <h2 style={{ margin: 0, color: "#fcbf49" }}>Sartex</h2>
      <div style={{ display: "flex", alignItems: "center" }}>
        <FaUserCircle size={30} style={{ marginRight: 10 }} />
        <div>
          <div style={{ fontWeight: "bold" }}>
            {user?.prenom} {user?.nom}
          </div>
          <div style={{ fontSize: 12, color: "#ccc" }}>{user?.role}</div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ selected, setSelected, onLogout, nbNotif }) {
  const linkStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    cursor: "pointer",
    backgroundColor: active ? "#fcbf49" : "#011627",
    color: active ? "#011627" : "#fefefe",
    fontWeight: active ? "bold" : "normal",
    borderRadius: "5px",
    marginBottom: "10px",
    userSelect: "none",
    transition: "background-color 0.3s",
    position: "relative",
  });

  return (
    <div
      style={{
        backgroundColor: "#011627",
        color: "#fefefe",
        width: "220px",
        minHeight: "calc(100vh - 70px)",
        padding: "1.5rem",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={linkStyle(selected === "notifications")}
        onClick={() => setSelected("notifications")}
      >
        <FaBell style={{ marginRight: 10 }} /> Notifications
        {nbNotif > 0 && (
          <span
            style={{
              position: "absolute",
              right: "15px",
              backgroundColor: "red",
              borderRadius: "50%",
              padding: "4px 8px",
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "white",
            }}
          >
            {nbNotif}
          </span>
        )}
      </div>
      <div
        style={{
          color: "#f44336",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
        onClick={onLogout}
      >
        <FaSignOutAlt style={{ marginRight: 10 }} /> Déconnexion
      </div>
    </div>
  );
}

function NotificationsList({ notifications, markAsRead }) {
  return (
    <div>
      <h3>Notifications récentes</h3>
      {notifications.length === 0 ? (
        <p>Aucune notification.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((notif) => (
            <li
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              style={{
                backgroundColor: notif.lu ? "#fff" : "#fcefcf",
                borderLeft: notif.lu ? "4px solid #ccc" : "6px solid #fcbf49",
                padding: "15px 20px",
                marginBottom: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: notif.lu ? "normal" : "600",
                color: notif.lu ? "#011627" : "#003049",
                boxShadow: notif.lu ? "none" : "0 0 10px rgba(252,191,73,0.7)",
                transition: "background-color 0.3s ease",
              }}
              title="Cliquer pour marquer comme lu"
            >
              {notif.matricule ? (
                <>
                  <p style={{ margin: 0 }}>
                    ✅ Demande validée pour employé : <strong>{notif.matricule}</strong>
                  </p>
                  {notif.date_sortie && (
                    <p style={{ margin: 0 }}>
                      📅 Date sortie : {new Date(notif.date_sortie).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(notif.date_sortie).toLocaleTimeString("fr-FR")}
                    </p>
                  )}
                  <small style={{ color: "#555" }}>
                    🕓 Notification reçue :{" "}
                    {new Date(notif.date_envoi).toLocaleString("fr-FR")}
                  </small>
                </>
              ) : (
                <p style={{ margin: 0 }}>{notif.message}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardGardien() {
  const [selected, setSelected] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [nbNotifNonLues, setNbNotifNonLues] = useState(0);
  const navigate = useNavigate();
  const token = getToken();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      const nonLues = res.data.filter((n) => !n.lu).length;
      setNbNotifNonLues(nonLues);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    }
  };

  const markAsRead = async (idNotif) => {
    try {
      await axios.put(
        `http://localhost:3000/notifications/${idNotif}/lu`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === idNotif ? { ...n, lu: true } : n))
      );
      setNbNotifNonLues((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Erreur mise à jour notification:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-layout" style={{ display: "flex" }}>
        <Sidebar
          selected={selected}
          setSelected={setSelected}
          onLogout={handleLogout}
          nbNotif={nbNotifNonLues}
        />
        <main className="dashboard-main" style={{ flex: 1, padding: "1rem" }}>
          {selected === "notifications" && (
            <NotificationsList
              notifications={notifications}
              markAsRead={markAsRead}
            />
          )}
        </main>
      </div>
    </>
  );
}
