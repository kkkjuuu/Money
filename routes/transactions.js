const express = require("express");
const router = express.Router();

const db = require("../db");
const { v4: uuidv4 } = require("uuid");

/*
==========================
GET HISTORY
==========================
*/

router.get("/history", async (req, res) => {

    try {

        const result = await db.query(`
            SELECT *
            FROM transactions
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success:false,
            message:"Database Error"
        });

    }

});

/*
==========================
GET STATS
==========================
*/

router.get("/stats", async (req,res)=>{

    try{

        const result = await db.query(`
        SELECT
        COALESCE(
            SUM(
                CASE
                    WHEN type='deposit'
                    THEN amount
                    ELSE -amount
                END
            ),0
        ) balance,

        COALESCE(
            SUM(
                CASE
                    WHEN type='withdraw'
                    THEN amount
                    ELSE 0
                END
            ),0
        ) withdraw

        FROM transactions
        `);

        res.json({

            success:true,

            balance:Number(result.rows[0].balance),

            totalWithdraw:Number(result.rows[0].withdraw)

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/*
==========================
DEPOSIT
==========================
*/

router.post("/deposit", async (req,res)=>{

    try{

        const { amount } = req.body;

        if(!amount || amount<=0){

            return res.status(400).json({

                success:false,
                message:"Invalid Amount"

            });

        }

        await db.query(

            `
            INSERT INTO transactions
            (
                id,
                type,
                amount
            )

            VALUES
            ($1,$2,$3)
            `,

            [

                uuidv4(),
                "deposit",
                amount

            ]

        );

        res.json({

            success:true

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/*
==========================
WITHDRAW
==========================
*/

router.post("/withdraw", async (req,res)=>{

    try{

        const { amount, reason } = req.body;

        if(!amount || amount<=0){

            return res.status(400).json({

                success:false,
                message:"Invalid Amount"

            });

        }

        const balanceResult = await db.query(`
        SELECT
        COALESCE(
            SUM(
                CASE
                WHEN type='deposit'
                THEN amount
                ELSE -amount
                END
            ),0
        ) balance
        FROM transactions
        `);

        const balance = Number(balanceResult.rows[0].balance);

        if(amount>balance){

            return res.status(400).json({

                success:false,
                message:"Not Enough Money"

            });

        }

        await db.query(

            `
            INSERT INTO transactions
            (
                id,
                type,
                amount,
                reason
            )

            VALUES
            ($1,$2,$3,$4)
            `,

            [

                uuidv4(),
                "withdraw",
                amount,
                reason

            ]

        );

        res.json({

            success:true

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/*
==========================
DELETE
==========================
*/

router.delete("/transaction/:id", async(req,res)=>{

    try{

        await db.query(

            `
            DELETE FROM transactions
            WHERE id=$1
            `,

            [

                req.params.id

            ]

        );

        res.json({

            success:true

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/*
==========================
RESET
==========================
*/

router.delete("/reset", async(req,res)=>{

    try{

        await db.query("DELETE FROM transactions");

        res.json({

            success:true

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

module.exports = router;