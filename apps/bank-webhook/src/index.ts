import express from "express";
import z from "zod";
import db from "@repo/db"
const app=express();
app.use(express.json());

//dummy web hook;

app.post("/",async (req,res)=>{

    //todo : add zod validation
    const paymentInfo={
        token:req.body.token,
        userId:req.body.userId,
        amount:req.body.amount
    }
    try{
       
        await db.$transaction([
             db.balance.update({
                where:{
                    userId:paymentInfo.userId
                },
                data:{
                    amount:{
                        increment:paymentInfo.amount
                    }
                }
            }),
        
             db.onRampTransaction.update({
                where:{
                    token:paymentInfo.token
                },
                data:{
                    status:"Success"
                }
            })
        
        ]);
       
        return res.status(200).json({
            message:"captured"
        })
    }
    catch(e){
        await db.onRampTransaction.update({
            where:{
                token:paymentInfo.token
            },
            data:{
                status:"Failure"
            }
        })
        return res.status(411).json({
            message:"failed"
        })
    }
    
})
