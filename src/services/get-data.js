import { sql, poolPromise } from '../config/db.js';

export default async function getDataFromRaw(req, res) {
    try {
        const { name, page = 1, perPage = 20, orderBy = 'ASC' } = req.query;
        const tableName = 'WebHookEvent';

        const pageNum = Math.max(parseInt(page, 10), 1);
        const perPageNum = Math.max(parseInt(perPage, 10), 1);
        const offset = (pageNum - 1) * perPageNum;

        const pool = await poolPromise;

        const sortOrder = orderBy.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        let query = `SELECT id, payload, timestamp FROM ${tableName} WHERE payload IS NOT NULL AND payload <> '' AND payload NOT LIKE '%"number_of_rows":0%'`;
        const request = pool.request()
            .input('Offset', sql.Int, offset)
            .input('Limit', sql.Int, perPageNum);

        if (name) {
            query += ` AND payload LIKE @name`;
            request.input('name', sql.NVarChar, `%${name}%`);
        }

        // 👇 fixed spacing around ORDER BY / OFFSET / FETCH
        query += ` ORDER BY id ${sortOrder} OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`;

        const result = await request.query(query);
        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({ error: 'No raw data found' });
        }

        const formatted = result.recordset.map(row => {
            let parsedPayload;
            try {
                parsedPayload = JSON.parse(row.payload);
            } catch (err) {
                parsedPayload = {};
            }

            return {
                id: row.id,
                timestamp: row.timestamp,
                payload_name: parsedPayload.name || null,
                data: parsedPayload
            };
        });

        return res.json({
            page: pageNum,
            perPage: perPageNum,
            count: formatted.length,
            data: formatted
        });

    } catch (error) {
        console.error('Error fetching raw data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// import { sql, poolPromise } from '../config/db.js';

// export default async function getDataFromRaw(req, res) {
//     try {
//         const { name, page = 1, perPage = 20, orderBy = 'ASC' } = req.query;
//         const tableName = 'WebHookEvent';

//         const pageNum = Math.max(parseInt(page, 10), 1);
//         const perPageNum = Math.max(parseInt(perPage, 10), 1);
//         const offset = (pageNum - 1) * perPageNum;

//         const pool = await poolPromise;

//         const sortOrder = orderBy.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

//         let query = `SELECT id, payload, timestamp 
//                      FROM ${tableName} 
//                      WHERE payload IS NOT NULL 
//                        AND payload <> '' 
//                        AND payload NOT LIKE '%"number_of_rows":0%'`;


//         const request = pool.request()
//             .input('Offset', sql.Int, offset)
//             .input('Limit', sql.Int, perPageNum);

//         if (name) {
//             query += ` AND payload LIKE @name`;
//             request.input('name', sql.NVarChar, `%${name}%`);
//         }

//         query += ` ORDER BY id ${sortOrder} OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`;

//         const result = await request.query(query);
//         if (!result.recordset || result.recordset.length === 0) {
//             return res.status(404).json({ error: 'No raw data found' });
//         }

//         const formatted = result.recordset.map(row => {
//             let parsedPayload;
//             try {
//                 parsedPayload = JSON.parse(row.payload);
//             } catch (err) {
//                 parsedPayload = {};
//             }

//             let mappedData = [];
//             if (
//                 parsedPayload.data &&
//                 Array.isArray(parsedPayload.data.data) &&
//                 parsedPayload.data.data.length > 0
//             ) {
//                 const headers = parsedPayload.data.header || [];
//                 const units = parsedPayload.data.units || [];

//                 mappedData = parsedPayload.data.data.map(rowArr => {
//                     const obj = {};
//                     rowArr.forEach((val, i) => {
//                         obj[headers[i] || `col_${i}`] = {
//                             value: val,
//                             unit: units[i] || ''
//                         };
//                     });
//                     return obj;
//                 });
//             }

//             return {
//                 id: row.id,
//                 timestamp: row.timestamp,
//                 payload_name: parsedPayload.name || null,
//                 data: mappedData.length > 0 ? mappedData : parsedPayload
//             };
//         });

//         return res.json({
//             page: pageNum,
//             perPage: perPageNum,
//             count: formatted.length,
//             data: formatted
//         });

//     } catch (error) {
//         console.error('Error fetching raw data:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// }
