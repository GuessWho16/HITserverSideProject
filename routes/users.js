import { Router } from 'express';
import User from '../models/User.js';
import Cost from '../models/Cost.js';
const router = Router();

/**
 * GET /api/users/:id - Get user details with total costs
 * @description Retrieves a specific user's information along with their total cost spending.
 * Uses the Computed Pattern to calculate the total cost by aggregating all costs from the 
 * costs collection in real-time, rather than storing a pre-computed total in the user document.
 * This ensures the total is always accurate and up-to-date.
 * @route GET /api/users/:id
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to retrieve details for (must be a valid number)
 * @returns {Object} JSON response with user details and total costs or error message
 * @throws {400} Invalid user ID - ID must be a valid number
 * @throws {500} Database or server error
 */
router.get('/:id', async (req,res) => {
    // TASK: Get the details of a specific user by ID and also have its total sum of costs associated with that user.
    try{

        // STEP 1: Extract user ID from request parameters
        const userID = Number(req.params.id);

        // STEP 2: Validate user ID is indeed a number
        if (isNaN(userID)){
            return res.status(400).json({ error: 'Invalid user ID (Must be a number)'});
        }

        // STEP 3: Find user by ID
        const user = await User.findOne({ id: userID});

        // STEP 4: If user not found, return error
        if(!user){
            return res.status(404).json({ error: 'User not found'});
        }

        const totalResult = await Cost.aggregate([
            {
                $match: { userid: Number(userID) } // Match costs for the specific user
            },
            {
                $group: {
                    _id: null, // Grouping all costs together
                    totalSum: { $sum: '$sum' } // Calculate total sum of costs
                }
            }
        ])

        const total = totalResult.length > 0 ? totalResult[0].totalSum : 0; // If no costs found, total is 0

        // STEP 5: Return success response
        return res.status(200).json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: total
        });

    } catch (error) {
        res.status(500).json({ error: error.message});
    }

});

export default router;
