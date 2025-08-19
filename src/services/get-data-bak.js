// import { sql, poolPromise } from '../config/db.js';

// export default async function getData(req, res) {
//     try {
//         const { name, page = 1, limit = 20 } = req.query;
//         const tableName = 'DataFromWebHook';

//         const pageNum = Math.max(parseInt(page, 10), 1);
//         const limitNum = Math.max(parseInt(limit, 10), 1);
//         const offset = (pageNum - 1) * limitNum;

//         const pool = await poolPromise;

//         // Base query
//         let query = `SELECT * FROM ${tableName}`;

//         // Use parameterized query for safety
//         const request = pool.request()
//             .input('Offset', sql.Int, offset)
//             .input('Limit', sql.Int, limitNum);

//         if (name && name.trim()) {
//             query += ` WHERE payload_name = @Name`;
//             request.input('Name', sql.VarChar, name.trim());
//         }

//         // Pagination
//         query += `
//             ORDER BY record_id
//             OFFSET @Offset ROWS
//             FETCH NEXT @Limit ROWS ONLY
//         `;

//         const result = await request.query(query);

//         if (!result.recordset || result.recordset.length === 0) {
//             return res.status(404).json({ error: 'No data found' });
//         }

//         return res.json({
//             page: pageNum,
//             limit: limitNum,
//             count: result.recordset.length,
//             data: result.recordset
//         });

//     } catch (error) {
//         console.error('Error fetching device data:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// }
