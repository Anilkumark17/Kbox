import React, { useState } from "react";
import DashboardContainer from "../../containers/dashboard/DashboardContainer";
import { supabase } from "../../utils/db";
import { getUserSession } from "../../api/userApi";

const Dashboard = () => {
  const [create, setCreate] = useState([]);
  const [cat, setCat] = useState("");

  const createSubmit = async (e) => {
    e.preventDefault();
    if (!cat.trim()) return;

    try {
      const userId = await getUserSession();

      const { data, error } = await supabase.from("categories").insert([
        {
          user_id: userId,
          name: cat,
        },
      ]);

      if (error) throw error;

      setCreate((prev) => [...prev, cat]);
      setCat("");
      console.log(data);
    } catch (error) {
      console.error("Error inserting category:", error.message);
    }
    window.location.reload();
  };

  return (
    <DashboardContainer
      cat={cat}
      onCat={(e) => setCat(e.target.value)}
      onSubmit={createSubmit}
      create={create}
    />
  );
};

export default Dashboard;
