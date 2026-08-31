

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFarmerProfile, getFarmerDashboard, getConsultationHistory } from "@/lib/farmer-api";
import { getStoredAuth, getErrorMessage } from "@/lib/api";

export default function FarmerDashboardExample() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ CHECK AUTHENTICATION BEFORE FETCHING
    const auth = getStoredAuth();
    if (!auth?.access) {
      router.push("/auth");
      return;
    }

    // ✅ FETCH ALL DATA FROM DJANGO DIRECTLY
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // All these call Django REST API directly - NO Next.js intermediary
        const [profileData, dashboardData, historyData] = await Promise.all([
          getFarmerProfile(),
          getFarmerDashboard(),
          getConsultationHistory(5), // Last 5 consultations
        ]);

        setProfile(profileData);
        setStats(dashboardData);
        setHistory(historyData);
      } catch (err) {
        setError(getErrorMessage(err));
        // If auth error, redirect to login
        if (error?.includes("401") || error?.includes("Unauthorized")) {
          router.push("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div className="farmer-dashboard">
      <div className="welcome-section">
        <h1>Welcome, {profile.full_name}!</h1>
        <p>Phone: {profile.phone}</p>
        <p>Village: {profile.village}, {profile.district}</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Livestock</h3>
            <p className="stat-number">{stats.total_livestock}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Consultations</h3>
            <p className="stat-number">{stats.pending_consultations}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Consultations</h3>
            <p className="stat-number">{stats.completed_consultations}</p>
          </div>
        </div>
      )}

      <section className="consultation-history">
        <h2>Recent Consultations</h2>
        {history.length > 0 ? (
          <ul>
            {history.map((consultation) => (
              <li key={consultation.id}>
                <div className="consultation-item">
                  <p>
                    <strong>Date:</strong> {new Date(consultation.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Vet:</strong> {consultation.vet_name}
                  </p>
                  <p>
                    <strong>Problem:</strong> {consultation.problem}
                  </p>
                  <p>
                    <strong>Status:</strong> {consultation.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No consultation history yet.</p>
        )}
      </section>
    </div>
  );
}
