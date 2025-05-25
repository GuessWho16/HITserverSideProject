import { Router } from 'express';
import Cost from '../models/Cost.js';
const router = Router();


router.post('/', async (req,res) => {
    try {
        const{ description, category, userid, sum, created_at } = req.body;

        if(!description || !category || !userid || !sum){
            return res.status(400).json({error: 'Missing required fields'});
        }

        const newCost = new Cost({
            description,
            category,
            userid,
            sum,
            created_at: created_at || Date.now()
        });

        const saved = await newCost.save();
        res.status(201).json(saved);
    
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.get('/', async (req, res) =>{

    try{
        const {id, year, month} = req.query; 

        if(!id || !year || !month ) {
            return res.status(400).json({error: 'Missing id, year, or month'});
        }

        const userID = Number(id);
        const numericYear = Number(year);
        const numericMonth = Number(month);

        if(isNaN(userId) || isNaN(numericYear) || isNaN(numericMonth)) {
            return res.status(400).json({error: 'Invalid number values in query'});
        }

        const start = new Date(numericYear, numericMonth - 1,1);
        const end = new Date(numericYear, numericMonth, 0, 23, 59, 59);

        const costs = await Cost.find({
            userid: userId,
            created_at: { $gte: start, $lte: end}
        });

        const categories = ['food', 'health', 'housing', 'sport','education'];
        const grouped = {};

        categories.forEach((cat) => {
            grouped[cat] = [];
        });

        costs.forEach((cost) => {
            const day = new Date(cost.created_at).getDate();
            grouped[cost.category].push({
                sum: cost.sum,
                description: cost.description,
                day
            });
        });

        const costOutput = categories.map((cat) => ({
            [cat]: grouped[cat]
        }));

        res.json({
            userid: userID,
            year: numericYear,
            month: numericMonth,
            costs: costOutput;
        });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default router;