import pool from "../config/postgres.js";
import AppError from "../error/AppError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get schema and data for a specific sandbox table
export const getTableData = asyncHandler(async (req, res, next) => {
  const { tableName } = req.params;

  const allowedTables = ["employees", "departments"];

  if (!allowedTables.includes(tableName.toLowerCase())) {
    return next(
      new AppError(
        `Access denied: Table '${tableName}' is not available in the sandbox.`,
        403,
      ),
    );
  }

  const result = await pool.query(
    `SELECT * FROM ${tableName} ORDER BY id ASC `,
  );

  const columns = result.fields.map((field) => field.name);

  const tableData = {
    tableName: tableName,
    columns: columns,
    rowCount: result.rowCount,
    rows: result.rows,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, tableData, `Successfully fetched ${tableName} data`),
    );
});
