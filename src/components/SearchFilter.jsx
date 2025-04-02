import React from "react";
import "../styles/SearchFilter.css";

const SearchFilter = ({
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  searchPlaceholder = "Rechercher...",
  filterLabel = "Filtrer par",
  className = "",
}) => {
  return (
    <div className={`tag-search-filter-container ${className}`}>
      <div className="tag-search-filter-group">
        <label>Rechercher</label>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="tag-search-filter-group">
        <label>{filterLabel}</label>
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
