{
  checkAccess("juriste") && (
    <>
      <NavLink
        to="/statistiques"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        <i className="fas fa-chart-bar"></i>
        <span>Statistiques</span>
      </NavLink>
    </>
  );
}
