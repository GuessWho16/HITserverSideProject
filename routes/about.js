import { Router } from 'express';
const router = Router();

router.get('/',(req,res) => {
    res.json([
    { first_name: 'Noy', last_name: 'Klar' },
    { first_name: 'Daniel', last_name: 'Podolsky' },
]);
});

export default router;