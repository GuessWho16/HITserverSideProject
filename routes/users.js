import { Router } from 'express';
import User from '../models/User.js';
import Cost from '../models/Cost.js';
const router = Router();

router.get('/:id', async (req,res) => {
    try{
        const userId = Number(req.params.id);

        if (isNaN(userId)){
            return res.status(400).json({ error: 'Invalid user ID'});
        }

        const user = await User.findOne({ id: userId});

        if(!user){
            return res.status(404).json({ error: 'User not found'});
        }

        const totalResult = await Cost.aggregate([
            { $match: { userid: userId} },
            { $group: { _id: null, total: { $sum: '$sum'}}}
        ]);

        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        res.json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total
        });

    } catch (error) {
        res.status(500).json({ error: error.message});
    }

});

export default router;
