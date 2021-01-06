import React from "react";

const Filter = ({ handleFilterValueChange, filterValue }) => {
  return (
    <>
      <div>
        filter shown with{" "}
        <input value={filterValue} onChange={handleFilterValueChange} />
      </div>
    </>
  );
};

export default Filter;
