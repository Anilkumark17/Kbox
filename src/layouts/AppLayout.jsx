import React from "react";
import { Outlet } from "react-router-dom";
// import UserId from "./UserId";
const AppLayout = () => {
  return (
    <div>
      <Outlet />
      {/* <UserId /> */}
    </div>
  );
};

export default AppLayout;
