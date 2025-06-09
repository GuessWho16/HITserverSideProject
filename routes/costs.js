import { Router } from 'express';
import Cost from '../models/Cost.js';
import Report from '../models/Report.js';
const router = Router();

/**
 * POST /api/add - Create a new cost item
 * @description Creates a new cost record in the database with validation for required fields and data types.
 * If no timestamp is provided, uses current server time.
 * @route POST /api/add
 * @param {string} req.body.description - Description of the cost item
 * @param {string} req.body.category - Category of cost (must be: food, health, housing, sport, education)
 * @param {number} req.body.userid - ID of the user who made this cost
 * @param {number} req.body.sum - Amount of money spent (must be positive)
 * @param {string} [req.body.created_at] - Optional ISO timestamp. If not provided, uses current server time
 * @returns {Object} JSON response with created cost data or error message
 * @throws {400} Missing required fields (description, category, userid, sum)
 * @throws {400} Invalid data types for userid or sum (must be numbers)
 * @throws {400} Sum must be greater than 0
 * @throws {500} Database or server error
 */

router.post('/', async (req,res) => {
    // TASK: Create a new cost item with the following fields: description, category, userid, sum, created_at and save it to the database.
    try {
        const{ description, category, userid, sum, created_at } = req.body; // Get information from the body of the request
        
        // STEP 1: Check the required fields
        if(!description || !category || !userid || !sum){
            return res.status(400).json({error: 'Missing required fields'});
        }

        // STEP 2: Type validation
        if (isNaN(userid) || isNaN(sum)) {
            return res.status(400).json({ error: 'Invalid number values for userid or sum' });
        }

        // STEP 3: Value validation
        if (Number(sum) <= 0) {
            return res.status(400).json({ error: 'Sum must be a positive number (Greater than 0)' });
        }

        // STEP 4: Create cost data with legitimate values
        const newCost = new Cost({
            description,
            category,
            userid,
            sum,
            created_at: created_at || Date.now()
        });

        // STEP 5: Create and save to MongoDB
        const savedCost = await newCost.save();

        // STEP 6: Return success response
        return res.status(201).json({ message: 'Cost item created successfully', cost: savedCost });
    
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

/**
 * GET /api/report - Get monthly cost report grouped by category
 * @description Retrieves all costs for a specific user within a given month/year and groups them by category.
 * Each cost includes the day of month, amount, and description. Uses the Computed Pattern to calculate 
 * groupings on-demand rather than storing pre-computed totals.
 * @route GET /api/report
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.id - User ID to get costs for
 * @param {string} req.query.year - Year to filter costs (e.g., "2025")
 * @param {string} req.query.month - Month to filter costs (1-12)
 * @returns {Object} JSON response with grouped costs or error message
 * @throws {400} Missing required query parameters (id, year, month)
 * @throws {400} Invalid number values for id, year, or month
 * @throws {400} Month must be between 1 and 12
 * @throws {500} Database or server error
 */

router.get('/', async (req, res) => {
    // TASK: Get monthly report of costs grouped by category (with caching via Report model)

    try{
        // STEP 1: Extract query parameters
        const {id, year, month} = req.query; 

        // STEP 2: Validate query parameters
        if(!id || !year || !month ) {
            return res.status(400).json({error: 'Missing required query parameters', required: ['id','year','month'] });
        }

        // STEP 3: Convert to numbers and validate
        const userID = Number(id);
        const numericYear = Number(year);
        const numericMonth = Number(month);

        if(isNaN(userID) || isNaN(numericYear) || isNaN(numericMonth)) {
            return res.status(400).json({ error: 'Invalid number values for id, year or month'});
        }

        // STEP 4: Validate month range
        if(numericMonth < 1 || numericMonth > 12 ){
            return res.status(400).json({ error: 'Month must be between 1 and 12'});
        }

        // STEP 5: Create date range for the query
        const startDate = new Date(numericYear, numericMonth - 1, 1); // First day of the month
        const endDate = new Date(numericYear, numericMonth, 0, 23, 59, 59, 999); // Last day of the month

        // STEP 6: Query the database for  costs within the date range and for the specific user
        const costs = await Cost.find({
            userid: userID,
            created_at: { $gte: startDate, $lte: endDate }
        });

        // STEP 7: Group costs by category and calculate total sum for each category
        const grouped = {
            food: [],
            health: [],
            housing: [],
            sport: [],
            education: [],
        };

        costs.forEach(cost => {
            const day = new Date(cost.created_at).getDate(); // getDate: get only the day

            // Create the cost object
            const costItem = {
                sum: cost.sum,
                day: day,
                description: cost.description,
            };

            if (grouped[cost.category]) {
                grouped[cost.category].push(costItem);
            }
        });

        // STEP 8: Return success response
        return res.status(200).json({
            userid: userID,
            year: numericYear,
            month: numericMonth,
            costs: grouped
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
});

export default router;